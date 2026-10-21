// Synthesises a light, upbeat background bed (marimba arpeggios, soft pads, bass and
// gentle percussion) to public/music.wav. Replace that file with a licensed track to
// use real music instead; the composition fades and ducks whatever is there.
//
//   npm run music
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SR = 44100;
const BPM = 104;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const BARS = 24;
const LENGTH = BARS * BAR + 4;
const N = Math.ceil(LENGTH * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const plucks = [new Float32Array(N), new Float32Array(N)];

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

function add(bufL, bufR, start, dur, pan, sample) {
  const s0 = Math.floor(start * SR);
  const n = Math.min(Math.floor(dur * SR), N - s0);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n; i++) {
    const v = sample(i / SR);
    bufL[s0 + i] += v * gl;
    bufR[s0 + i] += v * gr;
  }
}

// D – Bm – G – A, one chord per bar.
const CHORDS = [
  { pad: [50, 57, 62, 66, 69], arp: [74, 76, 78, 81], bass: 38 },
  { pad: [47, 54, 62, 66, 69], arp: [71, 74, 78, 81], bass: 35 },
  { pad: [43, 50, 59, 62, 66], arp: [71, 74, 78, 79], bass: 43 },
  { pad: [45, 52, 61, 64, 69], arp: [69, 73, 76, 81], bass: 45 },
];
const PATTERN = [0, 1, 2, 3, 2, 1, 2, 3];

for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const c = CHORDS[bar % 4];
  const last = bar === BARS - 1;
  const full = bar >= 2 && bar < BARS - 1;

  // Pad: detuned sines with slow attack and release.
  for (const m of c.pad) {
    const f = hz(m);
    add(L, R, t0, BAR + 1.2, 0, (t) => {
      const env = Math.min(1, t / 0.6) * (t > BAR ? Math.max(0, 1 - (t - BAR) / 1.2) : 1);
      const lfo = 1 + 0.08 * Math.sin(2 * Math.PI * 0.25 * t);
      return 0.028 * env * lfo * (Math.sin(2 * Math.PI * f * t) + 0.6 * Math.sin(2 * Math.PI * f * 1.004 * t) + 0.2 * Math.sin(4 * Math.PI * f * t));
    });
  }

  // Marimba arpeggio on eighth notes, panned left and right.
  const steps = last ? 1 : 8;
  for (let k = 0; k < steps; k++) {
    const f = hz(c.arp[PATTERN[k]]);
    const accent = k % 4 === 0 ? 1 : 0.72;
    add(plucks[0], plucks[1], t0 + (k * BEAT) / 2, last ? 3 : 1.2, k % 2 ? 0.35 : -0.35, (t) => {
      const a = Math.min(1, t / 0.003);
      return 0.16 * accent * a * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.22) + 0.35 * Math.sin(2 * Math.PI * 3.9 * f * t) * Math.exp(-t / 0.035));
    });
  }

  if (!full) continue;

  // Bass on beat one and the "and" of beat three.
  for (const [beat, len] of [[0, 1.5], [2.5, 1.2]]) {
    const f = hz(c.bass);
    add(L, R, t0 + beat * BEAT, len * BEAT + 0.15, 0, (t) => {
      const env = Math.min(1, t / 0.01) * (0.55 + 0.45 * Math.exp(-t / 0.25)) * Math.max(0, Math.min(1, (len * BEAT + 0.15 - t) / 0.12));
      return 0.2 * env * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t));
    });
  }

  // Soft kick on beats one and three.
  for (const beat of [0, 2]) {
    add(L, R, t0 + beat * BEAT, 0.35, 0, (t) => {
      const f = 45 + 70 * Math.exp(-t / 0.03);
      return 0.42 * Math.exp(-t / 0.11) * Math.sin(2 * Math.PI * f * t);
    });
  }

  // Shaker on the off-beats, finger snap on two and four once the groove settles.
  for (let k = 0; k < 8; k++) {
    let prev = 0;
    add(L, R, t0 + ((k + 0.5) * BEAT) / 2, 0.12, 0.25, (t) => {
      const x = rand();
      const hp = x - prev;
      prev = x;
      return 0.035 * (k % 2 ? 1 : 0.6) * Math.min(1, t / 0.002) * Math.exp(-t / 0.028) * hp;
    });
  }
  if (bar >= 4) {
    for (const beat of [1, 3]) {
      let prev = 0;
      add(L, R, t0 + beat * BEAT, 0.25, -0.1, (t) => {
        const x = rand();
        const hp = x - prev;
        prev = x;
        return 0.07 * Math.exp(-t / 0.05) * hp + 0.03 * Math.exp(-t / 0.02) * Math.sin(2 * Math.PI * 1800 * t);
      });
    }
  }
}

// Dotted-eighth echo on the marimba, then mix it in.
const D = Math.round(0.75 * BEAT * SR);
for (const bus of plucks) for (let i = D; i < N; i++) bus[i] += bus[i - D] * 0.32;
for (let i = 0; i < N; i++) {
  L[i] += plucks[0][i];
  R[i] += plucks[1][i];
}

let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.89 / peak;

const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);
writeFileSync(join(root, "public", "music.wav"), Buffer.concat([header, data]));
console.log(`public/music.wav — ${LENGTH.toFixed(1)}s at ${BPM} BPM`);
