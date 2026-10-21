import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Fragment, type FC } from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Background } from "./background";
import { TrcLogo } from "./brand";
import { Captions } from "./captions";
import { ControlScene } from "./scenes/control";
import { EndScene } from "./scenes/end";
import { JoinScene } from "./scenes/join";
import { LeadersScene } from "./scenes/leaders";
import { NetworkScene } from "./scenes/network";
import { OpeningScene } from "./scenes/opening";
import { ProfileScene } from "./scenes/profile";
import { FADE, FPS, LEAD, type SceneId, type SceneTiming, scenes, TOTAL_FRAMES } from "./timeline";

const SCENES: Record<SceneId, FC<{ t: SceneTiming }>> = {
  brand: OpeningScene,
  leaders: LeadersScene,
  network: NetworkScene,
  profile: ProfileScene,
  join: JoinScene,
  control: ControlScene,
  end: EndScene,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Music sits under the narration and lifts in the gaps; spans closer than a second merge so it doesn't pump.
const MUSIC_UNDER_VOICE = 0.21;
const MUSIC_ALONE = 0.56;
const SPEECH = scenes
  .filter((s) => s.file)
  .map((s) => [s.from + Math.round(LEAD * FPS), s.from + Math.round((LEAD + s.vo) * FPS)])
  .reduce<number[][]>((spans, [a, b]) => {
    const prev = spans[spans.length - 1];
    if (prev && a - prev[1] < FPS) prev[1] = b;
    else spans.push([a, b]);
    return spans;
  }, []);

function musicVolume(f: number) {
  const speaking = Math.max(0, ...SPEECH.map(([a, b]) => interpolate(f, [a - 10, a, b, b + 18], [0, 1, 1, 0], clamp)));
  const fade = interpolate(f, [0, 15, TOTAL_FRAMES - 50, TOTAL_FRAMES - 1], [0, 1, 1, 0], clamp);
  return (MUSIC_ALONE - (MUSIC_ALONE - MUSIC_UNDER_VOICE) * speaking) * fade;
}

// The Report Company logo stays in the corner between the opening and the end card, which both show it large.
const BUG_IN = scenes[1].from + FADE;
const BUG_OUT = scenes[scenes.length - 1].from;

export type IntroProps = { captions: boolean; music: boolean };

export function Intro({ captions, music }: IntroProps) {
  const frame = useCurrentFrame();
  const fadeInOut = interpolate(frame, [0, 10, TOTAL_FRAMES - 24, TOTAL_FRAMES - 1], [1, 0, 0, 1], clamp);
  const bug = interpolate(frame, [BUG_IN, BUG_IN + 15, BUG_OUT, BUG_OUT + FADE], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        {scenes.map((s, i) => {
          const Scene = SCENES[s.id];
          return (
            <Fragment key={s.id}>
              {i > 0 && <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />}
              <TransitionSeries.Sequence durationInFrames={s.duration}>
                <Scene t={s} />
              </TransitionSeries.Sequence>
            </Fragment>
          );
        })}
      </TransitionSeries>
      {bug > 0 && (
        <div style={{ position: "absolute", left: 64, top: 54, opacity: 0.85 * bug }}>
          <TrcLogo width={210} />
        </div>
      )}
      {scenes.map(
        (s) =>
          s.file && (
            <Sequence key={s.id} from={s.from + Math.round(LEAD * FPS)} durationInFrames={Math.ceil(s.vo * FPS) + 2} layout="none">
              <Html5Audio src={staticFile(s.file)} />
            </Sequence>
          ),
      )}
      {music && <Html5Audio src={staticFile("music.wav")} volume={musicVolume} />}
      {captions && <Captions />}
      <AbsoluteFill style={{ background: "black", opacity: fadeInOut, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
}
