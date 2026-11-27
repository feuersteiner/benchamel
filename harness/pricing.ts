type Rates = {
  input: number;
  cached: number;
  write: number;
  output: number;
  longContext: number;
};

// Standard USD per million tokens, checked 2026-11-25. Cache writes use 30-minute retention.
// https://developers.openai.com/api/docs/models/gpt-6-luna
// https://developers.openai.com/api/docs/models/gpt-6.1-terra
// https://developers.openai.com/api/docs/models/gpt-6.1-sol
// https://docs.typesafe.ai/models
const jev: Rates = {
  input: 0.042,
  cached: 0.042,
  write: 0.042,
  output: 0,
  longContext: Infinity,
};
const prices: Record<string, Rates> = {
  "gpt-6-luna": {
    input: 0.1,
    cached: 0.01,
    write: 0.125,
    output: 0.5,
    longContext: 272_000,
  },
  "gpt-6.1-terra": {
    input: 1,
    cached: 0.05,
    write: 1.25,
    output: 5,
    longContext: 272_000,
  },
  "gpt-6.1-sol": {
    input: 2,
    cached: 0.1,
    write: 2.5,
    output: 10,
    longContext: 272_000,
  },
  jev,
};

export const tokenCost = (call: {
  model: string;
  inputTokens: number;
  cachedInputTokens: number;
  cacheWriteInputTokens: number;
  outputTokens: number;
}): number => {
  const rates = prices[call.model];
  if (!rates) throw "can't price tokens! model not found!";
  const long = call.inputTokens > rates.longContext;
  const uncached =
    call.inputTokens - call.cachedInputTokens - call.cacheWriteInputTokens;
  return (
    ((uncached * rates.input +
      call.cachedInputTokens * rates.cached +
      call.cacheWriteInputTokens * rates.write) *
      (long ? 2 : 1) +
      call.outputTokens * rates.output * (long ? 1.5 : 1)) /
    1_000_000
  );
};
