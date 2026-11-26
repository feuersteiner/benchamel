#!/usr/bin/env bun
import { inspect,judgeDomain } from '../../harness/domain-judge.ts';
export const inspectWorkspace=(workspace:string)=>inspect(import.meta.dir,workspace);
export const judge=(workspace:string)=>judgeDomain(import.meta.dir,workspace);
if(import.meta.main){const workspace=process.argv[2];if(!workspace)throw Error('Usage: bun judge.ts WORKSPACE [--inspect]');console.log(JSON.stringify(process.argv.includes('--inspect')?await inspectWorkspace(workspace):{score:await judge(workspace)}));}
