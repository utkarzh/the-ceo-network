"use client";

import { ArrowLeft, ArrowRight, Check, ChevronDown, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GoogleG, Logo, Seal } from "@/components/brand";
import { Avatar, Portrait } from "@/components/profile/portrait";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/overlay";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/primitives";
import { useApp } from "@/lib/store";
import type { Profile } from "@/lib/types";
import { cn, firstName } from "@/lib/utils";

const STEPS = ["Verify identity", "Review profile", "Accept terms"] as const;
const counted = new Set<string>();

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  return (
    <div className="flex gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            const next = (value.slice(0, i) + d + value.slice(i + 1)).slice(0, 6);
            onChange(next);
            if (d && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (digits) {
              e.preventDefault();
              onChange(digits);
              refs.current[Math.min(digits.length, 5)]?.focus();
            }
          }}
          className="size-12 rounded-xl text-center text-lg font-semibold text-navy-950 outline-none ring-1 ring-inset ring-slate-200 transition focus:ring-2 focus:ring-navy-400"
        />
      ))}
    </div>
  );
}

export default function JoinPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const profiles = useApp((s) => s.profiles);
  const policy = useApp((s) => s.settings.activationPolicy);
  const register = useApp((s) => s.register);
  const recordVisit = useApp((s) => s.recordVisit);
  const setPersona = useApp((s) => s.setPersona);
  const p = useMemo(() => profiles.find((x) => x.slug === slug), [profiles, slug]);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [delegate, setDelegate] = useState(false);
  const [delegateName, setDelegateName] = useState("");
  const [delegateRole, setDelegateRole] = useState("Executive Assistant");
  const [method, setMethod] = useState<"google" | "email" | null>(null);
  const [email, setEmail] = useState(p?.invite.recipient ?? "");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [looksGood, setLooksGood] = useState(true);
  const [change, setChange] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!p || counted.has(p.id)) return;
    counted.add(p.id);
    recordVisit(p.id, true);
  }, [p, recordVisit]);

  if (!p) {
    return (
      <Shell>
        <h1 className="display text-3xl text-navy-950">Invitation not found</h1>
        <p className="mt-2 text-slate-600">This invitation link is not valid. Please use the link in your email from TRC.</p>
      </Shell>
    );
  }

  const first = firstName(p.fullName);
  const usable = p.permission.value === "yes" && p.status !== "deactivated" && (p.status === "active" || policy === "consent");
  const registered = p.invite.status === "registered";

  if (!usable && !registered) {
    return (
      <Shell profile={p}>
        <h1 className="display text-3xl text-navy-950">This invitation isn&apos;t active</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          Your profile is not ready to publish yet. {p.projectDirector}, your Project Director at TRC, will be in touch.
        </p>
      </Shell>
    );
  }

  if (done || registered) {
    return (
      <Shell profile={p}>
        <div className="animate-rise">
          <div className="grid size-16 place-items-center rounded-2xl bg-gold-50 ring-1 ring-gold-200">
            <Seal className="size-9" tip={false} />
          </div>
          <h1 className="display mt-6 text-[2.4rem] leading-tight text-navy-950">Welcome to the CEO Network, {first}.</h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-600">
            {p.status === "active"
              ? "Your profile is live in the verified member directory. TRC will add your interview to your profile as soon as it is published."
              : "Your registration is complete. Your profile will appear in the directory shortly."}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Button size="lg" onClick={() => router.push(`/p/${p.slug}`)}>
              View my profile <ArrowRight />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => router.push("/directory")}>
              Explore the directory
            </Button>
          </div>
          {registered && !done && <p className="mt-6 text-sm text-slate-500">You have already accepted this invitation.</p>}
        </div>
      </Shell>
    );
  }

  const delegateOk = !delegate || delegateName.trim().length > 1;

  const verifyEmail = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setMethod("email");
      setStep(1);
    }, 700);
  };

  const finish = () => {
    setSubmitting(true);
    setTimeout(() => {
      register(p.id, {
        method: method ?? "email",
        email,
        delegate: delegate ? { name: delegateName.trim(), role: delegateRole } : null,
        marketing,
        changeRequest: looksGood ? undefined : change,
      });
      setPersona("member", p.id);
      setSubmitting(false);
      setDone(true);
    }, 900);
  };

  return (
    <Shell profile={p}>
      <ol className="mb-10 flex items-center gap-2 text-[13px]">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-[11px] font-semibold",
                i < step ? "bg-emerald-600 text-white" : i === step ? "bg-navy-950 text-white" : "bg-slate-100 text-slate-400",
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("hidden sm:inline", i === step ? "font-medium text-navy-950" : "text-slate-400")}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-200 sm:w-10" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="animate-rise">
          <h1 className="display text-[2.2rem] leading-tight text-navy-950">Welcome, {first}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">Confirm it&apos;s you to open your CEO Network profile. This takes about a minute.</p>

          <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
            <Checkbox checked={delegate} onChange={(e) => setDelegate(e.target.checked)} className="mt-0.5" />
            <span className="text-sm">
              <span className="font-medium text-navy-950">I&apos;m registering on behalf of {p.fullName}</span>
              <span className="mt-0.5 block text-slate-500">For executive assistants, chiefs of staff and communications teams.</span>
            </span>
          </label>
          {delegate && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Your name" required>
                <Input value={delegateName} onChange={(e) => setDelegateName(e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Your role">
                <Input value={delegateRole} onChange={(e) => setDelegateRole(e.target.value)} />
              </Field>
            </div>
          )}

          <div className="mt-7 space-y-3">
            <Button variant="secondary" size="lg" className="w-full" disabled={!delegateOk} onClick={() => setGoogleOpen(true)}>
              <GoogleG className="size-5" /> Continue with Google
            </Button>
            <div className="flex items-center gap-3 py-1 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> or use a verified email <span className="h-px flex-1 bg-slate-200" />
            </div>
            {!codeSent ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="h-12" />
                <Button size="lg" disabled={!email.includes("@") || !delegateOk} onClick={() => setCodeSent(true)}>
                  <Mail /> Send code
                </Button>
              </div>
            ) : (
              <div className="rounded-xl p-4 ring-1 ring-inset ring-slate-200">
                <p className="text-sm text-slate-600">
                  We sent a 6-digit code to <span className="font-medium text-navy-950">{email}</span>.
                </p>
                <div className="mt-4">
                  <OtpInput value={code} onChange={setCode} />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Button disabled={code.length < 6} loading={verifying} onClick={verifyEmail}>
                    Verify email
                  </Button>
                  <button className="text-[13px] text-slate-500 hover:text-navy-900" onClick={() => setCode("482913")}>
                    Demo: fill code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-rise">
          <h1 className="display text-[2.2rem] leading-tight text-navy-950">Review your profile</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">TRC prepared this from your interview and its own reporting. You can request changes at any time.</p>
          <div className="mt-7 rounded-2xl p-5 ring-1 ring-inset ring-slate-200">
            <div className="flex items-center gap-4">
              <Avatar profile={p} size="2xl" className="rounded-2xl" />
              <div>
                <p className="font-serif text-2xl text-navy-950">{p.fullName}</p>
                <p className="text-sm text-slate-600">
                  {p.designation}, {p.company}
                </p>
                <p className="text-sm text-slate-500">{p.country}</p>
              </div>
            </div>
            <p className="mt-5 text-[14.5px] leading-relaxed text-slate-700">{p.intro}</p>
            <p className="mt-4 text-[13px] text-slate-500">
              Also shown: company overview, {p.links.filter((l) => l.status === "confirmed").length} TRC articles and reports, and your industry and location.
            </p>
            <Link href={`/p/${p.slug}?invite=${p.invite.token}`} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-link">
              Open the full preview <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-6 space-y-2">
            {[
              { v: true, label: "Yes, this looks right" },
              { v: false, label: "I'd like to request a change" },
            ].map((o) => (
              <label key={String(o.v)} className={cn("flex cursor-pointer items-center gap-3 rounded-xl p-3.5 ring-1 ring-inset transition", looksGood === o.v ? "bg-navy-50/60 ring-navy-300" : "ring-slate-200 hover:ring-slate-300")}>
                <input type="radio" name="review" checked={looksGood === o.v} onChange={() => setLooksGood(o.v)} className="accent-navy-800" />
                <span className="text-sm font-medium text-navy-950">{o.label}</span>
              </label>
            ))}
            {!looksGood && (
              <Textarea rows={3} value={change} onChange={(e) => setChange(e.target.value)} placeholder="Tell TRC what to change — for example, an updated title or a different photograph." />
            )}
          </div>
          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft /> Back
            </Button>
            <Button size="lg" disabled={!looksGood && change.trim().length < 3} onClick={() => setStep(2)}>
              Continue <ArrowRight />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-rise">
          <h1 className="display text-[2.2rem] leading-tight text-navy-950">Privacy and membership</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            {p.status === "active"
              ? "Your profile is visible to verified members, as agreed at the end of your interview. Please confirm the terms to complete your membership."
              : "Your profile goes live to verified members only once you accept these terms."}
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { t: "What is shared", d: "Name, title, company, country, the introduction and links to TRC coverage." },
              { t: "Who can see it", d: "Verified CEO Network members only. Not search engines or the public." },
              { t: "Your control", d: "Request changes, pause or remove your profile at any time." },
            ].map((x) => (
              <li key={x.t} className="rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/80">
                <p className="text-[13px] font-semibold text-navy-950">{x.t}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{x.d}</p>
              </li>
            ))}
          </ul>
          <details className="group mt-4 rounded-xl ring-1 ring-inset ring-slate-200">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-navy-950">
              Read the privacy notice summary
              <ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" />
            </summary>
            <div className="space-y-2 border-t border-slate-100 px-4 py-3 text-[13px] leading-relaxed text-slate-600">
              <p>TRC processes your profile data to operate the CEO Network, on the basis of your consent. Data is held on secure servers and is never sold.</p>
              <p>You may withdraw consent at any time; your profile is then removed from member access and deleted on request. Contact {p.projectDirector} or privacy@trc.com.</p>
            </div>
          </details>
          <div className="mt-6 space-y-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
              <Checkbox checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5" />
              <span>
                I accept the <span className="font-medium text-navy-950 underline decoration-slate-300 underline-offset-2">CEO Network membership terms</span>.
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
              <Checkbox checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5" />
              <span>I have read the privacy notice and consent to TRC publishing my profile to verified members and processing my data for the CEO Network.</span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-500">
              <Checkbox checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5" />
              <span>Optional — send me occasional updates about TRC reports and events.</span>
            </label>
          </div>
          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft /> Back
            </Button>
            <Button size="lg" variant="gold" disabled={!terms || !privacy} loading={submitting} onClick={finish}>
              {p.status === "active" ? "Accept and join" : "Accept and publish my profile"}
            </Button>
          </div>
        </div>
      )}

      <Modal open={googleOpen} onOpenChange={setGoogleOpen} size="sm" title="Choose an account" description="to continue to CEO Network (demo sign-in)">
        <div className="space-y-1.5 pb-2">
          {[p.invite.recipient ?? `${p.slug.split("-")[0]}@gmail.com`, delegate ? `${(delegateName || "assistant").split(" ")[0].toLowerCase()}@${(p.invite.recipient ?? "@company.com").split("@")[1]}` : null]
            .filter(Boolean)
            .map((acct) => (
              <button
                key={acct}
                onClick={() => {
                  setEmail(acct!);
                  setMethod("google");
                  setGoogleOpen(false);
                  setStep(1);
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50"
              >
                <span className="grid size-9 place-items-center rounded-full bg-navy-900 text-sm font-semibold text-white">{acct![0].toUpperCase()}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-navy-950">{acct === p.invite.recipient || !delegate ? p.fullName : delegateName || "Assistant"}</span>
                  <span className="block truncate text-xs text-slate-500">{acct}</span>
                </span>
              </button>
            ))}
        </div>
      </Modal>
    </Shell>
  );
}

