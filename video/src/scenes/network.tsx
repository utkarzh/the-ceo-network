import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Abs, C, Mark, Seal, eyebrow, sans, serif } from "../brand";
import { CAST, Leader } from "../leader";
import { POP, between, enter, rise } from "../motion";
import { type SceneTiming, cue } from "../timeline";

const CENTER = { x: 960, y: 520 };
const NODES = Array.from({ length: 10 }, (_, i) => {
  const a = ((-90 + i * 36) * Math.PI) / 180;
  return { x: CENTER.x + 760 * Math.cos(a), y: CENTER.y + 360 * Math.sin(a) };
});
const RING = NODES.map((_, i) => [i, (i + 1) % NODES.length] as const);
const CHORDS = NODES.map((_, i) => [i, (i + 2) % NODES.length] as const);
const AVATAR = 108;

export function NetworkScene({ t }: { t: SceneTiming }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const connect = cue(t, "place");
  const intro = cue(t, "meet");

  const edge = ([a, b]: readonly [number, number], p: number, opacity: number, key: string) => {
    const A = NODES[a];
    const B = NODES[b];
    return <line key={key} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * p} y2={A.y + (B.y - A.y) * p} stroke={C.gold400} strokeWidth={2} strokeOpacity={opacity} strokeLinecap="round" />;
  };

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: CENTER.x - 700,
          top: CENTER.y - 560,
          width: 1400,
          height: 1000,
          background: "radial-gradient(closest-side, rgba(208,166,92,0.13), transparent 70%)",
          opacity: enter(frame, fps, intro),
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {CHORDS.map((e, i) => edge(e, between(frame, fps, connect + 0.5 + i * 0.06, connect + 1.2 + i * 0.06), 0.16, `c${i}`))}
        {RING.map((e, i) => edge(e, between(frame, fps, connect + i * 0.07, connect + 0.6 + i * 0.07), 0.55, `r${i}`))}
        {sec > connect + 1.4 &&
          RING.map(([a, b], i) => {
            const k = (((sec - connect) * 0.45 + i * 0.37) % 1 + 1) % 1;
            const A = NODES[a];
            const B = NODES[b];
            return <circle key={`m${i}`} cx={A.x + (B.x - A.x) * k} cy={A.y + (B.y - A.y) * k} r={4} fill={C.gold200} opacity={0.9 * Math.sin(k * Math.PI)} />;
          })}
      </svg>

      {NODES.map((n, i) => {
        const p = enter(frame, fps, 0.05 + i * 0.07, POP);
        const seal = enter(frame, fps, cue(t, "verified") + i * 0.06, POP);
        const bob = Math.sin(sec * 1.4 + i) * 5;
        return (
          <div key={i} style={{ position: "absolute", left: n.x - AVATAR / 2, top: n.y - AVATAR / 2 + bob, transform: `scale(${p})` }}>
            <div style={{ borderRadius: "50%", boxShadow: "0 18px 36px rgba(0,0,0,0.35)" }}>
              <Leader look={CAST[i]} size={AVATAR} />
            </div>
            <div style={{ position: "absolute", right: -8, bottom: -6, transform: `scale(${seal})` }}>
              <Seal size={40} check={seal} />
            </div>
          </div>
        );
      })}

      <Abs x={CENTER.x - 100} y={270}>
        <Mark size={200} draw={between(frame, fps, intro - 0.1, intro + 0.9)} spark={enter(frame, fps, intro + 0.7, POP)} />
      </Abs>
      <Abs x={0} y={490} w={1920} style={{ textAlign: "center" }}>
        <div style={{ fontFamily: serif, fontSize: 140, lineHeight: 1, color: "white", letterSpacing: "-0.02em", ...rise(enter(frame, fps, intro + 0.3), 40) }}>CEO Network</div>
        <div style={{ ...eyebrow, fontSize: 24, marginTop: 34, letterSpacing: "0.3em", ...rise(enter(frame, fps, cue(t, "private"))) }}>
          Private · Verified · By invitation
        </div>
        <div style={{ fontFamily: sans, fontSize: 30, color: C.navy200, marginTop: 20, ...rise(enter(frame, fps, cue(t, "chief"))) }}>
          For the chief executives featured in TRC reports
        </div>
      </Abs>
    </AbsoluteFill>
  );
}
