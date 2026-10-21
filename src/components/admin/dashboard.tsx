"use client";

import { ChartNoAxesColumn, CircleCheck, Clock, Loader, Table2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/profile/portrait";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/primitives";
import type { Kpi, KpiStatus } from "@/lib/metrics";
import { MILESTONES, STAGE_META, milestoneIndex, stageOf } from "@/lib/stage";
import type { Profile } from "@/lib/types";
import { cn, fmtTime, relativeDay, timeAgo } from "@/lib/utils";

/* ------------------------------ KPI tiles ----------------------------- */

const STATUS: Record<KpiStatus, { label: string; icon: typeof CircleCheck; className: string; fill: string }> = {
  on_track: { label: "On track", icon: CircleCheck, className: "text-emerald-700", fill: "bg-navy-700" },
  below: { label: "Below target", icon: TriangleAlert, className: "text-amber-700", fill: "bg-amber-500" },
  no_data: { label: "Awaiting data", icon: Clock, className: "text-slate-500", fill: "bg-navy-700" },
  progress: { label: "In progress", icon: Loader, className: "text-navy-600", fill: "bg-gold-500" },
};

export function KpiTile({ kpi }: { kpi: Kpi }) {
  const s = STATUS[kpi.status];
  const Icon = s.icon;
  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-500">{kpi.label}</p>
        <span className={cn("inline-flex shrink-0 items-center gap-1 text-[11.5px] font-medium", s.className)}>
          <Icon className="size-3.5" />
          {s.label}
        </span>
      </div>
      <p className="mt-3 text-[1.75rem] font-semibold leading-none tracking-tight text-navy-950">{kpi.value}</p>
      <p className="mt-2 text-[12.5px] leading-snug text-slate-500">{kpi.detail}</p>
      <div className="mt-auto pt-4">
        {kpi.meter != null && (
          <div className="relative h-1.5 rounded-full bg-navy-100" role="meter" aria-valuenow={Math.round(kpi.meter * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={kpi.label}>
            <div className={cn("h-full rounded-full transition-[width] duration-700", s.fill)} style={{ width: `${Math.min(1, kpi.meter) * 100}%` }} />
            {kpi.targetAt != null && <div className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-navy-950" style={{ left: `calc(${kpi.targetAt * 100}% - 1px)` }} title="Target" />}
          </div>
        )}
        <p className="mt-2 text-[11.5px] text-slate-400">{kpi.target}</p>
      </div>
    </div>
  );
}

/* -------------------------------- Funnel ------------------------------ */

export function Funnel({ data }: { data: { label: string; value: number }[] }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const base = data[0]?.value || 1;
  const steps = data.slice(1).map((d, i) => ({ label: d.label, conv: data[i].value ? d.value / data[i].value : 0 }));
  const weakest = steps.reduce((a, b) => (b.conv < a.conv ? b : a), steps[0] ?? { label: "—", conv: 1 });
  const invited = data.find((d) => d.label === "Invitation sent")?.value ?? 0;
  const last = data[data.length - 1]?.value ?? 0;
  const summary = [
    { k: "Generated → registered", v: `${Math.round((last / base) * 100)}%` },
    { k: "Invited → registered", v: invited ? `${Math.round((last / invited) * 100)}%` : "—" },
    { k: "Weakest step", v: `${Math.round(weakest.conv * 100)}%`, sub: weakest.label },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Pilot funnel"
        description="From generated profile to registered member — the pilot's core question."
        action={
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
            {(["chart", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={v === "chart" ? "Chart view" : "Table view"}
                className={cn("rounded-md p-1.5 text-slate-500 transition", view === v && "bg-white text-navy-950 shadow-sm")}
              >
                {v === "chart" ? <ChartNoAxesColumn className="size-4 rotate-90" /> : <Table2 className="size-4" />}
              </button>
            ))}
          </div>
        }
      />
      {view === "chart" ? (
        <div className="space-y-2 px-5 pb-6 pt-5 sm:px-6">
          {data.map((d, i) => {
            const prev = i ? data[i - 1].value : null;
            const conv = prev ? Math.round((d.value / prev) * 100) : null;
            const last = i === data.length - 1;
            return (
              <div
                key={d.label}
                tabIndex={0}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="grid grid-cols-[minmax(0,9.5rem)_1fr] items-center gap-4 rounded-md outline-none sm:grid-cols-[minmax(0,12rem)_1fr]"
              >
                <span className={cn("truncate text-[13px]", hover === i ? "text-navy-950" : "text-slate-600")}>{d.label}</span>
                <div className="relative flex h-8 items-center">
                  <div
                    className={cn("h-5 rounded-r-[4px] transition-[width,filter] duration-700", last ? "bg-gold-500" : "bg-navy-700", hover === i && "brightness-125")}
                    style={{ width: `${(d.value / max) * 85}%`, minWidth: d.value ? 4 : 0 }}
                  />
                  <span className="ml-2.5 text-[13px] font-semibold text-navy-950">{d.value}</span>
                  {conv != null && <span className="ml-1.5 text-xs text-slate-400">· {conv}%</span>}
                  {hover === i && (
                    <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 rounded-lg bg-navy-950 px-3 py-2 text-xs text-white shadow-lift" style={{ left: `min(${(d.value / max) * 85}%, 60%)` }}>
                      <p className="text-sm font-semibold">{d.value} CEOs</p>
                      <p className="text-white/60">{d.label}</p>
                      {conv != null && <p className="mt-1 text-white/80">{conv}% of previous step · {Math.round((d.value / base) * 100)}% of generated</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <p className="pt-2 text-[11.5px] text-slate-400">Percentages show conversion from the previous step.</p>
        </div>
      ) : (
        <div className="px-5 pb-5 pt-3 sm:px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                <th className="py-2 font-medium">Step</th>
                <th className="py-2 text-right font-medium">CEOs</th>
                <th className="py-2 text-right font-medium">From previous</th>
                <th className="py-2 text-right font-medium">Of generated</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {data.map((d, i) => (
                <tr key={d.label} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 text-slate-700">{d.label}</td>
                  <td className="py-2.5 text-right font-medium text-navy-950">{d.value}</td>
                  <td className="py-2.5 text-right text-slate-500">{i ? `${Math.round((d.value / (data[i - 1].value || 1)) * 100)}%` : "—"}</td>
                  <td className="py-2.5 text-right text-slate-500">{Math.round((d.value / base) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <dl className="mt-auto grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
        {summary.map((x) => (
          <div key={x.k} className="px-5 py-4 sm:px-6">
            <dt className="text-[11.5px] text-slate-500">{x.k}</dt>
            <dd className="mt-1 text-xl font-semibold text-navy-950">{x.v}</dd>
            {x.sub && <dd className="truncate text-[11.5px] text-slate-400">into “{x.sub}”</dd>}
          </div>
        ))}
      </dl>
    </Card>
  );
}

/* ---------------------------- Profiles table --------------------------- */

export function MilestoneDots({ p }: { p: Profile }) {
  const reached = milestoneIndex(p);
  const stage = stageOf(p);
  return (
    <div className="flex items-center" aria-label={`Reached: ${MILESTONES[reached]}`}>
      {MILESTONES.map((m, i) => {
        const flag = i === 2 && (stage === "ask_later" || stage === "declined");
        return (
          <div key={m} className="flex items-center" title={m}>
            {i > 0 && <span className={cn("h-px w-3", i <= reached ? "bg-navy-700" : "bg-slate-200")} />}
            <span
              className={cn(
                "size-2 rounded-full",
                flag ? (stage === "declined" ? "bg-rose-500" : "bg-amber-500") : i <= reached ? (stage === "deactivated" && i === 3 ? "bg-rose-400" : "bg-navy-700") : "bg-slate-200",
                i === reached + 1 && !flag && "bg-white ring-[1.5px] ring-navy-400",
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

export function StageBadge({ p }: { p: Profile }) {
  const meta = STAGE_META[stageOf(p)];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

export function ProfilesTable({ profiles, compact }: { profiles: Profile[]; compact?: boolean }) {
  const router = useRouter();
  const md = compact ? "hidden" : "hidden md:table-cell";
  const lg = compact ? "hidden" : "hidden lg:table-cell";
  const xl = compact ? "hidden" : "hidden xl:table-cell";
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-left text-sm", compact ? "table-fixed" : "min-w-[640px]")}>
        <thead>
          <tr className="border-b border-slate-100 text-[12px] text-slate-500">
            <th className="py-3 pl-5 pr-3 font-medium sm:pl-6">CEO</th>
            <th className={cn(md, "px-3 py-3 font-medium")}>Market</th>
            <th className={cn("px-3 py-3 font-medium", compact && "w-28")}>Interview</th>
            <th className={cn("px-3 py-3 font-medium", compact && "w-48 pr-6")}>Stage</th>
            <th className={cn(lg, "px-3 py-3 font-medium")}>Progress</th>
            <th className={cn(xl, "px-3 py-3 text-right font-medium")}>Visits</th>
            <th className={cn(md, "py-3 pl-3 pr-6 font-medium")}>Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {profiles.map((p) => (
            <tr key={p.id} onClick={() => router.push(`/admin/profiles/${p.id}`)} className="group cursor-pointer transition-colors hover:bg-slate-50/80">
              <td className="py-3 pl-5 pr-3 sm:pl-6">
                <div className="flex items-center gap-3">
                  <Avatar profile={p} size="md" />
                  <div className="min-w-0">
                    <Link href={`/admin/profiles/${p.id}`} onClick={(e) => e.stopPropagation()} className="block truncate font-medium text-navy-950 group-hover:underline">
                      {p.fullName}
                    </Link>
                    <p className="truncate text-[12.5px] text-slate-500">
                      {p.designation} · {p.company}
                    </p>
                  </div>
                </div>
              </td>
              <td className={cn(md, "px-3 py-3 text-slate-600")}>{p.country}</td>
              <td className="whitespace-nowrap px-3 py-3">
                <p className="text-slate-700">{relativeDay(p.interviewAt)}</p>
                <p className="text-[12px] text-slate-400">{fmtTime(p.interviewAt)}</p>
              </td>
              <td className={cn("px-3 py-3", compact && "pr-6")}>
                <StageBadge p={p} />
              </td>
              <td className={cn(lg, "px-3 py-3")}>
                <MilestoneDots p={p} />
              </td>
              <td className={cn(xl, "px-3 py-3 text-right tabular-nums text-slate-600")}>{p.visits}</td>
              <td className={cn(md, "whitespace-nowrap py-3 pl-3 pr-6 text-[12.5px] text-slate-500")}>{timeAgo(p.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
