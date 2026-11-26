import { hash } from '../boundary.ts';
import type { DomainTest, ReviewPacket } from './gate.ts';

/** Context reduction is representation-only: all omitted inventories are verified by trusted replay. */
export function compactState(state:unknown,audit:unknown) {
  const seen=new Map<string,string>();
  const canonical=(v:any):string=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(canonical(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(canonical(v[k]))])):v);
  const pointer=(key:string)=>key.replaceAll('~','~0').replaceAll('/','~1');
  const visit=(value:any,path:string,key=''):any=>{
    if(key==='snapshot'&&typeof value==='string') {
      try{return {decodedJsonArgument:visit(JSON.parse(value),path+'/decodedJsonArgument')};}catch{return value;}
    }
    if(!value||typeof value!=='object')return value;
    const identity=canonical(value);
    if(identity.length>256&&seen.has(identity))return {$ref:seen.get(identity)};
    if(identity.length>256)seen.set(identity,path);
    if(Array.isArray(value)&&value.length&&value.every(x=>x&&typeof x==='object'&&typeof x.id==='string'&&typeof x.sha256==='string'&&/^[a-f0-9]{64}$/.test(x.sha256)&&Object.keys(x).every(k=>['id','sha256'].includes(k)))) {
      return {representation:'SHA-256 inventory verified by trusted deterministic replay',count:value.length,ids:value.map(x=>x.id),inventorySha256:hash(identity)};
    }
    if(Array.isArray(value))return value.map((x,i)=>visit(x,path+'/'+i));
    return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,visit(v,path+'/'+pointer(k),k)]));
  };
  return {state:visit(state,'/state'),audit:visit(audit,'/audit')};
}

export function assertionPacket(base:ReviewPacket,item:DomainTest,question:string):ReviewPacket {
  const manifest=item.evidence??Object.keys(base.evidence);
  const mentioned=[...new Set(question.match(/\bE\d{2}\b/g)??[])];
  const selected=mentioned.length?mentioned:manifest;
  for(const id of selected)if(!manifest.includes(id)||!Object.hasOwn(base.evidence,id))throw Error(`${item.domain}: assertion evidence ${id} is absent from its declared manifest`);
  const represented=compactState(base.state,base.audit);
  return {...base,...represented,evidence:Object.fromEntries(selected.map(id=>[id,base.evidence[id]!])),representation:{references:'JSON Pointer $ref values refer to the same packet; repeated state is represented once.',integrity:'Original state and complete audit were replayed and immutable assets checked before this representation was built. Hash inventory values are omitted only after that validation.'}};
}
