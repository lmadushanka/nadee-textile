import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /** Ship local SA JSON with the upload route trace when the file exists (gitignored). */
  outputFileTracingIncludes: {
    "/api/admin/upload": ["./src/lib/amplified-vine-462115-g9-2cc994038afc.json"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
