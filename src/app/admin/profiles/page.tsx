"use client";

import { ArrowRight, Search, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/admin/console-shell";
import { ProfilesTable } from "@/components/admin/dashboard";
import { Avatar } from "@/components/profile/portrait";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Select } from "@/components/ui/primitives";
import { FILTERS, stageOf } from "@/lib/stage";
import { useApp } from "@/lib/store";
import { cn, fmtTime, normalize, relativeDay } from "@/lib/utils";

export default function ProfilesPage() {
  const profiles = useApp((s) => s.profiles);
  const upcoming = useApp((s) => s.upcoming);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("updated");
  const [owner, setOwner] = useState("all");

  const owners = useMemo(() => [...new Set(profiles.map((p) => p.projectDirector))].sort(), [profiles]);
  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.key, profiles.filter((p) => f.match(stageOf(p))).length])), [profiles]);

  const list = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    const n = normalize(q);
    return profiles
      .filter((p) => f.match(stageOf(p)))
      .filter((p) => owner === "all" || p.projectDirector === owner)
      .filter((p) => !n || normalize(`${p.fullName} ${p.company} ${p.country} ${p.designation}`).includes(n))
      .sort((a, b) =>
        sort === "interview" ? a.interviewAt.localeCompare(b.interviewAt) : sort === "name" ? a.fullName.localeCompare(b.fullName) : b.updatedAt.localeCompare(a.updatedAt),
      );
  }, [profiles, filter, q, sort, owner]);

  return (
    <>
      <title>Profiles · TRC Console</title>
      <PageHeader
        eyebrow="Pilot profiles"
        title="Profiles"
        description="Every CEO in the pilot, from draft to registered member. Click a row to review, record permission, activate or invite."
        actions={
          <Button asChild>
            <Link href="/admin/new">
              <Sparkles /> Generate profile
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium ring-1 ring-inset transition",
              filter === f.key ? "bg-navy-950 text-white ring-navy-950" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300",
            )}
          >
            {f.label}
            <span className={cn("rounded-full px-1.5 text-[11px]", filter === f.key ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500")}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-slate-100 p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name, company, market…"
              className="h-9 w-full rounded-lg bg-slate-50 pl-9 pr-3 text-sm outline-none ring-1 ring-inset ring-transparent placeholder:text-slate-400 focus:bg-white focus:ring-navy-300"
            />
          </div>
          <Select value={owner} onChange={(e) => setOwner(e.target.value)} className="h-9 sm:w-48" aria-label="Project Director">
            <option value="all">All Project Directors</option>
            {owners.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 sm:w-44" aria-label="Sort">
            <option value="updated">Recently updated</option>
            <option value="interview">Interview date</option>
            <option value="name">Name A–Z</option>
          </Select>
        </div>
        {list.length ? (
          <ProfilesTable profiles={list} />
        ) : (
          <EmptyState icon={<Users />} title="No profiles here">
            Nothing matches this filter yet.
          </EmptyState>
        )}
      </Card>

      {upcoming.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between px-5 pt-5 sm:px-6">
            <div>
              <h3 className="text-[15px] font-semibold text-navy-950">Not yet generated</h3>
              <p className="text-[13px] text-slate-500">Upcoming pilot interviews without a profile</p>
            </div>
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {upcoming.map((u) => (
              <li key={u.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar profile={{ fullName: u.fullName, useInitials: true }} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy-950">{u.fullName}</p>
                    <p className="truncate text-[12.5px] text-slate-500">
                      {u.designation} · {u.company} · {u.country}
                    </p>
                  </div>
                </div>
                <p className="text-[12.5px] text-slate-500 sm:w-48">
                  Interview {relativeDay(u.interviewAt)}, {fmtTime(u.interviewAt)}
                  <span className="block text-slate-400">{u.projectDirector}</span>
                </p>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/admin/new?upcoming=${u.id}`}>
                    Generate <ArrowRight />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
