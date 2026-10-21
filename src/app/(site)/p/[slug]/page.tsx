"use client";

import { ArrowRight, Lock, MessageSquare, PencilLine, ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ProfileView } from "@/components/profile/profile-view";
import { SignInDialog } from "@/components/site/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STAGE_META, stageOf } from "@/lib/stage";
import { useApp } from "@/lib/store";
import type { Profile } from "@/lib/types";
import { firstName, timeAgo } from "@/lib/utils";

// One visit per profile per page load (guards StrictMode double effects).
const counted = new Set<string>();

function Unavailable({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-navy-950 text-gold-300">
        <Lock className="size-6" />
      </div>
      <h1 className="display mt-6 text-3xl text-navy-950">{title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{body}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {children ?? (
          <Button asChild variant="secondary">
            <Link href="/directory">Back to the directory</Link>
          </Button>
        )}
      </div>
    </main>
  );
}

function related(all: Profile[], p: Profile) {
  return all
    .filter((x) => x.id !== p.id && x.status === "active")
    .map((x) => ({ x, score: (x.industry === p.industry ? 2 : 0) + (x.country === p.country ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.x);
}

export default function ProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const profiles = useApp((s) => s.profiles);
  const persona = useApp((s) => s.persona);
  const memberId = useApp((s) => s.memberId);
  const policy = useApp((s) => s.settings.activationPolicy);
  const recordVisit = useApp((s) => s.recordVisit);
  const [signIn, setSignIn] = useState(false);

  const p = useMemo(() => profiles.find((x) => x.slug === slug), [profiles, slug]);
  const viaInvite = !!p && search.get("invite") === p.invite.token;
  const others = useMemo(() => (p ? related(profiles, p) : []), [profiles, p]);

  useEffect(() => {
    if (!p || persona === "director" || counted.has(p.id)) return;
    counted.add(p.id);
    recordVisit(p.id, viaInvite);
  }, [p, persona, viaInvite, recordVisit]);

  if (!p) return <Unavailable title="Profile not found" body="This link doesn't match a profile in the CEO Network." />;

  const first = firstName(p.fullName);
  const isSelf = persona === "member" && memberId === p.id;
  const live = p.status === "active";

  /* TRC staff see every state, with the live status spelled out. */
  if (persona === "director") {
    const meta = STAGE_META[stageOf(p)];
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <title>{`${p.fullName} · CEO Network`}</title>
        <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-navy-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="size-5 text-gold-300" />
            <span>
              TRC staff view · <Badge tone={meta.tone}>{meta.label}</Badge>{" "}
              <span className="text-white/60">{live ? "This URL is live to verified members." : "This URL is inactive — members cannot open it."}</span>
            </span>
          </div>
          <Button asChild variant="inverse" size="sm">
            <Link href={`/admin/profiles/${p.id}`}>
              Open in console <ArrowRight />
            </Link>
          </Button>
        </div>
        <ProfileView profile={p} mode={live ? "member" : "preview"} related={others} />
      </main>
    );
  }

  /* The CEO (or delegate) arriving from the invitation link. */
  if (viaInvite && p.invite.status !== "registered") {
    const usable = p.permission.value === "yes" && p.status !== "deactivated" && (live || policy === "consent");
    if (!usable)
      return (
        <Unavailable
          title="This invitation isn't active yet"
          body={`Your profile is still being prepared. TRC will email you as soon as it is ready — or contact ${p.projectDirector}, your Project Director.`}
        />
      );
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <title>{`Your profile · CEO Network`}</title>
        <div className="mb-6 overflow-hidden rounded-2xl bg-navy-950 text-white">
          <div className="grain relative flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="eyebrow text-gold-300">Invitation from TRC</p>
              <p className="display mt-2 text-2xl sm:text-[1.75rem]">Welcome, {first}. Your CEO Network profile is ready.</p>
              <p className="mt-1.5 max-w-xl text-sm text-white/65">
                {live
                  ? "As agreed at the end of your interview, your profile is visible to verified members. Join to confirm it and access the directory."
                  : "Review your profile below. It goes live to verified members only when you accept the privacy and membership terms."}
              </p>
            </div>
            <Button asChild variant="gold" size="lg" className="shrink-0">
              <Link href={`/join/${p.slug}?invite=${p.invite.token}`}>
                Accept invitation <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
        <ProfileView
          profile={p}
          mode="preview"
          showAside={false}
          actions={
            <Button asChild>
              <Link href={`/join/${p.slug}?invite=${p.invite.token}`}>
                <UserPlus /> Request to join
              </Link>
            </Button>
          }
        />
      </main>
    );
  }

  if (!live) {
    return (
      <Unavailable
        title="This profile isn't available"
        body="The profile may not be published yet, or it has been withdrawn. Only active profiles are visible in the CEO Network."
      />
    );
  }

  if (persona === "guest") {
    return (
      <>
        <Unavailable title={`${p.fullName}'s profile is for members`} body="Profiles in the CEO Network are visible to verified members only. If this is your profile, please use the personal link in your invitation email.">
          <Button onClick={() => setSignIn(true)}>Sign in</Button>
          <Button variant="secondary" asChild>
            <Link href="/#how">How membership works</Link>
          </Button>
        </Unavailable>
        <SignInDialog open={signIn} onOpenChange={setSignIn} />
      </>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <title>{`${p.fullName} · CEO Network`}</title>
      {isSelf && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-gold-50 px-5 py-4 ring-1 ring-inset ring-gold-200 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gold-900">
            <span className="font-semibold">This is your profile.</span> It is visible to verified members only
            {p.invite.registeredAt ? ` — you joined ${timeAgo(p.invite.registeredAt)}.` : "."}
          </p>
          <Button variant="secondary" size="sm" onClick={() => toast.success("Change request sent to TRC", { description: `${p.projectDirector} will update your profile and confirm by email.` })}>
            <PencilLine /> Request a change
          </Button>
        </div>
      )}
      <ProfileView
        profile={p}
        related={others}
        actions={
          !isSelf && (
            <>
              <Button onClick={() => toast("Connections arrive with the social features", { description: "Shown here as a preview of the next release." })}>
                <UserPlus /> Connect
              </Button>
              <Button variant="secondary" onClick={() => router.push("/messages")}>
                <MessageSquare /> Message
              </Button>
            </>
          )
        }
      />
    </main>
  );
}
