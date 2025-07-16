import type { NextConfig } from "next";

/**
 * Next.js config with lightningcss disabled for compatibility
 */
const nextConfig: NextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      lightningcss: false,
    };
    return config;
  },
};

export default nextConfig;
