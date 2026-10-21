"use client";

import { ArrowRight, Briefcase, Eye, Globe, Lock, MapPin, Quote } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, Seal } from "@/components/brand";
import { Avatar, Cover, Portrait } from "@/components/profile/portrait";
import { Badge } from "@/components/ui/badge";
import { INDUSTRY_ICON } from "@/lib/data/reference";
import type { Profile, TrcItem } from "@/lib/types";
import { cn, fmtDate } from "@/lib/utils";

const TYPE_LABEL: Record<TrcItem["type"], string> = {
  article: "Article",
  profile: "Leadership profile",
  report: "Special report",
  interview: "Interview",
};

function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="display text-[1.55rem] leading-tight text-navy-950">{title}</h2>
      {action}
    </div>
  );
}

function ViewAll({ href, children }: { href: string; children: ReactNode }) {
  return (
    <ExternalLink href={href} className="group inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-link">
      {children}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </ExternalLink>
  );
}

function FactTile({ icon: Icon, label, value, sub }: { icon: typeof Briefcase; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl bg-slate-50/80 px-4 py-3.5 ring-1 ring-inset ring-slate-200/70">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-navy-800 shadow-card ring-1 ring-slate-200/60">
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="truncate text-[15px] font-medium text-navy-950">{value}</dd>
        {sub && <dd className="truncate text-[13px] text-slate-500">{sub}</dd>}
      </div>
    </div>
  );
}

function ArticleCard({ item }: { item: TrcItem }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 transition-shadow hover:shadow-lift">
      <Cover src={item.image} alt="" className="aspect-[16/9]" sizes="(min-width: 1280px) 380px, (min-width: 768px) 45vw, 100vw" />
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow text-slate-400">
          {TYPE_LABEL[item.type]} · {fmtDate(item.date, { month: "short", year: "numeric" })}
        </p>
        <h3 className="display mt-2 text-[1.3rem] leading-snug text-navy-950">{item.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{item.excerpt}</p>
        <ExternalLink href={item.url} className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-medium text-link">
          {item.type === "profile" ? "Read profile" : "Read article"}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </ExternalLink>
      </div>
    </div>
  );
}

function ReportCard({ item, highlight }: { item: TrcItem; highlight?: string }) {
  return (
    <div className="group grid grid-cols-1 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 transition-shadow hover:shadow-lift @xl:grid-cols-[14rem_1fr]">
      <Cover src={item.image} alt="" className="aspect-[16/9] @xl:aspect-auto @xl:min-h-40" sizes="(min-width: 768px) 260px, 100vw" />
      <div className="p-5">
        <Badge tone={highlight ? "gold" : "slate"}>{highlight ?? TYPE_LABEL[item.type]}</Badge>
        <h3 className="display mt-2.5 text-[1.3rem] leading-snug text-navy-950">{item.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.excerpt}</p>
        <ExternalLink href={item.url} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-link">
          {item.type === "report" ? "Read report" : "Read interview"}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </ExternalLink>
      </div>
    </div>
  );
}

export interface ProfileViewProps {
  profile: Profile;
  /** member = the live page · preview = CEO or staff preview with live-state chips */
  mode?: "member" | "preview";
  actions?: ReactNode;
  related?: Profile[];
  showAside?: boolean;
  className?: string;
}

