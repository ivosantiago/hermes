# Hermes — Claude Code Project Guide

## Project Overview

Calligraphy tracing app for kids. Child traces a guide letter on canvas, gets confetti at 90% coverage, taps Next to advance. A-Z, a-z, 0-9 (62 chars). All state persisted to localStorage.

## Tech Stack

- **Next.js 15** (App Router) — single page at `src/app/page.tsx`, all client components
- **TypeScript** — strict mode, `@/*` path alias maps to `src/*`
- **Tailwind CSS v4** — `@import` syntax in `globals.css`, no `tailwind.config`
- **shadcn/ui** — `new-york` style, components in `src/components/ui/`
- **pnpm** — package manager (not npm or yarn)

## Key Libraries

- **perfect-freehand** — stroke rendering. `getStroke()` returns outline points, converted to `Path2D` via SVG path strings. See `src/lib/stroke-renderer.ts`.
- **canvas-confetti** — celebration effects. Imported directly, called imperatively.
- **zustand** v5 — state management with `persist` middleware. Store at `src/store/tracing-store.ts`. Uses `skipHydration: true` for SSR safety.

## Architecture

### Canvas System (src/components/tracing-canvas.tsx)

Three overlaid `<canvas>` elements in a relative container:
1. **Mask canvas** (invisible) — solid black letter, used for pixel-level coverage comparison
2. **Guide canvas** (z:20) — faded letter, `pointer-events: none`
3. **Drawing canvas** (z:30) — user strokes, handles all pointer events

**DPR handling is intentionally split:**
- Drawing canvas uses `setupCanvas()` which applies `ctx.scale(dpr, dpr)` — so pointer coordinates (CSS pixels) map correctly
- Guide and mask canvases are set up with raw `canvas.width = size * dpr` — no `ctx.scale`. Their rendering functions (`renderGuideLetter`, `generateLetterMask`) multiply font size by DPR directly.
- **Do not "fix" this to be uniform** — it's correct because the drawing canvas needs DPR coordinate mapping while guide/mask just need matching pixel dimensions.

### Coverage Detection (src/lib/pixel-mask.ts)

- `generateLetterMask()` — renders letter in black, extracts binary mask (alpha > 10)
- `calculateCoverage()` — reads drawing canvas pixels, compares against mask. Samples every 4th pixel for performance.
- Coverage threshold is 90% (0.9), defined as `COVERAGE_THRESHOLD` in `tracing-canvas.tsx`

### Stroke Pipeline

1. `pointerdown` → start collecting `[x, y, pressure]` points in a `useRef`
2. `pointermove` → push point, re-render all existing strokes + live stroke via `renderLiveStroke()`
3. `pointerup` → filter artifacts (< 3 points or < 50ms), flush to Zustand store, check coverage
4. Store write triggers localStorage persist automatically

### State Shape (src/store/tracing-store.ts)

```typescript
{
  currentChar: string,          // "A" through "9", or "COMPLETED"
  progress: Record<string, {    // keyed by character
    completed: boolean,
    strokes: Stroke[]           // point arrays for re-rendering
  }>,
  settings: {
    fontFamily: string,
    fontSize: number,
    fontWeight: number,
    strokeColor: string,
    strokeSize: number
  }
}
```

localStorage key: `hermes-tracing`, version: 1.

### Hydration (SSR Safety)

Zustand persist uses `skipHydration: true`. The `HydrationGate` component (wraps the entire app in `page.tsx`) calls `rehydrate()` on mount and shows a loading state until hydration completes. This prevents React hydration mismatches.

## File Map

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript types, character constants (ALL_CHARS, UPPERCASE, etc), default settings |
| `src/store/tracing-store.ts` | Zustand store — state + actions + persist config |
| `src/lib/stroke-renderer.ts` | perfect-freehand integration — `renderStroke()`, `renderLiveStroke()`, `getSvgPathFromStroke()` |
| `src/lib/pixel-mask.ts` | `generateLetterMask()`, `renderGuideLetter()`, `calculateCoverage()` |
| `src/lib/fonts.ts` | `loadFont()` — dynamic Google Fonts loader with caching |
| `src/hooks/use-drawing.ts` | Pointer event handlers, stroke recording, Apple Pencil detection |
| `src/hooks/use-coverage.ts` | Mask generation + coverage checking wrapper |
| `src/hooks/use-high-dpi-canvas.ts` | `setupCanvas()` — DPR-aware canvas initialization |
| `src/hooks/use-hydration.ts` | Zustand rehydration lifecycle hook |
| `src/components/tracing-canvas.tsx` | **Core component** — 3-canvas stack, orchestrates everything |
| `src/components/parent-controls.tsx` | Collapsible settings panel — fonts, sliders, colors, letter picker |
| `src/components/celebration.tsx` | Confetti overlay + Next button |
| `src/components/completion-screen.tsx` | Final screen after all 62 characters |
| `src/components/progress-bar.tsx` | Coverage percentage bar |
| `src/components/letter-display.tsx` | Current letter + progress counter in header |
| `src/components/hydration-gate.tsx` | SSR hydration wrapper |

## Commands

```bash
pnpm dev          # Dev server on :3000
pnpm build        # Production build
pnpm lint         # ESLint
```

## Common Modifications

**Change coverage threshold**: Edit `COVERAGE_THRESHOLD` in `src/components/tracing-canvas.tsx` (currently 0.9).

**Add fonts**: Add entry to `AVAILABLE_FONTS` in `src/types/index.ts`. Google Fonts are loaded dynamically — no build config needed.

**Change character sequence**: Edit `UPPERCASE`, `LOWERCASE`, `NUMBERS` arrays in `src/types/index.ts`. `ALL_CHARS` is derived from these.

**Adjust stroke feel**: Edit `DEFAULT_STROKE_OPTIONS` in `src/lib/stroke-renderer.ts`. Key params: `size` (width), `thinning` (pressure effect, 0-1), `smoothing`, `streamline`.

**Change localStorage key**: Edit the `name` field in the persist config in `src/store/tracing-store.ts`.

## Known Considerations

- The entire app is client-side rendered (all components use `"use client"`). The Next.js App Router is used for routing/layout infrastructure but there are no server components with data fetching.
- Font loading uses stylesheet injection + `document.fonts.load()`. First render of a new font may briefly show a fallback.
- Coverage detection reads raw pixels with `getImageData()` — this triggers a `willReadFrequently` optimization hint on the drawing canvas context.
- On orientation change or window resize, canvases are re-initialized and stored strokes are re-rendered from point data.
- PWA manifest is at `public/manifest.json`. Icons (`icon-192.png`, `icon-512.png`) are referenced but not yet created — add them for a complete PWA experience.
