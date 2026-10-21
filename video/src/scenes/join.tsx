import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Abs, C, GoogleG, Icon, Mark, Seal, eyebrow, headline, sans, serif } from "../brand";
import { CAST, Leader } from "../leader";
import { POP, between, enter, rise } from "../motion";
import { type SceneTiming, cue } from "../timeline";

const PHONE = { x: 1250, y: 110, w: 400, h: 820 };
const SCREEN = { w: PHONE.w - 28, h: PHONE.h - 28 };

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  a: random(`ca${i}`) * Math.PI * 2,
  v: 180 + random(`cv${i}`) * 260,
  s: 6 + random(`cs${i}`) * 8,
  c: [C.gold300, C.gold500, C.navy300, C.gold200][i % 4],
  spin: (random(`cr${i}`) - 0.5) * 720,
}));

function Screen({ show, children }: { show: number; children: ReactNode }) {
  if (show <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: show, transform: `translateX(${(1 - show) * 30}px)` }}>{children}</div>;
}

function Tap({ x, y, p }: { x: number; y: number; p: number }) {
  if (p <= 0 || p >= 1) return null;
  return <div style={{ position: "absolute", left: x - 40 * p, top: y - 40 * p, width: 80 * p, height: 80 * p, borderRadius: "50%", background: C.navy400, opacity: 0.35 * (1 - p) }} />;
}

