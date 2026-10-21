import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Abs, C, Mark, Seal, TrcLogo, sans, serif } from "../brand";
import { CAST, Leader } from "../leader";
import { POP, between, enter, rise } from "../motion";
import { type SceneTiming, cue } from "../timeline";

const ENV = { x: 640, y: 400, w: 640, h: 400 };
const CARD = { w: 600, h: 360 };
const BUTTON = { x: 175, y: 200, w: 250, h: 66 };

// Members who appear once the invitation is accepted, placed around the settled card.
const CROWD = [
  { x: 420, y: 280, s: 104 },
  { x: 290, y: 470, s: 90 },
  { x: 440, y: 650, s: 96 },
  { x: 1500, y: 280, s: 104 },
  { x: 1630, y: 470, s: 90 },
  { x: 1480, y: 650, s: 96 },
  { x: 730, y: 140, s: 82 },
  { x: 1190, y: 140, s: 82 },
];

const CONFETTI = Array.from({ length: 44 }, (_, i) => ({
  a: -Math.PI / 2 + (random(`ea${i}`) - 0.5) * Math.PI * 1.6,
  v: 380 + random(`ev${i}`) * 520,
  w: 8 + random(`ew${i}`) * 9,
  c: [C.gold300, C.gold500, C.trcRed, "white", C.navy300][i % 5],
  spin: (random(`er${i}`) - 0.5) * 900,
}));

function Cursor() {
  return (
    <svg width={46} height={46} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))" }}>
      <path d="M4 2.5 L4 19.5 L8.3 15.6 L11.2 22 L14.1 20.7 L11.3 14.4 L17.2 14.4 Z" fill="white" stroke={C.navy950} strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
}

