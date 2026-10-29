"use client";

import * as React from "react";
import { Play } from "lucide-react";

import { GlassPlayer, type PlayerTrack } from "@/components/glass-player";
import GlassSurface from "@/components/GlassSurface";
import ShinyText from "@/components/ShinyText";
import SpotlightCard from "@/components/SpotlightCard";
import { Button } from "@/components/ui/button";

interface Video {
  title: string;
  description: string;
  src: string;
  poster?: string;
  thumbnails?: string;
  tracks?: PlayerTrack[];
  gradient: string;
}

// Real adaptive (HLS) streams with multiple qualities.
const VIDEOS: Video[] = [
  {
    title: "Sprite Fight",
    description: "Blender Studio short · HLS with English captions and hover thumbnails.",
    src: "https://files.vidstack.io/sprite-fight/hls/stream.m3u8",
    poster: "https://files.vidstack.io/sprite-fight/poster.webp",
    thumbnails: "https://files.vidstack.io/sprite-fight/thumbnails.vtt",
    tracks: [
      {
        src: "https://files.vidstack.io/sprite-fight/subs/english.vtt",
        label: "English",
        language: "en-US",
        kind: "subtitles",
        default: true,
      },
    ],
    gradient: "from-fuchsia-500/60 to-indigo-600/60",
  },
  {
    title: "Big Buck Bunny",
    description: "Blender Foundation · multi-quality HLS test stream.",
    src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    gradient: "from-emerald-500/60 to-cyan-600/60",
  },
  {
    title: "Tears of Steel",
    description: "Blender Foundation · adaptive HLS stream.",
    src: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    gradient: "from-orange-500/60 to-rose-600/60",
  },
];

export default function Home() {
  const [index, setIndex] = React.useState(0);
  const active = VIDEOS[index];

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0a0a12] text-white">
      {/* ambient glow so the glass has something to blur */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 size-[26rem] rounded-full bg-fuchsia-600/35 blur-3xl" />
        <div className="absolute -right-24 top-1/3 size-[24rem] rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-[22rem] rounded-full bg-indigo-600/30 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-10">
        <header className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">
            <ShinyText text="Glass Player" />
          </h1>
          <GlassSurface width={112} height={32} borderRadius={16}>
            <span className="text-xs font-medium text-white/90">Now playing</span>
          </GlassSurface>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
          <section className="min-w-0">
            <GlassPlayer
              key={active.src}
              src={active.src}
              title={active.title}
              poster={active.poster}
              thumbnails={active.thumbnails}
              tracks={active.tracks}
            />
            <h2 className="mt-3 text-base font-semibold sm:text-xl">{active.title}</h2>
            <p className="mt-1 text-sm text-white/60">{active.description}</p>
            <p className="mt-3 hidden text-xs text-white/45 sm:block">
              Space/K play · ←/→ seek · ↑/↓ volume · M mute · C captions · F fullscreen · double-click fullscreen
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3 border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
              onClick={() => setIndex((i) => (i + 1) % VIDEOS.length)}
            >
              Next video
            </Button>
          </section>

          <aside>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
              Up next
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
              {VIDEOS.map((v, i) => (
                <button
                  key={v.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index}
                  className="rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <SpotlightCard
                    className={`rounded-xl border-white/15 bg-white/5 p-2 backdrop-blur-xl ${
                      i === index ? "ring-1 ring-white/40" : ""
                    }`}
                    spotlightColor="rgba(255,255,255,0.18)"
                  >
                    <div
                      className={`relative grid aspect-video place-items-center overflow-hidden rounded-lg bg-gradient-to-br ${v.gradient}`}
                    >
                      {v.poster && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.poster}
                          alt=""
                          className="absolute inset-0 size-full object-cover"
                        />
                      )}
                      <span className="relative grid size-8 place-items-center rounded-full border border-white/30 bg-black/30 backdrop-blur-md">
                        <Play className="size-4 fill-white" />
                      </span>
                    </div>
                    <p
                      className={`mt-2 line-clamp-1 text-sm ${
                        i === index ? "font-semibold" : "text-white/70"
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
      </div>
    </main>
  );
}
