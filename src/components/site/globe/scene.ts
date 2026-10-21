import * as THREE from "three";
import { LAND_MASK } from "./land-mask";

/* ------------------------------------------------------------------ */
/*  The hero globe. Everything is drawn additively onto an opaque navy */
/*  canvas, and nothing uses the depth buffer: each shader decides for */
/*  itself how much of it is hidden behind the sphere, so the far side */
/*  reads as glass rather than disappearing.                           */
/* ------------------------------------------------------------------ */

export type LatLon = readonly [lat: number, lon: number];

export interface GlobeLayout {
  /** Canvas size in CSS pixels. */
  width: number;
  height: number;
  /** Where the globe's centre should land, and its radius, in canvas CSS pixels. */
  cx: number;
  cy: number;
  radius: number;
}

export interface Projection {
  x: number;
  y: number;
  /** 1 facing the viewer, 0 on the limb, negative behind the globe. */
  facing: number;
}

const DEG = Math.PI / 180;
const FOV = 30;
const SPIN = 0.04; // rad/s — one turn every 2½ minutes or so
const TILT = 0.3; // centres roughly 17°N, where most members are
const START_LON = 22; // open on Europe, Africa and the Gulf
const LIGHT = new THREE.Vector3(-0.72, 0.5, 0.48).normalize(); // view space: low sun from the upper left, so a night side shows

const rgb = (hex: number) => new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);

const COLOR = {
  night: rgb(0x4f6491),
  day: rgb(0xd6ae66),
  cream: rgb(0xfbf3df),
  gold: rgb(0xd0a65c),
  thread: rgb(0xbb8b3f),
  deep: rgb(0x070c18),
  lift: rgb(0x1a2742),
  rim: rgb(0x4f6491),
  glow: rgb(0xd0a65c),
};

export function toVec3([lat, lon]: LatLon, r = 1) {
  const phi = lat * DEG;
  const lam = lon * DEG;
  return new THREE.Vector3(Math.cos(phi) * Math.sin(lam) * r, Math.sin(phi) * r, Math.cos(phi) * Math.cos(lam) * r);
}

/** Small deterministic PRNG so the twinkle pattern is the same on every visit. */
function random(seed = 7) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

/* ---------------------------- shaders ----------------------------- */

const OCCLUSION = /* glsl */ `
  uniform vec3 uCenter;
  uniform float uRadius;
  // 0 in front of the globe, 1 once the view ray has passed through it.
  float behindGlobe(vec3 p) {
    vec3 d = normalize(p);
    float b = dot(d, uCenter);
    float h = b * b - dot(uCenter, uCenter) + uRadius * uRadius;
    if (h <= 0.0) return 0.0;
    float t = b - sqrt(h);
    return smoothstep(0.0, 0.05, length(p) - t) * smoothstep(0.0, 0.01, h);
  }
`;

