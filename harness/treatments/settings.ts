// Provisional operating bounds; live evals must measure their error tradeoff.
export const decisionPolicy={failAtOrBelow:0.2,passAtOrAbove:0.8} as const;
export function decisionStatus(probability:number):'pass'|'fail'|'uncertain' {
  if(!Number.isFinite(probability)||probability<0||probability>1)throw Error('Invalid decision result');
  return probability>=decisionPolicy.passAtOrAbove?'pass':probability<=decisionPolicy.failAtOrBelow?'fail':'uncertain';
}
// Native agentests config schema, inspected in v1.0.1. No reasoning assertions are used.
export function config(decision:'luna'|'jev') {
  return {decision: decision==='luna'?{api:'openai' as const,url:'https://api.openai.com/v1',model:'gpt-6-luna',apiKeyEnv:'OPENAI_API_KEY'}:{api:'jev' as const,url:'https://api.typesafe.ai/v1',model:'jev-latest',apiKeyEnv:'TYPESAFE_AI_API_KEY'},
    reasoning:{api:'openai' as const,url:'https://api.openai.com/v1',model:'gpt-6-sol',apiKeyEnv:'OPENAI_API_KEY'},select:{threshold:decisionPolicy.passAtOrAbove},assert:{threshold:decisionPolicy.passAtOrAbove},ignore:[]};
}
export const domains=['legal','marketing','customer-support'] as const;
export type Domain=typeof domains[number];