function Shell({ profile, children }: { profile?: Profile; children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <title>Join the CEO Network</title>
      <aside className="relative hidden overflow-hidden bg-navy-950 text-white lg:block">
        <div className="grain absolute inset-0" />
        <div className="relative flex h-full flex-col p-10 xl:p-14">
          <Logo href="/" />
          {profile && (
            <div className="mt-16 max-w-sm">
              <p className="eyebrow text-gold-300">Your invitation from TRC</p>
              <div className="mt-5 overflow-hidden rounded-2xl bg-white text-navy-950 shadow-pop">
                <Portrait profile={profile} className="aspect-[16/11] w-full" sizes="380px" />
                <div className="p-5">
                  <p className="font-serif text-2xl">{profile.fullName}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {profile.designation} · {profile.company}
                  </p>
                </div>
              </div>
            </div>
          )}
          <ul className="mt-10 max-w-sm space-y-3 text-sm text-white/75">
            {["A verified profile, prepared for you by TRC", "Access to the private directory of leaders featured in TRC reports", "Published only with your permission — change or remove it any time"].map((t) => (
              <li key={t} className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-300" />
                {t}
              </li>
            ))}
          </ul>
          {profile && <p className="mt-auto pt-10 text-xs text-white/40">Questions? Contact {profile.projectDirector}, your Project Director at TRC.</p>}
        </div>
      </aside>
      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-10 lg:px-16 lg:py-14">
        <div className="mb-10 lg:hidden">
          <div className="inline-flex rounded-xl bg-navy-950 px-3 py-2">
            <Logo href="/" />
          </div>
        </div>
        <div className="mx-auto w-full max-w-xl flex-1">{children}</div>
      </main>
    </div>
  );
}
