# Cheonmyeong Issues

## [2026-03-01] Known Issues

### RESOLVED: Tailwind v4/v3 mismatch
- globals.css was using v4 syntax (`@import "tailwindcss"`, `@theme inline {}`)
- postcss.config.mjs was using `@tailwindcss/postcss` (v4 plugin)
- FIXED: globals.css now uses v3 syntax, postcss uses `tailwindcss: {}`
- tailwind.config.js created

### PENDING: Build verification
- `npm run build` has not been confirmed to pass yet
- Need to run and verify
