"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders children at a fixed desktop width and scales them to fit the
 * container — an accurate "screenshot" of the real page at any size.
 */
export function ScaledFrame({ width = 1120, children, className, fill = false }: { width?: number; children: ReactNode; className?: string; fill?: boolean }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      setScale(o.clientWidth / width);
      setHeight(i.scrollHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={outer} className={cn("relative w-full overflow-hidden", className)} style={fill ? undefined : { height: height * scale }}>
      <div ref={inner} className="absolute left-0 top-0 origin-top-left" style={{ width, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
