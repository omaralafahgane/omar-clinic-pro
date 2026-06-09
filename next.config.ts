import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["ar", "en"],
    defaultLocale: "ar",
  },
};

export default nextConfig;