/** The invitation: an envelope opens, the card settles, the CEO taps Join now and the network fills in around it. */
export function EndScene({ t }: { t: SceneTiming }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const join = cue(t, "join");
  const explore = cue(t, "exploring");
  const from = cue(t, "from");

  // The envelope arrives once the crossfade from the previous scene has finished.
  const envIn = enter(frame, fps, 0.45, { damping: 14, stiffness: 120, mass: 0.8 });
  const flap = between(frame, fps, 0.9, 1.3);
  const cardShown = between(frame, fps, 1.05, 1.15);
  const lift = enter(frame, fps, 1.2);
  const envOut = between(frame, fps, 1.8, 2.25, Easing.in(Easing.cubic));
  const settle = enter(frame, fps, 1.85);

  const cardScale = 1 + 0.25 * settle;
  const cardCy = 600 - 270 * lift + 125 * settle;
  const card = { left: 960 - CARD.w / 2, top: cardCy - CARD.h / 2 };
  const btn = { x: 960, y: cardCy + (BUTTON.y + BUTTON.h / 2 - CARD.h / 2) * cardScale };

  const press = between(frame, fps, join - 0.08, join + 0.22);
  const travel = between(frame, fps, join - 0.95, join - 0.12, Easing.inOut(Easing.cubic));
  const cursorX = interpolate(travel, [0, 1], [1620, btn.x + 40]);
  const cursorY = interpolate(travel, [0, 1], [1010, btn.y + 6]);
  const cursorOn = between(frame, fps, join - 1.0, join - 0.8) * (1 - between(frame, fps, join + 0.9, join + 1.3));
  const burst = Math.max(0, sec - join);
  const envOffset = (1 - envIn) * -1000 + envOut * 320;

  const envelope = (part: "back" | "front") => (
    <div style={{ position: "absolute", left: ENV.x, top: ENV.y + envOffset, width: ENV.w, height: ENV.h, opacity: 1 - envOut }}>
      <svg width={ENV.w} height={ENV.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {part === "back" ? (
          <rect x={0} y={0} width={ENV.w} height={ENV.h} rx={22} fill={C.navy700} stroke={C.gold400} strokeWidth={2} />
        ) : (
          <path d={`M0 150 L${ENV.w / 2} 285 L${ENV.w} 150 L${ENV.w} ${ENV.h - 22} Q${ENV.w} ${ENV.h} ${ENV.w - 22} ${ENV.h} L22 ${ENV.h} Q0 ${ENV.h} 0 ${ENV.h - 22} Z`} fill={C.navy600} stroke={C.gold400} strokeWidth={2} strokeLinejoin="round" />
        )}
      </svg>
    </div>
  );

  const flapEl = (
    <div style={{ position: "absolute", left: ENV.x, top: ENV.y + envOffset, width: ENV.w, height: 240, perspective: 1400, opacity: 1 - envOut }}>
      <div style={{ width: "100%", height: "100%", transformOrigin: "50% 0", transform: `rotateX(${flap * 180}deg)` }}>
        <svg width={ENV.w} height={240} style={{ overflow: "visible" }}>
          <path d={`M10 2 L${ENV.w / 2} 228 L${ENV.w - 10} 2 Z`} fill={flap < 0.5 ? C.navy500 : C.navy800} stroke={C.gold400} strokeWidth={2} strokeLinejoin="round" />
        </svg>
        {flap < 0.5 && (
          <div style={{ position: "absolute", left: ENV.w / 2 - 42, top: 186, width: 84, height: 84, borderRadius: 42, background: C.gold500, display: "grid", placeItems: "center", boxShadow: "0 6px 14px rgba(0,0,0,0.3)" }}>
            <Mark size={50} color={C.gold100} stroke={1.6} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AbsoluteFill>
      {CROWD.map((m, i) => {
        const p = enter(frame, fps, explore + i * 0.07, POP);
        if (p <= 0) return null;
        const x = 960 + (m.x - 960) * p;
        const y = 455 + (m.y - 455) * p;
        return (
          <div key={i} style={{ position: "absolute", left: x - m.s / 2, top: y - m.s / 2 + Math.sin(sec * 1.5 + i) * 6, transform: `scale(${Math.min(p, 1.2)})` }}>
            <div style={{ borderRadius: "50%", boxShadow: "0 16px 32px rgba(0,0,0,0.35)" }}>
              <Leader look={CAST[(i + 2) % CAST.length]} size={m.s} />
            </div>
            <div style={{ position: "absolute", right: -6, bottom: -4 }}>
              <Seal size={m.s * 0.34} />
            </div>
          </div>
        );
      })}

      {envelope("back")}
      {flap >= 0.5 && flapEl}

      <div
        style={{
          position: "absolute",
          left: card.left,
          top: card.top,
          width: CARD.w,
          height: CARD.h,
          borderRadius: 26,
          background: C.paper,
          boxShadow: `0 ${30 * settle}px ${80 * settle}px -24px rgba(0,0,0,0.6)`,
          transform: `scale(${cardScale})`,
          opacity: cardShown,
          textAlign: "center",
          fontFamily: sans,
        }}
      >
        <div style={{ position: "absolute", top: 30, width: "100%", fontSize: 14, fontWeight: 600, letterSpacing: "0.26em", textTransform: "uppercase", color: C.gold700 }}>You&apos;re invited</div>
        <div style={{ position: "absolute", top: 62, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
          <Mark size={46} color={C.gold500} stroke={1.7} />
          <span style={{ fontFamily: serif, fontSize: 52, color: C.navy950, letterSpacing: "-0.015em" }}>CEO Network</span>
        </div>
        <div style={{ position: "absolute", top: 138, width: "100%", fontFamily: serif, fontStyle: "italic", fontSize: 31, color: C.gold700 }}>There&apos;s a seat saved for you.</div>
        <div
          style={{
            position: "absolute",
            left: BUTTON.x,
            top: BUTTON.y,
            width: BUTTON.w,
            height: BUTTON.h,
            borderRadius: BUTTON.h / 2,
            background: press > 0 ? C.gold500 : C.navy950,
            color: "white",
            fontSize: 23,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            transform: `scale(${1 - 0.07 * Math.sin(press * Math.PI) + 0.03 * Math.sin(sec * 4) * (1 - between(frame, fps, join - 0.3, join))})`,
            boxShadow: "0 10px 22px -8px rgba(13,21,38,0.6)",
            overflow: "hidden",
          }}
        >
          Join now
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `translateX(${Math.sin(sec * 5) * 3}px)` }}>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 320 * press,
              height: 320 * press,
              marginLeft: -160 * press,
              marginTop: -160 * press,
              borderRadius: "50%",
              background: "white",
              opacity: 0.35 * (1 - press),
            }}
          />
        </div>
        <div style={{ position: "absolute", top: 296, width: "100%", fontSize: 17, fontWeight: 600, color: C.navy600, ...rise(enter(frame, fps, explore), 10) }}>
          Start exploring the network →
        </div>
      </div>

      {envelope("front")}
      {flap < 0.5 && flapEl}

      {burst > 0 &&
        burst < 2.2 &&
        CONFETTI.map((c, i) => {
          const x = btn.x + Math.cos(c.a) * c.v * burst;
          const y = btn.y + Math.sin(c.a) * c.v * burst + 620 * burst * burst;
          return (
            <div
              key={i}
              style={{ position: "absolute", left: x, top: y, width: c.w, height: c.w * 0.55, borderRadius: 2, background: c.c, transform: `rotate(${c.spin * burst}deg)`, opacity: Math.max(0, 1 - burst / 2.2) }}
            />
          );
        })}

      {cursorOn > 0 && (
        <div style={{ position: "absolute", left: cursorX - 4, top: cursorY - 2, opacity: cursorOn, transform: `scale(${1 - 0.15 * Math.sin(press * Math.PI)})`, transformOrigin: "4px 2px" }}>
          <Cursor />
        </div>
      )}

      <Abs x={960 - 220} y={762} style={{ ...rise(enter(frame, fps, from - 0.1), 16) }}>
        <TrcLogo width={440} wipe={between(frame, fps, from - 0.1, from + 0.6, Easing.out(Easing.cubic))} drop={enter(frame, fps, from + 0.55, POP)} ripple={between(frame, fps, from + 0.75, from + 1.4)} />
      </Abs>
    </AbsoluteFill>
  );
}
