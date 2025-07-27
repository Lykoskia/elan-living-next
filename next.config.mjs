/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'elan-living-strapi-production.up.railway.app',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
  experimental: {
    ppr: 'incremental',
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};

let userConfig;
try {
  // Use dynamic import which returns a promise
  userConfig = await import('./v0-user-next.config.mjs').catch(async () => {
    try {
      return await import('./v0-user-next.config.js');
    } catch {
      return null;
    }
  });
} catch (e) {
  console.log('No user config found or error importing it:', e);
}

// Merge user config if it exists
if (userConfig) {
  const config = userConfig.default || userConfig;
  
  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key]) &&
      config[key] !== null &&
      typeof config[key] === 'object'
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      };
    } else {
      nextConfig[key] = config[key];
    }
  }
}

export default nextConfig;