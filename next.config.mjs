import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Samsung Internet & Android 호환성을 위한 transpile 설정
  transpilePackages: [],
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    // 구형 브라우저 지원 강화
    esmExternals: false,
  },
};

export default withSentryConfig(nextConfig, {
  // No source maps upload (saves build time)
  sourcemaps: {
    disable: true,
  },
  // No telemetry
  telemetry: false,
  // Silent during build
  silent: true,
  // Hide source maps from client bundles
  hideSourceMaps: true,
});
