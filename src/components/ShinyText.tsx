import * as React from "react";

import { cn } from "@/lib/utils";

interface ShinyTextProps {
  text: string;
  speed?: number;
  className?: string;
}

/** React Bits "Shiny Text" style: a light sweep across the text (pure CSS). */
export default function ShinyText({ text, speed = 4, className }: ShinyTextProps) {
  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent animate-shine",
        "bg-[linear-gradient(110deg,rgba(255,255,255,0.55)_35%,#fff_50%,rgba(255,255,255,0.55)_65%)] bg-[length:200%_100%]",
        className,
      )}
      style={{ animationDuration: `${speed}s` }}
    >
      {text}
    </span>
  );
}
