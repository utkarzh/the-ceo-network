import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { C, TrcLogo, sans } from "../brand";
import { POP, between, enter, rise } from "../motion";
import type { SceneTiming } from "../timeline";

const WIDTH = 720;

/** The Report Company presents: the lettering wipes in, then the red full stop drops into place. */
export function OpeningScene(_: { t: SceneTiming }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wipe = between(frame, fps, 0.15, 1.05, Easing.out(Easing.cubic));
  const drop = enter(frame, fps, 1.0, POP);
  const ripple = between(frame, fps, 1.2, 1.9, Easing.out(Easing.quad));

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${1 + 0.03 * between(frame, fps, 0, 2.6, Easing.linear)})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ filter: `blur(${(1 - wipe) * 4}px)` }}>
          <TrcLogo width={WIDTH} wipe={wipe} drop={drop} ripple={ripple} />
        </div>
        <div style={{ marginTop: 40, fontFamily: sans, fontSize: 22, fontWeight: 500, letterSpacing: "0.42em", textTransform: "uppercase", color: C.navy300, ...rise(enter(frame, fps, 1.45), 14) }}>
          presents
        </div>
      </div>
    </AbsoluteFill>
  );
}
