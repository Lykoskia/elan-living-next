/** @type {import('next').NextConfig} */
const nextConfig = {
  // External image optimization for Strapi
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'elan-living-strapi-production.up.railway.app',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    quality: 80,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimize bundle size
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      'react-intersection-observer'
    ],
  },

  // Better caching headers
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Cache pages with ISR-friendly headers
        source: '/((?!api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Optimize production build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ✅Better compression
  compress: true,

  // Reduce bundle size
  swcMinify: true,

  // Enable standalone output for better deployment
  output: 'standalone',

  // Better performance monitoring
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;