"use client";

import { ArrowRight, BookOpenText, Eye, Lock, MessageSquare, Newspaper, ShieldCheck, Sparkles, UserCheck, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Seal } from "@/components/brand";
import { Avatar, Portrait } from "@/components/profile/portrait";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/overlay";
import { useApp } from "@/lib/store";

// three.js is heavy and browser-only, so the hero art loads after the page is interactive.
const HeroGlobe = dynamic(() => import("@/components/site/globe/hero-globe"), { ssr: false });

const STEPS = [
  {
    n: "01",
    title: "Interviewed by TRC",
    body: "Leaders featured in TRC's country and industry reports are invited to join after their interview — there is no application process.",
  },
  {
    n: "02",
    title: "Your profile, prepared for you",
    body: "TRC prepares a professional profile from its own reporting and verified sources. Nothing to fill in, and you can request changes at any time.",
  },
  {
    n: "03",
    title: "You approve, then join",
    body: "Your profile goes live only with your permission. Sign in with Google or a verified email address and accept the privacy terms — it takes a minute.",
  },
];

const PRINCIPLES = [
  { icon: ShieldCheck, title: "Verified, not self-declared", body: "Every member has been interviewed by TRC. Titles and company facts are checked against TRC's records before publication." },
  { icon: UserCheck, title: "Published with permission", body: "Nothing goes live without the leader's explicit consent, and any profile can be paused or removed on request." },
  { icon: Lock, title: "Private to members", body: "Profiles are visible only to verified members of the network — not to search engines or the public." },
  { icon: BookOpenText, title: "Grounded in TRC journalism", body: "Each profile links to the leader's interviews, articles and reports from TRC's archive." },
];

const FUTURE = [
  { icon: Newspaper, title: "Member feed", body: "Updates and perspectives shared between members." },
  { icon: MessageSquare, title: "Direct messages", body: "Private introductions between verified leaders." },
  { icon: Users, title: "Peer groups", body: "Closed circles by sector, region and theme." },
];

