import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import type { CSSProperties, ReactNode } from "react";
import { Img, staticFile } from "remotion";

export const sans = loadInter("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily;
export const serif = loadNewsreader("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
loadNewsreader("italic", { weights: ["400"], subsets: ["latin"] });

/** The CEO Network palette from src/app/globals.css: navy carries authority, brass marks verification. */
export const C = {
  navy950: "#0d1526",
  navy900: "#172239",
  navy800: "#22304d",
  navy700: "#2f3f61",
  navy600: "#3c4f78",
  navy500: "#4f6491",
  navy400: "#7084ab",
  navy300: "#a0aeca",
  navy200: "#c9d1e1",
  navy100: "#e5e9f1",
  gold100: "#f5eddb",
  gold200: "#ebdab3",
  gold300: "#dfc285",
  gold400: "#d0a65c",
  gold500: "#bb8b3f",
  gold700: "#7c5829",
  paper: "#fbfaf8",
  trcRed: "#e2232a",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
};

const ROSETTE =
  "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z";
const SPARK = "M12 7.2 13.1 10.9 16.8 12 13.1 13.1 12 16.8 10.9 13.1 7.2 12 10.9 10.9Z";

/** Brand mark. `draw` traces the rosette outline and `spark` grows the north-pointing star, both 0–1. */
export function Mark({ size, draw = 1, spark = 1, color = C.gold400, stroke = 1.4 }: { size: number; draw?: number; spark?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
      <path d={ROSETTE} pathLength={1} fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - draw} />
      <path d={SPARK} fill={color} transform={`translate(12 12) scale(${spark}) translate(-12 -12)`} />
    </svg>
  );
}

/** Filled verification seal; `check` draws the tick. */
export function Seal({ size, check = 1, color = C.gold500 }: { size: number; check?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
      <path d={ROSETTE} fill={color} />
      <path d="m8.8 12.1 2.2 2.2 4.3-4.4" pathLength={1} fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - check} />
    </svg>
  );
}

export const ICONS = {
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </>
  ),
  mic: (
    <>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v3" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  shield: (
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14a6.5 6.5 0 0 1 3 6" />
    </>
  ),
};

export function Icon({ name, size, color, stroke = 2 }: { name: keyof typeof ICONS; size: number; color: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

// The Report Company wordmark, split into the white lettering and its red full stop (560×76).
const LOGO = { w: 560, h: 76, dot: { x: 547.5, y: 52.5 } };

/** The Report Company logo. `wipe` reveals the lettering left to right; `drop` lands the red dot (springs past 1 to bounce). */
export function TrcLogo({ width, wipe = 1, drop = 1, ripple = 0 }: { width: number; wipe?: number; drop?: number; ripple?: number }) {
  const s = width / LOGO.w;
  const h = LOGO.h * s;
  const img: CSSProperties = { position: "absolute", left: 0, top: 0, width, height: h };
  return (
    <div style={{ position: "relative", width, height: h }}>
      <Img src={staticFile("brand/trc-logo-text.png")} style={{ ...img, clipPath: `inset(-20% ${(1 - wipe) * 100}% -20% 0)` }} />
      <Img src={staticFile("brand/trc-logo-dot.png")} style={{ ...img, opacity: drop > 0.02 ? 1 : 0, transform: `translateY(${(1 - drop) * -4 * h}px)` }} />
      {ripple > 0 && ripple < 1 && (
        <div
          style={{
            position: "absolute",
            left: LOGO.dot.x * s - 40 * s * ripple,
            top: LOGO.dot.y * s - 40 * s * ripple,
            width: 80 * s * ripple,
            height: 80 * s * ripple,
            borderRadius: "50%",
            border: `${2 * s}px solid ${C.trcRed}`,
            opacity: 1 - ripple,
          }}
        />
      )}
    </div>
  );
}

export function GoogleG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export const eyebrow: CSSProperties = {
  fontFamily: sans,
  fontSize: 22,
  fontWeight: 600,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: C.gold400,
};

export const headline: CSSProperties = {
  fontFamily: serif,
  fontWeight: 400,
  fontSize: 104,
  lineHeight: 1.0,
  letterSpacing: "-0.015em",
  color: "white",
  margin: 0,
};

export function Abs({ x, y, w, h, style, children }: { x: number; y: number; w?: number; h?: number; style?: CSSProperties; children?: ReactNode }) {
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>;
}
