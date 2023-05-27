/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [{ hostname: "cdn.sanity.io" }],
  },
  experimental: {
    serverActions: true,
  },
};

export default config;