export default function Home() {
  const profiles = useApp((s) => s.profiles);
  const persona = useApp((s) => s.persona);
  const setPersona = useApp((s) => s.setPersona);
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const globeAnchor = useRef<HTMLDivElement>(null);

  const active = useMemo(() => profiles.filter((p) => p.status === "active"), [profiles]);
  const featured = useMemo(
    () => [...active].filter((p) => p.photo && !p.useInitials).sort((a, b) => (b.invite.registeredAt ?? "").localeCompare(a.invite.registeredAt ?? "")),
    [active],
  );
  const countries = new Set(active.map((p) => p.country)).size;
  const industries = new Set(active.map((p) => p.industry)).size;
  const demoInvite = profiles.find((p) => p.invite.status === "sent" || p.invite.status === "opened");

  return (
    <main>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <HeroGlobe anchor={globeAnchor} members={active} />
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -left-48 -top-48 size-[760px] rounded-full bg-[radial-gradient(closest-side,rgb(60_79_120/0.32),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-2 px-4 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pt-2">
          <div className="lg:py-16">
            <p className="eyebrow flex animate-rise items-center gap-2 text-gold-300">
              <Seal className="size-4" tip={false} /> By invitation · Verified by TRC
            </p>
            <h1 className="display mt-6 animate-rise text-[2.75rem] leading-[1.02] text-balance [animation-delay:80ms] sm:text-6xl lg:text-[4.4rem]">
              The private network for the leaders{" "}
              <em className="box-decoration-clone bg-linear-to-r from-gold-200 via-gold-300 to-gold-400 bg-clip-text pr-1 text-transparent">shaping their economies.</em>
            </h1>
            <p className="mt-7 max-w-xl animate-rise text-[17px] leading-relaxed text-white/70 [animation-delay:160ms]">
              CEO Network brings together the chief executives and business leaders featured in TRC reports, in a verified directory where every profile is
              prepared by TRC and published only with the leader&apos;s permission.
            </p>
            <div className="mt-9 flex animate-rise flex-wrap gap-3 [animation-delay:240ms]">
              <Button asChild size="lg" variant="gold">
                <Link href="/directory">
                  Explore the directory <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="ghost-inverse" className="ring-1 ring-inset ring-white/20" onClick={() => setInviteOpen(true)}>
                I have an invitation
              </Button>
            </div>
          </div>

          {/* The globe is drawn behind the whole hero; this box only decides where it sits, and takes drags. */}
          <div
            ref={globeAnchor}
            aria-hidden
            className="aspect-square w-[min(112%,32rem)] touch-pan-y justify-self-center select-none motion-safe:cursor-grab motion-safe:active:cursor-grabbing lg:-my-10 lg:w-[112%] lg:max-w-none lg:justify-self-start"
          />
        </div>
        <div className="relative border-t border-white/10 bg-navy-950/40 backdrop-blur-[2px]">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-white/10 px-4 sm:px-6 md:grid-cols-4 md:divide-x lg:px-8">
            {[
              { k: "Verified leaders", v: active.length },
              { k: "Countries", v: countries },
              { k: "Industries", v: industries },
              { k: "Published with permission", v: "100%" },
            ].map((s) => (
              <div key={s.k} className="py-6 md:px-8 md:first:pl-0">
                <dt className="text-xs text-white/50">{s.k}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
        <div id="how" className="max-w-2xl scroll-mt-24">
          <p className="eyebrow text-gold-700">How membership works</p>
          <h2 className="display mt-3 text-4xl leading-tight text-navy-950 text-balance">An extension of your TRC interview — not another sign-up.</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-2xl bg-white p-7 shadow-card ring-1 ring-slate-200/70">
              <p className="display text-5xl text-gold-400/80">{s.n}</p>
              <h3 className="mt-5 text-lg font-semibold text-navy-950">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently joined */}
      <section className="border-y border-slate-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-gold-700">Founding members</p>
              <h2 className="display mt-3 text-4xl text-navy-950">Recently joined</h2>
            </div>
            <Button asChild variant="secondary">
              <Link href="/directory">
                View the directory <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/p/${p.slug}`} className="group">
                <Portrait profile={p} className="aspect-[4/5] w-full rounded-2xl" sizes="(min-width: 1024px) 300px, 50vw" />
                <p className="mt-4 flex items-center gap-1.5 font-serif text-xl text-navy-950 group-hover:underline">
                  {p.fullName} <Seal className="size-4" tip={false} />
                </p>
                <p className="text-sm text-slate-500">
                  {p.designation}, {p.company}
                </p>
                <p className="mt-1 text-xs text-slate-400">{p.country}</p>
              </Link>
            ))}
          </div>
          {persona === "guest" && (
            <p className="mt-8 flex items-center gap-2 text-sm text-slate-500">
              <Eye className="size-4" /> Full profiles are visible to verified members only.
            </p>
          )}
        </div>
      </section>

      {/* Principles */}
      <section id="principles" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow text-gold-700">Our principles</p>
            <h2 className="display mt-3 text-4xl leading-tight text-navy-950 text-balance">Built on trust, because that is what TRC&apos;s relationships are built on.</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <div className="grid size-11 place-items-center rounded-xl bg-navy-950 text-gold-300">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-[17px] font-semibold text-navy-950">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming next */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-12">
          <div className="grain absolute inset-0" />
          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow flex items-center gap-2 text-gold-300">
                <Sparkles className="size-3.5" /> Coming next
              </p>
              <h2 className="display mt-3 text-4xl leading-tight text-balance">A directory first. Conversations next.</h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
                The first release is a verified directory. Social features follow once the founding members are in — you can preview them today.
              </p>
              <Button
                variant="inverse"
                className="mt-7"
                onClick={() => {
                  if (persona === "guest") setPersona("member");
                  router.push("/feed");
                }}
              >
                Preview the social features <ArrowRight />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FUTURE.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-inset ring-white/10">
                  <Icon className="size-5 text-gold-300" />
                  <p className="mt-4 font-medium">{title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/55">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        size="sm"
        title="Open your invitation"
        description="Your invitation email from TRC contains a personal link to your prepared profile. Open that link to review it and complete your registration."
        footer={
          demoInvite && (
            <Button
              onClick={() => {
                setPersona("guest");
                setInviteOpen(false);
                router.push(`/p/${demoInvite.slug}?invite=${demoInvite.invite.token}`);
              }}
            >
              Open a demo invitation <ArrowRight />
            </Button>
          )
        }
      >
        {demoInvite && (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
            <Avatar profile={demoInvite} size="lg" />
            <div className="min-w-0 text-sm">
              <p className="font-medium text-navy-950">{demoInvite.fullName}</p>
              <p className="truncate text-slate-500">
                Invited {demoInvite.invite.sentAt ? new Date(demoInvite.invite.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""} · {demoInvite.company}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
