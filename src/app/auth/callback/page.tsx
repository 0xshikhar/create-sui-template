'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { completeZkLogin } from '@/lib/enoki';

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (hasRunRef.current) return; // guard duplicate runs in Strict Mode
      hasRunRef.current = true;
      const code = searchParams.get('code');
      const state = (searchParams.get('state') || 'google').toLowerCase();
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(errorParam);
        setStatus('error');
        setTimeout(() => router.push('/'), 2500);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setStatus('error');
        setTimeout(() => router.push('/'), 2500);
        return;
      }

      try {
        const data = await completeZkLogin(code, state as any);
        localStorage.setItem('zklogin_session', JSON.stringify(data));
        
        // Trigger storage event for same-window updates
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'zklogin_session',
          newValue: JSON.stringify(data),
          storageArea: localStorage
        }));
        
        setStatus('success');
        setTimeout(() => router.push('/'), 1200);
      } catch (e: any) {
        console.error('Auth callback error', e);
        setError(e?.message || 'Authentication failed');
        setStatus('error');
        setTimeout(() => router.push('/'), 2500);
      }
    };

    run();
  }, [router, searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {status === 'loading' && (
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-blue-500 rounded-full mx-auto mb-4" />
          <div className="text-lg font-medium">Completing sign-in…</div>
        </div>
      )}
      {status === 'success' && (
        <div className="text-center">
          <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">✓</div>
          <div className="text-lg font-medium">Signed in successfully</div>
        </div>
      )}
      {status === 'error' && (
        <div className="text-center">
          <div className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto mb-4">!</div>
          <div className="text-lg font-medium">Authentication failed</div>
          {error && <div className="text-sm text-gray-500 mt-2">{error}</div>}
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="text-center"><div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-blue-500 rounded-full mx-auto mb-4" /><div className="text-lg font-medium">Completing sign-in…</div></div></div>}>
      <CallbackInner />
    </Suspense>
  );
}
