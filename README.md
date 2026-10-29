# Glass Video Player

Responsive glassmorphism video player built with Next.js 15, Tailwind CSS v4, shadcn/ui (Radix) and React Bits-style components.

## Run

```bash
npm install
npm run dev
```

## Deploy

Push to GitHub, import the repo on Vercel (framework auto-detected as Next.js), and deploy. No environment variables needed.

## Usage

```tsx
<GlassVideoPlayer src="/video.mp4" poster="/poster.jpg" title="My video" />
```

## Features

Play/pause, ±10s skip, volume, speed 0.5–2×, Picture-in-Picture, fullscreen, buffered seek bar, auto-hiding controls, buffering spinner.
Keyboard: Space/K, ←/→ or J/L, ↑/↓, M, F.

## React Bits

`src/components/GlassSurface.tsx` and `SpotlightCard.tsx` are lightweight versions with the same props as the React Bits components. To use the official ones, overwrite them:

```bash
npx shadcn@latest add @react-bits/GlassSurface-TS-TW
npx shadcn@latest add @react-bits/SpotlightCard-TS-TW
```

## Known limitation

The speed menu and tooltips render in a portal on `document.body`, so they are hidden while the player is fullscreen.
