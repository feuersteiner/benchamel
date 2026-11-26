import { derive } from './integrations.ts';
const { cli }=await import('../.benchamel/'+'engine.ts');
await cli(import.meta.dir+'/..',derive);
