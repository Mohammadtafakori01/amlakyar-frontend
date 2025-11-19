import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../domains/auth/hooks/useAuth';
import Loading from '../common/Loading';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, accessToken, user } = useAuth();
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !accessToken && !redirectingRef.current) {
      redirectingRef.current = true;
      // Use replace instead of push to avoid adding to history
      router.replace('/').catch(() => {
        redirectingRef.current = false;
      });
    }
  }, [isAuthenticated, isLoading, accessToken, router]);

  if (isLoading) {
    return <Loading message="در حال بررسی احراز هویت..." />;
  }

  // If we have a token but no user yet, we're still initializing (fetching user profile)
  // Show loading state instead of redirecting
  if (accessToken && !user) {
    return <Loading message="در حال بارگذاری..." />;
  }

  if (!isAuthenticated && !accessToken) {
    return <Loading message="در حال هدایت..." />;
  }

  return <>{children}</>;
}

