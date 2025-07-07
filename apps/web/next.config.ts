import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ['@gameitos/db'],
    serverExternalPackages: ['postgres'],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
};

export default nextConfig;