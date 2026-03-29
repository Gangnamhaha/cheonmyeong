import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // No performance monitoring (cost saving)
  tracesSampleRate: 0,
  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",
  // Replay disabled (cost saving)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
