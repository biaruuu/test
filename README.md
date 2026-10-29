# Glass Player

Responsive glassmorphism video player built on **Vidstack** (real HLS player + Vidstack icons), Next.js 15, Tailwind CSS v4, shadcn/ui and React Bits-style components.

```bash
npm install
npm run dev
```

Deploy: import the repo on Vercel (Next.js is auto-detected). No environment variables needed.

## Usage

```tsx
<GlassPlayer
  src="https://files.vidstack.io/sprite-fight/hls/stream.m3u8"
  title="Sprite Fight"
  poster="https://files.vidstack.io/sprite-fight/poster.webp"
  thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
  tracks={[{ src: "/en.vtt", label: "English", language: "en-US", default: true }]}
/>
```

## Features

- Vidstack engine: HLS/MP4, adaptive quality, captions, thumbnails on seek hover, keyboard shortcuts
- Vidstack icons (`@vidstack/react/icons`)
- Compact glass layout: mute/cast pill, captions/PiP/settings pill, centered play with ±10s, fullscreen pill, slim seek bar
- Settings menu (Quality / Captions / Speed) with drill-down pages
- Fullscreen locks to landscape automatically on supported devices (Android/Chrome); iOS Safari does not allow orientation lock
- Responsive from small phones to desktop; menu renders inside the player so it also works in fullscreen

## React Bits

`GlassSurface`, `SpotlightCard` and `ShinyText` follow React Bits patterns. Official versions: `npx shadcn@latest add @react-bits/GlassSurface-TS-TW` (same for `SpotlightCard`, `ShinyText`).
