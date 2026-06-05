import { client } from '@/db';

export const cookies = async () => ({
  get: (name: string) => {
     if (typeof document === 'undefined') return { value: undefined };
     const value = document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
     return { value };
  }
});

export const NextResponse = {
  json: (body: any, init?: ResponseInit) => new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  })
};

// Mock Neon SQL tagged template for PGlite
export function neon(url: string) {
  return async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
    let text = '';
    for (let i = 0; i < strings.length; i++) {
        text += strings[i];
        if (i < values.length) {
            text += `$${i + 1}`;
        }
    }
    const result = await client.query(text, values);
    return result.rows;
  };
}