const haloShader = {
  vertex: /* glsl */ `
    varying vec2 vP;
    void main() {
      vP = position.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Drawn first with normal blending, so the body can sit darker than the page while the glow lifts it.
  fragment: /* glsl */ `
    uniform float uEdge;
    uniform float uIntro;
    uniform vec3 uLight;
    uniform vec3 uDeep;
    uniform vec3 uLift;
    uniform vec3 uRim;
    uniform vec3 uGlow;
    varying vec2 vP;
    void main() {
      vec2 p = vP / uEdge;
      float r = length(p);
      float lit = dot(normalize(p + 1e-5), normalize(uLight.xy)) * 0.5 + 0.5;
      vec3 col;
      float a;
      if (r < 1.0) {
        // The sphere's body, shaded analytically from its silhouette.
        vec3 n = vec3(p, sqrt(1.0 - r * r));
        float lambert = max(dot(n, uLight), 0.0);
        float fresnel = pow(1.0 - n.z, 3.0);
        col = mix(uDeep, uLift, lambert * lambert);
        col = mix(col, uRim, fresnel * mix(0.08, 0.35, lit));
        col = mix(col, uGlow, pow(fresnel, 6.0) * lit * 0.8);
        a = 0.94 * smoothstep(1.0, 0.985, r);
        a = max(a, pow(fresnel, 6.0) * lit);
      } else {
        float o = r - 1.0;
        col = mix(uRim, uGlow, lit);
        a = exp(-o * 18.0) * mix(0.05, 0.5, pow(lit, 1.5)) + exp(-o * 4.0) * 0.05;
      }
      gl_FragColor = vec4(col, a * uIntro);
    }
  `,
};

const dotShader = {
  vertex: /* glsl */ `
    attribute float aSeed;
    uniform float uTime;
    uniform float uSize;
    uniform float uIntro;
    uniform vec3 uLight;
    uniform vec3 uNight;
    uniform vec3 uDay;
    uniform vec3 uCream;
    varying float vAlpha;
    varying vec3 vColor;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      vec3 n = normalize(normalMatrix * position);
      float facing = dot(n, normalize(-mv.xyz));
      float front = smoothstep(-0.04, 0.22, facing);
      float day = smoothstep(-0.15, 0.75, dot(n, uLight));
      float twinkle = 0.72 + 0.28 * sin(uTime * (0.5 + aSeed * 1.3) + aSeed * 61.0);
      float spark = step(0.985, aSeed) * (0.5 + 0.5 * sin(uTime * 1.7 + aSeed * 90.0));
      float reveal = smoothstep(aSeed * 0.75, aSeed * 0.75 + 0.25, uIntro);
      vColor = mix(mix(uNight, uDay, day), uCream, spark * day);
      vAlpha = mix(0.06, (0.16 + 0.84 * day) * twinkle + spark * 0.6, front) * reveal;
      gl_PointSize = uSize * (0.8 + 0.4 * aSeed) * mix(0.7, 1.0, front) * mix(0.6, 1.0, smoothstep(0.0, 0.5, abs(facing)));
    }
  `,
  fragment: /* glsl */ `
    varying float vAlpha;
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.18, d) * vAlpha;
      if (a < 0.004) discard;
      gl_FragColor = vec4(vColor, a);
    }
  `,
};

/** Screen-space ribbons: lines with a real width, an optional travelling comet, dashes, and glass occlusion. */
const ribbonShader = {
  vertex: /* glsl */ `
    attribute vec3 aPrev;
    attribute vec3 aNext;
    attribute float aSide;
    attribute float aT;
    attribute float aSeed;
    uniform vec2 uResolution;
    uniform float uWidth;
    uniform float uHeadWidth;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uTrail;
    uniform float uLoop;
    varying float vT;
    varying float vSide;
    varying float vComet;
    varying float vVisible;
    ${OCCLUSION}
    float comet(float t) {
      float head = fract(uTime * uSpeed + aSeed);
      float k;
      if (uLoop > 0.5) {
        k = fract(head - t) / uTrail;
      } else {
        // Arcs fire, then rest for the remainder of their cycle.
        k = (head * (1.0 + uTrail) * 2.8 - t) / uTrail;
        if (k < 0.0) return 0.0;
      }
      return k < 1.0 ? pow(1.0 - k, 2.2) : 0.0;
    }
    void main() {
      mat4 mvp = projectionMatrix * modelViewMatrix;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec4 clip = projectionMatrix * mv;
      vec4 prev = mvp * vec4(aPrev, 1.0);
      vec4 next = mvp * vec4(aNext, 1.0);
      vec2 dir = normalize((next.xy / next.w - prev.xy / prev.w) * uResolution + 1e-6);
      vComet = uSpeed > 0.0 ? comet(aT) : 0.0;
      float width = uWidth * (1.0 + vComet * uHeadWidth);
      clip.xy += vec2(-dir.y, dir.x) * aSide * width / uResolution * clip.w;
      gl_Position = clip;
      vT = aT;
      vSide = aSide;
      vVisible = 1.0 - behindGlobe(mv.xyz);
    }
  `,
  fragment: /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uHeadColor;
    uniform float uBase;
    uniform float uHead;
    uniform float uBack;
    uniform float uDash;
    uniform float uLoop;
    uniform float uReveal;
    varying float vT;
    varying float vSide;
    varying float vComet;
    varying float vVisible;
    void main() {
      float edge = 1.0 - smoothstep(0.25, 1.0, abs(vSide));
      float dash = uDash > 0.0 ? step(0.5, fract(vT * uDash)) : 1.0;
      float ends = uLoop > 0.5 ? 1.0 : smoothstep(0.0, 0.05, vT) * smoothstep(1.0, 0.95, vT);
      float drawn = smoothstep(vT, vT + 0.04, uReveal * 1.04);
      float a = (uBase * dash * drawn + vComet * uHead) * ends;
      a *= mix(uBack, 1.0, vVisible) * edge;
      if (a < 0.003) discard;
      gl_FragColor = vec4(mix(uColor, uHeadColor, clamp(vComet * 1.4, 0.0, 1.0)), a);
    }
  `,
};

