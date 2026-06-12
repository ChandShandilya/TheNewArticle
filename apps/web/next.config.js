/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Shared workspace package ships ESM source in dist — let Next transpile it.
  transpilePackages: ['@tna/types'],
  // Lean output for low-bandwidth: no source maps in prod, powered-by header off.
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },
};

module.exports = nextConfig;
