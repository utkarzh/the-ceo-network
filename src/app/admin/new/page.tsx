"use client";

import {
  ArrowRight,
  Check,
  CircleDashed,
  Database,
  FileUser,
  Gauge,
  Info,
  Link2,
  Newspaper,
  PenLine,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/admin/console-shell";
import { Portrait } from "@/components/profile/portrait";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, Field, Input, Select } from "@/components/ui/primitives";
import { COUNTRIES, PROJECT_DIRECTORS } from "@/lib/data/reference";
import { generateProfile, sameName } from "@/lib/engine";
import { useApp } from "@/lib/store";
import type { PipelineStep, Profile, StepKey, UpcomingInterview } from "@/lib/types";
import { SITE_HOST, cn, wordCount } from "@/lib/utils";

const STEP_META: Record<StepKey, { icon: LucideIcon; title: string; running: string }> = {
  base: { icon: FileUser, title: "Create base record", running: "Creating the CEO record from your entry…" },
  hubspot: { icon: Database, title: "Check HubSpot", running: "Searching HubSpot contacts and companies…" },
  trc: { icon: Newspaper, title: "Search TRC past reports", running: "Searching 4,812 indexed reports, articles and profiles…" },
  completeness: { icon: Gauge, title: "Check information completeness", running: "Checking whether the information is sufficient…" },
  gemini: { icon: WandSparkles, title: "Run Gemini research (if needed)", running: "Researching official sources with Gemini…" },
  draft: { icon: PenLine, title: "Write the draft profile", running: "Writing the introduction and filling profile fields…" },
  url: { icon: Link2, title: "Create the unique profile URL", running: "Reserving the permanent profile URL…" },
};
const ORDER: StepKey[] = ["base", "hubspot", "trc", "completeness", "gemini", "draft", "url"];

const EXTRA_EXAMPLE = {
  id: "ex_yusuf",
  fullName: "Yusuf Demir",
  designation: "Chief Executive Officer",
  company: "Anatolia Smart Cities",
  country: "Türkiye",
  scenario: "Not found in any source — gaps are flagged, not guessed",
};

