"use client";

import * as React from "react";

import { GlassVideoPlayer } from "@/components/glass-video-player";
// React Bits: install with `npx shadcn@latest add @react-bits/SpotlightCard-TS-TW`
import SpotlightCard from "@/components/SpotlightCard";

const VIDEOS = [
  {
    title: "Big Buck Bunny",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
  },
  {
    title: "Elephants Dream",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
  },
  {
    title: "Sintel",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
  },
  {
    title: "Tears of Steel",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
  },
];

export default function Home() {
  const [index, setIndex] = React.useState(0);
  const active = VIDEOS[index];

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0b0b14] text-white">
      {/* ambient blobs so the glass has something to blur */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 size-[28rem] rounded-full bg-fuchsia-600/40 blur-3xl" />
        <div className="absolute -right-24 top-1/3 size-[26rem] rounded-full bg-cyan-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-[24rem] rounded-full bg-indigo-600/30 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid lg:grid-cols-[1fr_20rem] lg:items-start">
        <section className="min-w-0">
          <GlassVideoPlayer
            key={active.src}
            src={active.src}
            poster={active.poster}
            title={active.title}
          />
          <h1 className="mt-4 text-xl font-semibold sm:text-2xl">
            {active.title}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Space/K play · ←/→ seek 10s · ↑/↓ volume · M mute · F fullscreen
          </p>
        </section>

        <aside className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-white/60">
            Up next
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-1">
            {VIDEOS.map((v, i) => (
              <button
                key={v.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index}
                className="rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <SpotlightCard
                  className="rounded-xl border-white/15 bg-white/5 p-2 backdrop-blur-xl"
                  spotlightColor="rgba(255, 255, 255, 0.18)"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.poster}
                    alt=""
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                  <p
                    className={`mt-2 line-clamp-1 text-sm ${
                      i === index ? "font-semibold text-white" : "text-white/70"
                    }`}
                  >
                    {v.title}
                  </p>
                </SpotlightCard>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
