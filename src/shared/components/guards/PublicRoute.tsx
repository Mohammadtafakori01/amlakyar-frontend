import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../domains/auth/hooks/useAuth';
import Loading from '../common/Loading';

interface PublicRouteProps {
  children: React.ReactNode;
  /**
   * Redirect path for authenticated users (default: '/dashboard')
   */
  redirectTo?: string;
}

/**
 * PublicRoute - Protects routes that should only be accessible to unauthenticated users
 * Redirects authenticated users to the dashboard (or specified path)
 */
export default function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, accessToken, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const redirectingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect on client side after mount
    if (!mounted || isLoading) {
      return;
    }

    // If user is authenticated (has token and user), redirect to dashboard
    if (isAuthenticated && user && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace(redirectTo).catch(() => {
        redirectingRef.current = false;
      });
    }
  }, [isAuthenticated, isLoading, user, mounted, router, redirectTo]);

  // Show loading while checking auth or during redirect
  if (!mounted || isLoading || (isAuthenticated && user)) {
    return <Loading message="در حال بارگذاری..." />;
  }

  // If we have a token but no user yet, we're still initializing
  // Allow the page to render (AuthInitializer will handle fetching user)
  return <>{children}</>;
}

