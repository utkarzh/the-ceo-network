import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The demo navigator lives bottom-left; errors still surface without the indicator.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  // Pages render behind a browser-only boundary (localStorage demo data), so only
  // validate instant navigation where a segment explicitly opts in.
  experimental: {
    instantInsights: { validationLevel: "manual-warning" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
