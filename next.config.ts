import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ ESLint errors/warnings won’t block builds or show in terminal
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
