import * as React from "react";

import { cn } from "@/lib/utils";

interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

/**
 * Lightweight glass panel with the same props as React Bits' GlassSurface
 * (width, height, borderRadius, className, children).
 *
 * To use the official refracting version instead, run:
 *   npx shadcn@latest add @react-bits/GlassSurface-TS-TW
 * and overwrite this file; the player imports it unchanged.
 */
export default function GlassSurface({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  className,
}: GlassSurfaceProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        "bg-white/10 backdrop-blur-xl backdrop-saturate-150",
        "border border-white/25",
        "shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(255,255,255,0.1)]",
        className,
      )}
      style={{ width, height, borderRadius }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-white/5"
      />
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
