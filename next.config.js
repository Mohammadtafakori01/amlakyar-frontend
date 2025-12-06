const withPWA = require('next-pwa')({
  dest: 'public',
  register: process.env.ELECTRON !== 'true', // Disable ServiceWorker registration for Electron (file:// protocol)
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' || process.env.ELECTRON === 'true', // Disable PWA for Electron builds
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
  ...(process.env.NODE_ENV === 'production' && process.env.ELECTRON === 'true' && { 
    assetPrefix: './',
  }),
  basePath: '',
  // Proxy API requests to backend in development to avoid CORS
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.amlakyarr.com';
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

