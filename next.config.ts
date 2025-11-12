import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Disabled due to compatibility issues with Clerk's catch-all routes
  // typedRoutes: true,

  eslint: {
    dirs: ["app", "components", "lib"],
  },
};

export default nextConfig;
