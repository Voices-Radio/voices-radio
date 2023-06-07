export async function fetcher<JSON = any>(
  ...args: [input: RequestInfo, init?: RequestInit]
): Promise<JSON> {
  const r = await fetch(...args);
  if (r.ok) return r.json();
  throw new Error((await r.json()).message);
}
