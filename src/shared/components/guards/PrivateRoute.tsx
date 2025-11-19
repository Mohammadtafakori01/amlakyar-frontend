import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../domains/auth/hooks/useAuth';
import Loading from '../common/Loading';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * PrivateRoute - Protects routes that require authentication
 * Redirects unauthenticated users to the login page
 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, accessToken, user } = useAuth();
  const redirectingRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect after mount and when not loading
    if (!mounted || isLoading) {
      return;
    }

    if (!isAuthenticated && !accessToken && !redirectingRef.current) {
      redirectingRef.current = true;
      // Use replace instead of push to avoid adding to history
      router.replace('/').catch(() => {
        redirectingRef.current = false;
      });
    }
  }, [isAuthenticated, isLoading, accessToken, router, mounted]);

  // Show loading during initial mount or while checking auth
  if (!mounted || isLoading) {
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

