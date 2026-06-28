/** @type {import('next').NextConfig} */
const config = {
  async redirects() {
    return [
      {
        source: "/discover",
        destination: "/explore",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { hostname: "cdn.sanity.io" },
      { hostname: "thumbnailer.mixcloud.com" },
      { hostname: "optq01mefvpkgp3p.public.blob.vercel-storage.com" },
      { hostname: "i1.sndcdn.com" },
      { hostname: "drive.google.com" },
    ],
  },
  webpack: (config) => {
    // Exclude the bolt folder from Next.js compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/bolt/**", "**/node_modules/**"],
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
    dirs: ["app", "components", "lib", "hooks", "icons", "schemas"],
  },
};

export default config;
