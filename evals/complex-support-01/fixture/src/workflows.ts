import seed from "../data/seed.json";
import finance from "../policies/finance.json";
import service from "../policies/service.json";
import support from "../policies/support.json";

// Fixed synthetic adapters. No network, wall clock, environment or random values.
export type State = Record<string, any>;
export type Args = Record<string, string>;
export type Event = { seq: number; at: string; actor: string; command: string; args: Args; receipt: unknown };
export type Runtime = { state: State; audit: Event[] };
export const initial = (): State => structuredClone(seed.initial);
export const canonical = (v: any): string => JSON.stringify(v, (_k, x) => x && typeof x === "object" && !Array.isArray(x)
  ? Object.fromEntries(Object.keys(x).sort().map(k => [k, x[k]])) : x);
const fail = (message: string): never => { throw new Error(message); };
const time = (s: string): number => {
  if (!/^2024-03-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s) || !Number.isFinite(Date.parse(s))
    || new Date(s).toISOString().replace('.000Z', 'Z') !== s) fail("Use an exact March 2024 UTC timestamp: YYYY-MM-DDTHH:mm:ssZ");
  return Date.parse(s);
};
function options<const K extends string>(a: Args, required: readonly K[], optional: readonly string[] = []): asserts a is Args & Record<K, string> {
  if (!a || typeof a !== 'object' || Array.isArray(a) || Object.entries(a).some(([k,v]) => typeof v !== 'string' || !v.trim() || ![...required,...optional].includes(k))
    || required.some(k => !a[k]?.trim())) fail(`Required: ${required.join(', ') || '(none)'}. Optional: ${optional.join(', ') || '(none)'}`);
}
const reason = (text: string) => { if (text.trim().length < 20 || text.length > 1600) fail("Supply a specific reason/question (20–1600 characters)."); };
function active(s: State) {
  if (s.collection.status !== 'DISPUTE-HOLD' || time(s.collection.until) < time(s.now)
    || s.collection.dunning || s.collection.debitQueued || s.collection.suspension) fail("Confirm an active incident collection hold first.");
}
export function invariants(s: State) {
  const l = s.ledger;
  if (l.invoiceCents !== 10450000 || l.settledCents !== 60000 || l.basePaidCents !== 12000
    || ![l.receivableCents,l.creditCents,l.refundLiabilityCents,l.refundRequestedCents,l.refundAcceptedCents].every(Number.isSafeInteger)
    || l.receivableCents + l.creditCents !== 10390000 || ![0,10390000].includes(l.creditCents)
    || l.refundLiabilityCents !== (l.creditCents ? 60000 : 0)
    || ![0,60000].includes(l.refundRequestedCents) || ![0,60000].includes(l.refundAcceptedCents)
    || l.refundAcceptedCents > l.refundRequestedCents || l.refundRequestedCents > l.refundLiabilityCents
    || l.refundBankPosted !== false) fail("Ledger invariant failed; bank posting is outside this simulator.");
  if (s.subscription.plan !== seed.account.plan || s.subscription.renewal !== seed.account.renewal
    || s.subscription.status !== 'unchanged' || s.subscription.consent !== null) fail("No authenticated subscription election is available.");
  if (s.incident.preservation !== 'P-31' || s.incident.preservationUntil !== service.preservationUntil
    || s.incident.status !== 'open' || s.incident.cause !== 'unresolved') fail("Incident/preservation scope changed.");
}

