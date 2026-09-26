import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/ingest": ["./main_contestant.csv"],
  },
};

export default nextConfig;
