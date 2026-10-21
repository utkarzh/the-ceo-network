import script from "./script.json";
import timings from "./vo-timings.json";

export const FPS = 30;
/** Frames of crossfade between scenes. */
export const FADE = 15;
/** Seconds into a scene before its voiceover starts. */
export const LEAD = 0.25;
const TAIL = 0.5;
const END_HOLD = 2.8;

export type SceneId = "brand" | "leaders" | "network" | "profile" | "join" | "control" | "end";

interface ScriptLine {
  id: string;
  text: string;
  /** Seconds a scene without narration stays on screen. */
  hold?: number;
}

interface Recording {
  id: string;
  file: string;
  seconds: number;
  /** When each script word is spoken, measured by `npm run voiceover`. */
  words?: Word[];
}

export interface Word {
  text: string;
  /** Seconds into the voiceover. */
  at: number;
}

export interface Caption {
  text: string;
  start: number;
  end: number;
}

export interface SceneTiming {
  id: SceneId;
  file: string | null;
  vo: number;
  /** First frame of the scene in the full video. */
  from: number;
  duration: number;
  words: Word[];
  captions: Caption[];
}

// Fallback when a recording has no measured word times: punctuation adds a pause, so it
// weighs extra when spreading the clip's length over its words.
const PAUSE: Record<string, number> = { ",": 5, ";": 6, ":": 8, ".": 12, "?": 12, "!": 12 };

function wordTimes(text: string, seconds: number): Word[] {
  const words = text.split(/\s+/).filter(Boolean);
  const weights = words.map((w) => w.length + 1 + (PAUSE[w.slice(-1)] ?? 0));
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return words.map((text, i) => {
    const at = (acc / total) * seconds;
    acc += weights[i];
    return { text, at };
  });
}

const join = (ws: Word[]) => ws.map((w) => w.text).join(" ");

/** Phrases at punctuation; a short phrase joins the next one after a comma and the previous one after a full stop. */
function captionsFor(words: Word[], seconds: number): Caption[] {
  const phrases: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (/[,.:;?!]$/.test(w.text)) {
      phrases.push(cur);
      cur = [];
    }
  }
  if (cur.length) phrases.push(cur);

  const groups: Word[][] = [];
  let carry: Word[] = [];
  for (const p of phrases) {
    const g = [...carry, ...p];
    carry = [];
    if (join(g).length < 14 && /,$/.test(g[g.length - 1].text)) carry = g;
    else if (join(g).length < 14 && groups.length) groups[groups.length - 1].push(...g);
    else groups.push(g);
  }
  if (carry.length) groups.push(carry);

  const lines = groups.flatMap((g) => {
    if (join(g).length <= 56) return [g];
    let best = 1;
    for (let i = 1; i < g.length; i++) {
      if (Math.abs(join(g.slice(0, i)).length - join(g.slice(i)).length) < Math.abs(join(g.slice(0, best)).length - join(g.slice(best)).length)) best = i;
    }
    return [g.slice(0, best), g.slice(best)];
  });

  return lines.map((g, i) => ({ text: join(g), start: g[0].at, end: lines[i + 1]?.[0].at ?? seconds }));
}

export const scenes: SceneTiming[] = (() => {
  const lines = script as ScriptLine[];
  let from = 0;
  return lines.map((line, i) => {
    const last = i === lines.length - 1;
    let scene: SceneTiming;
    if (!line.text) {
      const duration = Math.ceil((line.hold ?? 2) * FPS) + FADE;
      scene = { id: line.id as SceneId, file: null, vo: 0, from, duration, words: [], captions: [] };
    } else {
      const t = (timings as Recording[]).find((x) => x.id === line.id);
      if (!t) throw new Error(`No voiceover for "${line.id}" — run npm run voiceover`);
      const count = line.text.split(/\s+/).filter(Boolean).length;
      const words = t.words?.length === count ? t.words : wordTimes(line.text, t.seconds);
      const duration = Math.ceil((LEAD + t.seconds + (last ? END_HOLD : TAIL)) * FPS) + (last ? 0 : FADE);
      scene = { id: line.id as SceneId, file: t.file, vo: t.seconds, from, duration, words, captions: captionsFor(words, t.seconds) };
    }
    from += scene.duration - FADE;
    return scene;
  });
})();

export const TOTAL_FRAMES = scenes[scenes.length - 1].from + scenes[scenes.length - 1].duration;

/** Seconds from the start of a scene until the voiceover reaches `word`, so beats follow the narration. */
export function cue(t: SceneTiming, word: string, offset = 0) {
  const key = word.toLowerCase();
  const w = t.words.find((x) => x.text.toLowerCase().replace(/[^a-z']/g, "").startsWith(key));
  if (!w) throw new Error(`"${word}" is not in the ${t.id} voiceover`);
  return LEAD + w.at + offset;
}
