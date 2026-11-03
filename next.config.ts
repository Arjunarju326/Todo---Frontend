import type { NextConfig } from "next";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${DJANGO_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