export function ProfileView({ profile: p, mode = "member", actions, related = [], showAside = true, className }: ProfileViewProps) {
  const confirmed = p.links.filter((l) => l.status === "confirmed").map((l) => l.item);
  const articles = confirmed.filter((i) => i.type !== "report");
  const reports = confirmed.filter((i) => i.type === "report");
  const live = p.status === "active";
  const IndustryIcon = INDUSTRY_ICON[p.industry] ?? Briefcase;
  const facts = p.facts.filter((f) => f.value.trim());

  return (
    <article className={cn("@container", className)}>
      <div className="rounded-[22px] bg-white p-5 shadow-card ring-1 ring-slate-200/70 @2xl:p-8 @5xl:p-10">
        {mode === "preview" && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              <Eye className="size-3.5" /> Profile preview
            </span>
            {live ? (
              <Badge tone="green" dot>
                Live to verified members
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold-800 ring-1 ring-inset ring-gold-200">
                <Lock className="size-3.5" /> This profile is not yet live
              </span>
            )}
          </div>
        )}

        {/* Hero */}
        <div className="grid grid-cols-1 gap-6 @2xl:grid-cols-[minmax(0,14rem)_1fr] @2xl:gap-8 @4xl:grid-cols-[minmax(0,17rem)_1fr] @4xl:gap-10">
          <Portrait profile={p} priority className="aspect-[4/5] w-full max-w-[17rem] rounded-2xl shadow-card" />
          <div className="min-w-0">
            <div className="flex flex-col gap-5 @xl:flex-row @xl:items-start @xl:justify-between">
              <div className="min-w-0">
                {live && (
                  <p className="eyebrow mb-3 flex items-center gap-1.5 text-gold-700">
                    <Seal className="size-4" tip={false} /> {p.invite.status === "registered" ? "Verified member" : "Verified by TRC"}
                  </p>
                )}
                <h1 className="display text-[2.2rem] leading-[1.04] text-navy-950 text-balance @2xl:text-[2.75rem]">{p.fullName}</h1>
                <p className="mt-3 text-[17px] text-slate-700">{p.designation}</p>
                <p className="text-[17px] text-slate-500">{p.company}</p>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="size-4 text-slate-400" />
                  {p.country}
                </p>
              </div>
              {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
            </div>
            <div className="my-6 h-px bg-slate-200/80" />
            <p className="text-[15.5px] leading-[1.75] text-slate-700 text-pretty">{p.intro}</p>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-1 gap-3 @xl:grid-cols-3">
          <FactTile icon={Briefcase} label="Current role" value={p.designation} sub={p.company} />
          <FactTile icon={MapPin} label="Location" value={p.country} />
          <FactTile icon={IndustryIcon} label="Industry" value={p.industry} />
        </dl>

        <div className={cn("mt-12 grid grid-cols-1 gap-12", showAside && "@5xl:grid-cols-[minmax(0,1fr)_17.5rem] @5xl:gap-10")}>
          <div className="min-w-0 space-y-12">
            <section>
              <SectionTitle title={`About ${p.company}`} />
              <p className="max-w-3xl text-[15px] leading-7 text-slate-600 text-pretty">{p.companyAbout}</p>
              {p.website && (
                <ExternalLink href={`https://${p.website}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-link">
                  <Globe className="size-4" />
                  {p.website}
                </ExternalLink>
              )}
            </section>

            {p.quote && (
              <figure className="relative overflow-hidden rounded-2xl bg-navy-950 px-7 py-8 text-white @2xl:px-10">
                <div className="grain absolute inset-0" />
                <Quote className="absolute right-6 top-6 size-20 text-white/[0.06]" />
                <blockquote className="display relative max-w-2xl text-[1.6rem] leading-snug text-white text-balance">“{p.quote.text}”</blockquote>
                <figcaption className="relative mt-5 text-sm text-navy-200">
                  {p.fullName} · <span className="text-gold-300">{p.quote.source}</span>
                </figcaption>
              </figure>
            )}

            {p.currentInterview && (
              <section>
                <SectionTitle title="Latest TRC interview" />
                <ReportCard item={p.currentInterview} highlight="New · TRC interview" />
              </section>
            )}

            {articles.length > 0 && (
              <section>
                <SectionTitle title="Articles & profiles" action={<ViewAll href="https://trc.com/articles">View all articles</ViewAll>} />
                <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
                  {articles.map((a) => (
                    <ArticleCard key={a.id} item={a} />
                  ))}
                </div>
              </section>
            )}

            {reports.length > 0 && (
              <section>
                <SectionTitle title="Featured in" action={<ViewAll href="https://trc.com/reports">View all reports</ViewAll>} />
                <div className="space-y-4">
                  {reports.map((r) => (
                    <ReportCard key={r.id} item={r} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {showAside && (
            <aside className="min-w-0 space-y-4">
              <div className="rounded-2xl bg-gradient-to-b from-gold-50 to-white p-5 ring-1 ring-inset ring-gold-200/70">
                <div className="flex items-center gap-2">
                  <Seal className="size-5" tip={false} />
                  <p className="text-sm font-semibold text-navy-950">{live ? "Verified by TRC" : "Prepared by TRC"}</p>
                </div>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-600">
                  <li>
                    Part of TRC&apos;s {p.report} · {fmtDate(p.interviewAt, { month: "long", year: "numeric" })}.
                  </li>
                  <li>{live ? "Published with the member's permission." : "Published only with the leader's permission."}</li>
                  {p.invite.registeredAt && <li>Member since {fmtDate(p.invite.registeredAt, { month: "long", year: "numeric" })}.</li>}
                </ul>
              </div>

              {facts.length > 0 && (
                <div className="rounded-2xl p-5 ring-1 ring-inset ring-slate-200/80">
                  <p className="eyebrow text-slate-400">At a glance</p>
                  <dl className="mt-3 divide-y divide-slate-100">
                    {facts.map((f) => (
                      <div key={f.id} className="flex justify-between gap-4 py-2.5 text-[13px]">
                        <dt className="text-slate-500">{f.label}</dt>
                        <dd className="text-right font-medium text-navy-950">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {related.length > 0 && (
                <div className="rounded-2xl p-5 ring-1 ring-inset ring-slate-200/80">
                  <p className="eyebrow text-slate-400">Also in the network</p>
                  <ul className="mt-3 space-y-3">
                    {related.map((r) => (
                      <li key={r.id}>
                        <Link href={`/p/${r.slug}`} className="group flex items-center gap-3">
                          <Avatar profile={r} size="md" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-navy-950 group-hover:underline">{r.fullName}</p>
                            <p className="truncate text-xs text-slate-500">
                              {r.company} · {r.country}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </article>
  );
}
