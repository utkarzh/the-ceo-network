import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Abs, C, Icon, Mark, Seal, eyebrow, headline, sans, serif } from "../brand";
import { CAST, Leader } from "../leader";
import { POP, between, enter, rise } from "../motion";
import { type SceneTiming, cue } from "../timeline";

const CARD = { x: 1060, y: 120, w: 660, h: 820 };
const MIC = { x: 975, y: 300 };
const LINES = [1, 0.95, 0.99, 0.6];

function Label({ children }: { children: ReactNode }) {
  return <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: C.slate400 }}>{children}</div>;
}

function Bar({ w, h = 12, fill = 1, color = C.navy300 }: { w: number; h?: number; fill?: number; color?: string }) {
  return (
    <div style={{ width: w, height: h, borderRadius: h / 2, background: C.slate100, overflow: "hidden" }}>
      <div style={{ width: `${fill * 100}%`, height: "100%", background: color, borderRadius: h / 2 }} />
    </div>
  );
}

export function ProfileScene({ t }: { t: SceneTiming }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const built = cue(t, "built");
  const reviewed = cue(t, "reviewed");
  const card = enter(frame, fps, 0.1);
  const stamp = enter(frame, fps, reviewed + 0.1, POP);
  const writing = (k: number) => between(frame, fps, built + 0.1 + k * 0.38, built + 0.55 + k * 0.38);

  return (
    <AbsoluteFill>
      <Abs x={150} y={300} w={720}>
        <div style={{ ...eyebrow, ...rise(enter(frame, fps, 0.15)) }}>Your profile</div>
        <h1 style={{ ...headline, marginTop: 28, ...rise(enter(frame, fps, 0.3)) }}>
          Already
          <br />
          done.
        </h1>
        <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 26 }}>
          {[
            { icon: "mic" as const, text: "Built from your TRC interview", at: built },
            { icon: "check" as const, text: "Reviewed by your Project Director", at: reviewed },
          ].map((row) => (
            <div key={row.text} style={{ display: "flex", alignItems: "center", gap: 22, ...rise(enter(frame, fps, row.at), 20) }}>
              <div style={{ width: 58, height: 58, borderRadius: 29, background: C.navy800, border: `1px solid ${C.navy600}`, display: "grid", placeItems: "center" }}>
                <Icon name={row.icon} size={28} color={C.gold300} />
              </div>
              <span style={{ fontFamily: sans, fontSize: 32, color: "white" }}>{row.text}</span>
            </div>
          ))}
        </div>
      </Abs>

      {/* The interview, flowing into the profile */}
      <Abs x={MIC.x - 62} y={MIC.y - 62} style={{ transform: `scale(${enter(frame, fps, 0.4, POP)})` }}>
        {[0, 1, 2].map((k) => {
          const w = ((sec * 0.9 + k / 3) % 1 + 1) % 1;
          return (
            <div
              key={k}
              style={{ position: "absolute", left: 62 - 62 * (1 + w), top: 62 - 62 * (1 + w), width: 124 * (1 + w), height: 124 * (1 + w), borderRadius: "50%", border: `2px solid ${C.gold400}`, opacity: (1 - w) * 0.45 }}
            />
          );
        })}
        <div style={{ width: 124, height: 124, borderRadius: 62, background: C.navy700, border: `2px solid ${C.gold400}`, display: "grid", placeItems: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}>
          <Icon name="mic" size={58} color={C.gold300} stroke={1.8} />
        </div>
      </Abs>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 14 }, (_, k) => {
          const p = interpolate(sec, [built - 0.3 + k * 0.1, built + 0.5 + k * 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (p <= 0 || p >= 1) return null;
          const x0 = MIC.x + 60;
          const y0 = MIC.y + 20;
          const x1 = CARD.x + 60;
          const y1 = CARD.y + 400 + (k % 4) * 30;
          const x = (1 - p) ** 2 * x0 + 2 * (1 - p) * p * (x0 + 30) + p ** 2 * x1;
          const y = (1 - p) ** 2 * y0 + 2 * (1 - p) * p * (y1 - 40) + p ** 2 * y1;
          return <circle key={k} cx={x} cy={y} r={5} fill={C.gold300} opacity={Math.sin(p * Math.PI)} />;
        })}
      </svg>

      {/* Profile card */}
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          borderRadius: 30,
          background: C.paper,
          overflow: "hidden",
          boxShadow: "0 40px 90px -30px rgba(0,0,0,0.6)",
          opacity: card,
          transform: `translateY(${(1 - card) * 60}px) scale(${0.96 + 0.04 * card})`,
        }}
      >
        <div style={{ height: 170, background: `linear-gradient(120deg, ${C.navy800}, ${C.navy600})`, position: "relative", overflow: "hidden" }}>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ position: "absolute", left: 380 + k * 110, top: -30 + k * 40, opacity: 0.18 }}>
              <Mark size={150} />
            </div>
          ))}
        </div>
        <Abs x={44} y={92} style={{ borderRadius: "50%", border: `6px solid ${C.paper}`, transform: `scale(${enter(frame, fps, 0.5, POP)})` }}>
          <Leader look={CAST[0]} size={150} ring={null} />
        </Abs>
        <Abs x={226} y={186}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: serif, fontSize: 46, color: C.navy950, ...rise(enter(frame, fps, 0.7), 12) }}>Your name</span>
            <span style={{ transform: `scale(${stamp})`, display: "inline-flex" }}>
              <Seal size={34} check={stamp} />
            </span>
          </div>
          <div style={{ fontFamily: sans, fontSize: 22, color: C.slate600, marginTop: 6, ...rise(enter(frame, fps, 0.85), 12) }}>Chief Executive Officer</div>
          <div style={{ fontFamily: sans, fontSize: 20, color: C.slate500, marginTop: 4, ...rise(enter(frame, fps, 0.95), 12) }}>Your company</div>
        </Abs>

        <Abs x={44} y={360}>
          <Label>Introduction</Label>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {LINES.map((w, k) => (
              <Bar key={k} w={572 * w} fill={writing(k)} />
            ))}
          </div>
        </Abs>

        <Abs x={44} y={540}>
          <Label>Company</Label>
          <div style={{ marginTop: 18, display: "flex", gap: 16 }}>
            {(["building", "globe", "users"] as const).map((icon, k) => {
              const p = enter(frame, fps, built + 1.1 + k * 0.12, POP);
              return (
                <div key={icon} style={{ width: 180, height: 88, borderRadius: 16, background: "white", border: `1px solid ${C.slate200}`, padding: 16, display: "flex", gap: 14, alignItems: "center", transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.gold100, display: "grid", placeItems: "center" }}>
                    <Icon name={icon} size={24} color={C.gold700} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Bar w={80} h={10} color={C.navy400} />
                    <Bar w={56} h={8} color={C.slate200} />
                  </div>
                </div>
              );
            })}
          </div>
        </Abs>

        <Abs x={44} y={680}>
          <Label>Featured in TRC</Label>
          <div style={{ marginTop: 18, display: "flex", gap: 16 }}>
            {[0, 1].map((k) => {
              const p = enter(frame, fps, built + 1.6 + k * 0.15, POP);
              return (
                <div key={k} style={{ width: 278, height: 72, borderRadius: 14, background: k ? `linear-gradient(120deg, ${C.gold500}, ${C.gold300})` : `linear-gradient(120deg, ${C.navy700}, ${C.navy400})`, transform: `scale(${p})`, opacity: Math.min(1, p * 2), position: "relative", overflow: "hidden" }}>
                  <svg width={278} height={72} style={{ position: "absolute", inset: 0 }}>
                    <path d={k ? "M0 60 L50 34 L90 50 L150 18 L200 44 L278 26 L278 72 L0 72Z" : "M0 72 L0 46 L30 46 L30 28 L58 28 L58 40 L84 40 L84 16 L110 16 L110 44 L150 44 L150 30 L180 30 L180 50 L220 50 L220 22 L250 22 L250 72Z"} fill="white" opacity={0.2} />
                  </svg>
                </div>
              );
            })}
          </div>
        </Abs>
      </div>

      {/* Review stamp */}
      <div
        style={{
          position: "absolute",
          right: 1920 - CARD.x - CARD.w - 50,
          top: CARD.y - 34,
          transform: `scale(${1.6 - 0.6 * stamp}) rotate(${-4 * stamp}deg)`,
          opacity: Math.min(1, stamp * 3),
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 24px 14px 16px",
          borderRadius: 999,
          background: C.gold500,
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 600,
          color: "white",
        }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 19, background: "rgba(255,255,255,0.22)", display: "grid", placeItems: "center" }}>
          <Icon name="check" size={24} color="white" stroke={3} />
        </div>
        Reviewed by TRC
      </div>
    </AbsoluteFill>
  );
}
