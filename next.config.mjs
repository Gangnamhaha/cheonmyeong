import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
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
