"use client";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  CircleSlash,
  ClipboardCheck,
  Clock,
  Copy,
  Database,
  Eye,
  Globe,
  Hourglass,
  Link2,
  Mail,
  MailCheck,
  MessageSquareQuote,
  Monitor,
  Newspaper,
  PauseCircle,
  PenLine,
  Power,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserCheck,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ExternalLink } from "@/components/brand";
import { ProfileView } from "@/components/profile/profile-view";
import { ScaledFrame } from "@/components/profile/scaled-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal, Tip } from "@/components/ui/overlay";
import { Card, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { CURRENT_USER } from "@/lib/data/reference";
import { MILESTONES, milestoneIndex, stageOf } from "@/lib/stage";
import { useApp } from "@/lib/store";
import { useNow } from "@/lib/use-now";
import type { ActivityEvent, PermissionValue, Profile } from "@/lib/types";
import { SITE_HOST, cn, firstName, fmtDateTime, fmtTime, formatHours, hoursBetween, relativeDay, timeAgo, timeUntil, wordCount } from "@/lib/utils";

/* ------------------------------- helpers ------------------------------- */

export function profileUrl(p: Profile, invite = false) {
  const origin = typeof window === "undefined" ? `https://${SITE_HOST}` : window.location.origin;
  return `${origin}/p/${p.slug}${invite ? `?invite=${p.invite.token}` : ""}`;
}

export async function copyLink(p: Profile) {
  const url = profileUrl(p);
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    /* clipboard unavailable — still show the link */
  }
  toast.success("Profile link copied", {
    description: p.status === "active" ? url : "The URL is reserved — it opens for members once the profile is activated.",
  });
}

export function useOpenAsCeo() {
  const router = useRouter();
  const setPersona = useApp((s) => s.setPersona);
  return (p: Profile) => {
    setPersona("guest");
    router.push(`/p/${p.slug}?invite=${p.invite.token}`);
    toast("Viewing as the CEO", { description: "Switch back to Project Director from the Demo menu." });
  };
}

/* ----------------------------- stage tracker ---------------------------- */

