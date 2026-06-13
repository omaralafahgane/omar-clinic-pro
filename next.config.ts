import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // swcMinify is now default in Next.js 15
  // i18n is not supported in App Router, use middleware for localization
};

export default nextConfig;