function Button({ children, dark, pressed = 0, style }: { children: ReactNode; dark?: boolean; pressed?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        height: 58,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: sans,
        fontSize: 18,
        fontWeight: 600,
        background: dark ? C.navy900 : "white",
        color: dark ? "white" : C.navy950,
        border: dark ? "none" : `1.5px solid ${C.slate200}`,
        transform: `scale(${1 - 0.04 * Math.sin(pressed * Math.PI)})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function JoinScene({ t }: { t: SceneTiming }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const signIn = cue(t, "sign");
  const review = cue(t, "review");
  const done = cue(t, "you're");
  const phone = enter(frame, fps, 0.1);

  const screenA = 1 - between(frame, fps, review - 0.25, review);
  const screenB = between(frame, fps, review - 0.25, review) - between(frame, fps, done - 0.25, done);
  const screenC = between(frame, fps, done - 0.25, done);
  const reveal = done - 0.25;
  const success = enter(frame, fps, reveal, POP);

  const steps = [
    { text: "Sign in securely", at: signIn },
    { text: "Review your profile", at: review },
    { text: "You're in", at: done },
  ];

  return (
    <AbsoluteFill>
      <Abs x={150} y={290} w={820}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, ...rise(enter(frame, fps, 0.15)) }}>
          <span style={eyebrow}>Joining</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 16px 6px 8px", borderRadius: 999, background: C.navy800, border: `1px solid ${C.navy600}`, fontFamily: sans, fontSize: 20, fontWeight: 500, color: C.gold200 }}>
            <svg width={26} height={26} viewBox="0 0 26 26">
              <circle cx={13} cy={13} r={10} fill="none" stroke={C.navy600} strokeWidth={3} />
              <circle cx={13} cy={13} r={10} fill="none" stroke={C.gold400} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - between(frame, fps, 0.3, done + 0.4)} transform="rotate(-90 13 13)" strokeLinecap="round" />
            </svg>
            about 1 min
          </span>
        </div>
        <h1 style={{ ...headline, marginTop: 28, ...rise(enter(frame, fps, 0.3)) }}>
          In about
          <br />a minute.
        </h1>
        <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 22 }}>
          {steps.map((s, i) => {
            const on = enter(frame, fps, s.at);
            const past = i < 2 ? enter(frame, fps, steps[i + 1].at) : 0;
            return (
              <div key={s.text} style={{ display: "flex", alignItems: "center", gap: 22, opacity: 0.35 + 0.65 * on }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    display: "grid",
                    placeItems: "center",
                    background: on > 0.5 ? C.gold500 : C.navy800,
                    border: `1px solid ${on > 0.5 ? C.gold400 : C.navy600}`,
                    fontFamily: sans,
                    fontSize: 22,
                    fontWeight: 600,
                    color: "white",
                    transform: `scale(${1 + 0.12 * Math.sin(on * Math.PI)})`,
                  }}
                >
                  {past > 0.5 || (i === 2 && on > 0.5) ? <Icon name="check" size={26} color="white" stroke={3} /> : i + 1}
                </div>
                <span style={{ fontFamily: sans, fontSize: 34, color: "white" }}>{s.text}</span>
              </div>
            );
          })}
        </div>
      </Abs>

      <div
        style={{
          position: "absolute",
          left: PHONE.x,
          top: PHONE.y,
          width: PHONE.w,
          height: PHONE.h,
          borderRadius: 60,
          background: C.navy950,
          border: `2px solid ${C.navy600}`,
          boxShadow: "0 50px 100px -30px rgba(0,0,0,0.7)",
          padding: 12,
          opacity: phone,
          transform: `translateY(${(1 - phone) * 80}px) rotate(${(1 - phone) * 4}deg)`,
        }}
      >
        <div style={{ position: "relative", width: SCREEN.w, height: SCREEN.h, borderRadius: 48, background: C.paper, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: SCREEN.w / 2 - 55, top: 14, width: 110, height: 30, borderRadius: 15, background: C.navy950, zIndex: 5 }} />

          <Screen show={screenA}>
            <div style={{ position: "absolute", top: 110, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Mark size={64} color={C.gold500} stroke={1.6} />
              <div style={{ fontFamily: serif, fontSize: 28, color: C.navy950, marginTop: 14 }}>CEO Network</div>
              <div style={{ fontFamily: serif, fontSize: 44, color: C.navy950, marginTop: 70 }}>Welcome</div>
              <div style={{ fontFamily: sans, fontSize: 17, color: C.slate500, marginTop: 10 }}>Your profile is ready to review.</div>
            </div>
            <div style={{ position: "absolute", left: 28, right: 28, top: 480, display: "flex", flexDirection: "column", gap: 14 }}>
              <Button pressed={between(frame, fps, signIn + 0.15, signIn + 0.45)}>
                <GoogleG size={24} /> Continue with Google
              </Button>
              <Button dark>
                <Icon name="mail" size={22} color="white" /> Continue with email
              </Button>
            </div>
            <Tap x={SCREEN.w / 2} y={509} p={between(frame, fps, signIn + 0.1, signIn + 0.7)} />
            <div style={{ position: "absolute", bottom: 46, width: "100%", textAlign: "center", fontFamily: sans, fontSize: 14, color: C.slate400 }}>Private · Verified members only</div>
          </Screen>

          <Screen show={screenB}>
            <div style={{ position: "absolute", top: 64, left: 28, fontFamily: sans, fontSize: 18, fontWeight: 600, color: C.navy950 }}>Review your profile</div>
            <div style={{ position: "absolute", left: 22, right: 22, top: 108 - 30 * between(frame, fps, review, done), borderRadius: 22, background: "white", border: `1px solid ${C.slate200}`, overflow: "hidden" }}>
              <div style={{ height: 90, background: `linear-gradient(120deg, ${C.navy800}, ${C.navy600})` }} />
              <div style={{ position: "absolute", left: 20, top: 44, borderRadius: "50%", border: "4px solid white" }}>
                <Leader look={CAST[0]} size={88} ring={null} />
              </div>
              <div style={{ padding: "58px 22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: serif, fontSize: 28, color: C.navy950 }}>
                  Your name <Seal size={22} />
                </div>
                <div style={{ fontFamily: sans, fontSize: 15, color: C.slate500, marginTop: 4 }}>Chief Executive Officer</div>
                <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 0.94, 0.98, 0.9, 0.97, 0.55].map((w, k) => (
                    <div key={k} style={{ height: 9, width: `${w * 100}%`, borderRadius: 5, background: C.navy200 }} />
                  ))}
                </div>
                <div style={{ marginTop: 26, display: "flex", gap: 10 }}>
                  {[0, 1, 2].map((k) => (
                    <div key={k} style={{ flex: 1, height: 64, borderRadius: 12, background: C.slate100 }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", left: 28, right: 28, bottom: 52 }}>
              <Button dark pressed={between(frame, fps, done - 0.45, done - 0.15)} style={{ background: C.gold500 }}>
                Looks good
              </Button>
            </div>
            <Tap x={SCREEN.w / 2} y={SCREEN.h - 81} p={between(frame, fps, done - 0.5, done)} />
          </Screen>

          <Screen show={screenC}>
            <div style={{ position: "absolute", top: 230, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ position: "relative", transform: `scale(${success})` }}>
                {CONFETTI.map((c, i) => {
                  const k = Math.max(0, sec - reveal);
                  const x = Math.cos(c.a) * c.v * k;
                  const y = Math.sin(c.a) * c.v * k + 300 * k * k;
                  return <div key={i} style={{ position: "absolute", left: 75 + x, top: 75 + y, width: c.s, height: c.s * 0.6, background: c.c, transform: `rotate(${c.spin * k}deg)`, opacity: Math.max(0, 1 - k / 1.6) }} />;
                })}
                <Seal size={150} check={between(frame, fps, reveal + 0.15, reveal + 0.55)} />
              </div>
              <div style={{ fontFamily: serif, fontSize: 50, color: C.navy950, marginTop: 40, ...rise(enter(frame, fps, reveal + 0.15), 16) }}>You&apos;re in.</div>
              <div style={{ fontFamily: sans, fontSize: 18, color: C.slate500, marginTop: 10, ...rise(enter(frame, fps, reveal + 0.3), 16) }}>Welcome to the CEO Network</div>
            </div>
          </Screen>
        </div>
      </div>
    </AbsoluteFill>
  );
}
