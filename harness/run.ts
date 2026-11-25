import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { codexMetrics } from "./metrics.ts";

type Definition = {
  preflight: string[];
  agent: string;
  starter_prompt: string;
};

function parseDefinition(source: string): Definition {
  const parsed = Bun.YAML.parse(source);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("run.yaml must contain a mapping.");
  }
  const value = parsed as Record<string, unknown>;
  const fields = ["preflight", "agent", "starter_prompt"];
  if (
    Object.keys(value).length !== fields.length ||
    Object.keys(value).some((key) => !fields.includes(key)) ||
    typeof value.agent !== "string" || !value.agent.trim() ||
    typeof value.starter_prompt !== "string" ||
    !Array.isArray(value.preflight) ||
    !value.preflight.every((command) => typeof command === "string" && command.trim())
  ) {
    throw new Error("run.yaml requires preflight (command strings), agent, and starter_prompt.");
  }
  return value as Definition;
}

export async function run(definitionPath: string): Promise<void> {
  const path = resolve(definitionPath);
  const definition = parseDefinition(await Bun.file(path).text());
  const runDirectory = dirname(path);
  const caseDirectory = resolve(runDirectory, "../..");
  const fixture = join(caseDirectory, "fixture");
  const [caseText, judgeText, judgeCode, { judge }] = await Promise.all([
    Bun.file(join(caseDirectory, "CASE.md")).arrayBuffer(),
    Bun.file(join(caseDirectory, "JUDGE.md")).arrayBuffer(),
    Bun.file(join(caseDirectory, "judge.ts")).arrayBuffer(),
    import(join(caseDirectory, "judge.ts")),
  ]);
  const output = runDirectory;
  const workspace = await mkdtemp(join(tmpdir(), "benchamel-"));
  const transcript = Bun.file(join(output, "transcript.jsonl")).writer();
  const result: Record<"time" | "cost" | "score" | "context_length", number | null> = {
    time: null, cost: null, score: null, context_length: null,
  };
  let agentOutput = "";
  const record = (event: Record<string, unknown>) => {
    transcript.write(JSON.stringify({ timestamp: new Date().toISOString(), ...event }) + "\n");
  };

  async function execute(command: string, stage: string, prompt?: string): Promise<void> {
    record({ type: "start", stage, command });
    const argv = prompt === undefined
      ? ["/bin/sh", "-c", command]
      : ["/bin/sh", "-c", `${command} "$1"`, "benchamel", prompt];
    const child = Bun.spawn(argv, { cwd: workspace, stdin: "ignore", stdout: "pipe", stderr: "pipe" });

    async function capture(stream: ReadableStream<Uint8Array>, name: "stdout" | "stderr") {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      const emit = async (text: string) => {
        if (!text) return;
        record({ type: "output", stage, stream: name, text });
        if (stage === "agent" && name === "stdout") agentOutput += text;
        await Bun.write(name === "stdout" ? Bun.stdout : Bun.stderr, text);
      };
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          await emit(decoder.decode(chunk.value, { stream: true }));
        }
        await emit(decoder.decode());
      } finally {
        reader.releaseLock();
      }
    }

    const [exitCode] = await Promise.all([
      child.exited,
      capture(child.stdout, "stdout"),
      capture(child.stderr, "stderr"),
    ]);
    record({ type: "exit", stage, exit_code: exitCode });
    if (exitCode !== 0) throw new Error(`${stage} exited with code ${exitCode}.`);
  }

  let failed = false;
  let failure: unknown;
  try {
    record({
      type: "run",
      case_version: new Bun.CryptoHasher("sha256").update(caseText).digest("hex"),
      judge_version: new Bun.CryptoHasher("sha256").update(judgeText).update(judgeCode).digest("hex"),
    });
    await cp(fixture, workspace, { recursive: true });
    for (const [index, command] of definition.preflight.entries()) {
      await execute(command, `preflight:${index + 1}`);
    }
    const start = performance.now();
    try {
      await execute(definition.agent, "agent", definition.starter_prompt);
    } finally {
      result.time = (performance.now() - start) / 1000;
      const metrics = await codexMetrics(agentOutput);
      result.cost = metrics.cost;
      result.context_length = metrics.context_length;
      for (const call of metrics.calls) record({ type: "usage", ...call });
    }
    const score = await judge(workspace);
    if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error("judge.ts must return a score from 0 to 100.");
    }
    result.score = score;
    record({ type: "judge", score });
  } catch (error) {
    failed = true;
    failure = error;
    record({ type: "error", message: error instanceof Error ? error.message : String(error) });
  } finally {
    try {
      await transcript.end();
      await Bun.write(join(output, "result.json"), JSON.stringify(result, null, 2) + "\n");
      await rm(join(output, "workproduct"), { recursive: true, force: true });
      await cp(workspace, join(output, "workproduct"), { recursive: true });
    } catch (error) {
      throw new Error(`Could not save artifacts to ${output}; workspace retained at ${workspace}.`, { cause: error });
    }
    await rm(workspace, { recursive: true });
    console.log(`Artifacts: ${output}`);
  }
  if (failed) throw failure;
}