const beaconShader = {
  vertex: /* glsl */ `
    attribute float aSeed;
    attribute float aIndex;
    uniform float uTime;
    uniform float uSize;
    uniform float uActive;
    uniform float uIntro;
    varying float vAlpha;
    varying float vActive;
    varying float vPulse;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      vec3 n = normalize(normalMatrix * position);
      float facing = dot(n, normalize(-mv.xyz));
      vActive = 1.0 - step(0.5, abs(aIndex - uActive));
      vPulse = fract(uTime * 0.32 + aSeed);
      vAlpha = smoothstep(-0.02, 0.25, facing) * smoothstep(0.35 + aSeed * 0.4, 0.55 + aSeed * 0.4, uIntro);
      gl_PointSize = uSize * (1.0 + vActive * 0.7) * mix(0.55, 1.0, smoothstep(0.0, 0.6, facing));
    }
  `,
  fragment: /* glsl */ `
    uniform vec3 uGold;
    uniform vec3 uCream;
    varying float vAlpha;
    varying float vActive;
    varying float vPulse;
    void main() {
      float d = length(gl_PointCoord - 0.5) * 2.0;
      float core = smoothstep(0.17, 0.07, d);
      float glow = exp(-d * d * 14.0) * (0.55 + 0.35 * vActive);
      float ring = smoothstep(0.07, 0.0, abs(d - vPulse * 0.92)) * pow(1.0 - vPulse, 1.5) * (0.45 + 0.55 * vActive);
      float a = (core + glow + ring) * vAlpha;
      if (a < 0.004) discard;
      gl_FragColor = vec4(mix(uGold, uCream, core), a);
    }
  `,
};

/* --------------------------- geometry ----------------------------- */

