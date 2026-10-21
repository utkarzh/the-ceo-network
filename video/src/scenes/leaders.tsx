import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Abs, C, eyebrow, headline, serif } from "../brand";
import { CAST, Leader } from "../leader";
import { POP, between, enter, rise, smoothstep } from "../motion";
import { type SceneTiming, cue } from "../timeline";

const RAD = Math.PI / 180;
const TILT = 18 * RAD;
const GLOBE = { x: 1330, y: 540, r: 360 };

// Continents approximated as spherical caps: [lat, lon, radius in degrees].
const LAND: [number, number, number][] = [
  [48, -100, 18], [58, -115, 15], [62, -95, 14], [40, -90, 12], [32, -105, 10], [20, -100, 7], [14, -88, 4], [66, -150, 8], [72, -42, 9],
  [-5, -62, 14], [-18, -55, 12], [-32, -64, 9], [-45, -70, 5], [6, -70, 7],
  [50, 10, 9], [58, 25, 9], [45, 0, 6], [41, -4, 5], [64, 16, 6], [54, -2, 3], [42, 13, 3],
  [8, 20, 16], [-4, 24, 13], [-20, 26, 11], [-29, 24, 7], [20, 0, 13], [18, 25, 12], [28, 30, 6], [10, 40, 7], [-19, 47, 3],
  [24, 45, 9], [33, 52, 6],
  [55, 90, 22], [62, 120, 17], [48, 70, 13], [35, 105, 15], [30, 80, 8], [22, 78, 9], [14, 102, 6], [38, 128, 4], [36, 138, 4], [60, 150, 10],
  [-2, 113, 5], [-6, 106, 4], [7, 123, 4],
  [-25, 134, 12], [-32, 145, 7], [-18, 145, 5], [-41, 173, 3],
];

function angle(lat1: number, lon1: number, lat2: number, lon2: number) {
  const c = Math.sin(lat1 * RAD) * Math.sin(lat2 * RAD) + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.cos((lon1 - lon2) * RAD);
  return Math.acos(Math.min(1, Math.max(-1, c))) / RAD;
}

const DOTS = (() => {
  const out: { lat: number; lon: number; land: boolean }[] = [];
  for (let lat = -76; lat <= 80; lat += 4) {
    const step = 4 / Math.max(0.25, Math.cos(lat * RAD));
    for (let lon = -180; lon < 180; lon += step) out.push({ lat, lon, land: LAND.some(([a, o, r]) => angle(lat, lon, a, o) < r) });
  }
  return out;
})();

function project(lat: number, lon: number, center: number) {
  const phi = lat * RAD;
  const lam = (lon - center) * RAD;
  const x = Math.cos(phi) * Math.sin(lam);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(lam);
  return { x: GLOBE.x + GLOBE.r * x, y: GLOBE.y - GLOBE.r * (y * Math.cos(TILT) - z * Math.sin(TILT)), z: y * Math.sin(TILT) + z * Math.cos(TILT) };
}

// Illustrative leaders pinned to business hubs.
const PINS: [number, number][] = [
  [40.7, -74], [-23.5, -46.6], [51.5, -0.1], [5.6, -0.2], [-1.3, 36.8], [25.2, 55.3], [1.35, 103.8],
];

export function LeadersScene({ t }: { t: SceneTiming }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const center = interpolate(frame, [0, t.duration], [-18, 34]);
  const globeIn = enter(frame, fps, 0.05);

  return (
    <AbsoluteFill>
      <Abs x={150} y={330} w={760}>
        <div style={{ ...eyebrow, ...rise(enter(frame, fps, 0.15)) }}>Featured in TRC reports</div>
        <h1 style={{ ...headline, marginTop: 28, ...rise(enter(frame, fps, 0.3)) }}>
          The leaders shaping their economies.
        </h1>
        <div style={{ marginTop: 40, height: 3, width: 140 * between(frame, fps, 0.9, 1.8), background: C.gold400, borderRadius: 2 }} />
        <p
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 56,
            color: C.gold300,
            margin: "26px 0 0",
            transformOrigin: "0 50%",
            opacity: Math.min(1, enter(frame, fps, cue(t, "like", -0.1)) * 1.5),
            transform: `scale(${0.85 + 0.15 * enter(frame, fps, cue(t, "like", -0.1), POP)}) rotate(${-2 * (1 - enter(frame, fps, cue(t, "like", -0.1)))}deg)`,
          }}
        >
          Leaders like you.
        </p>
      </Abs>

      <div
        style={{
          position: "absolute",
          left: GLOBE.x - GLOBE.r * 1.6,
          top: GLOBE.y - GLOBE.r * 1.6,
          width: GLOBE.r * 3.2,
          height: GLOBE.r * 3.2,
          background: `radial-gradient(closest-side, rgba(208,166,92,0.16), rgba(208,166,92,0.05) 55%, transparent 72%)`,
          opacity: globeIn,
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: globeIn, transform: `scale(${0.92 + 0.08 * globeIn})`, transformOrigin: `${GLOBE.x}px ${GLOBE.y}px` }}>
        <defs>
          <radialGradient id="sphere" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor={C.navy700} />
            <stop offset="70%" stopColor={C.navy900} />
            <stop offset="100%" stopColor={C.navy950} />
          </radialGradient>
        </defs>
        <circle cx={GLOBE.x} cy={GLOBE.y} r={GLOBE.r} fill="url(#sphere)" />
        {DOTS.map((d, i) => {
          const p = project(d.lat, d.lon, center);
          if (p.z <= 0) return null;
          return d.land ? (
            <circle key={i} cx={p.x} cy={p.y} r={3.1} fill={C.gold300} opacity={0.25 + 0.6 * p.z} />
          ) : (
            <circle key={i} cx={p.x} cy={p.y} r={1.4} fill={C.navy400} opacity={0.22 * p.z} />
          );
        })}
        <circle cx={GLOBE.x} cy={GLOBE.y} r={GLOBE.r} fill="none" stroke={C.gold400} strokeOpacity={0.35} strokeWidth={1.5} />
      </svg>

      {PINS.map(([lat, lon], i) => {
        const p = project(lat, lon, center);
        const vis = smoothstep(p.z, 0.08, 0.4);
        const pop = enter(frame, fps, 0.55 + i * 0.32, POP);
        if (vis <= 0 || pop <= 0) return null;
        const pulse = ((frame / fps + i * 0.4) % 1.6) / 1.6;
        return (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y, opacity: vis }}>
            <div style={{ position: "absolute", left: -7, top: -7, width: 14, height: 14, borderRadius: 7, background: C.gold400 }} />
            <div
              style={{
                position: "absolute",
                left: -7 - 22 * pulse,
                top: -7 - 22 * pulse,
                width: 14 + 44 * pulse,
                height: 14 + 44 * pulse,
                borderRadius: "50%",
                border: `2px solid ${C.gold400}`,
                opacity: (1 - pulse) * 0.7,
              }}
            />
            <div style={{ position: "absolute", left: -1, top: -64 * pop, width: 2, height: 64 * pop, background: C.gold400 }} />
            <div style={{ position: "absolute", left: -46, top: -64 - 92, transform: `scale(${pop})`, transformOrigin: "50% 100%" }}>
              <div style={{ borderRadius: "50%", boxShadow: "0 16px 30px rgba(0,0,0,0.35)" }}>
                <Leader look={CAST[i]} size={92} />
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
