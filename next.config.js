const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
  buildExcludes: [/app-build-manifest\.json$/],
  publicExcludes: ['!noprecache/**/*'],
});

const nextConfig = {
  reactStrictMode: true,
  // Only use static export in production, not in development
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Use relative paths for Electron file:// protocol compatibility
  // Only when ELECTRON=true, not for Docker/web deployment
  ...(process.env.NODE_ENV === 'production' && process.env.ELECTRON === 'true' && { assetPrefix: './' }),
  basePath: '',
  // Proxy API requests to backend in development to avoid CORS
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://185.215.244.196:3002';
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = withPWA(nextConfig);