function decodeMask() {
  const bin = atob(LAND_MASK.data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Land as latitude rows of evenly spaced dots, alternately staggered like a halftone. */
function landGeometry(step: number) {
  const { res, north, rows, cols } = LAND_MASK;
  const bytes = decodeMask();
  const south = north - rows / res;
  const rand = random(11);
  const positions: number[] = [];
  const seeds: number[] = [];
  let row = 0;
  for (let lat = north - step / 2; lat > south; lat -= step, row++) {
    const count = Math.max(1, Math.round((360 * Math.cos(lat * DEG)) / step));
    const r = Math.floor((north - lat) * res);
    for (let i = 0; i < count; i++) {
      const lon = -180 + ((i + (row % 2) * 0.5) * 360) / count;
      const bit = r * cols + (Math.floor((lon + 180) * res) % cols);
      if (!(bytes[bit >> 3] & (1 << (bit & 7)))) continue;
      const v = toVec3([lat, lon]);
      positions.push(v.x, v.y, v.z);
      seeds.push(rand());
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
  return geometry;
}

interface Polyline {
  points: THREE.Vector3[];
  seed: number;
}

function ribbonGeometry(lines: Polyline[]) {
  const position: number[] = [];
  const prev: number[] = [];
  const next: number[] = [];
  const side: number[] = [];
  const t: number[] = [];
  const seed: number[] = [];
  const index: number[] = [];
  let base = 0;
  for (const line of lines) {
    const n = line.points.length;
    line.points.forEach((p, i) => {
      const a = line.points[Math.max(i - 1, 0)];
      const b = line.points[Math.min(i + 1, n - 1)];
      for (const s of [-1, 1]) {
        position.push(p.x, p.y, p.z);
        prev.push(a.x, a.y, a.z);
        next.push(b.x, b.y, b.z);
        side.push(s);
        t.push(i / (n - 1));
        seed.push(line.seed);
      }
      if (i < n - 1) {
        const k = base + i * 2;
        // Counter-clockwise on screen, since the extrusion is always to the left of the direction of travel.
        index.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
      }
    });
    base += n * 2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute("aPrev", new THREE.Float32BufferAttribute(prev, 3));
  geometry.setAttribute("aNext", new THREE.Float32BufferAttribute(next, 3));
  geometry.setAttribute("aSide", new THREE.Float32BufferAttribute(side, 1));
  geometry.setAttribute("aT", new THREE.Float32BufferAttribute(t, 1));
  geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
  geometry.setIndex(index);
  return geometry;
}

/** Great-circle arc, lifted off the surface in proportion to its length. */
function arc(a: THREE.Vector3, b: THREE.Vector3, segments = 72) {
  const angle = a.angleTo(b);
  const lift = 0.05 + angle * 0.13;
  const s = Math.sin(angle);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = a
      .clone()
      .multiplyScalar(Math.sin((1 - t) * angle) / s)
      .addScaledVector(b, Math.sin(t * angle) / s);
    points.push(p.multiplyScalar(1 + lift * Math.sin(Math.PI * t)));
  }
  return points;
}

function circle(radius: number, segments = 256) {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  });
}

function graticule() {
  const lines: Polyline[] = [];
  for (let lon = -180; lon < 180; lon += 30) {
    lines.push({ points: Array.from({ length: 61 }, (_, i) => toVec3([-75 + i * 2.5, lon], 1.001)), seed: 0 });
  }
  for (const lat of [-60, -30, 0, 30, 60]) {
    lines.push({ points: Array.from({ length: 145 }, (_, i) => toVec3([lat, -180 + i * 2.5], 1.001)), seed: 0 });
  }
  return lines;
}

/** Each node links to its nearest neighbour, and every other node also throws one long-haul route. */
function linkNodes(points: THREE.Vector3[]) {
  const seen = new Set<string>();
  const pairs: [number, number][] = [];
  const add = (i: number, j: number) => {
    const key = i < j ? `${i}:${j}` : `${j}:${i}`;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push([i, j]);
  };
  points.forEach((p, i) => {
    const others = points
      .map((q, j) => ({ j, angle: p.angleTo(q) }))
      .filter((o) => o.j !== i && o.angle > 0.2)
      .sort((x, y) => x.angle - y.angle);
    if (others[0]) add(i, others[0].j);
    if (i % 2 === 0 && others.length > 3) add(i, others[Math.floor(others.length * 0.55)].j);
  });
  return pairs.slice(0, 28);
}

/* ----------------------------- scene ------------------------------ */

function ribbonMaterial(uniforms: Record<string, THREE.IUniform>, shared: Record<string, THREE.IUniform>) {
  return new THREE.ShaderMaterial({
    vertexShader: ribbonShader.vertex,
    fragmentShader: ribbonShader.fragment,
    uniforms: {
      ...shared,
      uWidth: { value: 1 },
      uHeadWidth: { value: 0 },
      uSpeed: { value: 0 },
      uTrail: { value: 0.3 },
      uLoop: { value: 0 },
      uColor: { value: COLOR.thread },
      uHeadColor: { value: COLOR.cream },
      uBase: { value: 0.1 },
      uHead: { value: 0 },
      uBack: { value: 0.15 },
      uDash: { value: 0 },
      uReveal: { value: 1 },
      ...uniforms,
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function createGlobe(canvas: HTMLCanvasElement, { nodes, reducedMotion }: { nodes: LatLon[]; reducedMotion: boolean }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setClearColor(0x0d1526, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

  // Shared by everything that needs the screen size, the clock or the occluding sphere.
  const shared = {
    uTime: { value: 0 },
    uIntro: { value: reducedMotion ? 1 : 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uCenter: { value: new THREE.Vector3() },
    uRadius: { value: 1 },
  };

  // Atmosphere and body: a camera-facing quad at the globe's centre.
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    new THREE.ShaderMaterial({
      vertexShader: haloShader.vertex,
      fragmentShader: haloShader.fragment,
      uniforms: {
        uIntro: shared.uIntro,
        uEdge: { value: 1 },
        uLight: { value: LIGHT },
        uDeep: { value: COLOR.deep },
        uLift: { value: COLOR.lift },
        uRim: { value: COLOR.rim },
        uGlow: { value: COLOR.glow },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  halo.renderOrder = 0;
  scene.add(halo);

  // tilt: fixed lean plus pointer parallax. spin: the earth turning.
  const tilt = new THREE.Group();
  tilt.rotation.set(TILT, 0, 0.16);
  const spin = new THREE.Group();
  tilt.add(spin);
  scene.add(tilt);

  const lines = new THREE.Mesh(ribbonGeometry(graticule()), ribbonMaterial({ uBase: { value: 0.045 }, uColor: { value: COLOR.rim }, uBack: { value: 0.25 } }, shared));
  lines.renderOrder = 1;
  spin.add(lines);

  const dotUniforms = {
    uTime: shared.uTime,
    uIntro: shared.uIntro,
    uSize: { value: 2 },
    uLight: { value: LIGHT },
    uNight: { value: COLOR.night },
    uDay: { value: COLOR.day },
    uCream: { value: COLOR.cream },
  };
  const dotMaterial = new THREE.ShaderMaterial({
    vertexShader: dotShader.vertex,
    fragmentShader: dotShader.fragment,
    uniforms: dotUniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  let land: THREE.Points | null = null;

  // Member countries and the routes between them.
  const rand = random(29);
  const nodePoints = nodes.map((n) => toVec3(n));
  const arcs = new THREE.Mesh(
    ribbonGeometry(linkNodes(nodePoints).map(([i, j]) => ({ points: arc(nodePoints[i], nodePoints[j]), seed: rand() }))),
    ribbonMaterial(
      {
        uBase: { value: 0.22 },
        uHead: { value: 1 },
        uHeadWidth: { value: 1.1 },
        uSpeed: { value: 1 / 7.5 },
        uTrail: { value: 0.32 },
        uBack: { value: 0.12 },
        uReveal: { value: reducedMotion ? 1 : 0 },
      },
      shared,
    ),
  );
  arcs.renderOrder = 3;
  spin.add(arcs);

  const beaconGeometry = new THREE.BufferGeometry();
  beaconGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nodePoints.flatMap((p) => p.clone().multiplyScalar(1.003).toArray()), 3));
  beaconGeometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(nodePoints.map(() => rand()), 1));
  beaconGeometry.setAttribute("aIndex", new THREE.Float32BufferAttribute(nodePoints.map((_, i) => i), 1));
  const beaconUniforms = {
    uTime: shared.uTime,
    uIntro: shared.uIntro,
    uSize: { value: 24 },
    uActive: { value: -1 },
    uGold: { value: COLOR.gold },
    uCream: { value: COLOR.cream },
  };
  const beacons = new THREE.Points(
    beaconGeometry,
    new THREE.ShaderMaterial({
      vertexShader: beaconShader.vertex,
      fragmentShader: beaconShader.fragment,
      uniforms: beaconUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  beacons.renderOrder = 5;
  spin.add(beacons);

  // Armillary rings — they lean with the globe but keep their own slow orbit.
  const rings = [
    { radius: 1.2, rotation: [0.05, 0, 0.42], speed: 1 / 18, dash: 0, base: 0.13 },
    { radius: 1.36, rotation: [0.32, 0, -0.62], speed: -1 / 26, dash: 220, base: 0.16 },
  ].map(({ radius, rotation, speed, dash, base }, i) => {
    const mesh = new THREE.Mesh(
      ribbonGeometry([{ points: circle(radius), seed: i * 0.37 }]),
      ribbonMaterial(
        {
          uBase: { value: base },
          uHead: { value: 0.75 },
          uHeadWidth: { value: 1.4 },
          uSpeed: { value: speed },
          uTrail: { value: 0.22 },
          uLoop: { value: 1 },
          uDash: { value: dash },
          uBack: { value: 0.18 },
          uColor: { value: COLOR.gold },
          uReveal: { value: 1 },
        },
        shared,
      ),
    );
    // ZXY so the per-frame y rotation turns the ring within its own plane instead of precessing it.
    mesh.rotation.set(rotation[0], rotation[1], rotation[2], "ZXY");
    mesh.renderOrder = 4;
    tilt.add(mesh);
    return mesh;
  });

  /* --------------------------- state ---------------------------- */

  let layout: GlobeLayout = { width: 1, height: 1, cx: 0.5, cy: 0.5, radius: 0.25 };
  let time = 0;
  let spinAngle = -START_LON * DEG;
  let spinVelocity = 0;
  let dragging = false;
  let dragTilt = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scroll = 0;
  let raf = 0;
  let running = false;
  let last = 0;
  let disposed = false;
  let onFrame: ((time: number, dt: number) => void) | undefined;

  const tmp = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const toCamera = new THREE.Vector3();

  function update(dt: number) {
    time += dt;
    shared.uTime.value = time;

    const intro = reducedMotion ? 1 : easeOut(time / 2.2);
    shared.uIntro.value = intro;
    if (!reducedMotion) arcs.material.uniforms.uReveal.value = easeOut((time - 0.9) / 2.4);

    if (!dragging) {
      spinVelocity *= Math.exp(-dt * 2.2);
      dragTilt *= Math.exp(-dt * 3);
    }
    if (!reducedMotion) spinAngle += (SPIN + spinVelocity) * dt;

    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 2.5));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 2.5));
    const targetScroll = reducedMotion ? 0 : window.scrollY * 0.0012;
    scroll += (targetScroll - scroll) * (1 - Math.exp(-dt * 6));

    // The globe settles into place as it appears.
    const settle = 1 - intro;
    spin.rotation.y = spinAngle + scroll - settle * 0.9;
    tilt.rotation.x = TILT + pointer.y * 0.07 + dragTilt;
    tilt.rotation.y = pointer.x * 0.1;
    rings.forEach((ring, i) => (ring.rotation.y = time * (i ? -0.05 : 0.035)));

    const scale = 0.9 + 0.1 * intro;
    tilt.scale.setScalar(scale);
    halo.scale.setScalar(scale);
    shared.uRadius.value = scale * 0.998;
  }

  function render() {
    renderer.render(scene, camera);
    onFrame?.(time, 0);
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    update(dt);
    renderer.render(scene, camera);
    onFrame?.(time, dt);
  }

  function setLayout(next: GlobeLayout) {
    layout = next;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(next.width, next.height, false);

    // Back the camera off until the sphere's silhouette is exactly `radius` pixels, then shift the frustum so it sits at (cx, cy).
    const focal = next.height / 2 / Math.tan((FOV / 2) * DEG);
    const distance = 1 / Math.sin(Math.atan(next.radius / focal));
    camera.aspect = next.width / next.height;
    camera.position.set(0, 0, distance);
    camera.near = Math.max(0.05, distance - 4);
    camera.far = distance + 4;
    camera.setViewOffset(next.width, next.height, next.width / 2 - next.cx, next.height / 2 - next.cy, next.width, next.height);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    shared.uResolution.value.set(next.width * dpr, next.height * dpr);
    shared.uCenter.value.set(0, 0, -distance);
    halo.material.uniforms.uEdge.value = distance / Math.sqrt(distance * distance - 1);

    // Dot density follows the globe's size so small screens don't turn to noise.
    const step = next.radius > 240 ? 1.05 : next.radius > 170 ? 1.3 : 1.55;
    if (!land || land.userData.step !== step) {
      if (land) {
        land.geometry.dispose();
        spin.remove(land);
      }
      land = new THREE.Points(landGeometry(step), dotMaterial);
      land.userData.step = step;
      land.renderOrder = 2;
      spin.add(land);
    }
    dotUniforms.uSize.value = next.radius * step * DEG * 0.62 * dpr;
    beaconUniforms.uSize.value = Math.min(Math.max(next.radius * 0.14, 20), 40) * dpr;
    for (const mesh of [lines, arcs, ...rings]) mesh.material.uniforms.uWidth.value = (mesh === lines ? 1 : 1.25) * dpr;

    if (!running || reducedMotion) {
      update(0);
      render();
    }
  }

  function setRunning(on: boolean) {
    if (disposed || on === running) return;
    running = on;
    if (on && !reducedMotion) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
    }
  }

  return {
    setLayout,
    setRunning,
    set onFrame(fn: ((time: number, dt: number) => void) | undefined) {
      onFrame = fn;
    },
    /** Pointer position over the hero, -1…1 on each axis. */
    setPointer(x: number, y: number) {
      pointer.tx = x;
      pointer.ty = y;
    },
    grab(on: boolean) {
      dragging = on;
      if (on) spinVelocity = 0;
    },
    /** Rotate by a drag delta in radians. */
    drag(dx: number, dy: number) {
      spinAngle += dx;
      dragTilt = Math.min(Math.max(dragTilt + dy, -0.35), 0.35);
    },
    fling(velocity: number) {
      spinVelocity = Math.min(Math.max(velocity, -2.5), 2.5);
    },
    setActive(node: number) {
      beaconUniforms.uActive.value = node;
      if (reducedMotion) renderer.render(scene, camera);
    },
    /** Where a node currently sits on the canvas, in CSS pixels. */
    project(node: number): Projection {
      tmp.copy(nodePoints[node]).multiplyScalar(1.003);
      spin.localToWorld(tmp);
      const facing = toCamera.copy(camera.position).sub(tmp).normalize().dot(normal.copy(tmp).normalize());
      tmp.project(camera);
      return { x: ((tmp.x + 1) / 2) * layout.width, y: ((1 - tmp.y) / 2) * layout.height, facing };
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
    },
  };
}

export type Globe = ReturnType<typeof createGlobe>;
