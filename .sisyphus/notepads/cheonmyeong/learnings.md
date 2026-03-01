# Cheonmyeong Learnings

## [2026-03-01] Project State

### Config files (all correct as of session start)
- `globals.css` → v3 syntax (`@tailwind base/components/utilities`)
- `tailwind.config.js` → exists, content array covers `./src/**`
- `postcss.config.mjs` → `{ tailwindcss: {}, autoprefixer: {} }` (v3)
- `next.config.mjs` → simple export (NOT .ts)
- `package.json` → tailwindcss ^3.4.1

### Source files completed
- `src/app/page.tsx` — SPA with form/result state
- `src/app/layout.tsx` — lang="ko", bg-slate-900
- `src/app/api/interpret/route.ts` — GPT-4o-mini POST endpoint
- `src/components/SajuForm.tsx` — 5 selects (year/month/day/hour/minute)
- `src/components/SajuResult.tsx` — 4 pillar cards
- `src/components/OhengChart.tsx` — 5-element bar chart (div+Tailwind only)
- `src/components/AiInterpretation.tsx` — loading/error/result display
- `src/lib/saju.ts` — calculateSajuFromBirth() using manseryeok
- `src/lib/oheng.ts` — analyzeOheng()

### Tests
- `src/lib/__tests__/saju.test.ts` — 9/9 PASS
- `src/lib/__tests__/oheng.test.ts` — 5/5 PASS

### Build status
- Build was failing due to Tailwind v4/v3 mismatch — now fixed
- Need to verify `npm run build` succeeds