export function apply(before: State, command: string, a: Args): { state: State; receipt: any } {
  const s = structuredClone(before);
  const at = s.now;
  let receipt: any;
  switch (command) {
    case 'clock': {
      options(a,['to']);
      if (time(a.to) <= time(s.now) || time(a.to) > time('2024-03-08T18:00:00Z')) fail("Clock must advance, no later than March 8 18:00.");
      s.now = a.to; receipt = {clock:s.now}; break;
    }
    case 'hold-extend': {
      options(a,['until','reason']); reason(a.reason);
      if (time(a.until) <= time(s.collection.until) || time(a.until) > time(finance.holdLimit)
        || Math.floor(time(a.until) / 86400000) - Math.floor(time(s.now) / 86400000) > 7) fail("Lead extension must increase expiry, within seven calendar days and March 8 18:00.");
      s.collection = {...s.collection, until:a.until, status:'DISPUTE-HOLD', dunning:false, debitQueued:false, suspension:false};
      receipt = {system:'collections', confirmed:true, scope:s.collection.scope, until:a.until, renewalExcluded:true, reason:a.reason}; break;
    }
    case 'review-open': {
      options(a,['question']); reason(a.question); active(s);
      if (s.review || s.finance.status !== 'none') fail("A review/request is already recorded.");
      if (time(s.now) > time(support.reviewRequestBy)) fail("Leon's 15:30 slot required booking by 15:15; use an authorized immediate route or record a revised owner/deadline.");
      s.review = {status:'booked', question:a.question, sources:['E16','E18','E19'], leonAt:support.leonSlot, decisionAt:support.inezSlot, owner:'Inez Holt'};
      receipt = {system:'support-scheduler', leonConfirmed:support.leonSlot, inezConfirmed:support.inezSlot, question:a.question}; break;
    }
    case 'review-poll': {
      options(a,[]);
      if (s.review?.status !== 'booked' || time(s.now) < time(support.inezSlot)) fail("Focused review is not due; Inez responds at 16:10.");
      s.review = {...s.review,status:'clarified', leon:'Runner digest not recovered; unit, version and execution remain unverified.', decision:'Inez accepts E18 for A-73; E19 does not establish a commissioned load test. Attribution remains open.', decidedAt:s.now};
      receipt = {system:'finance-director', approval:'A-73', conditionAccepted:true, review:s.review}; break;
    }
    case 'finance-submit': {
      options(a,['route','reason','evidence']); reason(a.reason); active(s);
      if (finance.id !== 'FIN-3.2' || finance.supersedes !== 'FIN-2.4') fail("Current authority unavailable.");
      if (!['immediate','review'].includes(a.route) || (a.route === 'review' && s.review?.status !== 'clarified')) fail("Choose immediate, or complete the focused review before using route review.");
      if (s.review?.status === 'booked' && a.route === 'immediate') fail("Resolve the recorded condition review before submission.");
      const cited = a.evidence.split(',');
      if (['E07','E08','E16','E18','E19'].some(id=>!cited.includes(id)) || cited.some(id=>!/^E(0[1-9]|1\d|20)$/.test(id))) fail("Attach at least E07,E08,E16,E18,E19; reconcile the conflicting evidence.");
      if (s.finance.status !== 'none' || time(s.now) > time(finance.approvalExpires)) fail("Approval expired or request already exists.");
      const slot = time(s.now) <= time(finance.cutoff) ? finance.postingWindow : finance.fallbackWindow;
      if (time(slot) < time(s.now)) fail("The modeled posting windows have passed; keep collection protected and assign Finance follow-up.");
      s.finance = {...s.finance,status:'requested',request:{id:'FIN-H482',approval:finance.approval,route:a.route,reason:a.reason,evidence:cited,requestedAt:s.now,owner:'Sam',postAt:slot,creditCents:finance.creditCents,refundCents:finance.refundCents,reversalChecked:true,reversalFound:false}};
      receipt = {system:'finance-queue', accepted:true, ...s.finance.request, note:'Request accepted; credit and cash return not yet posted.'}; break;
    }
    case 'finance-poll': {
      options(a,[]); active(s);
      if (s.finance.status !== 'requested' || time(s.now) < time(s.finance.request.postAt)) fail("No due finance request.");
      s.ledger.creditCents = finance.creditCents; s.ledger.receivableCents = 0; s.ledger.refundLiabilityCents = finance.refundCents;
      s.finance.status='posted'; s.finance.posting={creditNote:'CN-H482',at:s.now,owner:'Sam',invoice:s.ledger.invoice,creditCents:finance.creditCents,refundLiabilityCents:finance.refundCents,reversalRechecked:true,reversalFound:false};
      receipt = {system:'finance-ledger',...s.finance.posting,bankPosted:false}; break;
    }
    case 'refund-submit': {
      options(a,[]);
      if (s.finance.status !== 'posted' || s.finance.refund) fail("A posted credit and an unsubmitted refund liability are required.");
      s.ledger.refundRequestedCents=finance.refundCents;
      s.finance.refund={reference:'RF-H482',status:'submitted',method:'original',cents:finance.refundCents,submittedAt:s.now,responseAt:new Date(time(s.now)+5*60000).toISOString().replace('.000Z','Z'),reversalRechecked:true,reversalFound:false};
      receipt={system:'payment-processor',...s.finance.refund,bankPosted:false}; break;
    }
    case 'refund-poll': {
      options(a,[],['simulate']);
      if (a.simulate && a.simulate !== 'failure') fail("Only --simulate failure is available.");
      if (s.finance.refund?.status !== 'submitted' || time(s.now) < time(s.finance.refund.responseAt)) fail("No processor response due.");
      s.finance.refund.status=a.simulate === 'failure' ? 'failed' : 'accepted';
      if (s.finance.refund.status === 'accepted') s.ledger.refundAcceptedCents=finance.refundCents;
      else s.work.push({area:'finance',owner:'Sam',due:new Date(time(s.now)+30*60000).toISOString().replace('.000Z','Z'),action:'Correct processor instructions, recheck reversal before retry; Niko updates customer on failure.'});
      receipt={system:'payment-processor',...s.finance.refund,estimate:finance.refundEstimate,bankPosted:false}; break;
    }
    case 'mitigation-request': {
      options(a,['deployment','consent']);
      if (s.mitigation.status !== 'none' || a.deployment !== service.deployment || a.consent !== service.authorizedConsent
        || !seed.consents.some(c=>c.id===a.consent && c.authenticated && c.site===service.allowedSite && c.action===service.allowedAction)) fail("Requires the recorded consent for the exact Linden deployment, once only.");
      s.mitigation={...s.mitigation,status:'requested',deployment:a.deployment,consent:a.consent,owner:'Tomas',requestedAt:s.now,readyAt:new Date(time(s.now)+30*60000).toISOString().replace('.000Z','Z'),rollback:service.rollback};
      receipt={system:'engineering',...s.mitigation,unchangedSites:seed.sites.filter(x=>x.id!=='linden').map(x=>x.id)}; break;
    }
    case 'mitigation-poll': {
      options(a,[],['simulate']);
      if (a.simulate && a.simulate !== 'failure') fail("Only --simulate failure is available.");
      if (s.mitigation.status !== 'requested' || time(s.now)<time(s.mitigation.readyAt)) fail("No deployment response due.");
      s.mitigation={...s.mitigation,status:a.simulate === 'failure'?'rolled-back':'verified',regions:a.simulate === 'failure'?[]:service.verificationRegions,verifiedAt:s.now,ticketLinksPreserved:true,informationPagesUntouched:true};
      if (a.simulate === 'failure') s.work.push({area:'engineering',owner:'Tomas',due:new Date(time(s.now)+30*60000).toISOString().replace('.000Z','Z'),action:'Linden-only rollback completed; diagnose failed verification, request safe retry; Niko updates Mara.'});
      receipt={system:'engineering',...s.mitigation,cap:false}; break;
    }
    case 'incident-request': {
      options(a,[]);
      if (s.incident.request) fail("Incident request already assigned.");
      s.incident.request={id:'SEC-H482',owner:'Priya',privacyOwner:'Privacy',requestedAt:s.now,briefAt:time(s.now)<=time('2024-03-01T16:00:00Z')?'2024-03-01T16:20:00Z':'2024-03-04T16:00:00Z',nextUpdate:support.securityUpdate,scope:'Minimized account-level aggregate explanation; no raw visitor or third-party data.'};
      receipt={system:'security-privacy',...s.incident.request,preservation:'P-31',cause:'unresolved'}; break;
    }
    case 'incident-poll': {
      options(a,[]);
      if (!s.incident.request || s.incident.packet || time(s.now)<time(s.incident.request.briefAt)) fail("No minimized packet due.");
      s.incident.packet={id:'SEC-H482-MIN',reviewedBy:['Priya','Privacy'],at:s.now,scope:'Aggregate time windows and asset classes only; third-party identifiers removed.',limitations:seed.evidence.sample,reviewMissConfirmed:true,notice:'Dispatch evidence does not prove receipt/usefulness; retry and runner history unresolved.',nextUpdate:support.securityUpdate};
      receipt={system:'security-privacy',packet:s.incident.packet,finalReport:false}; break;
    }
    case 'renewal-options': {
      options(a,[]);
      if (s.subscription.choiceRequest) fail("Choice request already prepared.");
      s.subscription.choiceRequest={id:'CHOICE-H482',status:'prepared-not-sent',owner:'Niko Reed',due:'2024-03-03T12:00:00Z',options:['Continue $120 monthly with metering; no spending cap','Optional Team Plus review; no retrospective protection or annual election','Mara may request scoped nonrenewal/transition; verify export and continuity first'],renewal:seed.account.renewal,reliefIndependent:true,priorSalesCorrection:'Annual purchase is not required for relief and is not a cap.'};
      receipt={system:'customer-operations',...s.subscription.choiceRequest,consentReceived:false,subscriptionChanged:false}; break;
    }
    case 'export-prepare': {
      options(a,[]);
      if (s.subscription.export) fail("Export inventory already prepared.");
      s.subscription.export={status:'inventory-ready',owner:'Customer Operations',items:['built deployment artifacts','redirects','configuration','available operational records'],excludes:['externally hosted source repositories','registrar domains','raw third-party visitor identifiers'],verification:'Customer usability check required before any cutoff',retention:'30 days after termination for ordinary artifacts; original shorter log retention; P-31 through March 15',cutoffScheduled:false};
      receipt={system:'customer-operations',...s.subscription.export}; break;
    }
    case 'task': {
      options(a,['area','owner','due','action']); reason(a.action);
      const owners:Record<string,string[]>={finance:['Sam','Inez Holt'],engineering:['Tomas'],incident:['Priya','Privacy'],renewal:['Niko Reed','Rhea','Customer Operations'],support:['Niko Reed','Rhea']};
      if (!owners[a.area]?.includes(a.owner) || time(a.due)<time(s.now)) fail("Use a case owner and a future deadline for finance, engineering, incident, renewal or support.");
      if (s.work.length>=30) fail("Keep the handoff focused (30 tasks maximum).");
      const task={area:a.area,owner:a.owner,due:a.due,action:a.action}; s.work.push(task); receipt={system:'support',task}; break;
    }
    case 'commitments': {
      options(a,['finance','mitigation','hold-until','next-update']);
      const financial = s.finance.refund?.status === 'accepted'?'refund-accepted':s.finance.refund?.status === 'failed'?'refund-failed':s.finance.refund?.status === 'submitted'?'refund-submitted':s.finance.status;
      if (a.finance !== financial || a.mitigation !== s.mitigation.status || a['hold-until'] !== s.collection.until) fail(`Claim mismatch: finance=${financial}, mitigation=${s.mitigation.status}, hold-until=${s.collection.until}`);
      active(s);
      if (time(a['next-update'])<time(s.now) || time(a['next-update'])>time(support.updateDue)) fail("Customer update must remain achievable by 16:30 March 1.");
      s.ticket.nextUpdate=a['next-update']; s.commitments={at:s.now,finance:financial,mitigation:s.mitigation.status,holdUntil:s.collection.until,nextUpdate:a['next-update'],sent:false};
      receipt={system:'support',...s.commitments}; break;
    }
    case 'handoff': {
      options(a,['note']); reason(a.note); active(s);
      if (!s.commitments) fail("Record state-backed commitments before handoff.");
      if (['finance','engineering','incident','renewal','support'].some(area=>!s.work.some((t:any)=>t.area===area))) fail("Assign surviving finance, engineering, incident, renewal and support work first.");
      s.handoff={to:support.weekendOwner,starts:support.weekendStarts,at:s.now,note:a.note,ledger:structuredClone(s.ledger),finance:structuredClone(s.finance),collection:structuredClone(s.collection),mitigation:structuredClone(s.mitigation),incident:structuredClone(s.incident),renewal:structuredClone(s.subscription),nextUpdate:s.ticket.nextUpdate,tasks:structuredClone(s.work)};
      receipt={system:'support-handoff',to:support.weekendOwner,starts:support.weekendStarts,accepted:true}; break;
    }
    case 'settlement': case 'service-pause': case 'subscription-change': case 'data-delete': case 'raw-disclose':
      return fail("Rejected: no scoped authority/consent for that operation. A-73 cannot authorize substitution; existing consent covers Linden video only. No state changed.");
    default: return fail(`Unknown workflow: ${command}. Use help.`);
  }
  invariants(s);
  return {state:s,receipt:{at,actor:s.actor,policy:[finance.id,service.id,support.id],...receipt}};
}

export function transition(runtime: Runtime, command: string, args: Args): Runtime {
  if (runtime.audit.length >= 100) fail("Audit limit reached (100 events).");
  const {state,receipt}=apply(runtime.state,command,args);
  return {state,audit:[...runtime.audit,{seq:runtime.audit.length+1,at:runtime.state.now,actor:seed.initial.actor,command,args,receipt}]};
}

export function replay(runtime: Runtime): State {
  if (!runtime || !Array.isArray(runtime.audit) || runtime.audit.length>100 || Object.keys(runtime).sort().join(',')!=='audit,state') fail("Malformed runtime snapshot.");
  let expected:Runtime={state:initial(),audit:[]};
  for (const event of runtime.audit) {
    expected=transition(expected,event.command,event.args);
    if (canonical(expected.audit.at(-1))!==canonical(event)) fail("Audit receipt/sequence does not match the trusted adapter.");
  }
  if (canonical(expected.state)!==canonical(runtime.state)) fail("Runtime state differs from trusted audit replay.");
  invariants(expected.state);
  return expected.state;
}
