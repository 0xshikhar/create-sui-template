export const ENOKI_API_URL = process.env.ENOKI_API_URL || 'https://api.enoki.mystenlabs.com';
export const ZKLOGIN_NETWORK = process.env.ZKLOGIN_NETWORK || 'testnet';

export const ENOKI_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_ENOKI_API_KEY || '';
export const ENOKI_API_KEY = process.env.ENOKI_API_KEY || (process.env.DEV_ZKLOGIN_ALLOW_PUBLIC === 'true' ? (process.env.NEXT_PUBLIC_ENOKI_API_KEY || '') : '');

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export const ORIGIN_FALLBACK = 'http://localhost:3000';
export const ZKLOGIN_REDIRECT_URI = process.env.ZKLOGIN_REDIRECT_URI || `${ORIGIN_FALLBACK}/auth/callback`;