export function StageTracker({ p }: { p: Profile }) {
  const reached = milestoneIndex(p);
  const stage = stageOf(p);
  const times = [p.createdAt, p.readyAt, p.permission.at, p.activatedAt, p.invite.sentAt, p.invite.registeredAt];
  const permLabel = p.permission.value === "yes" ? "Yes" : p.permission.value === "ask_later" ? "Ask later" : p.permission.value === "no" ? "No" : undefined;
  return (
    <ol className="grid grid-cols-3 gap-y-4 rounded-2xl bg-white px-4 py-4 shadow-card ring-1 ring-slate-200/70 sm:grid-cols-6 sm:px-6">
      {MILESTONES.map((m, i) => {
        const done = i <= reached;
        const current = i === reached + 1 && stage !== "declined" && stage !== "deactivated";
        const flagged = i === 2 && (stage === "ask_later" || stage === "declined");
        return (
          <li key={m} className="relative flex flex-col items-start">
            {i > 0 && <span className={cn("absolute right-[calc(100%-0.75rem)] top-3 hidden h-px w-[calc(100%-1.5rem)] sm:block", done ? "bg-navy-700" : "bg-slate-200")} />}
            <span
              className={cn(
                "relative z-10 grid size-6 place-items-center rounded-full text-[11px] font-semibold",
                flagged ? (stage === "declined" ? "bg-rose-500 text-white" : "bg-amber-500 text-white") : done ? "bg-navy-800 text-white" : current ? "animate-pulse-ring bg-gold-500 text-white" : "bg-slate-100 text-slate-400",
              )}
            >
              {flagged ? "!" : done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <p className={cn("mt-2 text-[12.5px] font-medium", done || current || flagged ? "text-navy-950" : "text-slate-400")}>
              {m}
              {i === 2 && permLabel && <span className="font-normal text-slate-500"> · {permLabel}</span>}
            </p>
            <p className="text-[11.5px] text-slate-400">{times[i] && (done || flagged) ? fmtDateTime(times[i]) : current ? "Next" : "—"}</p>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------ SLA meter ------------------------------ */

function SlaMeter({ since, label }: { since?: string; label: string }) {
  if (!since) return null;
  const h = hoursBetween(since, new Date().toISOString()) ?? 0;
  const tone = h <= 6 ? "bg-emerald-500" : h <= 24 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="mt-4 rounded-xl bg-white/70 p-3 ring-1 ring-inset ring-slate-200/80">
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="flex items-center gap-1.5 text-slate-600">
          <Clock className="size-3.5" /> {label} {formatHours(h)} ago
        </span>
        <span className={cn("font-medium", h <= 6 ? "text-emerald-700" : h <= 24 ? "text-amber-700" : "text-rose-700")}>
          {h <= 6 ? `${formatHours(6 - h)} left of the 6 h target` : h <= 24 ? "Past 6 h target · within 1 business day" : "Past the 1 business day maximum"}
        </span>
      </div>
      <div className="relative mt-2 h-1.5 rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${Math.min(1, h / 24) * 100}%` }} />
        <div className="absolute -top-1 h-3.5 w-0.5 rounded bg-navy-950" style={{ left: `${(6 / 24) * 100}%` }} title="6 h target" />
      </div>
      <div className="mt-1 flex justify-between text-[10.5px] text-slate-400">
        <span>0 h</span>
        <span style={{ marginLeft: "12%" }}>6 h target</span>
        <span>1 business day</span>
      </div>
    </div>
  );
}

/* ------------------------------ next step ------------------------------ */

type Dialogs = "permission" | "activate" | "invite" | "deactivate" | null;

const PERMISSION_SCRIPT =
  "“Before we finish — as mentioned in the presentation, we have prepared a short profile of you for TRC's CEO Network, a private directory of the leaders featured in our reports. May we publish it for verified members? You can review it and ask for changes at any time.”";

export function NextStepCard({ p, open }: { p: Profile; open: (d: Dialogs) => void }) {
  const policy = useApp((s) => s.settings.activationPolicy);
  const reminders = useApp((s) => s.settings.reminderEnabled);
  const now = useNow();
  const markReady = useApp((s) => s.markReady);
  const reactivate = useApp((s) => s.reactivate);
  const sendReminder = useApp((s) => s.sendReminder);
  const openAsCeo = useOpenAsCeo();
  const router = useRouter();
  const stage = stageOf(p);
  const first = firstName(p.fullName);
  const unresolved = p.conflicts.filter((c) => !c.resolved).length;
  const pendingLinks = p.links.filter((l) => l.status === "suggested").length;
  const interviewFuture = new Date(p.interviewAt).getTime() > now;

  let icon: LucideIcon = ClipboardCheck;
  let eyebrow = "Next step";
  let title: ReactNode = "";
  let body: ReactNode = null;
  let actions: ReactNode = null;
  let extra: ReactNode = null;
  let tone = "from-gold-50 via-white to-white ring-gold-200/70";

  switch (stage) {
    case "draft":
      icon = ClipboardCheck;
      eyebrow = `Before the interview · ${relativeDay(p.interviewAt)} ${fmtTime(p.interviewAt)}`;
      title = "Review the draft, then mark it ready";
      body = (
        <>
          Check the basic details, introduction, image and suggested TRC links. Saving keeps the URL inactive.
          {(unresolved > 0 || pendingLinks > 0) && (
            <span className="mt-2 flex flex-wrap gap-1.5">
              {unresolved > 0 && <Badge tone="amber">{unresolved} conflict{unresolved > 1 ? "s" : ""} to review</Badge>}
              {pendingLinks > 0 && <Badge tone="amber">{pendingLinks} link{pendingLinks > 1 ? "s" : ""} to confirm</Badge>}
            </span>
          )}
        </>
      );
      actions = (
        <Button
          onClick={() => {
            markReady(p.id);
            toast.success("Saved and marked ready for permission", { description: "The unique link remains inactive." });
          }}
        >
          <ClipboardCheck /> Save and mark ready for permission
        </Button>
      );
      break;
    case "ready":
      icon = MessageSquareQuote;
      eyebrow = interviewFuture ? `Interview ${relativeDay(p.interviewAt).toLowerCase()} at ${fmtTime(p.interviewAt)} · ${timeUntil(p.interviewAt)}` : "Interview completed";
      title = "Ask for permission at the end of the interview";
      body = (
        <>
          Introduce the network briefly within the full offer. A yes during the presentation signals interest only — record the answer to the explicit question at the end.
          <span className="mt-3 block rounded-xl bg-white/80 px-4 py-3 text-[13px] italic leading-relaxed text-slate-600 ring-1 ring-inset ring-slate-200/80">{PERMISSION_SCRIPT}</span>
        </>
      );
      actions = (
        <>
          <Button onClick={() => open("permission")}>
            <PenLine /> Record permission
          </Button>
          <Button variant="secondary" onClick={() => router.push(`/present/${p.id}`)}>
            <Monitor /> Presentation mock-up
          </Button>
        </>
      );
      break;
    case "ask_later":
      icon = Hourglass;
      eyebrow = `Recorded ${timeAgo(p.permission.at)} by ${p.permission.by}`;
      title = `${first} asked to decide later`;
      body = p.permission.note ? `“${p.permission.note}” — follow up when appropriate and update the response.` : "Follow up when appropriate and update the response.";
      actions = (
        <Button onClick={() => open("permission")}>
          <PenLine /> Update response
        </Button>
      );
      break;
    case "declined":
      icon = CircleSlash;
      tone = "from-rose-50 via-white to-white ring-rose-200/70";
      eyebrow = `Recorded ${timeAgo(p.permission.at)} by ${p.permission.by}`;
      title = "Not to be published";
      body = `${first} declined${p.permission.note ? ` — “${p.permission.note}”` : ""}. The record is kept and the URL stays inactive.`;
      actions = (
        <Button variant="secondary" onClick={() => open("permission")}>
          Update response
        </Button>
      );
      break;
    case "approved":
      if (policy === "verbal") {
        icon = Power;
        eyebrow = `Permission: yes · recorded ${timeAgo(p.permission.at)}`;
        title = "Final check, then activate the profile";
        body = "Make any correction from the meeting. Activating publishes the same unique URL to verified members.";
        actions = (
          <Button variant="success" onClick={() => open("activate")}>
            <Power /> Activate profile
          </Button>
        );
      } else {
        icon = Send;
        eyebrow = `Permission: yes · consent-first policy`;
        title = `Send ${first} the invitation to review and consent`;
        body = "The profile goes live automatically when the CEO accepts the data-protection terms during registration.";
        actions = (
          <>
            <Button onClick={() => open("invite")}>
              <Send /> Send invitation
            </Button>
            <Tip content="Under the consent-first policy, activation happens when the CEO accepts the terms.">
              <span>
                <Button variant="secondary" disabled>
                  <Power /> Activate profile
                </Button>
              </span>
            </Tip>
          </>
        );
      }
      extra = <SlaMeter since={p.permission.at} label="Permission given" />;
      break;
    case "active":
      icon = Send;
      tone = "from-emerald-50 via-white to-white ring-emerald-200/70";
      eyebrow = `Live since ${timeAgo(p.activatedAt)}`;
      title = `Send ${first} the invitation`;
      body = "Copy the link or send the standard invitation from the system. One automatic reminder follows after 48 hours.";
      actions = (
        <>
          <Button onClick={() => open("invite")}>
            <Send /> Send invitation
          </Button>
          <Button variant="secondary" onClick={() => copyLink(p)}>
            <Copy /> Copy link
          </Button>
        </>
      );
      extra = <SlaMeter since={p.permission.at} label="Interview ended" />;
      break;
    case "invited":
    case "opened": {
      const opened = stage === "opened";
      const due = p.invite.reminderDueAt ? new Date(p.invite.reminderDueAt).getTime() : 0;
      icon = opened ? Eye : MailCheck;
      tone = "from-sky-50 via-white to-white ring-sky-200/70";
      eyebrow = `Invitation sent ${timeAgo(p.invite.sentAt)} to ${p.invite.recipient}`;
      title = opened ? `${first} opened the link — registration pending` : "Waiting for the CEO to open the link";
      body = p.invite.reminderSentAt
        ? "The automatic reminder has been sent. Any further personal follow-up is your decision."
        : !reminders
          ? "The automatic reminder is switched off in Settings — any follow-up is your decision."
          : `One automatic reminder is scheduled ${due > now ? timeUntil(p.invite.reminderDueAt!, now) : "now"} if registration is still incomplete.`;
      actions = (
        <>
          <Button onClick={() => openAsCeo(p)}>
            Open invitation as the CEO <ArrowRight />
          </Button>
          <Button variant="secondary" onClick={() => copyLink(p)}>
            <Copy /> Copy link
          </Button>
          {!p.invite.reminderSentAt && reminders && (
            <Tip content="Demo: skip ahead 48 hours to trigger the automatic reminder">
              <Button
                variant="ghost"
                onClick={() => {
                  sendReminder(p.id);
                  toast("Automatic reminder sent", { description: `48 hours skipped for the demo · sent to ${p.invite.recipient}` });
                }}
              >
                <Clock /> Skip 48 h
              </Button>
            </Tip>
          )}
        </>
      );
      break;
    }
    case "registered":
      icon = UserCheck;
      tone = "from-emerald-50 via-white to-white ring-emerald-200/70";
      eyebrow = `Registered ${timeAgo(p.invite.registeredAt)} via ${p.invite.method === "google" ? "Google" : "verified email"}`;
      title = `${first} is a member of the CEO Network`;
      body = p.invite.registeredBy
        ? `Registered on ${first}'s behalf by ${p.invite.registeredBy.name} (${p.invite.registeredBy.role}). Privacy and membership terms accepted.`
        : "Privacy and membership terms accepted. Add the published interview to the profile when it is out.";
      if (p.invite.changeRequest) extra = <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-900 ring-1 ring-inset ring-amber-200">Change requested: “{p.invite.changeRequest}”</p>;
      actions = (
        <Button variant="secondary" onClick={() => router.push(`/p/${p.slug}`)}>
          <Eye /> View live profile
        </Button>
      );
      break;
    case "deactivated":
      icon = PauseCircle;
      tone = "from-rose-50 via-white to-white ring-rose-200/70";
      eyebrow = `Deactivated ${timeAgo(p.deactivatedAt)}`;
      title = "Removed from member access";
      body = "The record and URL are retained. Reactivate only with the CEO's agreement.";
      actions = (
        <Button
          variant="secondary"
          onClick={() => {
            reactivate(p.id);
            toast.success("Profile reactivated");
          }}
        >
          <RefreshCw /> Reactivate
        </Button>
      );
      break;
  }

  const Icon = icon;
  return (
    <div className={cn("rounded-2xl bg-gradient-to-br p-5 shadow-card ring-1 ring-inset sm:p-6", tone)}>
      <div className="flex gap-4">
        <div className="hidden size-11 shrink-0 place-items-center rounded-xl bg-navy-950 text-gold-300 sm:grid">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-gold-700">{eyebrow}</p>
          <h2 className="display mt-1.5 text-[1.6rem] leading-tight text-navy-950">{title}</h2>
          <div className="mt-2 text-[14px] leading-relaxed text-slate-600">{body}</div>
          {extra}
          <div className="mt-5 flex flex-wrap gap-2">{actions}</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- invitation tracking ------------------------- */

export function InvitationTracker({ p }: { p: Profile }) {
  const reminders = useApp((s) => s.settings.reminderEnabled);
  if (p.invite.status === "not_sent") return null;
  const rows: { label: string; at?: string; pending: string; icon: LucideIcon }[] = [
    { label: "Invitation sent", at: p.invite.sentAt, pending: "Not sent", icon: Send },
    { label: "Link opened", at: p.invite.openedAt, pending: "Not opened yet", icon: Eye },
    {
      label: "Automatic reminder",
      at: p.invite.reminderSentAt,
      pending: p.invite.registeredAt ? "Not needed" : !reminders ? "Switched off" : p.invite.reminderDueAt ? `Scheduled ${fmtDateTime(p.invite.reminderDueAt)}` : "—",
      icon: Clock,
    },
    { label: "Registered", at: p.invite.registeredAt, pending: "Pending", icon: BadgeCheck },
  ];
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-navy-950">Invitation tracking</h3>
        <span className="text-xs text-slate-500">{p.visits} profile visit{p.visits === 1 ? "" : "s"}</span>
      </div>
      <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <li key={r.label} className={cn("rounded-xl p-3 ring-1 ring-inset", r.at ? "bg-emerald-50/50 ring-emerald-200/80" : "ring-slate-200")}>
              <Icon className={cn("size-4", r.at ? "text-emerald-600" : "text-slate-300")} />
              <p className="mt-2 text-[13px] font-medium text-navy-950">{r.label}</p>
              <p className="text-[11.5px] text-slate-500">{r.at ? fmtDateTime(r.at) : r.pending}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/* -------------------------------- dialogs ------------------------------- */

export function PermissionDialog({ p, open, onOpenChange, onRecorded }: { p: Profile; open: boolean; onOpenChange: (v: boolean) => void; onRecorded: (v: PermissionValue) => void }) {
  const record = useApp((s) => s.recordPermission);
  const policy = useApp((s) => s.settings.activationPolicy);
  const [value, setValue] = useState<PermissionValue>(p.permission.value === "pending" ? "yes" : p.permission.value);
  const [note, setNote] = useState(p.permission.note ?? "");
  const options: { v: PermissionValue; label: string; body: string; icon: LucideIcon; tone: string }[] = [
    {
      v: "yes",
      label: "Yes",
      body: policy === "verbal" ? "The CEO agreed to publish the prepared profile. Activate Profile becomes available." : "The CEO agreed. Send the invitation — the profile goes live when they accept the terms.",
      icon: CircleCheck,
      tone: "text-emerald-600",
    },
    { v: "ask_later", label: "Ask later", body: "The CEO wants time to decide. Nothing is published.", icon: Hourglass, tone: "text-amber-600" },
    { v: "no", label: "No", body: "Do not publish. The record is kept and the URL stays inactive.", icon: CircleSlash, tone: "text-rose-600" },
  ];
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      icon={<PenLine />}
      title="Record the CEO's response"
      description={`To the explicit question at the end of the interview with ${p.fullName}.`}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              record(p.id, value, note);
              onOpenChange(false);
              onRecorded(value);
            }}
          >
            Record response
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        {options.map((o) => {
          const Icon = o.icon;
          return (
            <label key={o.v} className={cn("flex cursor-pointer gap-3 rounded-xl p-4 ring-1 ring-inset transition", value === o.v ? "bg-navy-50/60 ring-navy-300" : "ring-slate-200 hover:ring-slate-300")}>
              <input type="radio" name="permission" checked={value === o.v} onChange={() => setValue(o.v)} className="sr-only" />
              <Icon className={cn("mt-0.5 size-5 shrink-0", o.tone)} />
              <span>
                <span className="block text-sm font-semibold text-navy-950">{o.label}</span>
                <span className="block text-[13px] leading-relaxed text-slate-600">{o.body}</span>
              </span>
            </label>
          );
        })}
      </div>
      <Field label="Note (optional)" className="mt-4">
        <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Wants to check with the communications team" />
      </Field>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck className="size-3.5" /> Recorded by {CURRENT_USER.name} with a timestamp.
      </p>
    </Modal>
  );
}

function CheckRow({ ok, warn, children }: { ok: boolean; warn?: boolean; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      {ok ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <TriangleAlert className={cn("mt-0.5 size-4 shrink-0", warn ? "text-amber-500" : "text-rose-500")} />}
      <span className="text-slate-700">{children}</span>
    </li>
  );
}

export function ActivateDialog({ p, open, onOpenChange, onActivated }: { p: Profile; open: boolean; onOpenChange: (v: boolean) => void; onActivated: () => void }) {
  const activate = useApp((s) => s.activate);
  const wc = wordCount(p.intro);
  const unresolved = p.conflicts.filter((c) => !c.resolved).length;
  const confirmed = p.links.filter((l) => l.status === "confirmed").length;
  const suggested = p.links.filter((l) => l.status === "suggested").length;
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      icon={<Power />}
      title="Activate profile"
      description="The same unique URL becomes live and the profile appears in the verified member directory."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => {
              activate(p.id);
              onOpenChange(false);
              onActivated();
            }}
          >
            <Power /> Activate profile
          </Button>
        </>
      }
    >
      <p className="text-[13px] font-medium text-slate-500">Final check</p>
      <ul className="mt-3 space-y-2.5">
        <CheckRow ok>
          Permission: <strong>Yes</strong>, recorded by {p.permission.by} {timeAgo(p.permission.at)}
        </CheckRow>
        <CheckRow ok={unresolved === 0} warn>
          {unresolved === 0 ? "Basic details checked — no open conflicts" : `${unresolved} source conflict${unresolved > 1 ? "s" : ""} still open`}
        </CheckRow>
        <CheckRow ok={wc >= 100 && wc <= 200} warn>
          Introduction: {wc} words {wc >= 100 && wc <= 200 ? "(within range)" : "(outside 100–200)"}
        </CheckRow>
        <CheckRow ok={suggested === 0} warn>
          {confirmed} TRC link{confirmed === 1 ? "" : "s"} confirmed{suggested ? ` · ${suggested} unconfirmed suggestion${suggested > 1 ? "s" : ""} won't appear` : ""}
        </CheckRow>
        <CheckRow ok>Image: {p.photo && !p.useInitials ? "approved photograph" : "initials avatar"}</CheckRow>
      </ul>
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-[13px] text-slate-600 ring-1 ring-inset ring-slate-200/80">
        <Link2 className="size-4 shrink-0 text-slate-400" />
        <span className="truncate">
          {SITE_HOST}/p/{p.slug}
        </span>
      </div>
    </Modal>
  );
}

export function InviteDialog({ p, open, onOpenChange }: { p: Profile; open: boolean; onOpenChange: (v: boolean) => void }) {
  const settings = useApp((s) => s.settings);
  const sendInvite = useApp((s) => s.sendInvite);
  const openAsCeo = useOpenAsCeo();
  const [to, setTo] = useState(p.invite.recipient ?? "");
  const [name, setName] = useState(p.invite.recipientName ?? p.fullName);
  const link = profileUrl(p, true);
  const [body, setBody] = useState(() =>
    settings.inviteBody.replaceAll("{firstName}", firstName(p.fullName)).replaceAll("{link}", link).replaceAll("{sender}", CURRENT_USER.name),
  );
  const valid = /\S+@\S+\.\S+/.test(to);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      icon={<Mail />}
      title={p.invite.status === "not_sent" ? "Send the invitation" : "Resend the invitation"}
      description="The standard invitation, sent from the system. Target: within 6 hours of the interview."
      footer={
        <>
          <Button variant="ghost" onClick={() => copyLink(p)}>
            <Copy /> Copy link
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              sendInvite(p.id, to, name);
              onOpenChange(false);
              toast.success(`Invitation sent to ${to}`, {
                description: "One automatic reminder after 48 hours if registration is incomplete.",
                action: { label: "Open as CEO", onClick: () => openAsCeo(p) },
              });
            }}
          >
            <Send /> Send invitation
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="To — CEO or delegated contact" hint={p.hubspot.contact?.email === to ? "From HubSpot" : undefined}>
          <Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@company.com" />
        </Field>
        <Field label="Recipient name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-inset ring-slate-200">
        <div className="space-y-1 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[12.5px] text-slate-500">
          <p>
            <span className="inline-block w-14">From</span>
            <span className="text-slate-700">{CURRENT_USER.name} via CEO Network &lt;network@trc.com&gt;</span>
          </p>
          <p>
            <span className="inline-block w-14">Subject</span>
            <span className="font-medium text-navy-950">{settings.inviteSubject}</span>
          </p>
        </div>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} className="rounded-none text-[13.5px] ring-0 focus:ring-0" />
      </div>
    </Modal>
  );
}

