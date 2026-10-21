import type { CSSProperties } from "react";
import { Easing, interpolate, spring, type SpringConfig } from "remotion";

export const SMOOTH: Partial<SpringConfig> = { damping: 200 };
export const POP: Partial<SpringConfig> = { damping: 11, stiffness: 170, mass: 0.6 };

/** A 0 → 1 spring that starts `at` seconds into the current sequence. */
export function enter(frame: number, fps: number, at: number, config: Partial<SpringConfig> = SMOOTH) {
  return spring({ frame: frame - Math.round(at * fps), fps, config });
}

/** Eased 0 → 1 between two times in seconds. */
export function between(frame: number, fps: number, from: number, to: number, easing = Easing.inOut(Easing.cubic)) {
  return interpolate(frame / fps, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

export function rise(p: number, distance = 30): CSSProperties {
  return { opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * distance}px)` };
}

export function smoothstep(x: number, lo: number, hi: number) {
  const t = Math.min(1, Math.max(0, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}
