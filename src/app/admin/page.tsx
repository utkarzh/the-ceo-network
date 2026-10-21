"use client";

import { ArrowRight, CalendarClock, Presentation, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { PageHeader } from "@/components/admin/console-shell";
import { Funnel, KpiTile, ProfilesTable, StageBadge } from "@/components/admin/dashboard";
import { Avatar, Portrait } from "@/components/profile/portrait";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/primitives";
import { CURRENT_USER } from "@/lib/data/reference";
import { PILOT_TARGET, computeMetrics } from "@/lib/metrics";
import { STAGE_META, type Tone, stageOf } from "@/lib/stage";
import { useApp } from "@/lib/store";
import { useNow } from "@/lib/use-now";
import type { Profile, UpcomingInterview } from "@/lib/types";
import { DAY, HOUR, cn, firstName, fmtTime, formatHours, hoursBetween, relativeDay, timeAgo, timeUntil } from "@/lib/utils";

interface Attention {
  key: string;
  who: Pick<Profile, "fullName" | "photo" | "useInitials">;
  title: string;
  meta: string;
  tone: Tone;
  href: string;
  cta: string;
  rank: number;
}

function attention(profiles: Profile[], upcoming: UpcomingInterview[], policy: "verbal" | "consent", nowMs: number): Attention[] {
  const now = new Date(nowMs).toISOString();
  const out: Attention[] = [];
  for (const p of profiles) {
    const s = stageOf(p);
    const href = `/admin/profiles/${p.id}`;
    const conflicts = p.conflicts.filter((c) => !c.resolved).length;
    if (s === "draft")
      out.push({
        key: p.id,
        who: p,
        href,
        cta: "Review",
        tone: conflicts ? "amber" : "slate",
        title: conflicts ? `${conflicts} source conflict${conflicts > 1 ? "s" : ""} to review` : "Draft ready for your review",
        meta: `Interview ${relativeDay(p.interviewAt).toLowerCase()}, ${fmtTime(p.interviewAt)}`,
        rank: 2,
      });
    if (s === "approved") {
      const h = hoursBetween(p.permission.at, now) ?? 0;
      out.push({
        key: p.id,
        who: p,
        href,
        cta: policy === "verbal" ? "Activate" : "Invite",
        tone: h > 6 ? "rose" : "amber",
        title: policy === "verbal" ? "Permission recorded — activate and invite" : "Permission recorded — send for consent",
        meta: `${formatHours(h)} since permission · invitation target 6 h`,
        rank: h > 6 ? 0 : 1,
      });
    }
    if (s === "active")
      out.push({ key: p.id, who: p, href, cta: "Invite", tone: "amber", title: "Activated — invitation not sent", meta: `Activated ${timeAgo(p.activatedAt)}`, rank: 1 });
    if (s === "ask_later")
      out.push({ key: p.id, who: p, href, cta: "Follow up", tone: "amber", title: "Asked to decide later", meta: `Recorded ${timeAgo(p.permission.at)}${p.permission.note ? ` · “${p.permission.note}”` : ""}`, rank: 3 });
    if ((s === "opened" || s === "invited") && p.invite.reminderSentAt)
      out.push({ key: p.id, who: p, href, cta: "Open", tone: "violet", title: "Reminder sent — not yet registered", meta: "Any further follow-up is your call", rank: 4 });
  }
  for (const u of upcoming) {
    const until = new Date(u.interviewAt).getTime() - nowMs;
    if (until < 7 * DAY)
      out.push({
        key: u.id,
        who: { fullName: u.fullName, useInitials: true },
        href: `/admin/new?upcoming=${u.id}`,
        cta: "Generate",
        tone: until < 3 * DAY ? "amber" : "sky",
        title: "No profile yet",
        meta: `Interview ${timeUntil(u.interviewAt)} · ${u.company}`,
        rank: until < 3 * DAY ? 1 : 3,
      });
  }
  return out.sort((a, b) => a.rank - b.rank);
}

const TONE_BAR: Record<Tone, string> = {
  slate: "bg-slate-300",
  navy: "bg-navy-600",
  gold: "bg-gold-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

export default function Overview() {
  const profiles = useApp((s) => s.profiles);
  const upcoming = useApp((s) => s.upcoming);
  const policy = useApp((s) => s.settings.activationPolicy);
  const now = useNow();
  const m = useMemo(() => computeMetrics(profiles, upcoming), [profiles, upcoming]);
  const items = useMemo(() => attention(profiles, upcoming, policy, now), [profiles, upcoming, policy, now]);

  const schedule = useMemo(() => {
    const rows = [
      ...profiles.filter((p) => new Date(p.interviewAt).getTime() > now - 2 * HOUR).map((p) => ({ kind: "profile" as const, at: p.interviewAt, p })),
      ...upcoming.map((u) => ({ kind: "upcoming" as const, at: u.interviewAt, u })),
    ];
    return rows.sort((a, b) => a.at.localeCompare(b.at));
  }, [profiles, upcoming, now]);

  const next = schedule.find((r) => r.kind === "profile" && new Date(r.at).getTime() > now);
  const nextProfile = next?.kind === "profile" ? next.p : undefined;
  const recent = useMemo(() => [...profiles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6), [profiles]);
  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <title>Overview · TRC Console</title>
      <PageHeader
        eyebrow={`Pilot · ${PILOT_TARGET} upcoming interviews`}
        title={`${greeting}, ${firstName(CURRENT_USER.name)}`}
        description="Testing whether CEOs register after TRC publishes a basic profile with their permission — with minimal manual work."
        actions={
          <Button asChild size="lg">
            <Link href="/admin/new">
              <Sparkles /> Generate profile
            </Link>
          </Button>
        }
      />

      {nextProfile && (
        <div className="mb-8 overflow-hidden rounded-2xl bg-navy-950 text-white shadow-lift">
          <div className="grain relative grid grid-cols-1 gap-6 p-6 sm:p-7 md:grid-cols-[auto_1fr_auto] md:items-center">
            <Portrait profile={nextProfile} className="hidden size-24 rounded-xl md:block" sizes="96px" />
            <div className="min-w-0">
              <p className="eyebrow flex items-center gap-2 text-gold-300">
                <CalendarClock className="size-3.5" /> Next interview · {relativeDay(nextProfile.interviewAt)} {fmtTime(nextProfile.interviewAt)} · {timeUntil(nextProfile.interviewAt)}
              </p>
              <p className="display mt-2 text-[1.9rem] leading-tight">{nextProfile.fullName}</p>
              <p className="text-sm text-white/60">
                {nextProfile.designation}, {nextProfile.company} · {nextProfile.country}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-white/70">
                <StageBadge p={nextProfile} />
                <span>
                  {stageOf(nextProfile) === "draft" || stageOf(nextProfile) === "ready"
                    ? "Introduce the CEO Network briefly within the full offer, then ask for permission at the end."
                    : `${STAGE_META[stageOf(nextProfile)].hint}.`}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:flex-col">
              <Button asChild variant="gold">
                <Link href={`/present/${nextProfile.id}`}>
                  <Presentation /> Presentation mock-up
                </Link>
              </Button>
              <Button asChild variant="ghost-inverse" className="ring-1 ring-inset ring-white/20">
                <Link href={`/admin/profiles/${nextProfile.id}`}>
                  Open profile <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <section aria-label="Pilot targets" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {m.kpis.map((k) => (
          <KpiTile key={k.key} kpi={k} />
        ))}
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Funnel data={m.funnel} />
        <Card>
          <CardHeader title="Needs your attention" description={`${items.length} item${items.length === 1 ? "" : "s"} across the pilot`} />
          <ul className="mt-3 divide-y divide-slate-100 pb-2">
            {items.slice(0, 7).map((it) => (
              <li key={`${it.key}-${it.title}`}>
                <Link href={it.href} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 sm:px-6">
                  <span className={cn("h-9 w-1 shrink-0 rounded-full", TONE_BAR[it.tone])} />
                  <Avatar profile={it.who} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-950">
                      {it.who.fullName} <span className="font-normal text-slate-500">· {it.title}</span>
                    </p>
                    <p className="truncate text-[12.5px] text-slate-500">{it.meta}</p>
                  </div>
                  <span className="shrink-0 text-[13px] font-medium text-link group-hover:underline">{it.cta}</span>
                </Link>
              </li>
            ))}
            {!items.length && <li className="px-6 py-8 text-center text-sm text-slate-500">Nothing needs attention. Nice.</li>}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card>
          <CardHeader title="Interview schedule" description="Upcoming interviews and their profile status" />
          <ul className="mt-3 space-y-1 px-3 pb-4">
            {schedule.slice(0, 7).map((r) => {
              const d = new Date(r.at);
              const name = r.kind === "profile" ? r.p.fullName : r.u.fullName;
              const company = r.kind === "profile" ? r.p.company : r.u.company;
              const href = r.kind === "profile" ? `/admin/profiles/${r.p.id}` : `/admin/new?upcoming=${r.u.id}`;
              return (
                <li key={r.kind === "profile" ? r.p.id : r.u.id}>
                  <Link href={href} className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50">
                    <div className="w-12 shrink-0 rounded-lg bg-slate-50 py-1.5 text-center ring-1 ring-inset ring-slate-200/80">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{d.toLocaleDateString("en-GB", { month: "short" })}</p>
                      <p className="text-lg font-semibold leading-tight text-navy-950">{d.getDate()}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy-950">{name}</p>
                      <p className="truncate text-[12.5px] text-slate-500">
                        {company} · {fmtTime(r.at)}
                      </p>
                    </div>
                    {r.kind === "profile" ? (
                      <StageBadge p={r.p} />
                    ) : (
                      <Badge tone="sky" icon={<Sparkles />}>
                        Generate
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader
            title="Recently updated"
            description="Latest activity across pilot profiles"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/profiles">
                  All profiles <ArrowRight />
                </Link>
              </Button>
            }
          />
          <div className="mt-3">
            <ProfilesTable profiles={recent} compact />
          </div>
        </Card>
      </div>
    </>
  );
}
