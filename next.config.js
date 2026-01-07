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
  // Configure webpack to handle Capacitor plugins as optional externals
  webpack: (config, { isServer }) => {
    // Mark Capacitor plugins as externals so webpack doesn't try to bundle them
    // These are only available in Capacitor runtime, not in web builds
    if (!isServer) {
      const webpack = require('webpack');
      
      // Use IgnorePlugin to ignore Capacitor plugins during web build
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^@capacitor\/(filesystem|share)$/,
        })
      );
      
      // Mark as externals to prevent webpack from trying to resolve them
      const originalExternals = config.externals || [];
      config.externals = [
        ...(Array.isArray(originalExternals) ? originalExternals : [originalExternals]),
        ({ request }, callback) => {
          if (request && /^@capacitor\/(filesystem|share)$/.test(request)) {
            // Return undefined to indicate the module should be ignored
            return callback();
          }
          callback();
        },
      ].filter(Boolean);
    }
    return config;
  },
  // Proxy API requests to backend in development to avoid CORS
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.amlakyarr.com/';
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

