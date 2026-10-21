import type { ReactNode } from "react";
import type { Tone } from "@/lib/stage";
import { cn } from "@/lib/utils";

const tones: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200/80",
  navy: "bg-navy-50 text-navy-800 ring-navy-200",
  gold: "bg-gold-50 text-gold-800 ring-gold-200",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  rose: "bg-rose-50 text-rose-800 ring-rose-200",
  sky: "bg-sky-50 text-sky-800 ring-sky-200",
  violet: "bg-violet-50 text-violet-800 ring-violet-200",
};

const dots: Record<Tone, string> = {
  slate: "bg-slate-400",
  navy: "bg-navy-600",
  gold: "bg-gold-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

export function Badge({
  tone = "slate",
  dot,
  icon,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset [&_svg]:size-3.5",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dots[tone])} />}
      {icon}
      {children}
    </span>
  );
}

export function dotClass(tone: Tone) {
  return dots[tone];
}
