import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  typedRoutes: true,

  eslint: {
    dirs: ["app", "components", "lib"],
  },
};

export default nextConfig;
