"use client";

import { ArrowUpRight, LayoutDashboard, Menu as MenuIcon, Search, Settings2, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand";
import { Avatar } from "@/components/profile/portrait";
import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "@/components/ui/overlay";
import { CURRENT_USER } from "@/lib/data/reference";
import { PILOT_TARGET } from "@/lib/metrics";
import { STAGE_META, stageOf } from "@/lib/stage";
import { useApp } from "@/lib/store";
import { cn, normalize } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/new", label: "Generate profile", icon: Sparkles },
  { href: "/admin/profiles", label: "Profiles", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const profiles = useApp((s) => s.profiles);
  const upcoming = useApp((s) => s.upcoming);
  const total = Math.max(PILOT_TARGET, profiles.length + upcoming.length);
  const generated = profiles.length;
  const registered = profiles.filter((p) => p.invite.status === "registered").length;
  const attention = profiles.filter((p) => {
    const s = stageOf(p);
    return s === "draft" || s === "approved" || (s === "active" && p.invite.status === "not_sent");
  }).length;

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-5">
        <Logo href="/admin" />
        <p className="eyebrow mt-3 text-gold-300/80">TRC Console</p>
      </div>
      <nav className="space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className={cn("size-[18px]", active ? "text-gold-300" : "text-white/40 group-hover:text-white/70")} />
              {label}
              {href === "/admin/profiles" && attention > 0 && (
                <span className="ml-auto rounded-full bg-gold-500/20 px-1.5 text-[11px] font-semibold text-gold-200">{attention}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <p className="eyebrow mt-8 px-6 text-white/30">Member experience</p>
      <nav className="mt-2 space-y-0.5 px-3">
        {[
          { href: "/directory", label: "Member directory" },
          { href: "/", label: "Network home" },
        ].map((l) => (
          <Link key={l.href} href={l.href} onClick={onNavigate} className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px] text-white/55 hover:bg-white/5 hover:text-white">
            {l.label}
            <ArrowUpRight className="size-3.5 text-white/30" />
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-4 p-4">
        <div className="rounded-xl bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-white/80">Pilot · {PILOT_TARGET} CEOs</span>
            <span className="text-white/50">
              {generated}/{PILOT_TARGET} generated
            </span>
          </div>
          <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="rounded-full bg-gold-400" style={{ width: `${(registered / total) * 100}%` }} />
            <div className="ml-0.5 rounded-full bg-white/35" style={{ width: `${((generated - registered) / total) * 100}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-white/45">{registered} registered members</p>
        </div>
        <div className="flex items-center gap-3 px-1">
          <div className="grid size-9 place-items-center rounded-full bg-gold-500/90 text-xs font-semibold text-white">SW</div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-white">{CURRENT_USER.name}</p>
            <p className="truncate text-[11px] text-white/45">{CURRENT_USER.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const profiles = useApp((s) => s.profiles);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const n = normalize(q);
    if (!n) return [];
    return profiles.filter((p) => normalize(`${p.fullName} ${p.company} ${p.country}`).includes(n)).slice(0, 6);
  }, [q, profiles]);

  return (
    <PopoverRoot open={open && results.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                router.push(`/admin/profiles/${results[0].id}`);
                setQ("");
                setOpen(false);
              }
            }}
            placeholder="Search CEOs, companies, markets…"
            className="h-9 w-full rounded-lg bg-slate-100/80 pl-9 pr-3 text-sm text-slate-900 outline-none ring-1 ring-inset ring-transparent transition placeholder:text-slate-400 focus:bg-white focus:ring-navy-300"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1.5" onOpenAutoFocus={(e) => e.preventDefault()}>
        {results.map((p) => {
          const meta = STAGE_META[stageOf(p)];
          return (
            <button
              key={p.id}
              onClick={() => {
                router.push(`/admin/profiles/${p.id}`);
                setQ("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-slate-100"
            >
              <Avatar profile={p} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy-950">{p.fullName}</p>
                <p className="truncate text-xs text-slate-500">
                  {p.company} · {p.country}
                </p>
              </div>
              <span className="text-[11px] text-slate-400">{meta.label}</span>
            </button>
          );
        })}
      </PopoverContent>
    </PopoverRoot>
  );
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const persona = useApp((s) => s.persona);
  const setPersona = useApp((s) => s.setPersona);
  const [drawer, setDrawer] = useState(false);

  if (persona !== "director") {
    return (
      <div className="grid min-h-screen place-items-center bg-navy-950 px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-pop">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-navy-950 text-gold-300">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="display mt-5 text-2xl text-navy-950">TRC staff only</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">The console is restricted to authorised TRC users. You are currently viewing the prototype as a {persona === "member" ? "verified member" : "guest"}.</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={() => setPersona("director")}>Switch to Project Director</Button>
            <Button variant="secondary" asChild>
              <Link href="/directory">Back to the network</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen bg-navy-950 lg:block">
        <SidebarNav />
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-navy-950 shadow-pop">
            <button className="absolute right-3 top-4 rounded-md p-1.5 text-white/60 hover:bg-white/10" onClick={() => setDrawer(false)} aria-label="Close menu">
              <X className="size-5" />
            </button>
            <SidebarNav onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}
      <div className="min-w-0">
        <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-10">
          <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu">
            <MenuIcon />
          </Button>
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2">
            {pathname !== "/admin" && !pathname.startsWith("/admin/new") && (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/admin/new">
                  <Sparkles /> Generate profile
                </Link>
              </Button>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2 text-gold-700">{eyebrow}</p>}
        <h1 className="display text-[2rem] leading-tight text-navy-950 sm:text-[2.35rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
