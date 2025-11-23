import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: 'https',
        // S3のホスト名パターン
        hostname: '*.s3.amazonaws.com', // または 'video-humbnail-backet.s3.ap-northeast-1.amazonaws.com' を正確に記述
        port: '',
        pathname: '/**',
      },
      // リージョンを含む形式も許可する場合
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
