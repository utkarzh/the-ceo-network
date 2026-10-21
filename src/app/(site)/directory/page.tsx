"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Seal } from "@/components/brand";
import { Avatar } from "@/components/profile/portrait";
import { MemberGate } from "@/components/site/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, Select } from "@/components/ui/primitives";
import { INDUSTRY_ICON } from "@/lib/data/reference";
import { useApp } from "@/lib/store";
import { useNow } from "@/lib/use-now";
import type { Profile } from "@/lib/types";
import { DAY, normalize } from "@/lib/utils";

function MemberCard({ p, now }: { p: Profile; now: number }) {
  const Icon = INDUSTRY_ICON[p.industry];
  const isNew = p.invite.registeredAt && now - new Date(p.invite.registeredAt).getTime() < 10 * DAY;
  return (
    <Link
      href={`/p/${p.slug}`}
      className="group relative flex flex-col rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200/70 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
    >
      {isNew && (
        <Badge tone="gold" className="absolute right-4 top-4">
          New
        </Badge>
      )}
      <div className="flex items-start gap-4">
        <Avatar profile={p} size="xl" className="rounded-2xl" />
        <div className="min-w-0 pr-10 pt-0.5">
          <p className="flex items-center gap-1.5 font-serif text-[1.3rem] leading-tight text-navy-950">
            <span className="truncate group-hover:underline group-hover:decoration-slate-300 group-hover:underline-offset-4">{p.fullName}</span>
            <Seal className="size-4" tip={false} />
          </p>
          <p className="mt-1 text-[13.5px] text-slate-600">{p.designation}</p>
          <p className="truncate text-[13.5px] text-slate-500">{p.company}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-[13.5px] leading-relaxed text-slate-600">{p.intro}</p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
        <Badge>{p.country}</Badge>
        <Badge icon={Icon ? <Icon /> : undefined}>{p.industry}</Badge>
      </div>
    </Link>
  );
}

export default function DirectoryPage() {
  const profiles = useApp((s) => s.profiles);
  const now = useNow();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [sort, setSort] = useState<"recent" | "name">("recent");

  const active = useMemo(() => profiles.filter((p) => p.status === "active"), [profiles]);
  const countries = useMemo(() => [...new Set(active.map((p) => p.country))].sort(), [active]);
  const industries = useMemo(() => [...new Set(active.map((p) => p.industry))].sort(), [active]);

  const list = useMemo(() => {
    const n = normalize(q);
    return active
      .filter((p) => !n || normalize(`${p.fullName} ${p.company} ${p.designation}`).includes(n))
      .filter((p) => country === "all" || p.country === country)
      .filter((p) => industry === "all" || p.industry === industry)
      .sort((a, b) => (sort === "name" ? a.fullName.localeCompare(b.fullName) : (b.activatedAt ?? "").localeCompare(a.activatedAt ?? "")));
  }, [active, q, country, industry, sort]);

  const filtered = q || country !== "all" || industry !== "all";

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <title>Member directory · CEO Network</title>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-2 text-gold-700">
            <Seal className="size-3.5" tip={false} /> Verified member directory
          </p>
          <h1 className="display mt-3 text-[2.6rem] leading-tight text-navy-950">The CEO Network</h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">
            {active.length} verified leaders across {countries.length} countries. Every profile is prepared by TRC and published with the leader&apos;s permission.
          </p>
        </div>
      </div>

      <MemberGate>
        <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200/70 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, company or title"
              className="h-10 w-full rounded-lg bg-slate-50 pl-9 pr-3 text-sm outline-none ring-1 ring-inset ring-transparent transition placeholder:text-slate-400 focus:bg-white focus:ring-navy-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <Select value={country} onChange={(e) => setCountry(e.target.value)} className="lg:w-44" aria-label="Country">
              <option value="all">All countries</option>
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select value={industry} onChange={(e) => setIndustry(e.target.value)} className="lg:w-52" aria-label="Industry">
              <option value="all">All industries</option>
              {industries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value as "recent" | "name")} className="col-span-2 sm:col-span-1 lg:w-40" aria-label="Sort">
              <option value="recent">Recently joined</option>
              <option value="name">Name A–Z</option>
            </Select>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <p className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" />
            Showing {list.length} of {active.length} members
          </p>
          {filtered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQ("");
                setCountry("all");
                setIndustry("all");
              }}
            >
              <X /> Clear filters
            </Button>
          )}
        </div>

        {list.length ? (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <MemberCard key={p.id} p={p} now={now} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<Search />} title="No members match">
            Try a different name, country or industry.
          </EmptyState>
        )}
      </MemberGate>
    </main>
  );
}
