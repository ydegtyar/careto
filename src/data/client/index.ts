import { type Remote, wrap } from 'comlink';
import type { WorkerApi } from '../worker/data.worker';

let workerInstance: Worker | null = null;
let apiProxy: Remote<WorkerApi> | null = null;

export function getDataClient(): Remote<WorkerApi> {
  if (!apiProxy) {
    workerInstance = new Worker(new URL('../worker/data.worker.ts', import.meta.url), {
      type: 'module',
    });
    apiProxy = wrap<WorkerApi>(workerInstance);
  }
  return apiProxy;
}

export const data = getDataClient();
