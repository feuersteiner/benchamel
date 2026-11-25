type Rates = { input: number; cached: number; write: number; output: number; longContext: number };

// Standard USD per million tokens, checked 2026-11-25. Cache writes use 30-minute retention.
// https://developers.openai.com/api/docs/models/gpt-6-luna
// https://developers.openai.com/api/docs/models/gpt-6.1-terra
// https://developers.openai.com/api/docs/models/gpt-6.1-sol
// https://docs.typesafe.ai/models
const jev: Rates = { input: 0.042, cached: 0.042, write: 0.042, output: 0, longContext: Infinity };
const prices: Record<string, Rates> = {
  "gpt-6-luna": { input: 0.10, cached: 0.01, write: 0.125, output: 0.50, longContext: 272_000 },
  "gpt-6.1-terra": { input: 1, cached: 0.05, write: 1.25, output: 5, longContext: 272_000 },
  "gpt-6.1-sol": { input: 2, cached: 0.10, write: 2.50, output: 10, longContext: 272_000 },
  jev,
  "jev-latest": jev,
  "jev-preview": jev,
  "jev-1.13.0": jev,
  "jev-1.14.0": jev,
};

export function tokenCost(call: {
  model: string;
  input_tokens: number;
  cached_input_tokens: number;
  cache_write_input_tokens: number;
  output_tokens: number;
}): number | null {
  const rates = prices[call.model];
  if (!rates) return null;
  const long = call.input_tokens > rates.longContext;
  const uncached = call.input_tokens - call.cached_input_tokens - call.cache_write_input_tokens;
  return ((uncached * rates.input + call.cached_input_tokens * rates.cached +
    call.cache_write_input_tokens * rates.write) * (long ? 2 : 1) +
    call.output_tokens * rates.output * (long ? 1.5 : 1)) / 1_000_000;
}
