import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Docker 배포를 위한 standalone 모드 활성화
  output: 'standalone',
};

export default nextConfig;
