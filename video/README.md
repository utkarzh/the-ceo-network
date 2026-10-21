# CEO Network — intro video

A 52-second animated introduction for invited CEOs, built with [Remotion](https://www.remotion.dev) (React → MP4). It opens and closes on The Report Company logo and uses the CEO Network's own palette, type and mark from the main app.

```bash
npm install
npm run studio      # live preview and scrubbing at http://localhost:3123
npm run render      # → out/ceo-network-intro.mp4 (1920×1080, 30 fps)
npm run render:no-captions
```

## Changing the words or the voice

1. Edit `src/script.json` — one line of narration per scene (`brand` is the silent logo opening).
2. Run `npm run voiceover`. It records each line, then Whisper listens back to find when every word is spoken and prints what it heard, so mispronunciations show up as text (`⚠` marks words it couldn't match).
3. Render again. Scene lengths, animation beats and captions all follow the new recording.

The default voice is Kokoro `af_heart`, an open-weight (Apache 2.0) AI voice that runs on this machine — no account or API key. The first run downloads the voice and Whisper models (about 650 MB) into `node_modules/@huggingface/transformers/.cache`.

```bash
KOKORO_VOICE=bf_emma npm run voiceover               # British; also bf_isabella, af_bella, af_nicole…
KOKORO_SPEED=1.0 npm run voiceover                   # default 1.1
ELEVENLABS_API_KEY=... npm run voiceover             # ElevenLabs "Rachel" (ELEVENLABS_VOICE_ID to change)
TTS=say npm run voiceover                            # macOS built-in voice
```

Animation beats are tied to words in the narration (`cue(t, "reviewed")` in the scenes), so if you remove a word a scene uses, rendering stops with a message naming it.

## Music

`npm run music` synthesises the light background bed in `public/music.wav`. To use a licensed track instead, save it over that file. The composition fades it in and out and lowers it under the narration (`MUSIC_UNDER_VOICE` and `MUSIC_ALONE` in `src/intro.tsx`). Render with `--props='{"captions":true,"music":false}'` to leave it out.

## Logo

`public/brand/` holds The Report Company wordmark cut out of its black background: `trc-logo-text.png` (white lettering) and `trc-logo-dot.png` (the red full stop, animated separately). `TrcLogo` in `src/brand.tsx` draws them.

## Scenes

| File | Narration |
| --- | --- |
| `scenes/opening.tsx` | — The Report Company presents (logo wipe, red dot drops in) |
| `scenes/leaders.tsx` | Every TRC report features the leaders… Leaders like you. (globe with pinned leaders) |
| `scenes/network.tsx` | Meet the CEO Network… (leaders connect, logo reveal) |
| `scenes/profile.tsx` | Your profile is already done… (interview → profile card → review stamp) |
| `scenes/join.tsx` | Joining takes about a minute… (phone: sign in → review → you're in) |
| `scenes/control.tsx` | Only verified members can see it… (privacy controls) |
| `scenes/end.tsx` | There's a seat saved for you. Join now… (invitation envelope, Join now tap, members appear, logo) |

The illustrated leaders in `src/leader.tsx` are generic characters, not real people.
