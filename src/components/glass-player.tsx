"use client";

import * as React from "react";
import {
  Captions,
  CaptionButton,
  Controls,
  FullscreenButton,
  Gesture,
  GoogleCastButton,
  MediaPlayer,
  MediaProvider,
  Menu,
  MuteButton,
  PIPButton,
  PlayButton,
  Poster,
  SeekButton,
  Time,
  TimeSlider,
  Track,
  VolumeSlider,
  useCaptionOptions,
  usePlaybackRateOptions,
  useMediaState,
  useVideoQualityOptions,
} from "@vidstack/react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronRightIcon,
  ChromecastIcon,
  ClosedCaptionsIcon,
  ClosedCaptionsOnIcon,
  FullscreenExitIcon,
  FullscreenIcon,
  MuteIcon,
  PauseIcon,
  PictureInPictureExitIcon,
  PictureInPictureIcon,
  PlayIcon,
  PlaybackSpeedCircleIcon,
  SeekBackward10Icon,
  SeekForward10Icon,
  SettingsIcon,
  SettingsMenuIcon,
  VolumeHighIcon,
  VolumeLowIcon,
} from "@vidstack/react/icons";

import { cn } from "@/lib/utils";

export interface PlayerTrack {
  src: string;
  label: string;
  language: string;
  kind?: "subtitles" | "captions";
  default?: boolean;
}

export interface GlassPlayerProps {
  src: string;
  title: string;
  poster?: string;
  thumbnails?: string;
  tracks?: PlayerTrack[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Shared glass styles (compact: 32px buttons on phones, 36px on sm+)  */
/* ------------------------------------------------------------------ */

// Controls are only clickable while the control layer is visible.
const live = "pointer-events-none group-data-[visible]/c:pointer-events-auto";

const pill = cn(
  live,
  "flex items-center gap-0.5 rounded-full border border-white/20 bg-black/35 p-0.5",
  "backdrop-blur-xl backdrop-saturate-150",
  "shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]",
);

const iconBtn = cn(
  "grid size-8 shrink-0 place-items-center rounded-full text-white/90 outline-none transition sm:size-9",
  "hover:bg-white/15 hover:text-white data-[focus]:ring-2 data-[focus]:ring-white/70",
);

const icon = "size-[18px] sm:size-5";

const roundGlass = cn(
  live,
  "grid place-items-center rounded-full border border-white/25 text-white outline-none backdrop-blur-xl transition",
  "shadow-[0_6px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]",
  "hover:scale-105 active:scale-95 data-[focus]:ring-2 data-[focus]:ring-white/70",
);

/* ------------------------------------------------------------------ */
/* Settings menu (Quality / Captions / Speed) with drill-down pages    */
/* ------------------------------------------------------------------ */

type Page = "main" | "quality" | "captions" | "speed";

function MenuRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-left text-sm text-white outline-none transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <Icon className="size-5 shrink-0 text-white/80" />
      <span className="flex-1 font-medium">{label}</span>
      <span className="text-white/60">{value}</span>
      <ChevronRightIcon className="size-4 shrink-0 text-white/70" />
    </button>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-semibold text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <ArrowLeftIcon className="size-5" />
      {title}
    </button>
  );
}

const radioCls = cn(
  "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 outline-none transition",
  "hover:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-white/60",
  "data-[checked]:bg-white/15 data-[checked]:text-white",
);

type Opts = ReadonlyArray<{
  label: string;
  value: string;
  select: (trigger?: Event) => void;
}> & { selectedValue: string };

function Radios({ options }: { options: Opts }) {
  return (
    <Menu.RadioGroup value={options.selectedValue} className="flex flex-col">
      {options.map(({ label, value, select }) => (
        <Menu.Radio
          key={value}
          value={value}
          onSelect={(e) => select(e as unknown as Event)}
          className={radioCls}
        >
          <span>{label}</span>
          {options.selectedValue === value && <CheckIcon className="size-4" />}
        </Menu.Radio>
      ))}
    </Menu.RadioGroup>
  );
}

