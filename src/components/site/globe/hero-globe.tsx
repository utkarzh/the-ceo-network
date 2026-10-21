"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Seal } from "@/components/brand";
import { Avatar } from "@/components/profile/portrait";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { COUNTRY_COORDS } from "./places";
import { createGlobe, type Globe, type Projection } from "./scene";

export type GlobeMember = Pick<Profile, "id" | "fullName" | "company" | "country" | "photo" | "useInitials">;

/** Globe radius as a share of the anchor's width; the armillary rings reach a little past the anchor. */
const RADIUS = 0.42;
/** Seconds a member's callout stays up, and the pause before the next one. */
const HOLD = 5.5;
const GAP = 0.6;
/** Length of the hairline between a beacon and its callout. */
const LEAD = 40;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * The hero's WebGL globe: member countries as beacons, routes between them, and a callout that
 * follows one featured member at a time. It fills its positioned parent and centres the globe on
 * `anchor`, which also takes drag input — so the page's layout decides where the art sits.
 */
export default function HeroGlobe({ anchor, members }: { anchor: RefObject<HTMLElement | null>; members: GlobeMember[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(-1);

  const { places, featured } = useMemo(() => {
    const places = [...new Set(members.map((m) => m.country))].filter((c) => c in COUNTRY_COORDS);
    const featured = members.filter((m) => m.photo && !m.useInitials && places.includes(m.country));
    return { places, featured };
  }, [members]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const target = anchor.current;
    const lead = leadRef.current;
    const card = cardRef.current;
    if (!root || !canvas || !target || !lead || !card) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let globe: Globe;
    try {
      globe = createGlobe(canvas, { nodes: places.map((c) => COUNTRY_COORDS[c]), reducedMotion: reduced });
    } catch {
      return; // No WebGL — the hero stands on its typography alone.
    }

    let size = { width: 0, height: 0 };
    const measure = () => {
      const box = root.getBoundingClientRect();
      const a = target.getBoundingClientRect();
      size = { width: box.width, height: box.height };
      globe.setLayout({ ...size, cx: a.left - box.left + a.width / 2, cy: a.top - box.top + a.height / 2, radius: a.width * RADIUS });
    };

    // One member at a time, chosen from those turning into view; least recently shown first.
    const nodeOf = featured.map((m) => places.indexOf(m.country));
    const lastShown = featured.map(() => -Infinity);
    let current = -1;
    let showing = false;
    let shownAt = 0;
    let hiddenAt = -Infinity;
    let opacity = 0;
    let first = true;
    let anchorAt: Projection | null = null;

    const place = () => {
      if (!anchorAt) return;
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      const x = Math.min(Math.max(anchorAt.x - w / 2, 12), size.width - w - 12);
      const y = anchorAt.y - LEAD - h + (1 - opacity) * 8;
      lead.style.transform = `translate3d(${anchorAt.x}px, ${anchorAt.y}px, 0)`;
      card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      lead.style.opacity = card.style.opacity = opacity.toFixed(3);
    };

    globe.onFrame = (time, dt) => {
      if (first) {
        first = false;
        setReady(true);
      }
      let p = current >= 0 ? globe.project(nodeOf[current]) : null;
      if (showing && (!p || p.facing < 0.3 || time - shownAt > HOLD)) {
        showing = false;
        hiddenAt = time;
        globe.setActive(-1);
      }
      if (!showing && time - hiddenAt > GAP && (reduced || time > 2.4)) {
        let next = -1;
        nodeOf.forEach((node, i) => {
          if (i === current && nodeOf.length > 1) return;
          const q = globe.project(node);
          if (q.facing < 0.55 || q.y < LEAD + 90 || q.x < 24 || q.x > size.width - 24) return;
          if (next < 0 || lastShown[i] < lastShown[next]) next = i;
        });
        if (next >= 0) {
          current = next;
          showing = true;
          shownAt = lastShown[next] = time;
          setActive(next);
          globe.setActive(nodeOf[next]);
          p = globe.project(nodeOf[next]);
        }
      }

      const goal = showing && p ? smoothstep(0.3, 0.5, p.facing) : 0;
      opacity += (goal - opacity) * (dt > 0 ? 1 - Math.exp(-dt * 7) : 1);
      if (!p) return;
      anchorAt = p;
      place();
    };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    resize.observe(target);
    // A new member's card has no size until React renders it, so place it again once it does.
    const cardSize = new ResizeObserver(place);
    cardSize.observe(card);
    const visibility = new IntersectionObserver(([entry]) => globe.setRunning(entry.isIntersecting));
    visibility.observe(root);

    // Gentle parallax under a mouse; drag (or swipe sideways) to turn the globe, with a little inertia.
    const parallax = !reduced && window.matchMedia("(pointer: fine)").matches;
    const onHover = (e: PointerEvent) => {
      const box = root.getBoundingClientRect();
      const x = ((e.clientX - box.left) / box.width) * 2 - 1;
      const y = ((e.clientY - box.top) / box.height) * 2 - 1;
      globe.setPointer(Math.min(Math.max(x, -1), 1), Math.min(Math.max(y, -1), 1));
    };
    let drag: { x: number; y: number; t: number; v: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, t: e.timeStamp, v: 0 };
      target.setPointerCapture(e.pointerId);
      globe.grab(true);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const scale = Math.PI / target.clientWidth;
      const dx = (e.clientX - drag.x) * scale;
      const dt = Math.max((e.timeStamp - drag.t) / 1000, 1 / 240);
      drag.v = drag.v * 0.6 + (dx / dt) * 0.4;
      globe.drag(dx, e.pointerType === "touch" ? 0 : (e.clientY - drag.y) * scale);
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.t = e.timeStamp;
    };
    const onUp = () => {
      if (!drag) return;
      globe.grab(false);
      globe.fling(drag.v);
      drag = null;
    };
    if (parallax) window.addEventListener("pointermove", onHover, { passive: true });
    if (!reduced) {
      target.addEventListener("pointerdown", onDown);
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
      target.addEventListener("pointercancel", onUp);
    }

    return () => {
      resize.disconnect();
      cardSize.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onHover);
      target.removeEventListener("pointerdown", onDown);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
      globe.dispose();
    };
  }, [anchor, places, featured]);

  const member = featured[active];

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0" aria-hidden>
      <canvas ref={canvasRef} className={cn("absolute inset-0 size-full opacity-0 transition-opacity duration-1000", ready && "opacity-100")} />
      <div ref={leadRef} className="absolute left-0 top-0 opacity-0 will-change-transform">
        <span className="absolute bottom-0 left-0 h-10 w-px -translate-x-1/2 bg-linear-to-t from-gold-300/0 via-gold-300/70 to-gold-300/10" />
      </div>
      <div ref={cardRef} className="absolute left-0 top-0 opacity-0 will-change-transform">
        {member && (
          <div key={member.id} className="flex animate-fade items-center gap-2.5 rounded-xl bg-navy-950/55 py-1.5 pl-1.5 pr-3 shadow-pop ring-1 ring-inset ring-white/10 backdrop-blur-md sm:gap-3 sm:rounded-2xl sm:py-2 sm:pl-2 sm:pr-4">
            <Avatar profile={member} size="md" className="size-8 ring-1 ring-gold-300/30 sm:size-10" />
            <div className="whitespace-nowrap">
              <p className="eyebrow text-[9.5px] leading-3 text-gold-300/90">{member.country}</p>
              <p className="mt-0.5 flex items-center gap-1.5 font-serif text-sm leading-tight text-white sm:mt-1 sm:text-[15px]">
                {member.fullName} <Seal className="size-3.5" tip={false} />
              </p>
              <p className="text-[11px] text-white/55 sm:text-xs">{member.company}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
