import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glass Video Player",
  description: "Responsive glassmorphism video player built with Next.js, shadcn/ui and React Bits.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b14",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
