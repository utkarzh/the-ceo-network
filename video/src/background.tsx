import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./brand";

const MOTES = Array.from({ length: 46 }, (_, i) => ({
  x: random(`x${i}`),
  y: random(`y${i}`),
  r: 1 + random(`r${i}`) * 2.2,
  speed: 0.15 + random(`s${i}`) * 0.45,
  phase: random(`p${i}`) * Math.PI * 2,
  alpha: 0.08 + random(`a${i}`) * 0.3,
}));

/** Deep navy field with slowly rising brass motes, shared by every scene. */
export function Background() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = Math.sin(frame / 160) * 60;
  return (
    <AbsoluteFill style={{ background: C.navy950 }}>
      <AbsoluteFill style={{ background: `radial-gradient(1300px 900px at ${62 + drift / 40}% ${38 + drift / 60}%, ${C.navy800} 0%, ${C.navy900} 38%, ${C.navy950} 78%)` }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {MOTES.map((m, i) => {
          const y = (((m.y * height - frame * m.speed) % height) + height) % height;
          const x = m.x * width + Math.sin(frame / 50 + m.phase) * 14;
          return <circle key={i} cx={x} cy={y} r={m.r} fill={C.gold300} opacity={m.alpha} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(closest-side at 50% 50%, transparent 70%, rgba(4,8,18,0.55) 100%)", transform: "scale(1.35)" }} />
    </AbsoluteFill>
  );
}
