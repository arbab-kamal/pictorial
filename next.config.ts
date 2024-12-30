/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next'

const nextConfig:NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "fuxvaygmdhbytxsffyvz.supabase.co", // Update this to your supabase url
      },
    ],
  },
};

export default nextConfig;
