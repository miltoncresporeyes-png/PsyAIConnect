import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  ignoreErrors: [
    'Network Error',
    'NetworkError: Failed to fetch',
    /ResizeObserver/,
    /loading chunk \d+ failed/,
  ],
  attachStacktrace: true,
  enabled: process.env.NODE_ENV !== 'development',
})
