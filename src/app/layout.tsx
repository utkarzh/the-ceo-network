import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "CEO Network — by TRC", template: "%s · CEO Network" },
  description: "A private, verified network for the chief executives and business leaders featured in TRC reports.",
};

export const viewport: Viewport = { themeColor: "#0d1526" };

// The prototype keeps all state in localStorage and renders in the browser by design,
// so navigations are allowed to wait for that client-only boundary.
export const instant = false;

function Splash() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 24 24" className="size-10 animate-pulse text-gold-500" aria-hidden>
          <path
            d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <p className="display text-xl text-navy-900">CEO Network</p>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Suspense fallback={<Splash />}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
