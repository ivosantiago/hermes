# Hermes — Calligraphy Tracing App for Kids

A web-based calligraphy tracing app where children see a letter rendered in a chosen font, draw on top of it (finger or Apple Pencil on iPad), and get a confetti celebration when they cover 90%+ of the letter. Progress is saved locally so they can close and resume where they left off.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser or iPad Safari.

## How It Works

1. On first visit, the app starts at letter **A** (uppercase) in Noto Serif
2. A faded guide letter is shown on canvas — the child traces over it
3. A live progress bar shows coverage percentage
4. At **90%+ coverage** — confetti fires + "Great job!" + **Next** button appears
5. Child taps **Next** to advance to the next letter
6. Sequence: **A-Z** then **a-z** then **0-9** (62 characters total)
7. After all 62 — a completion celebration screen
8. Parent controls (collapsible top bar): font, size, weight, stroke color, letter picker

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Drawing | HTML5 Canvas + [perfect-freehand](https://github.com/steveruizok/perfect-freehand) |
| Input | PointerEvents API (touch + Apple Pencil with pressure) |
| Fonts | Google Fonts (8 curated fonts loaded via FontFace API) |
| Celebration | [canvas-confetti](https://github.com/catdad/canvas-confetti) |
| State | Zustand + `persist` middleware (localStorage) |

## Architecture

### Three-Canvas Layer Stack

```
[Drawing Canvas]  z:30  — user strokes via perfect-freehand (pointer events here)
[Guide Canvas]    z:20  — faded letter visible to child (pointer-events: none)
[Mask Canvas]     hidden — solid black letter for pixel comparison
```

All three canvases share identical dimensions and DPR scaling so pixel indices align for coverage comparison.

### Stroke Rendering

Uses `perfect-freehand` which takes `[x, y, pressure]` input points and returns polygon outline points forming a filled shape with natural width variation. These are rendered as filled `Path2D` objects on the drawing canvas.

- Apple Pencil detected via `pointerType === "pen"` — uses real pressure data
- Finger/mouse — uses simulated pressure for consistent strokes
- Short stroke filtering (< 3 points or < 50ms) suppresses Apple Pencil double-tap artifacts

### Coverage Detection

1. On letter change: render letter in solid black on hidden mask canvas, extract pixel data into a binary mask
2. On each `pointerup`: read drawing canvas pixels, compare against mask
3. Sampled comparison (every 4th pixel) keeps calculation under 50ms
4. Coverage % = covered letter pixels / total letter pixels

### Persistence

Zustand store with `persist` middleware saves to localStorage:
- Current character
- Completion status per character
- In-progress stroke data (point arrays)
- Parent settings (font, size, weight, stroke color)

Points are collected in a `useRef` during active drawing. On `pointerup`, the completed stroke is flushed to the store. No writes during active pointer movement.

## Project Structure

```
src/
  app/
    layout.tsx                — root layout, font loading, PWA metadata
    page.tsx                  — main app page
    globals.css               — Tailwind imports + touch optimizations
  components/
    tracing-canvas.tsx        — 3-canvas stack, pointer events, coverage
    letter-display.tsx        — current letter + progress counter
    parent-controls.tsx       — font picker, sliders, color picker, letter grid
    progress-bar.tsx          — visual coverage % indicator
    celebration.tsx           — confetti + success message + Next button
    completion-screen.tsx     — final celebration after all 62 characters
    hydration-gate.tsx        — gates rendering until localStorage loads
    ui/                       — shadcn/ui components (button, slider, select)
  hooks/
    use-drawing.ts            — pointer events, point collection, rendering
    use-coverage.ts           — mask generation, pixel comparison
    use-high-dpi-canvas.ts    — DPR-aware canvas setup
    use-hydration.ts          — Zustand persist rehydration lifecycle
  store/
    tracing-store.ts          — Zustand store with persist config
  lib/
    fonts.ts                  — Google Fonts loading utilities
    stroke-renderer.ts        — perfect-freehand to Path2D conversion
    pixel-mask.ts             — mask generation + coverage calculation
    utils.ts                  — cn() utility
  types/
    index.ts                  — TypeScript types and constants
```

## Parent Controls

- **Font picker**: Noto Serif, Caveat, Dancing Script, Patrick Hand, Pacifico, Roboto Slab, Lora, Playfair Display
- **Letter size**: 100px - 400px
- **Font weight**: 100 - 900 (works with variable fonts)
- **Stroke size**: 8 - 40
- **Stroke color**: Blue, Red, Green, Purple, Orange, Pink, Black
- **Category tabs**: Uppercase / Lowercase / Numbers
- **Letter picker**: Jump to any specific letter
- **Clear Drawing**: Reset current canvas

## iPad Optimization

- `touch-action: none` + `preventDefault` on touch events for Safari scroll prevention
- `overscroll-behavior: none` on html/body
- `-webkit-touch-callout: none` on canvas and buttons
- Apple Pencil pressure support
- Viewport locked (no pinch zoom)
- PWA manifest for home screen install (`/manifest.json`)
- Responsive canvas sizing (300px - 600px based on viewport)

## Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```
