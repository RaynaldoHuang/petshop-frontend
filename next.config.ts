import type { NextConfig } from "next";

const storageUrl =
  process.env.NEXT_PUBLIC_STORAGE_URL ||
  (
    process.env.NEXT_PUBLIC_API_URL
      ? new URL(process.env.NEXT_PUBLIC_API_URL).origin + "/storage"
      : "http://localhost:8000/storage"
  );

const storageHost =
  new URL(storageUrl).hostname;

const storageProtocol =
  new URL(storageUrl).protocol.replace(
    ":",
    ""
  ) as "http" | "https";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: storageProtocol,
        hostname: storageHost,
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
