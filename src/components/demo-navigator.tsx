"use client";

import { ArrowRight, FlaskConical, Globe, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PopoverClose, PopoverContent, PopoverRoot, PopoverTrigger } from "@/components/ui/overlay";
import type { Persona } from "@/lib/types";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const PERSONAS: { key: Persona; label: string; sub: string; icon: typeof UserRound }[] = [
  { key: "director", label: "Project Director", sub: "TRC Console", icon: ShieldCheck },
  { key: "member", label: "Verified member", sub: "Signed in", icon: UserRound },
  { key: "guest", label: "Guest / invitee", sub: "Signed out", icon: Globe },
];

export function DemoNavigator() {
  const pathname = usePathname();
  const router = useRouter();
  const persona = useApp((s) => s.persona);
  const profiles = useApp((s) => s.profiles);
  const memberId = useApp((s) => s.memberId);
  const setPersona = useApp((s) => s.setPersona);
  const reset = useApp((s) => s.reset);
  const [confirmReset, setConfirmReset] = useState(false);

  if (pathname.startsWith("/present")) return null;

  const alex = profiles.find((p) => p.slug.startsWith("alex-morgan"));
  const steps = [
    { href: "/admin/new", label: "Generate a profile from four fields" },
    alex && { href: `/admin/profiles/${alex.id}`, label: "Review, permission and activation — Alex Morgan" },
    alex && { href: `/present/${alex.id}`, label: "Interview presentation mock-up" },
    { href: "/directory", label: "Verified member directory" },
    { href: "/feed", label: "Future social features (preview)" },
  ].filter(Boolean) as { href: string; label: string }[];

  const choose = (key: Persona) => {
    if (key === "member") {
      const member = profiles.find((p) => p.id === memberId && p.invite.status === "registered") ?? profiles.find((p) => p.invite.status === "registered" && p.status === "active");
      setPersona("member", member?.id ?? null);
    } else setPersona(key);
    toast(`Now viewing as ${PERSONAS.find((p) => p.key === key)!.label.toLowerCase()}`);
  };

  return (
    <PopoverRoot onOpenChange={() => setConfirmReset(false)}>
      <PopoverTrigger asChild>
        <button className="no-print fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-navy-950 py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium text-white shadow-pop ring-1 ring-white/10 transition hover:bg-navy-900">
          <span className="grid size-7 place-items-center rounded-full bg-gold-500 text-white">
            <FlaskConical className="size-3.5" />
          </span>
          Demo
          <span className="hidden text-white/50 sm:inline">· {PERSONAS.find((p) => p.key === persona)!.label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-[min(360px,calc(100vw-2rem))] overflow-hidden p-0">
        <div className="bg-navy-950 px-5 py-4 text-white">
          <p className="display text-lg">Prototype controls</p>
          <p className="mt-0.5 text-xs text-white/55">All data is simulated in this browser — no APIs, no database.</p>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <p className="eyebrow text-slate-400">View as</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {PERSONAS.map(({ key, label, sub, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => choose(key)}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-xl p-2.5 text-left ring-1 ring-inset transition",
                    persona === key ? "bg-navy-950 text-white ring-navy-950" : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300",
                  )}
                >
                  <Icon className={cn("size-4", persona === key ? "text-gold-300" : "text-slate-400")} />
                  <span className="text-[12px] font-medium leading-tight">{label}</span>
                  <span className={cn("text-[10.5px]", persona === key ? "text-white/55" : "text-slate-400")}>{sub}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow text-slate-400">Walkthrough</p>
            <ol className="mt-2 space-y-0.5">
              {steps.map((s, i) => (
                <li key={s.href}>
                  <PopoverClose asChild>
                    <Link href={s.href} className="group flex items-center gap-3 rounded-lg px-2 py-2 text-[13px] text-slate-700 hover:bg-slate-50">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500 group-hover:bg-gold-100 group-hover:text-gold-800">
                        {i + 1}
                      </span>
                      <span className="flex-1">{s.label}</span>
                      <ArrowRight className="size-3.5 text-slate-300 group-hover:text-slate-500" />
                    </Link>
                  </PopoverClose>
                </li>
              ))}
            </ol>
          </div>
          <button
            onClick={() => {
              if (!confirmReset) return setConfirmReset(true);
              reset();
              setConfirmReset(false);
              toast.success("Demo data reset", { description: "20 pilot CEOs restored." });
              router.push("/admin");
            }}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium ring-1 ring-inset transition",
              confirmReset ? "bg-rose-50 text-rose-700 ring-rose-200" : "text-slate-500 ring-slate-200 hover:bg-slate-50 hover:text-slate-700",
            )}
          >
            <RotateCcw className="size-3.5" />
            {confirmReset ? "Click again to reset everything" : "Reset demo data"}
          </button>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}
