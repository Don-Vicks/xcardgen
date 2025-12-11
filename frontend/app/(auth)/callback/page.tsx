'use client';

import { useAuth } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function CallbackContent() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if ((user.workspaceMemberships && user.workspaceMemberships.length > 0) || (user.workspaceOwnerships && user.workspaceOwnerships.length > 0)) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Authenticating...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