export function DeactivateDialog({ p, open, onOpenChange }: { p: Profile; open: boolean; onOpenChange: (v: boolean) => void }) {
  const deactivate = useApp((s) => s.deactivate);
  const [reason, setReason] = useState("at the CEO's request");
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      icon={<PauseCircle />}
      title="Deactivate profile"
      description="Removes the page from member access without deleting the record. You can reactivate later."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deactivate(p.id, reason);
              onOpenChange(false);
              toast("Profile deactivated", { description: "Removed from the directory. Record retained." });
            }}
          >
            Deactivate
          </Button>
        </>
      }
    >
      <Field label="Reason">
        <Select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="at the CEO's request">At the CEO&apos;s request</option>
          <option value="information needs correcting">Information needs correcting</option>
          <option value="role or company changed">Role or company changed</option>
        </Select>
      </Field>
    </Modal>
  );
}

/* ------------------------------ right panels ----------------------------- */

export function PreviewPanel({ p }: { p: Profile }) {
  const [mode, setMode] = useState<"fit" | "desktop">("fit");
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12.5px] text-slate-500">{p.status === "active" ? "As verified members see it" : "As the CEO will see it before it goes live"}</p>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[12px] font-medium">
          {(["fit", "desktop"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cn("rounded-md px-2.5 py-1 text-slate-500 transition", mode === m && "bg-white text-navy-950 shadow-sm")}>
              {m === "fit" ? "Fit" : "Desktop"}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-[calc(100vh-15rem)] overflow-y-auto rounded-2xl bg-canvas p-2 ring-1 ring-inset ring-slate-200/80">
        {mode === "fit" ? (
          <ProfileView profile={p} mode="preview" />
        ) : (
          <ScaledFrame width={1120}>
            <div className="bg-canvas p-6">
              <ProfileView profile={p} mode="preview" />
            </div>
          </ScaledFrame>
        )}
      </div>
    </div>
  );
}

