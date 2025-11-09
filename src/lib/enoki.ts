import { ENOKI_PUBLIC_API_KEY, GOOGLE_CLIENT_ID, ZKLOGIN_REDIRECT_URI, ZKLOGIN_NETWORK } from './constants';

export const zkLoginProviders = {
  google: {
    name: 'Google',
    clientId: GOOGLE_CLIENT_ID,
    icon: '🔍',
    color: 'from-red-500 to-red-600',
    scope: 'openid email profile'
  },
};

/**
 * Get OAuth authorization URL for zkLogin
 */
export async function getAuthUrl(provider: keyof typeof zkLoginProviders) {
  const config = zkLoginProviders[provider];
  if (!config.clientId) throw new Error(`${config.name} client ID not configured`);
  try {
    console.debug('[enoki] getAuthUrl (server)', { provider, clientId: config.clientId.slice(-6) });
    const res = await fetch(`/api/auth/zklogin/url?provider=${encodeURIComponent(provider)}`);
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Failed to get server auth url (${res.status}): ${t}`);
    }
    const data = await res.json();
    if (!data.url) throw new Error('No auth url returned');
    return data.url as string;
  } catch (error) {
    console.error(`[enoki] Failed to get auth URL for ${provider}:`, error);
    throw error;
  }
}

/**
 * Complete zkLogin authentication by exchanging code for session
 */
export async function completeZkLogin(authCode: string, provider: keyof typeof zkLoginProviders) {
  try {
    console.debug('[enoki] completeZkLogin', { provider, codePrefix: authCode.slice(0, 6) });
    
    // Call server endpoint to exchange code for zkLogin session
    const response = await fetch('/api/auth/zklogin/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: authCode,
        provider,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[enoki] completeZkLogin failed', { status: response.status, error: errorText });
      throw new Error(`zkLogin failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.debug('[enoki] zkLogin completed', { address: result.address?.slice(0, 10) });
    
    return {
      address: result.address,
      zkProof: result.zkProof,
      userInfo: result.userInfo,
      provider,
    };
  } catch (error) {
    console.error('[enoki] Failed to complete zkLogin:', error);
    throw error;
  }
}

/**
 * Start zkLogin flow by redirecting to OAuth provider
 */
export async function startZkLogin(provider: keyof typeof zkLoginProviders = 'google') {
  try {
    console.debug('[enoki] startZkLogin', { provider });
    
    // Store provider for callback
    try {
      localStorage.setItem('zklogin_provider', provider);
    } catch (e) {
      console.warn('[enoki] Failed to store provider in localStorage:', e);
    }
    
    const authUrl = await getAuthUrl(provider);
    console.debug('[enoki] Redirecting to OAuth', { provider, urlPrefix: authUrl.slice(0, 50) });
    
    // Redirect to OAuth provider
    window.location.href = authUrl;
  } catch (error) {
    console.error('[enoki] startZkLogin error:', error);
    throw error;
  }
}

/**
 * Get stored zkLogin session from localStorage
 */
export function getZkLoginSession() {
  try {
    const session = localStorage.getItem('zklogin_session');
    if (!session) return null;
    return JSON.parse(session);
  } catch (error) {
    console.warn('[enoki] Failed to parse zkLogin session:', error);
    return null;
  }
}

/**
 * Clear zkLogin session
 */
export function clearZkLoginSession() {
  try {
    localStorage.removeItem('zklogin_session');
    localStorage.removeItem('zklogin_provider');
    console.debug('[enoki] Cleared zkLogin session');
  } catch (error) {
    console.warn('[enoki] Failed to clear zkLogin session:', error);
  }
}
