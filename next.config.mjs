/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [{ hostname: "cdn.sanity.io" }],
  },
  webpack: (config) => {
    // Exclude the bolt folder from Next.js compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/bolt/**', '**/node_modules/**'],
    };
    return config;
  },
  // Exclude bolt folder from TypeScript compilation
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude bolt folder from ESLint
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'hooks', 'icons', 'schemas'],
  },
};

export default config;
