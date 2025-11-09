import { useEffect, useState } from 'react';
import { getZkLoginSession, clearZkLoginSession } from '@/lib/enoki';

export interface ZkLoginSession {
  address: string;
  zkProof: any;
  userInfo: {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  provider: string;
  _devMode?: boolean;
}

export function useZkLogin() {
  const [session, setSession] = useState<ZkLoginSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session on mount
    const loadSession = () => {
      const storedSession = getZkLoginSession();
      setSession(storedSession);
      setLoading(false);
    };

    loadSession();

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zklogin_session') {
        if (e.newValue) {
          try {
            setSession(JSON.parse(e.newValue));
          } catch {
            setSession(null);
          }
        } else {
          setSession(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    clearZkLoginSession();
    setSession(null);
    // Trigger storage event for same-window updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'zklogin_session',
      newValue: null,
      storageArea: localStorage
    }));
  };

  return {
    session,
    loading,
    logout,
    isConnected: !!session,
  };
}
