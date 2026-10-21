// Records one voiceover clip per scene from src/script.json, finds when each word is
// spoken, and writes src/vo-timings.json, which the composition uses to time scenes,
// animation beats and captions.
//
//   npm run voiceover                          Kokoro "af_heart", a natural AI voice that runs locally
//   KOKORO_VOICE=bf_emma npm run voiceover     another Kokoro voice (bf_* are British, af_* American)
//   ELEVENLABS_API_KEY=... npm run voiceover   ElevenLabs (optional ELEVENLABS_VOICE_ID)
//   TTS=say npm run voiceover                  macOS `say`
//
// Word timings come from Whisper, which also prints what it heard so mispronunciations show up.
import { pipeline } from "@huggingface/transformers";
import { KokoroTTS } from "kokoro-js";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "vo");
const script = JSON.parse(readFileSync(join(root, "src", "script.json"), "utf8"));

const elevenKey = process.env.ELEVENLABS_API_KEY;
const engine = process.env.TTS ?? (elevenKey ? "elevenlabs" : "kokoro");
const kokoroVoice = process.env.KOKORO_VOICE ?? "af_heart";
const kokoroSpeed = Number(process.env.KOKORO_SPEED ?? "1.1");
const elevenVoice = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM"; // "Rachel", a warm female narrator
const sayVoice = process.env.SAY_VOICE ?? "Samantha";

let kokoroModel;
async function kokoro(text, file) {
  kokoroModel ??= await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "fp32", device: "cpu" }).catch((e) => {
    throw new Error(`${e.message}\nIf the model download was interrupted, delete node_modules/@huggingface/transformers/.cache and try again.`);
  });
  const audio = await kokoroModel.generate(text, { voice: kokoroVoice, speed: kokoroSpeed });
  // Kokoro peaks around -5 dBFS; bring every clip to the same fuller level.
  let peak = 0;
  for (const v of audio.audio) peak = Math.max(peak, Math.abs(v));
  if (peak > 0) for (let i = 0; i < audio.audio.length; i++) audio.audio[i] *= 0.89 / peak;
  await audio.save(file);
}

async function elevenlabs(text, file) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoice}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": elevenKey, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

function say(text, file) {
  execFileSync("say", ["-v", sayVoice, "--file-format=WAVE", "--data-format=LEI16@44100", "-o", file, text]);
}

function seconds(file) {
  const m = execFileSync("afinfo", [file], { encoding: "utf8" }).match(/estimated duration: ([\d.]+)/);
  if (!m) throw new Error(`Could not read the duration of ${file}`);
  return Number(m[1]);
}

let whisper;
async function hear(file) {
  whisper ??= await pipeline("automatic-speech-recognition", "onnx-community/whisper-base.en_timestamped", { dtype: "fp32" });
  const tmp = `${file}.16k.wav`;
  execFileSync("afconvert", ["-f", "WAVE", "-d", "LEF32@16000", "-c", "1", file, tmp]);
  const b = readFileSync(tmp);
  rmSync(tmp);
  const data = b.indexOf("data") + 8;
  const pcm = new Float32Array(b.buffer.slice(b.byteOffset + data, b.byteOffset + b.length - ((b.length - data) % 4)));
  const out = await whisper(pcm, { return_timestamps: "word" });
  return out.chunks.map((c) => ({ text: c.text.trim(), at: c.timestamp[0] }));
}

const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

/** Gives every script word the time Whisper heard it, interpolating any words it missed. */
function align(words, heard, total) {
  const a = words.map(norm);
  const b = heard.map((h) => norm(h.text));
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const at = new Array(a.length).fill(null);
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (a[i] === b[j]) at[i++] = heard[j++].at;
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const matched = at.filter((x) => x != null).length;
  for (let i = 0; i < at.length; i++) {
    if (at[i] != null) continue;
    let p = i - 1;
    while (p >= 0 && at[p] == null) p--;
    let q = i + 1;
    while (q < at.length && at[q] == null) q++;
    const tp = p >= 0 ? at[p] : 0;
    const tq = q < at.length ? at[q] : total;
    at[i] = tp + ((tq - tp) * (i - p)) / (q - p);
  }
  for (let i = 1; i < at.length; i++) at[i] = Math.max(at[i], at[i - 1]);
  return { at, matched };
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const timings = [];
for (const line of script) {
  if (!line.text) continue;
  const file = `vo/${line.id}.${engine === "elevenlabs" ? "mp3" : "wav"}`;
  const path = join(root, "public", file);
  const text = line.speak ?? line.text;
  if (engine === "elevenlabs") await elevenlabs(text, path);
  else if (engine === "say") say(text, path);
  else await kokoro(text, path);

  const s = seconds(path);
  const heard = await hear(path);
  const words = line.text.split(/\s+/).filter(Boolean);
  const { at, matched } = align(words, heard, s);
  timings.push({
    id: line.id,
    file,
    seconds: Math.round(s * 1000) / 1000,
    words: words.map((text, i) => ({ text, at: Math.round(at[i] * 1000) / 1000 })),
  });
  const flag = matched < words.length ? `  ⚠ ${words.length - matched} word(s) not heard clearly` : "";
  console.log(`${line.id.padEnd(8)} ${s.toFixed(2)}s  heard: ${heard.map((h) => h.text).join(" ")}${flag}`);
}

writeFileSync(join(root, "src", "vo-timings.json"), `${JSON.stringify(timings, null, 2)}\n`);
const label = engine === "kokoro" ? `Kokoro ${kokoroVoice}` : engine === "elevenlabs" ? `ElevenLabs ${elevenVoice}` : `macOS say (${sayVoice})`;
console.log(`Voice: ${label}. Timings written to src/vo-timings.json.`);
