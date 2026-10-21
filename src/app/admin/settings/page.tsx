"use client";

import { Check, Database, Mail, Newspaper, RotateCcw, ShieldCheck, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/console-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, Field, Input, Switch, Textarea } from "@/components/ui/primitives";
import { DEFAULT_SETTINGS, useApp } from "@/lib/store";
import type { ActivationPolicy } from "@/lib/types";
import { cn } from "@/lib/utils";

const POLICIES: { key: ActivationPolicy; title: string; source: string; steps: string[] }[] = [
  {
    key: "verbal",
    title: "Activate on recorded verbal permission",
    source: "As in the MVP brief",
    steps: ["Project Director records “Yes” at the end of the interview", "Project Director clicks Activate Profile — the URL goes live", "Invitation sent; CEO registers and accepts the privacy terms"],
  },
  {
    key: "consent",
    title: "Activate only after the CEO accepts data-protection terms",
    source: "Consent-first alternative",
    steps: ["Project Director records “Yes” at the end of the interview", "Invitation sent while the profile is still inactive", "CEO accepts the terms — the profile activates automatically"],
  },
];

export default function SettingsPage() {
  const settings = useApp((s) => s.settings);
  const update = useApp((s) => s.updateSettings);
  const reset = useApp((s) => s.reset);
  const router = useRouter();
  const [subject, setSubject] = useState(settings.inviteSubject);
  const [body, setBody] = useState(settings.inviteBody);
  const [confirm, setConfirm] = useState(false);
  const dirty = subject !== settings.inviteSubject || body !== settings.inviteBody;

  return (
    <>
      <title>Settings · TRC Console</title>
      <PageHeader eyebrow="Configuration" title="Settings" description="Publication rules, invitation template and connected sources for the pilot." />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              icon={<ShieldCheck />}
              title="Activation policy"
              description="When does a profile go live? The brief and the data-protection guidance differ on this — choose for the pilot."
            />
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6">
              {POLICIES.map((pol) => {
                const on = settings.activationPolicy === pol.key;
                return (
                  <button
                    key={pol.key}
                    onClick={() => {
                      update({ activationPolicy: pol.key });
                      toast.success("Activation policy updated", { description: pol.title });
                    }}
                    className={cn("relative rounded-2xl p-5 text-left ring-1 ring-inset transition", on ? "bg-navy-950 text-white ring-navy-950" : "bg-white ring-slate-200 hover:ring-slate-300")}
                  >
                    {on && (
                      <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-gold-500 text-white">
                        <Check className="size-3.5" />
                      </span>
                    )}
                    <p className={cn("text-[11px] font-semibold uppercase tracking-wider", on ? "text-gold-300" : "text-slate-400")}>{pol.source}</p>
                    <p className={cn("mt-2 pr-6 text-[15px] font-semibold leading-snug", on ? "text-white" : "text-navy-950")}>{pol.title}</p>
                    <ol className={cn("mt-4 space-y-2 text-[13px] leading-snug", on ? "text-white/70" : "text-slate-600")}>
                      {pol.steps.map((s, i) => (
                        <li key={s} className="flex gap-2.5">
                          <span className={cn("grid size-5 shrink-0 place-items-center rounded-full text-[10.5px] font-semibold", on ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500")}>{i + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </button>
                );
              })}
            </div>
            <p className="px-5 pb-5 text-xs leading-relaxed text-slate-500 sm:px-6">
              In both policies a verbal yes during the presentation counts as interest only — permission is recorded from the explicit question at the end of the interview.
            </p>
          </Card>

          <Card>
            <CardHeader icon={<Mail />} title="Invitation" description="Sent from the system after activation. Placeholders: {firstName}, {link}, {sender}." />
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200/80">
                <div>
                  <p className="text-sm font-medium text-navy-950">One automatic reminder after 48 hours</p>
                  <p className="text-xs text-slate-500">Only if registration is incomplete. Any further follow-up is a TRC decision.</p>
                </div>
                <Switch checked={settings.reminderEnabled} onCheckedChange={(v) => update({ reminderEnabled: v })} label="Automatic reminder" />
              </div>
              <Field label="Subject">
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </Field>
              <Field label="Message">
                <Textarea rows={13} value={body} onChange={(e) => setBody(e.target.value)} className="text-[13.5px]" />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!dirty}
                  onClick={() => {
                    update({ inviteSubject: subject, inviteBody: body });
                    toast.success("Invitation template saved");
                  }}
                >
                  Save template
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSubject(DEFAULT_SETTINGS.inviteSubject);
                    setBody(DEFAULT_SETTINGS.inviteBody);
                  }}
                >
                  Restore default
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Connected sources" description="Simulated in this prototype — no API keys required." />
            <ul className="divide-y divide-slate-100 px-5 pb-2 pt-3 sm:px-6">
              {[
                { icon: Database, name: "HubSpot", detail: "Contacts and companies · optional enrichment", badge: <Badge tone="green" dot>Connected</Badge> },
                { icon: Newspaper, name: "TRC past reports database", detail: "4,812 articles, profiles and reports indexed", badge: <Badge tone="green" dot>Indexed</Badge> },
                { icon: WandSparkles, name: "Gemini", detail: "Runs only when internal information is incomplete or stale", badge: <Badge tone="gold">Conditional</Badge> },
              ].map(({ icon: Icon, name, detail, badge }) => (
                <li key={name} className="flex items-center gap-3 py-3.5">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-950">{name}</p>
                    <p className="text-xs text-slate-500">{detail}</p>
                  </div>
                  {badge}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Pilot targets" description="Used by the overview dashboard." />
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-b-2xl bg-slate-100 text-sm">
              {[
                ["Pilot size", "20 CEOs"],
                ["Generation completion", "≥ 90%"],
                ["Draft readiness", "≥ 90%"],
                ["Invitation speed", "6 h · max 1 day"],
                ["Visit rate", "≥ 60%"],
                ["Registration rate", "60%"],
                ["Profile quality", "≥ 80% minor edits"],
                ["Review time", "10 + 5 min"],
              ].map(([k, v]) => (
                <div key={k} className="bg-white px-5 py-3.5">
                  <dt className="text-xs text-slate-500">{k}</dt>
                  <dd className="mt-0.5 font-medium text-navy-950">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5 sm:p-6">
            <p className="text-sm font-semibold text-navy-950">Demo data</p>
            <p className="mt-1 text-[13px] text-slate-500">Everything lives in this browser&apos;s local storage. Resetting restores the 20 pilot CEOs.</p>
            <Button
              variant={confirm ? "danger" : "secondary"}
              className="mt-4"
              onClick={() => {
                if (!confirm) return setConfirm(true);
                reset();
                setConfirm(false);
                toast.success("Demo data reset");
                router.push("/admin");
              }}
            >
              <RotateCcw /> {confirm ? "Click again to confirm" : "Reset demo data"}
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
