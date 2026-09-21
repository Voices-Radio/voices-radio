/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [{ hostname: "cdn.sanity.io" }],
    // Local, trusted client-logo SVGs in /public/agency/logos need the
    // built-in optimizer to serve SVG content; locked down per Next's
    // recommended safe defaults for local-only SVG sources.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