function SourceBlock({ icon: Icon, title, status, children }: { icon: LucideIcon; title: string; status: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-navy-950">
          <Icon className="size-4 text-slate-400" /> {title}
        </p>
        {status}
      </div>
      <div className="mt-3 text-[13px] text-slate-600">{children}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-slate-500">{k}</span>
      <span className="text-right font-medium text-navy-950">{v}</span>
    </div>
  );
}

export function SourcesPanel({ p }: { p: Profile }) {
  const hs = p.hubspot;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-navy-950 p-4 text-white">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">Information completeness</p>
          <p className="text-2xl font-semibold">{p.completeness}%</p>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gold-400" style={{ width: `${p.completeness}%` }} />
        </div>
        {p.missing.length ? (
          <ul className="mt-3 space-y-1 text-[12.5px] text-white/70">
            {p.missing.map((m) => (
              <li key={m} className="flex gap-2">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-gold-300" /> {m}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[12.5px] text-white/60">All required information was found.</p>
        )}
      </div>

      <SourceBlock icon={Database} title="HubSpot" status={hs.matched ? <Badge tone="green">{hs.confidence}% match</Badge> : <Badge>No record</Badge>}>
        {hs.matched ? (
          <div className="divide-y divide-slate-100">
            {hs.contact && (
              <>
                <KV k="Contact" v={`#${hs.contact.id} · ${hs.contact.name}`} />
                <KV k="Title in HubSpot" v={hs.contact.title} />
                <KV k="Email" v={hs.contact.email} />
                <KV k="Account owner" v={hs.contact.owner} />
                <KV k="Last activity" v={timeAgo(new Date(hs.contact.lastActivity).toISOString())} />
              </>
            )}
            {hs.company && (
              <>
                <KV k="Company" v={hs.company.name} />
                <KV k="Lifecycle" v={hs.company.lifecycle} />
                {hs.company.pastAdvertiser && <KV k="Past advertiser" v={hs.company.pastAdvertiser.join(", ")} />}
              </>
            )}
            <p className="pt-2 text-xs text-slate-500">Imported: {hs.importedFields.join(", ")}</p>
          </div>
        ) : (
          <p>No matching contact or company — the workflow continued without HubSpot.</p>
        )}
      </SourceBlock>

      <SourceBlock icon={Newspaper} title="TRC past reports" status={<Badge tone={p.trcSearch.results ? "navy" : "slate"}>{p.trcSearch.results} found</Badge>}>
        <p>
          Searched for {p.trcSearch.terms.map((t) => `“${t}”`).join(" and ")} across 4,812 indexed items. {p.links.filter((l) => l.status === "confirmed").length} confirmed for the profile.
        </p>
      </SourceBlock>

      <SourceBlock icon={WandSparkles} title="Gemini research" status={p.gemini.ran ? <Badge tone="violet">Ran</Badge> : <Badge>Skipped</Badge>}>
        <p>{p.gemini.ran ? p.gemini.reason : "Not required — HubSpot and TRC records were sufficient and current."}</p>
        {p.gemini.findings.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-600">
            {p.gemini.findings.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
        {p.gemini.sources.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Sources retained</p>
            {p.gemini.sources.map((s) => (
              <ExternalLink key={s.url} href={s.url} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] text-link ring-1 ring-inset ring-slate-200 hover:bg-slate-50">
                <Globe className="size-3.5 shrink-0" />
                <span className="truncate">{s.title}</span>
              </ExternalLink>
            ))}
          </div>
        )}
      </SourceBlock>

      <div className="rounded-2xl p-4 ring-1 ring-inset ring-slate-200">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Source hierarchy</p>
        <ol className="mt-2 space-y-1 text-[12.5px] text-slate-600">
          {["Your entry", "Approved interview transcript", "HubSpot", "TRC published content", "Gemini research (with source links)"].map((s, i) => (
            <li key={s} className="flex gap-2">
              <span className="w-4 text-slate-400">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const ACTIVITY_ICON: Record<ActivityEvent["kind"], LucideIcon> = {
  generated: Sparkles,
  source: Database,
  edit: PenLine,
  regenerate: RefreshCw,
  ready: ClipboardCheck,
  permission: MessageSquareQuote,
  activated: Power,
  deactivated: PauseCircle,
  invite: Send,
  visit: Eye,
  reminder: Clock,
  registered: BadgeCheck,
  transcript: Newspaper,
  link: Link2,
  note: MessageSquareQuote,
};

export function ActivityPanel({ p }: { p: Profile }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
      <ol className="space-y-0">
        {p.activity.map((e, i) => {
          const Icon = ACTIVITY_ICON[e.kind] ?? Sparkles;
          return (
            <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < p.activity.length - 1 && <span className="absolute left-[13px] top-8 h-[calc(100%-1.75rem)] w-px bg-slate-200" />}
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[13px] leading-snug text-navy-950">{e.message}</p>
                <p className="mt-0.5 text-[11.5px] text-slate-400">
                  {e.actor} · {timeAgo(e.at)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

