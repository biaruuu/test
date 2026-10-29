"use client";

import * as React from "react";
import {
  Check,
  Gauge,
  Maximize,
  Minimize,
  PictureInPicture2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// React Bits: install with `npx shadcn@latest add @react-bits/GlassSurface-TS-TW`
import GlassSurface from "@/components/GlassSurface";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const HIDE_AFTER_MS = 2800;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export interface GlassVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
}

/** Shared glass look: translucent fill, blur, hairline border, soft shadow. */
const glass =
  "bg-white/10 backdrop-blur-xl backdrop-saturate-150 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]";

function IconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "size-9 rounded-full text-white hover:bg-white/20 hover:text-white focus-visible:ring-white/60",
            className,
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="border border-white/20 bg-black/60 text-white backdrop-blur-md"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function GlassVideoPlayer({
  src,
  poster,
  title,
  className,
  autoPlay = false,
}: GlassVideoPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [buffered, setBuffered] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [rate, setRate] = React.useState(1);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [seeking, setSeeking] = React.useState(false);
  const [waiting, setWaiting] = React.useState(false);
  const [pipSupported, setPipSupported] = React.useState(false);

  React.useEffect(() => {
    setPipSupported(
      typeof document !== "undefined" && !!document.pictureInPictureEnabled,
    );
  }, []);

  /* ---------- controls visibility ---------- */
  const revealControls = React.useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, HIDE_AFTER_MS);
  }, []);

  React.useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  /* ---------- actions ---------- */
  const togglePlay = React.useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }, []);

  const skip = React.useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(
      Math.max(0, v.currentTime + delta),
      v.duration || Infinity,
    );
  }, []);

  const toggleMute = React.useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }, []);

  const togglePip = React.useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {
      /* PiP can be rejected by the browser; ignore */
    }
  }, []);

  const changeRate = (r: number) => {
    setRate(r);
    if (videoRef.current) videoRef.current.playbackRate = r;
  };

  React.useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* ---------- keyboard shortcuts (when the player has focus) ---------- */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Let sliders/buttons handle their own keys.
    const target = e.target as HTMLElement;
    if (target.closest('[role="slider"]')) return;

    switch (e.key.toLowerCase()) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "arrowleft":
      case "j":
        e.preventDefault();
        skip(-10);
        break;
      case "arrowright":
      case "l":
        e.preventDefault();
        skip(10);
        break;
      case "arrowup":
        e.preventDefault();
        setVolume((v) => {
          const nv = Math.min(1, v + 0.1);
          if (videoRef.current) videoRef.current.volume = nv;
          return nv;
        });
        break;
      case "arrowdown":
        e.preventDefault();
        setVolume((v) => {
          const nv = Math.max(0, v - 0.1);
          if (videoRef.current) videoRef.current.volume = nv;
          return nv;
        });
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        toggleFullscreen();
        break;
      default:
        return;
    }
    revealControls();
  };

  /* ---------- video events ---------- */
  const syncBuffered = () => {
    const v = videoRef.current;
    if (!v || v.buffered.length === 0) return;
    setBuffered(v.buffered.end(v.buffered.length - 1));
  };

  const volumeIcon =
    muted || volume === 0 ? (
      <VolumeX className="size-5" />
    ) : volume < 0.5 ? (
      <Volume1 className="size-5" />
    ) : (
      <Volume2 className="size-5" />
    );

  const progressPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={containerRef}
        tabIndex={0}
        role="region"
        aria-label={title ? `Video player: ${title}` : "Video player"}
        onKeyDown={onKeyDown}
        onMouseMove={revealControls}
        onMouseLeave={() => playing && setShowControls(false)}
        onTouchStart={revealControls}
        className={cn(
          "group/player relative isolate w-full overflow-hidden rounded-2xl bg-black outline-none",
          "aspect-video shadow-2xl ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white/60",
          fullscreen && "rounded-none",
          !showControls && playing && "cursor-none",
          className,
        )}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => {
            setPlaying(false);
            setShowControls(true);
          }}
          onTimeUpdate={(e) => {
            if (!seeking) setCurrent(e.currentTarget.currentTime);
            syncBuffered();
          }}
          onProgress={syncBuffered}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onVolumeChange={(e) => {
            setMuted(e.currentTarget.muted);
            setVolume(e.currentTarget.volume);
          }}
          onWaiting={() => setWaiting(true)}
          onPlaying={() => setWaiting(false)}
          onCanPlay={() => setWaiting(false)}
          className="absolute inset-0 size-full object-contain"
        />

        {/* top gradient + title */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4 transition-opacity duration-300 sm:p-5",
            showControls || !playing ? "opacity-100" : "opacity-0",
          )}
        >
          {title && (
            <h2 className="line-clamp-1 text-sm font-medium text-white drop-shadow sm:text-base">
              {title}
            </h2>
          )}
        </div>

        {/* buffering spinner */}
        {waiting && playing && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <div className="size-12 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          </div>
        )}

        {/* big glass play button (React Bits GlassSurface) */}
        {!playing && !waiting && (
          <button
            type="button"
            aria-label="Play"
            onClick={togglePlay}
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <GlassSurface width={76} height={76} borderRadius={38}>
              <Play className="size-8 translate-x-0.5 fill-white text-white" />
            </GlassSurface>
          </button>
        )}

        {/* control bar */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-20 p-2 transition-all duration-300 sm:p-4",
            showControls || !playing
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0",
          )}
        >
          <div className={cn("rounded-2xl px-3 py-2 sm:px-4 sm:py-3", glass)}>
            {/* seek */}
            <div className="relative flex h-5 items-center">
              <div
                aria-hidden
                className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full"
              >
                <div
                  className="h-full bg-white/25"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <Slider
                aria-label="Seek"
                min={0}
                max={duration || 1}
                step={0.1}
                value={[current]}
                onValueChange={([v]) => {
                  setSeeking(true);
                  setCurrent(v);
                }}
                onValueCommit={([v]) => {
                  if (videoRef.current) videoRef.current.currentTime = v;
                  setSeeking(false);
                }}
                className="relative z-10 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-track]]:bg-transparent"
              />
            </div>

            {/* buttons row */}
            <div className="mt-1 flex items-center gap-0.5 sm:gap-1">
              <IconButton label={playing ? "Pause (k)" : "Play (k)"} onClick={togglePlay}>
                {playing ? (
                  <Pause className="size-5 fill-current" />
                ) : (
                  <Play className="size-5 fill-current" />
                )}
              </IconButton>

              <IconButton
                label="Back 10s (←)"
                onClick={() => skip(-10)}
                className="hidden sm:inline-flex"
              >
                <RotateCcw className="size-[18px]" />
              </IconButton>
              <IconButton
                label="Forward 10s (→)"
                onClick={() => skip(10)}
                className="hidden sm:inline-flex"
              >
                <RotateCw className="size-[18px]" />
              </IconButton>

              {/* volume: slider hidden on small screens */}
              <div className="group/vol flex items-center">
                <IconButton label={muted ? "Unmute (m)" : "Mute (m)"} onClick={toggleMute}>
                  {volumeIcon}
                </IconButton>
                <div className="hidden w-0 overflow-hidden transition-all duration-200 group-hover/vol:w-20 group-focus-within/vol:w-20 sm:block">
                  <Slider
                    aria-label="Volume"
                    min={0}
                    max={1}
                    step={0.02}
                    value={[muted ? 0 : volume]}
                    onValueChange={([v]) => {
                      const el = videoRef.current;
                      if (!el) return;
                      el.volume = v;
                      el.muted = v === 0;
                    }}
                    className="mx-2 w-16 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-track]]:bg-white/25"
                  />
                </div>
              </div>

              <span className="ml-1 select-none font-mono text-[11px] tabular-nums text-white/90 sm:ml-2 sm:text-xs">
                {formatTime(current)} / {formatTime(duration)}
              </span>

              <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          aria-label="Playback speed"
                          className="h-9 gap-1 rounded-full px-2.5 text-xs text-white hover:bg-white/20 hover:text-white"
                        >
                          <Gauge className="size-4" />
                          <span className="tabular-nums">{rate}×</span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="border border-white/20 bg-black/60 text-white backdrop-blur-md"
                    >
                      Playback speed
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent
                    align="end"
                    side="top"
                    className="min-w-32 border-white/20 bg-black/50 text-white backdrop-blur-xl"
                  >
                    <DropdownMenuLabel className="text-xs text-white/60">
                      Speed
                    </DropdownMenuLabel>
                    {SPEEDS.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onSelect={() => changeRate(s)}
                        className="justify-between focus:bg-white/15 focus:text-white"
                      >
                        {s === 1 ? "Normal" : `${s}×`}
                        {rate === s && <Check className="size-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {pipSupported && (
                  <IconButton
                    label="Picture in picture"
                    onClick={togglePip}
                    className="hidden sm:inline-flex"
                  >
                    <PictureInPicture2 className="size-[18px]" />
                  </IconButton>
                )}

                <IconButton
                  label={fullscreen ? "Exit fullscreen (f)" : "Fullscreen (f)"}
                  onClick={toggleFullscreen}
                >
                  {fullscreen ? (
                    <Minimize className="size-5" />
                  ) : (
                    <Maximize className="size-5" />
                  )}
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
