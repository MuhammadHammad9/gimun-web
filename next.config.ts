import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Turbopack the workspace root explicitly to avoid the
  // "package-lock.json is outside the current Git repository" warning.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
