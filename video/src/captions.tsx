import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, sans } from "./brand";
import { FPS, LEAD, scenes } from "./timeline";

// Latest first, so the next line replaces the previous one instead of waiting for it to fade.
const CUES = scenes
  .flatMap((s) => s.captions.map((c) => ({ text: c.text, start: s.from + Math.round((LEAD + c.start) * FPS), end: s.from + Math.round((LEAD + c.end) * FPS) })))
  .reverse();

/** Burned-in subtitles that follow the voiceover, for viewers watching on mute. */
export function Captions() {
  const frame = useCurrentFrame();
  const cue = CUES.find((c) => frame >= c.start && frame < c.end + 6);
  if (!cue) return null;
  const opacity = interpolate(frame, [cue.start, cue.start + 5, cue.end + 1, cue.end + 6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 52 }}>
      <div
        style={{
          opacity,
          fontFamily: sans,
          fontSize: 34,
          fontWeight: 500,
          color: "white",
          background: "rgba(8, 13, 26, 0.72)",
          border: `1px solid ${C.navy700}`,
          padding: "12px 28px",
          borderRadius: 14,
          letterSpacing: "-0.005em",
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
}
