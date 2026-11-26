/** Deterministic local integration interpreter. Policies are data, never evaluated as code. */
import { readFile, writeFile, rename, lstat } from 'node:fs/promises';
import { join } from 'node:path';
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type Obj = { [key: string]: any };
export type Action = { description: string; owner: string; evidence: string[]; args?: Record<string, string[] | 'text'>;
  requires?: Obj; effects: Obj; before?: string; after?: string; failEffects?: Obj };
export type Policy = { id: string; now: string; updateBy: string; handoff: string; areas: Record<string,string[]>;
  invariants: Obj; actions: Record<string,Action>; initial: Obj; rules: string[] };
export type Derive = (command:string,args:Record<string,string>,domain:Obj)=>Obj;
export type Runtime = { state: Obj; audit: { seq:number; command:string; args:Record<string,string>; at:string; outcome: string }[] };
export const canonical = (value:any):string => JSON.stringify(value && typeof value==='object'
  ? Array.isArray(value) ? value.map(v=>JSON.parse(canonical(v))) : Object.fromEntries(Object.keys(value).sort().map(k=>[k,JSON.parse(canonical(value[k]))])) : value);
const requireThat = (ok:unknown,message:string):void => { if(!ok) throw new Error(message); };
const timestamp = (v:string) => { requireThat(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().replace('.000Z','Z')===v, 'Use an exact UTC timestamp'); return Date.parse(v); };
export const initial = (p:Policy):Runtime => ({state:{now:p.now,domain:structuredClone(p.initial),tasks:[],commitments:null,handoff:null},audit:[]});
export function transition(p:Policy,input:Runtime,command:string,args:Record<string,string>,derive:Derive=()=>({})):Runtime {
  requireThat(input.audit.length<500,'Audit event limit reached');
  const r=structuredClone(input), s=r.state, action=p.actions[command];
  let outcome='confirmed';
  if(command==='clock') {
    requireThat(Object.keys(args).join()==='to','clock --to UTC_TIMESTAMP');
    requireThat(timestamp(args.to!)>=timestamp(s.now),'Clock cannot move backwards'); s.now=args.to;
  } else if(command==='task') {
    requireThat(Object.keys(args).sort().join()==='action,area,due,owner','task --area AREA --owner OWNER --due UTC --action TEXT');
    requireThat(p.areas[args.area!]?.includes(args.owner!), 'Owner is not responsible for that area');
    requireThat(timestamp(args.due!)>=timestamp(s.now)&&args.action!.trim().length>=12,'Future deadline and useful task required');
    s.tasks=s.tasks.filter((t:Obj)=>t.area!==args.area); s.tasks.push({...args});
  } else if(command==='commitments') {
    requireThat(Object.keys(args).sort().join()==='next-update,snapshot','commitments --next-update UTC --snapshot JSON_DOMAIN_STATE');
    requireThat(timestamp(args['next-update']!)>=timestamp(s.now)&&timestamp(args['next-update']!)<=timestamp(p.updateBy),'Update misses the customer window');
    requireThat(canonical(JSON.parse(args.snapshot!))===canonical(s.domain),'Commitments must match the current domain state');
    s.commitments={nextUpdate:args['next-update'],domain:structuredClone(s.domain)};
  } else if(command==='handoff') {
    requireThat(Object.keys(args).join()==='note'&&args.note!.trim().length>=20,'handoff --note USEFUL_TEXT');
    requireThat(Object.keys(p.areas).every(area=>s.tasks.some((t:Obj)=>t.area===area&&timestamp(t.due)>=timestamp(s.now))),'Assign every work area before handoff');
    s.handoff={to:p.handoff,note:args.note,domain:structuredClone(s.domain),tasks:structuredClone(s.tasks)};
  } else {
    requireThat(action,`Unknown or unauthorized operation: ${command}. Read help and policies/domain.json.`);
    const allowed={...action!.args,...(action!.failEffects?{simulate:['success','failure']}:{} )};
    requireThat(Object.keys(args).every(k=>Object.hasOwn(allowed,k)),'Unknown option');
    for(const [key,values] of Object.entries(action!.args??{})) {
      requireThat(typeof args[key]==='string'&&(values==='text'?args[key]!.trim().length>=8:values.includes(args[key]!)),`Invalid --${key}; authority/scope does not match policy`);
    }
    if(action!.before) requireThat(timestamp(s.now)<=timestamp(action!.before),'Reserved decision window expired');
    if(action!.after) requireThat(timestamp(s.now)>=timestamp(action!.after),'Integration response is not due yet');
    for(const [key,expected] of Object.entries(action!.requires??{})) {
      requireThat(canonical(s.domain[key])===canonical(expected),`Precondition ${key} must be ${JSON.stringify(expected)}`);
    }
    if(args.simulate==='failure') { Object.assign(s.domain,structuredClone(action!.failEffects)); outcome='failed-safe'; }
    else {Object.assign(s.domain,structuredClone(action!.effects));Object.assign(s.domain,derive(command,args,s.domain));}
  }
  for(const [key,value] of Object.entries(p.invariants)) requireThat(canonical(s.domain[key])===canonical(value),`Invariant breached: ${key}`);
  r.audit.push({seq:r.audit.length+1,command,args:structuredClone(args),at:s.now,outcome});
  return r;
}
export function replay(p:Policy,r:Runtime,derive:Derive=()=>({})):Obj {
  requireThat(r&&typeof r==='object'&&Object.keys(r).sort().join()==='audit,state'&&Array.isArray(r.audit)&&r.audit.length<=500,'Malformed runtime');
  let rebuilt=initial(p);
  for(const e of r.audit) {
    requireThat(e&&typeof e.command==='string'&&e.args&&Object.values(e.args).every(v=>typeof v==='string'),'Invalid event');
    rebuilt=transition(p,rebuilt,e.command,e.args,derive);
    requireThat(canonical(rebuilt.audit.at(-1))===canonical(e),'Receipt differs from trusted replay');
  }
  requireThat(canonical(rebuilt)===canonical(r),'State/audit mismatch'); return rebuilt.state;
}
export async function cli(root:string,derive:Derive=()=>({})) {
  try {
    const p:Policy=JSON.parse(await readFile(join(root,'policies/domain.json'),'utf8'));
    const argv=process.argv.slice(2); if(argv[0]==='--')argv.shift(); const command=argv.shift()??'help';
    const args:Record<string,string>={};
    while(argv.length) { const key=argv.shift()!, value=argv.shift(); requireThat(key.startsWith('--')&&value!==undefined&&!Object.hasOwn(args,key.slice(2)),'Use unique --option value pairs'); args[key.slice(2)]=value!; }
    if(command==='help') {
      requireThat(!Object.keys(args).length,'help takes no options');
      console.log(`${p.id}: offline local integrations. No messages or money leave this repository.\nRead-only: help | status | check\nclock --to UTC_TIMESTAMP\ntask --area AREA --owner OWNER --due UTC_TIMESTAMP --action TEXT\ncommitments --next-update UTC_TIMESTAMP --snapshot JSON_DOMAIN_STATE\nhandoff --note TEXT\n`);
      for(const [name,a] of Object.entries(p.actions))console.log(`${name} ${Object.entries(a.args??{}).map(([k,v])=>`--${k} ${v==='text'?'TEXT':v.join('|')}`).join(' ')}${a.failEffects?' [--simulate success|failure]':''}: ${a.description} Owner: ${a.owner}; evidence: ${a.evidence.join(',')}`);
      console.log('State fields, preconditions, approval scopes and service invariants: policies/domain.json'); return;
    }
    const path=join(root,'state/runtime.json'); requireThat((await lstat(path)).isFile(),'Runtime must be a regular file');
    const r:Runtime=JSON.parse(await readFile(path,'utf8')); replay(p,r,derive);
    if(command==='status'||command==='check') {
      requireThat(!Object.keys(args).length,'Read-only commands take no options');
      if(command==='status')console.log(JSON.stringify(r,null,2));
      else { requireThat(canonical(JSON.parse(await readFile(join(root,'data/seed.json'),'utf8')))===canonical(initial(p)),'Seed mismatch'); console.log(JSON.stringify({ok:true,offline:true,events:r.audit.length,invariants:Object.keys(p.invariants)})); }
    } else {
      const next=transition(p,r,command,args,derive); const temp=join(root,'state/.runtime.tmp');
      await writeFile(temp,JSON.stringify(next,null,2)+'\n',{flag:'wx'}); await rename(temp,path); console.log(JSON.stringify(next.audit.at(-1)));
    }
  } catch(e) { console.error(e instanceof Error?e.message:String(e)); process.exitCode=1; }
}
