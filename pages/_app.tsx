import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import Providers from '../src/app/providers';
import AuthInitializer from '../src/shared/components/AuthInitializer';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Providers>
      <AuthInitializer />
      <Component {...pageProps} />
    </Providers>
  );
}

