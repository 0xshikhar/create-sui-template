import { ZKLOGIN_NETWORK } from './constants';

// Simple in-memory cache for development
const SALT_CACHE = new Map<string, string>();

const DEFAULT_SALT_API = process.env.MYSTEN_SALT_API || 'https://salt.api.mystenlabs.com/get_salt';

export async function getSaltForJwt(jwt: string, sub?: string): Promise<string> {
  const key = sub || 'unknown';
  const cached = SALT_CACHE.get(key);
  if (cached) return cached;

  const endpoints = [DEFAULT_SALT_API];
  let lastError: any = null;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ token: jwt }),
      });
      const text = await res.text();
      if (!res.ok) {
        lastError = new Error(`salt_api_error(${res.status}) from ${url}: ${text}`);
        continue;
      }
      let data: any = text;
      try { data = JSON.parse(text); } catch {}
      const salt = data?.salt ?? data?.data?.salt ?? data?.result?.salt;
      if (!salt) {
        lastError = new Error(`salt_api_no_salt from ${url}: ${text}`);
        continue;
      }
      SALT_CACHE.set(key, String(salt));
      return String(salt);
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('salt_api_failed_all_endpoints');
}
