import { GenericAdapter } from './generic';
import { InHireAdapter } from './inhire';
import { JobPlatformAdapter } from './types';

const ADAPTERS: JobPlatformAdapter[] = [
  new InHireAdapter(),
  new GenericAdapter(),
];

export function getAdapterForUrl(url: string): JobPlatformAdapter {
  const match = ADAPTERS.find(adapter => adapter.matches(url));
  return match || new GenericAdapter();
}
