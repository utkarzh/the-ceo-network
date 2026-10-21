"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Tip } from "@/components/ui/overlay";
import { cn } from "@/lib/utils";

const ROSETTE =
  "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z";

/** Brand mark: the verification rosette, drawn as an outline with a north-pointing spark. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("text-gold-400", className)} aria-hidden>
      <path d={ROSETTE} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 7.2 13.1 10.9 16.8 12 13.1 13.1 12 16.8 10.9 13.1 7.2 12 10.9 10.9Z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ href = "/", tone = "light", suffix, className }: { href?: string; tone?: "light" | "dark"; suffix?: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2.5", className)}>
      <Mark className="size-7 transition-transform duration-500 group-hover:rotate-45" />
      <span className={cn("display text-[1.35rem] leading-none", tone === "light" ? "text-white" : "text-navy-950")}>CEO Network</span>
      {suffix}
    </Link>
  );
}

/** Filled gold seal shown next to verified members. */
export function Seal({ className, tip = "Verified by TRC" }: { className?: string; tip?: string | false }) {
  const svg = (
    <svg viewBox="0 0 24 24" className={cn("inline-block shrink-0 text-gold-500", className)} role="img" aria-label="Verified">
      <path d={ROSETTE} fill="currentColor" />
      <path d="m8.8 12.1 2.2 2.2 4.3-4.4" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (!tip) return svg;
  return (
    <Tip content={tip}>
      <span className="inline-flex">{svg}</span>
    </Tip>
  );
}

/** External links are inert in the prototype — they explain themselves instead of leaving the demo. */
export function ExternalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        toast("External links are disabled in the prototype", { description: href.replace(/^https?:\/\//, "") });
      }}
      className={className}
    >
      {children}
    </a>
  );
}

export function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function PreviewRibbon({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gold-50 px-4 py-3 text-[13px] leading-relaxed text-gold-800 ring-1 ring-inset ring-gold-200">
      <span className="mt-px rounded-md bg-gold-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Preview</span>
      <p>{children}</p>
    </div>
  );
}
