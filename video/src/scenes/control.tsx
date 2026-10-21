import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Abs, C, ICONS, Icon, eyebrow, headline, sans } from "../brand";
import { POP, between, enter, rise } from "../motion";
import { type SceneTiming, cue } from "../timeline";

const PANEL = { x: 1010, y: 330, w: 760 };

export function ControlScene({ t }: { t: SceneTiming }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const panel = enter(frame, fps, 0.1);

  const rows = [
    { icon: "lock" as const, title: "Verified members only", sub: "Only signed-in, verified CEOs can see it.", at: cue(t, "only"), toggle: true },
    { icon: "pencil" as const, title: "Change it any time", sub: "Ask TRC to update any detail.", at: cue(t, "change") },
    { icon: "trash" as const, title: "Remove it any time", sub: "Your profile comes down on request.", at: cue(t, "remove") },
  ];

  return (
    <AbsoluteFill>
      <Abs x={150} y={300} w={760}>
        <div style={{ ...eyebrow, ...rise(enter(frame, fps, 0.15)) }}>Privacy</div>
        <h1 style={{ ...headline, marginTop: 28, ...rise(enter(frame, fps, 0.3)) }}>
          You stay
          <br />
          <span style={{ position: "relative" }}>
            in control.
            <span style={{ position: "absolute", left: 0, bottom: -10, height: 6, borderRadius: 3, background: C.gold400, width: `${between(frame, fps, cue(t, "control"), cue(t, "control", 0.6)) * 100}%` }} />
          </span>
        </h1>
        <div style={{ marginTop: 70, ...rise(enter(frame, fps, 0.6)) }}>
          <svg width={250} height={250} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
            <g transform={`translate(12 12) scale(${1 + 0.02 * Math.sin(sec * 2.2)}) translate(-12 -12)`}>
              <g fill={C.navy800} stroke={C.gold400} strokeWidth={0.7} strokeLinejoin="round">
                {ICONS.shield}
              </g>
              <g transform="translate(7.4 7.3) scale(0.38)" fill="none" stroke={C.gold300} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                {ICONS.lock}
              </g>
            </g>
          </svg>
        </div>
      </Abs>

      <div
        style={{
          position: "absolute",
          left: PANEL.x,
          top: PANEL.y,
          width: PANEL.w,
          borderRadius: 30,
          background: C.paper,
          padding: "14px 0",
          boxShadow: "0 40px 90px -30px rgba(0,0,0,0.6)",
          opacity: panel,
          transform: `translateY(${(1 - panel) * 60}px)`,
        }}
      >
        {rows.map((r, i) => {
          const on = enter(frame, fps, r.at);
          const tick = enter(frame, fps, r.at + 0.15, POP);
          return (
            <div key={r.title} style={{ display: "flex", alignItems: "center", gap: 26, padding: "28px 36px", borderTop: i ? `1px solid ${C.slate200}` : "none", opacity: 0.35 + 0.65 * on }}>
              <div style={{ width: 76, height: 76, borderRadius: 22, background: on > 0.5 ? C.navy900 : C.slate100, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name={r.icon} size={34} color={on > 0.5 ? C.gold300 : C.slate400} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: sans, fontSize: 31, fontWeight: 600, color: C.navy950, letterSpacing: "-0.01em" }}>{r.title}</div>
                <div style={{ fontFamily: sans, fontSize: 21, color: C.slate500, marginTop: 6 }}>{r.sub}</div>
              </div>
              {r.toggle ? (
                <div style={{ width: 82, height: 46, borderRadius: 23, background: on > 0.5 ? C.gold500 : C.slate200, position: "relative", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 5, left: 5 + 36 * on, width: 36, height: 36, borderRadius: 18, background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
                </div>
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 26, background: C.gold500, display: "grid", placeItems: "center", transform: `scale(${tick})`, flexShrink: 0 }}>
                  <Icon name="check" size={28} color="white" stroke={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