type Form = { fullName: string; designation: string; company: string; country: string; interviewAt: string; report: string; projectDirector: string };
const EMPTY: Form = { fullName: "", designation: "", company: "", country: "", interviewAt: "", report: "", projectDirector: "Sarah Whitfield" };

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function StepRow({ step, meta, state, last }: { step?: PipelineStep; meta: (typeof STEP_META)[StepKey]; state: "idle" | "pending" | "running" | "complete"; last: boolean }) {
  const Icon = meta.icon;
  const status = state === "complete" ? step?.status : undefined;
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!last && <span className={cn("absolute left-[17px] top-10 h-[calc(100%-2.5rem)] w-px", state === "complete" ? "bg-navy-200" : "bg-slate-200")} />}
      <div
        className={cn(
          "relative grid size-9 shrink-0 place-items-center rounded-full ring-1 ring-inset transition-colors duration-300",
          state === "idle" && "bg-white text-slate-400 ring-slate-200",
          state === "pending" && "bg-white text-slate-300 ring-slate-200",
          state === "running" && "bg-navy-950 text-gold-300 ring-navy-950",
          status === "done" && "bg-emerald-50 text-emerald-700 ring-emerald-200",
          status === "warning" && "bg-amber-50 text-amber-700 ring-amber-200",
          status === "skipped" && "border border-dashed border-slate-300 bg-slate-50 text-slate-400 ring-0",
        )}
      >
        {state === "running" && <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold-400" />}
        {status === "done" ? <Check className="size-4" /> : status === "warning" ? <TriangleAlert className="size-4" /> : status === "skipped" ? <CircleDashed className="size-4" /> : <Icon className="size-4" />}
      </div>
      <div className="min-w-0 flex-1 pt-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className={cn("text-sm font-medium", state === "pending" || state === "idle" ? "text-slate-400" : "text-navy-950")}>{step?.title ?? meta.title}</p>
          {state === "complete" && step && <span className="shrink-0 text-[11.5px] tabular-nums text-slate-400">{status === "skipped" ? "skipped" : `${(step.ms / 1000).toFixed(1)} s`}</span>}
        </div>
        {state === "running" && (
          <div className="mt-1.5">
            <p className="text-[13px] text-slate-500">{meta.running}</p>
            <div className="skeleton mt-2 h-1.5 w-2/3 rounded-full" />
          </div>
        )}
        {state === "complete" && step && (
          <div className="animate-fade">
            <p className={cn("mt-1 text-[13px]", status === "warning" ? "text-amber-800" : status === "skipped" ? "text-slate-500" : "text-slate-700")}>{step.summary}</p>
            {step.details.length > 0 && (
              <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 px-3 py-2.5 text-[12px] leading-relaxed text-slate-500 ring-1 ring-inset ring-slate-200/70">
                {step.details.map((d) => (
                  <li key={d} className="truncate" title={d}>
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export default function GeneratePage() {
  const search = useSearchParams();
  const router = useRouter();
  const upcoming = useApp((s) => s.upcoming);
  const profiles = useApp((s) => s.profiles);
  const addProfile = useApp((s) => s.addProfile);

  const [form, setForm] = useState<Form>(EMPTY);
  const [upcomingId, setUpcomingId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"form" | "running" | "done">("form");
  const [run, setRun] = useState<{ steps: PipelineStep[]; profile: Profile } | null>(null);
  const [active, setActive] = useState(0);
  const [showOptional, setShowOptional] = useState(false);
  const saved = useRef<string | null>(null);

  const fill = (u: Pick<UpcomingInterview, "fullName" | "designation" | "company" | "country"> & Partial<UpcomingInterview>, id: string | null) => {
    setForm({
      fullName: u.fullName,
      designation: u.designation,
      company: u.company,
      country: u.country,
      interviewAt: u.interviewAt ? toLocalInput(u.interviewAt) : "",
      report: u.report ?? "",
      projectDirector: u.projectDirector ?? "Sarah Whitfield",
    });
    setUpcomingId(id);
    if (u.interviewAt) setShowOptional(true);
  };

  // Prefill from ?upcoming= — adjusted during render when the param changes
  // (the page stays mounted between visits, so this runs on every new link).
  const param = search.get("upcoming");
  const [seenParam, setSeenParam] = useState<string | null>(null);
  if (param !== seenParam) {
    setSeenParam(param);
    const u = param ? upcoming.find((x) => x.id === param) : undefined;
    if (u) {
      setPhase("form");
      setRun(null);
      fill(u, u.id);
    }
  }

  // Step through the precomputed pipeline so each stage is visible.
  useEffect(() => {
    if (phase !== "running" || !run) return;
    const t = setTimeout(() => {
      if (active + 1 < run.steps.length) return setActive(active + 1);
      if (saved.current !== run.profile.id) {
        saved.current = run.profile.id;
        addProfile(run.profile, upcomingId ?? undefined);
      }
      setActive(run.steps.length);
      setPhase("done");
    }, run.steps[active].ms);
    return () => clearTimeout(t);
  }, [phase, active, run, addProfile, upcomingId]);

  const required = [form.fullName, form.designation, form.company, form.country].map((v) => v.trim().length > 0);
  const filled = required.filter(Boolean).length;
  const valid = filled === 4;
  const duplicate = useMemo(() => (form.fullName.trim().length > 3 ? profiles.find((p) => sameName(p.fullName, form.fullName)) : undefined), [profiles, form.fullName]);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const generate = () => {
    const result = generateProfile({
      fullName: form.fullName,
      designation: form.designation,
      company: form.company,
      country: form.country,
      interviewAt: form.interviewAt ? new Date(form.interviewAt).toISOString() : undefined,
      report: form.report || undefined,
      projectDirector: form.projectDirector,
    });
    setRun(result);
    setActive(0);
    setPhase("running");
  };

  const resetState = () => {
    setPhase("form");
    setRun(null);
    setActive(0);
    setForm(EMPTY);
    setUpcomingId(null);
  };
  const restart = () => {
    resetState();
    if (param) router.replace("/admin/new");
  };

  const totalMs = run?.steps.reduce((s, x) => s + x.ms, 0) ?? 0;
  const p = run?.profile;
  const examples = [...upcoming.map((u) => ({ ...u })), EXTRA_EXAMPLE];
  const locked = phase !== "form";

  return (
    <>
      <title>Generate profile · TRC Console</title>
      <PageHeader
        eyebrow="Profile generator"
        title="Generate a CEO profile"
        description="Enter four details. The system checks HubSpot and TRC's past reports, runs Gemini research only when needed, and drafts the profile with an inactive URL."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-navy-950">Interviewee details</h2>
              <span className={cn("text-xs font-medium", valid ? "text-emerald-700" : "text-slate-400")}>{filled} of 4 required</span>
            </div>
            <div className="mt-5 space-y-4">
              <Field label="Full name" required htmlFor="fullName">
                <Input id="fullName" value={form.fullName} onChange={set("fullName")} placeholder="e.g. Alex Morgan" disabled={locked} autoComplete="off" />
              </Field>
              {duplicate && !locked && (
                <p className="-mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                  <Info className="size-3.5" /> A profile for {duplicate.fullName} already exists.{" "}
                  <Link href={`/admin/profiles/${duplicate.id}`} className="font-medium underline">
                    Open it
                  </Link>
                </p>
              )}
              <Field label="Designation" required htmlFor="designation">
                <Input id="designation" value={form.designation} onChange={set("designation")} placeholder="e.g. Chief Executive Officer" disabled={locked} />
              </Field>
              <Field label="Company or organisation" required htmlFor="company">
                <Input id="company" value={form.company} onChange={set("company")} placeholder="e.g. Northstar Technologies" disabled={locked} />
              </Field>
              <Field label="Country" required htmlFor="country">
                <Input id="country" list="country-list" value={form.country} onChange={set("country")} placeholder="Start typing a country" disabled={locked} autoComplete="off" />
                <datalist id="country-list">
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>

              <button type="button" onClick={() => setShowOptional((v) => !v)} className="text-[13px] font-medium text-slate-500 hover:text-navy-900">
                {showOptional ? "− Hide" : "+ Add"} pilot tracking details (optional)
              </button>
              {showOptional && (
                <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/80 sm:grid-cols-2">
                  <Field label="Interview date and time">
                    <Input type="datetime-local" value={form.interviewAt} onChange={set("interviewAt")} disabled={locked} />
                  </Field>
                  <Field label="Project Director">
                    <Select value={form.projectDirector} onChange={set("projectDirector")} disabled={locked}>
                      {PROJECT_DIRECTORS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Report" className="sm:col-span-2">
                    <Input value={form.report} onChange={set("report")} placeholder="e.g. Philippines: Powering Growth 2026" disabled={locked} />
                  </Field>
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center gap-3">
              {phase === "form" ? (
                <Button size="lg" className="flex-1" disabled={!valid} onClick={generate}>
                  <Sparkles /> Generate Profile
                </Button>
              ) : (
                <Button size="lg" variant="secondary" className="flex-1" onClick={restart} disabled={phase === "running"}>
                  <RotateCcw /> Generate another
                </Button>
              )}
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">No HubSpot record is required to begin.</p>
          </Card>

          {phase === "form" && (
            <Card className="p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold text-navy-950">Upcoming pilot interviews</h2>
              <p className="mt-0.5 text-[13px] text-slate-500">Fill the form from the interview schedule — each one exercises a different path.</p>
              <ul className="mt-4 space-y-2">
                {examples.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => fill(u, "interviewAt" in u ? u.id : null)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl p-3 text-left ring-1 ring-inset transition",
                        form.fullName === u.fullName ? "bg-navy-50/70 ring-navy-300" : "ring-slate-200 hover:bg-slate-50 hover:ring-slate-300",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-navy-950">
                          {u.fullName} <span className="font-normal text-slate-500">· {u.company}</span>
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">{u.scenario}</p>
                      </div>
                      <span className="mt-0.5 shrink-0 text-xs text-slate-400">{u.country}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <Card className="overflow-hidden lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-[15px] font-semibold text-navy-950">Generation pipeline</h2>
              <p className="text-[13px] text-slate-500">
                {phase === "form" && "Waiting for the four required fields."}
                {phase === "running" && run && `Running · step ${Math.min(active + 1, run.steps.length)} of ${run.steps.length}`}
                {phase === "done" && `Completed in ${(totalMs / 1000).toFixed(1)} s · nothing assumed, conflicts flagged`}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="slate">HubSpot</Badge>
              <Badge tone="slate">TRC reports</Badge>
              <Badge tone="gold">Gemini · conditional</Badge>
            </div>
          </div>
          <ol className="px-5 py-6 sm:px-6">
            {ORDER.map((key, i) => {
              const step = run?.steps[i];
              const state = phase === "form" ? "idle" : i < active ? "complete" : i === active && phase === "running" ? "running" : phase === "done" ? "complete" : "pending";
              return <StepRow key={key} step={step} meta={STEP_META[key]} state={state} last={i === ORDER.length - 1} />;
            })}
          </ol>

          {phase === "done" && p && (
            <div className="animate-rise border-t border-slate-100 bg-gradient-to-b from-gold-50/60 to-white px-5 py-6 sm:px-6">
              <div className="flex gap-4">
                <Portrait profile={p} className="h-24 w-20 shrink-0 rounded-xl" sizes="80px" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="display text-2xl text-navy-950">{p.fullName}</p>
                    <Badge tone="slate" dot>
                      Draft
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {p.designation} · {p.company}
                  </p>
                  <p className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate rounded-md bg-white px-2 py-1 text-[12px] text-slate-500 ring-1 ring-inset ring-slate-200">
                    <Link2 className="size-3.5 shrink-0" /> {SITE_HOST}/p/{p.slug} · inactive
                  </p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { k: "Completeness", v: `${p.completeness}%` },
                  { k: "Introduction", v: `${wordCount(p.intro)} words` },
                  { k: "To review", v: `${p.conflicts.length + p.links.length} items` },
                ].map((x) => (
                  <div key={x.k} className="rounded-xl bg-white py-3 ring-1 ring-inset ring-slate-200/80">
                    <dd className="text-lg font-semibold text-navy-950">{x.v}</dd>
                    <dt className="text-[11.5px] text-slate-500">{x.k}</dt>
                  </div>
                ))}
              </dl>
              {p.missing.length > 0 && (
                <p className="mt-4 flex items-start gap-2 text-[12.5px] text-amber-800">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0" /> Flagged for review: {p.missing.join(" · ")}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  size="lg"
                  onClick={() => {
                    router.push(`/admin/profiles/${p.id}`);
                    setTimeout(resetState, 600);
                  }}
                >
                  Open review workspace <ArrowRight />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
