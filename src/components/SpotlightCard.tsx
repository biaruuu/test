"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * Card lit by a spotlight that follows the pointer (React Bits "Spotlight Card" pattern).
 * Official version: npx shadcn@latest add @react-bits/SpotlightCard-TS-TW
 */
export default function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 255, 255, 0.25)",
}: SpotlightCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = React.useState(0);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setOpacity(0.6)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 p-8",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}
