/** Offline structural/native-eval wiring checks. No semantic model judgments. */
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Agentests } from 'agentests';
import { config } from '../../../harness/treatments/gate.ts';
import { replay, type Policy } from '../../../harness/fixture-engine.ts';
import { derive } from '../fixture/src/integrations.ts';

const root = join(import.meta.dir, '..');
const domains = ['legal', 'marketing', 'customer-support'] as const;
const targets = {
  legal: 'cs03-legal-supplier-classification',
  marketing: 'cs03-marketing-refund-purchase-choice',
  'customer-support': 'cs03-customer-support-negative-transitions',
};
type Assertion = { id: string; description: string; error: string; decide: string };
type NativeTest = { version: number; id: string; select: { glob: string[] }; assert: Assertion[] };
const policy: Policy = await Bun.file(join(root, 'fixture/policies/domain.json')).json();
const provenance = await Bun.file(join(root, 'fixture/provenance.json')).json() as {documents: {id:string;file:string}[]};
const ids = new Set<string>();
const tests: {domain: typeof domains[number]; test: NativeTest; source: string; unsafe: string}[] = [];
assert.equal(await Bun.file(join(root, 'treatments/agentests/test.yaml')).exists(), false);
for (const domain of domains) {
  const source = join(root, 'treatments/agentests', domain);
  const test = Bun.YAML.parse(await readFile(join(source, 'test.yaml'), 'utf8')) as NativeTest;
  assert.equal(test.version, 1);
  assert.equal(test.id, `complex-support-03-${domain}`);
  assert.deepEqual(test.select, {glob: ['review.md']});
  assert(test.assert.length >= 15);
  const doc = await readFile(join(source, 'TEST.md'), 'utf8');
  const manifest = await Bun.file(join(source, 'context.json')).json() as {evidence:string[]};
  assert.deepEqual(Object.keys(manifest), ['evidence']);
  assert(manifest.evidence.length > 0);
  assert.equal(new Set(manifest.evidence).size, manifest.evidence.length);
  for (const item of test.assert) {
    assert(!ids.has(item.id), item.id); ids.add(item.id);
    assert.deepEqual(Object.keys(item).sort(), ['decide','description','error','id']);
    assert(item.description.length > 10 && item.error.length > 20 && item.decide.length > 20);
    assert(doc.includes(`| \`${item.id}\` |`), `Missing coverage row ${item.id}`);
    for (const match of item.decide.matchAll(/evidence\.(E\d\d)/g)) assert(manifest.evidence.includes(match[1]!));
  }
  for (const specimen of ['safe', 'unsafe', 'alternative']) {
    const packet = await Bun.file(join(source, 'evals', specimen, 'review.md')).json();
    assert.deepEqual(Object.keys(packet).sort(), ['audit','evidence','outputs','state']);
    assert.deepEqual(Object.keys(packet.outputs).sort(), ['plan.md','reply.md']);
    for (const output of Object.values(packet.outputs)) assert(typeof output === 'string' && output.length > 100);
    replay(policy, {state:packet.state, audit:packet.audit}, derive);
    assert.deepEqual(Object.keys(packet.evidence).sort(), manifest.evidence);
    for (const id of manifest.evidence) {
      const document = provenance.documents.find(d => d.id === id); assert(document);
      assert.equal(packet.evidence[id], await readFile(join(root, 'fixture/docs/evidence', document.file), 'utf8'));
    }
  }
  assert.equal(await Bun.file(join(source, 'evals/irrelevant/review.md')).exists(), false);
  tests.push({domain, test, source, unsafe:await readFile(join(source, 'evals/unsafe/review.md'), 'utf8')});
}

const temp = await mkdtemp(join(tmpdir(), 'cs03-native-check-'));
const previous = process.cwd();
try {
  for (const {test,source} of tests) await cp(source, join(temp, '.agents/tests', test.id), {recursive:true});
  const init = Bun.spawn(['git','init','--quiet',temp], {stdout:'ignore',stderr:'pipe'});
  assert.equal(await init.exited, 0);
  for (const provider of ['luna','jev'] as const) {
    const settings = config(provider);
    await writeFile(join(temp, 'agentests.config.yaml'), JSON.stringify(settings));
    const cli = Bun.spawn(['node',join(root,'../../node_modules/agentests/dist/cli/index.js'),'validate'], {cwd:temp,stdout:'pipe',stderr:'pipe'});
    const [code, stdout, stderr] = await Promise.all([cli.exited,new Response(cli.stdout).text(),new Response(cli.stderr).text()]);
    assert.equal(code, 0, stdout+stderr);
    process.chdir(temp);
    for (const {domain,test,unsafe} of tests) {
      const seen = new Map<string,number>();
      const target = test.assert.find(a => a.id === targets[domain]); assert(target);
      class Offline extends Agentests {
        constructor() {
          super(settings, {OPENAI_API_KEY:'offline-placeholder',TYPESAFE_AI_API_KEY:'offline-placeholder'});
          this.engines.decide = async (input, criteria) => {
            const item = test.assert.find(a => a.decide === criteria); assert(item);
            seen.set(item.id, (seen.get(item.id)??0)+1);
            // Fixture identity + injected assertion failure, deliberately no semantic interpretation.
            return input === unsafe && item.id === target!.id ? 0 : 1;
          };
          this.engines.reason = async () => {throw Error('Unexpected reasoning inference');};
        }
      }
      const results = await new Offline().eval(test.id);
      assert.equal(results.length,1);
      assert.equal(results[0]!.evals.length,4);
      for (const result of results[0]!.evals) {
        assert(result.matches);
        if (result.actual === 'fail') assert.deepEqual(result.findings.map(f => f.assertion.id), [target.id]);
        else assert.equal(result.findings.length,0);
      }
      assert.deepEqual([...seen.keys()].sort(), test.assert.map(a => a.id).sort());
      assert([...seen.values()].every(n => n===3)); // safe, unsafe and alternative; irrelevant is skipped.
    }
    process.chdir(previous);
  }
} finally {process.chdir(previous); await rm(temp,{recursive:true,force:true});}
console.log(JSON.stringify({offline:true, assertions:Object.fromEntries(tests.map(t=>[t.domain,t.test.assert.length])), nativeProviders:['luna','jev'], specimens:'replay-and-selection-checked', semanticValidation:'not-run'}));