function SettingsMenu() {
  const [page, setPage] = React.useState<Page>("main");

  const quality = useVideoQualityOptions({ auto: true, sort: "descending" });
  const captions = useCaptionOptions();
  const speed = usePlaybackRateOptions({
    rates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    normalLabel: "Normal",
  });

  const labelOf = (opts: Opts) =>
    opts.find((o) => o.value === opts.selectedValue)?.label ?? "";

  const hasQuality = !quality.disabled && quality.length > 1;
  const hasCaptions = !captions.disabled;

  return (
    <Menu.Root onClose={() => setPage("main")}>
      <Menu.Button aria-label="Settings" className={iconBtn}>
        <SettingsIcon className={cn(icon, "transition-transform duration-300")} />
      </Menu.Button>
      <Menu.Content
        placement="bottom end"
        offset={8}
        className={cn(
          "z-30 hidden w-[min(17rem,calc(100vw-1.5rem))] max-h-[min(20rem,70dvh)] flex-col overflow-y-auto overscroll-contain",
          "rounded-2xl border border-white/20 bg-black/55 p-2 backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]",
          "data-[open]:flex",
        )}
      >
        {page === "main" && (
          <div className="flex flex-col gap-1.5">
            {hasQuality && (
              <MenuRow
                icon={SettingsMenuIcon}
                label="Quality"
                value={labelOf(quality)}
                onClick={() => setPage("quality")}
              />
            )}
            {hasCaptions && (
              <MenuRow
                icon={ClosedCaptionsIcon}
                label="Captions"
                value={labelOf(captions)}
                onClick={() => setPage("captions")}
              />
            )}
            <MenuRow
              icon={PlaybackSpeedCircleIcon}
              label="Speed"
              value={labelOf(speed)}
              onClick={() => setPage("speed")}
            />
          </div>
        )}
        {page === "quality" && (
          <>
            <BackHeader title="Quality" onBack={() => setPage("main")} />
            <Radios options={quality} />
          </>
        )}
        {page === "captions" && (
          <>
            <BackHeader title="Captions" onBack={() => setPage("main")} />
            <Radios options={captions} />
          </>
        )}
        {page === "speed" && (
          <>
            <BackHeader title="Speed" onBack={() => setPage("main")} />
            <Radios options={speed} />
          </>
        )}
      </Menu.Content>
    </Menu.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Control layer                                                       */
/* ------------------------------------------------------------------ */

function VolumeControl() {
  const muted = useMediaState("muted");
  const volume = useMediaState("volume");
  const Icon = muted || volume === 0 ? MuteIcon : volume < 0.5 ? VolumeLowIcon : VolumeHighIcon;

  return (
    <div className="group/vol flex items-center">
      <MuteButton aria-label={muted ? "Unmute" : "Mute"} className={iconBtn}>
        <Icon className={icon} />
      </MuteButton>
      {/* slider only on devices with a real pointer; expands on hover/focus */}
      <div className="hidden w-0 overflow-hidden transition-[width] duration-200 group-focus-within/vol:w-20 group-hover/vol:w-20 [@media(hover:hover)]:block">
        <VolumeSlider.Root className="group relative mx-2 inline-flex h-8 w-16 touch-none select-none items-center">
          <VolumeSlider.Track className="relative h-1 w-full rounded-full bg-white/25">
            <VolumeSlider.TrackFill className="absolute h-full w-[var(--slider-fill)] rounded-full bg-white" />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className="absolute left-[var(--slider-fill)] top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" />
        </VolumeSlider.Root>
      </div>
    </div>
  );
}

function CenterControls() {
  const paused = useMediaState("paused");
  const waiting = useMediaState("waiting");
  const started = useMediaState("started");

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="flex items-center gap-5 sm:gap-8">
        <SeekButton
          seconds={-10}
          aria-label="Back 10 seconds"
          className={cn(roundGlass, "size-9 bg-white/10 sm:size-11")}
        >
          <SeekBackward10Icon className="size-5 sm:size-6" />
        </SeekButton>

        {waiting && started ? (
          <div className="grid size-11 place-items-center sm:size-14">
            <div className="size-8 animate-spin rounded-full border-2 border-white/25 border-t-white sm:size-10" />
          </div>
        ) : (
          <PlayButton
            aria-label={paused ? "Play" : "Pause"}
            className={cn(
              roundGlass,
              "size-11 bg-emerald-400/55 sm:size-14",
              "shadow-[0_6px_28px_rgba(52,211,153,0.35),inset_0_1px_0_rgba(255,255,255,0.4)]",
            )}
          >
            {paused ? (
              <PlayIcon className="size-6 translate-x-px sm:size-7" />
            ) : (
              <PauseIcon className="size-6 sm:size-7" />
            )}
          </PlayButton>
        )}

        <SeekButton
          seconds={10}
          aria-label="Forward 10 seconds"
          className={cn(roundGlass, "size-9 bg-white/10 sm:size-11")}
        >
          <SeekForward10Icon className="size-5 sm:size-6" />
        </SeekButton>
      </div>
    </div>
  );
}

function ProgressBar({ thumbnails }: { thumbnails?: string }) {
  return (
    <TimeSlider.Root
      className={cn(
        live,
        "group relative inline-flex h-5 w-full touch-none select-none items-center",
      )}
    >
      <TimeSlider.Track className="relative h-1 w-full rounded-full bg-white/25 transition-[height] group-data-[active]:h-1.5 group-hover:h-1.5">
        <TimeSlider.Progress className="absolute h-full w-[var(--slider-progress)] rounded-full bg-white/30" />
        <TimeSlider.TrackFill className="absolute h-full w-[var(--slider-fill)] rounded-full bg-white" />
      </TimeSlider.Track>
      <TimeSlider.Thumb className="absolute left-[var(--slider-fill)] top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white shadow transition-transform group-data-[active]:scale-100 group-hover:scale-100" />

      <TimeSlider.Preview className="pointer-events-none absolute bottom-full left-[var(--slider-pointer)] z-10 mb-2 flex -translate-x-1/2 flex-col items-center gap-1 opacity-0 transition-opacity data-[visible]:opacity-100">
        {thumbnails && (
          <TimeSlider.Thumbnail.Root
            src={thumbnails}
            className="block h-[var(--thumbnail-height)] max-h-24 min-h-12 w-[var(--thumbnail-width)] max-w-40 min-w-20 overflow-hidden rounded-lg border border-white/30 bg-black shadow-lg"
          >
            <TimeSlider.Thumbnail.Img />
          </TimeSlider.Thumbnail.Root>
        )}
        <TimeSlider.Value className="rounded-md border border-white/20 bg-black/60 px-1.5 py-0.5 text-[11px] text-white tabular-nums backdrop-blur-md" />
      </TimeSlider.Preview>
    </TimeSlider.Root>
  );
}

function PlayerControls({
  title,
  thumbnails,
}: {
  title: string;
  thumbnails?: string;
}) {
  const fullscreen = useMediaState("fullscreen");
  const pip = useMediaState("pictureInPicture");
  const hasCaptionOn = useMediaState("textTrack");

  return (
    <Controls.Root
      className={cn(
        "group/c absolute inset-0 z-20 flex flex-col justify-between p-2 sm:p-3",
        "bg-gradient-to-t from-black/60 via-transparent to-black/40",
        "pointer-events-none opacity-0 transition-opacity duration-300 data-[visible]:opacity-100",
      )}
    >
      {/* top */}
      <Controls.Group className="flex items-start justify-between">
        <div className={pill}>
          <VolumeControl />
          <GoogleCastButton
            aria-label="Cast"
            className={cn(iconBtn, "hidden data-[supported]:grid")}
          >
            <ChromecastIcon className={icon} />
          </GoogleCastButton>
        </div>

        <div className={pill}>
          <CaptionButton
            aria-label="Toggle captions"
            className={cn(iconBtn, "hidden data-[supported]:grid")}
          >
            {hasCaptionOn ? (
              <ClosedCaptionsOnIcon className={icon} />
            ) : (
              <ClosedCaptionsIcon className={icon} />
            )}
          </CaptionButton>
          <PIPButton
            aria-label="Picture in picture"
            className={cn(iconBtn, "hidden data-[supported]:grid")}
          >
            {pip ? (
              <PictureInPictureExitIcon className={icon} />
            ) : (
              <PictureInPictureIcon className={icon} />
            )}
          </PIPButton>
          <SettingsMenu />
        </div>
      </Controls.Group>

      <CenterControls />

      {/* bottom */}
      <Controls.Group className="flex flex-col gap-1">
        <div className="flex items-end justify-between gap-3">
          <p className="min-w-0 truncate text-[11px] text-white/90 drop-shadow sm:text-sm">
            <Time type="current" className="tabular-nums" />
            <span className="text-white/60"> / </span>
            <Time type="duration" className="tabular-nums" />
            <span className="hidden text-white/60 sm:inline"> • {title}</span>
          </p>
          <div className={cn(pill, "shrink-0")}>
            <FullscreenButton
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              className={iconBtn}
            >
              {fullscreen ? (
                <FullscreenExitIcon className={icon} />
              ) : (
                <FullscreenIcon className={icon} />
              )}
            </FullscreenButton>
          </div>
        </div>
        <ProgressBar thumbnails={thumbnails} />
      </Controls.Group>
    </Controls.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

type OrientationApi = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
};

async function lockLandscape(isFullscreen: boolean) {
  try {
    const o = screen.orientation as OrientationApi | undefined;
    if (!o) return;
    if (isFullscreen) await o.lock?.("landscape");
    else o.unlock();
  } catch {
    /* not supported (e.g. iOS Safari) or blocked: ignore */
  }
}

export function GlassPlayer({
  src,
  title,
  poster,
  thumbnails,
  tracks = [],
  className,
}: GlassPlayerProps) {
  return (
    <MediaPlayer
      title={title}
      src={src}
      viewType="video"
      streamType="on-demand"
      crossOrigin
      playsInline
      onFullscreenChange={(isFullscreen) => void lockLandscape(isFullscreen)}
      className={cn(
        "group/player relative isolate block w-full overflow-hidden rounded-xl bg-black text-white sm:rounded-2xl",
        "aspect-video ring-1 ring-white/10 shadow-2xl shadow-black/50",
        "data-[fullscreen]:aspect-auto data-[fullscreen]:h-full data-[fullscreen]:rounded-none",
        "data-[focus]:ring-2 data-[focus]:ring-white/50",
        className,
      )}
    >
      <MediaProvider className="absolute inset-0 block [&_video]:size-full [&_video]:object-contain">
        {poster && (
          <Poster
            src={poster}
            alt={title}
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity data-[visible]:opacity-100"
          />
        )}
        {tracks.map((t) => (
          <Track
            key={t.src}
            src={t.src}
            kind={t.kind ?? "subtitles"}
            label={t.label}
            lang={t.language}
            default={t.default}
          />
        ))}
      </MediaProvider>

      {/* tap / click = play-pause, double-click = fullscreen */}
      <Gesture
        className="pointer-events-none absolute inset-0 z-10"
        event="pointerup"
        action="toggle:paused"
      />
      <Gesture
        className="pointer-events-none absolute inset-0 z-10"
        event="dblpointerup"
        action="toggle:fullscreen"
      />

      <Captions
        className={cn(
          "pointer-events-none absolute inset-x-2 bottom-14 z-10 text-center text-xs sm:bottom-16 sm:text-base",
          "[&_[data-part=cue]]:inline-block [&_[data-part=cue]]:rounded-md [&_[data-part=cue]]:bg-black/70",
          "[&_[data-part=cue]]:px-2 [&_[data-part=cue]]:py-0.5 [&_[data-part=cue]]:text-white",
        )}
      />

      <PlayerControls title={title} thumbnails={thumbnails} />
    </MediaPlayer>
  );
}
