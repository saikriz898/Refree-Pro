'use client';
import { localApiRouter } from '@/lib/local-api';

import { ensureTables } from '@/db';

let tablesEnsured = false;

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    let urlStr = '';
    if (typeof input === 'string') urlStr = input;
    else if (input instanceof URL) urlStr = input.toString();
    else if (input instanceof Request) urlStr = input.url;

    if (urlStr.includes('/api/')) {
      if (!tablesEnsured) {
        await ensureTables().catch(console.error);
        tablesEnsured = true;
      }
      
      let req: Request;
      if (input instanceof Request) {
        req = new Request(input, init);
      } else {
        req = new Request(input, init);
      }
      
      const res = await localApiRouter(req);
      if (res) return res;
    }
    return originalFetch(input, init);
  };
}

export function FetchInterceptor() {
  return null;
}
