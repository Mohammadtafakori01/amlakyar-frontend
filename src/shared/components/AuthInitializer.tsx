import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { useAuth } from '../../domains/auth/hooks/useAuth';
import { fetchProfile } from '../../domains/profile/store/profileSlice';
import { setUser, restoreAuth } from '../../domains/auth/store/authSlice';

export default function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, isAuthenticated, user } = useAuth();
  const hasInitialized = useRef(false);
  const hasRestored = useRef(false);

  // Restore auth tokens from localStorage on mount
  useEffect(() => {
    if (!hasRestored.current && typeof window !== 'undefined') {
      hasRestored.current = true;
      // Always restore from localStorage to ensure tokens are synced
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedToken || storedRefreshToken) {
        dispatch(restoreAuth());
      }
    }
  }, [dispatch]);

  useEffect(() => {
    // Skip if already initialized or if we already have a user
    if (hasInitialized.current || user) {
      return;
    }

    // Check both Redux state and localStorage for token
    // This handles cases where Redux state might not be synced yet
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const tokenToUse = accessToken || storedToken;

    // Only initialize if we have a token but no user
    // Note: We check for token, not isAuthenticated, because after refresh
    // isAuthenticated might be false (user is null) but token exists
    if (!tokenToUse) {
      return;
    }

    let isMounted = true;
    hasInitialized.current = true;
    
    const initializeAuth = async () => {
      try {
        const result = await dispatch(fetchProfile());
        if (isMounted && fetchProfile.fulfilled.match(result)) {
          dispatch(setUser(result.payload));
        } else if (isMounted) {
          // Token is invalid, clear it
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
          hasInitialized.current = false;
        }
      } catch (error) {
        // Token is invalid, clear it
        if (isMounted && typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        hasInitialized.current = false;
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user]);

  // Reset initialization flag when user logs out
  useEffect(() => {
    if (!accessToken && hasInitialized.current) {
      hasInitialized.current = false;
    }
  }, [accessToken]);

  return null;
}

