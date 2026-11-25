import { homedir } from "node:os";
import { join } from "node:path";

// Standard USD per million tokens, checked 2026-11-25:
// https://developers.openai.com/api/docs/models/gpt-6-luna
const luna = { input: 0.10, cached: 0.01, write: 0.125, output: 0.50 };

export async function codexMetrics(stdout: string) {
  const threads = new Set<string>();
  for (const line of stdout.split("\n")) {
    try {
      const event = JSON.parse(line);
      if (event.type === "thread.started" && /^[a-f0-9-]+$/.test(event.thread_id)) {
        threads.add(event.thread_id);
      }
    } catch { /* Non-JSON command output is not usage. */ }
  }

  const calls: { model: string; input_tokens: number; cached_input_tokens: number;
    cache_write_input_tokens: number; output_tokens: number; reasoning_output_tokens: number }[] = [];
  const sessions = join(process.env.CODEX_HOME ?? join(homedir(), ".codex"), "sessions");
  for (const thread of threads) {
    const glob = new Bun.Glob(`**/*${thread}.jsonl`);
    for await (const path of glob.scan({ cwd: sessions, absolute: true })) {
      let model = "";
      const seen = new Set<string>();
      for (const line of (await Bun.file(path).text()).split("\n")) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.type === "turn_context") model = event.payload.model;
        if (event.type !== "event_msg" || event.payload?.type !== "token_count") continue;
        const info = event.payload.info;
        if (!info?.last_token_usage || !info.total_token_usage) continue;
        const key = JSON.stringify(info.total_token_usage);
        if (seen.has(key)) continue;
        seen.add(key);
        const usage = info.last_token_usage;
        calls.push({ model, input_tokens: usage.input_tokens,
          cached_input_tokens: usage.cached_input_tokens ?? 0,
          cache_write_input_tokens: usage.cache_write_input_tokens ?? 0,
          output_tokens: usage.output_tokens, reasoning_output_tokens: usage.reasoning_output_tokens ?? 0 });
      }
    }
  }

  let cost = 0;
  let priced = calls.length > 0;
  let context = 0;
  for (const call of calls) {
    context = Math.max(context, call.input_tokens);
    if (call.model !== "gpt-6-luna") { priced = false; continue; }
    const inputMultiplier = call.input_tokens > 272_000 ? 2 : 1;
    const outputMultiplier = call.input_tokens > 272_000 ? 1.5 : 1;
    const uncached = call.input_tokens - call.cached_input_tokens - call.cache_write_input_tokens;
    cost += ((uncached * luna.input + call.cached_input_tokens * luna.cached +
      call.cache_write_input_tokens * luna.write) * inputMultiplier +
      call.output_tokens * luna.output * outputMultiplier) / 1_000_000;
  }
  return {
    cost: priced ? Math.round(cost * 1e12) / 1e12 : null,
    context_length: calls.length ? context : null,
    calls,
  };
}
