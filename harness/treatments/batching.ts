import {paceLuna} from './pacing.ts';
export type TransportReceipt={provider:'luna'|'jev';questions:number;inputBytes:number;requestBytes:number;model:string;usage:unknown;pacing?:Awaited<ReturnType<typeof paceLuna>>};
type Pending={body:any;init:RequestInit|undefined;resolve:(r:Response)=>void;reject:(e:unknown)=>void};
/** Preserve native agentests engines; coalesce only otherwise-identical provider requests. */
export async function withBatchedDecisions<T>(operation:()=>Promise<T>,receipts:TransportReceipt[]) {
  const native=globalThis.fetch,groups=new Map<string,Pending[]>(),pending=new Set<Promise<void>>();
  async function send(url:string,group:Pending[]) {
    try {
      const openai=url.includes('api.openai.com/'),questions:any=openai?group.flatMap((e,i)=>e.body.questions.map((q:any,j:number)=>({...q,name:`q_${i}_${j}`}))):Object.fromEntries(group.flatMap((e,i)=>Object.entries(e.body.questions).map(([name,q],j)=>[`q_${i}_${j}`,q])));
      const body={...group[0]!.body,questions},encoded=JSON.stringify(body);
      const pacing=openai?await paceLuna(encoded):undefined;
      const response=await native(url,{...group[0]!.init,body:encoded});
      if(!response.ok){for(const e of group)e.resolve(response.clone() as Response);return;}
      const result:any=await response.json();
      const expected=openai?questions.map((q:any)=>q.name):Object.keys(questions);
      const names=openai?result.answers?.map((a:any)=>a.name):Object.keys(result.answers??{});
      if(!Array.isArray(names)||names.length!==expected.length||new Set(names).size!==expected.length||expected.some((name:string)=>!names.includes(name)))throw Error('Batched response omitted or duplicated an assertion');
      receipts.push({provider:openai?'luna':'jev',questions:expected.length,inputBytes:Buffer.byteLength(JSON.stringify(openai?body.input:body.state)),requestBytes:Buffer.byteLength(encoded),model:result.model??body.model,usage:result.usage??null,...(pacing?{pacing}:{})});
      for(const [i,e] of group.entries()) {
        const answers=openai?e.body.questions.map((q:any,j:number)=>({...result.answers.find((a:any)=>a.name===`q_${i}_${j}`),name:q.name})):Object.fromEntries(Object.keys(e.body.questions).map((name,j)=>[name,result.answers[`q_${i}_${j}`]]));
        const part={...result,answers};delete part.usage;
        const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');
        e.resolve(new Response(JSON.stringify(part),{status:response.status,headers}));
      }
    }catch(error){for(const e of group)e.reject(error);}
  }
  const fetchBatched=async(input:any,init?:RequestInit):Promise<Response>=>{
    const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
    if(!['https://api.openai.com/v1/decisions','https://api.typesafe.ai/v1/systemone'].includes(url)||typeof init?.body!=='string')return native(input,init);
    const body=JSON.parse(init.body),{questions,...same}=body,key=url+JSON.stringify(same);
    return new Promise((resolve,reject)=>{
      const entry={body,init,resolve,reject},existing=groups.get(key);
      if(existing){existing.push(entry);return;}
      const group=[entry];groups.set(key,group);
      const completion=new Promise<void>(done=>setTimeout(()=>{groups.delete(key);void send(url,group).finally(done);},0));pending.add(completion);completion.finally(()=>pending.delete(completion));
    });
  };
  globalThis.fetch=Object.assign(fetchBatched,native) as typeof fetch;
  try{return await operation();}finally{while(pending.size)await Promise.allSettled([...pending]);globalThis.fetch=native;}
}
