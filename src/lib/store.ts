"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CURRENT_USER } from "@/lib/data/reference";
import { createSeed } from "@/lib/data/seed";
import { seedPosts, type Post } from "@/lib/data/social";
import { INTRO_STYLES, writeIntro } from "@/lib/engine";
import type {
  ActivityEvent,
  Persona,
  PermissionValue,
  Profile,
  Pronouns,
  Settings,
  SuggestedLink,
  TranscriptSuggestion,
  TrcItem,
  UpcomingInterview,
} from "@/lib/types";
import { HOUR, uid } from "@/lib/utils";

export type EditableField =
  | "fullName"
  | "designation"
  | "company"
  | "country"
  | "industry"
  | "shortName"
  | "intro"
  | "companyAbout"
  | "website";

const FIELD_LABEL: Record<EditableField, string> = {
  fullName: "full name",
  designation: "designation",
  company: "company",
  country: "country",
  industry: "industry",
  shortName: "name used in text",
  intro: "introduction",
  companyAbout: "company overview",
  website: "website",
};

export const DEFAULT_SETTINGS: Settings = {
  activationPolicy: "verbal",
  reminderEnabled: true,
  inviteSubject: "Your profile in the CEO Network is ready",
  inviteBody: `Dear {firstName},

Thank you for your time today. As discussed at the end of our interview, we have prepared your profile for the CEO Network — TRC's private, verified directory of the leaders featured in our reports.

You can view your profile and complete your registration here:
{link}

Registration takes about a minute: sign in with Google or a verified email address and accept the privacy and membership terms. Your profile is visible only to verified members, and you can ask us to change or remove it at any time.

With best regards,
{sender}
Project Director, TRC`,
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const minutesSince = (iso?: string) => (iso ? Math.round((Date.now() - new Date(iso).getTime()) / 60_000) : 0);

function log(p: Profile, kind: ActivityEvent["kind"], message: string, actor: string = CURRENT_USER.name) {
  const at = new Date().toISOString();
  p.activity = [{ id: uid("a_"), at, actor, kind, message }, ...p.activity].slice(0, 80);
  p.updatedAt = at;
}

function initialData() {
  const now = Date.now();
  const { profiles, upcoming } = createSeed(now);
  return { profiles, upcoming, posts: seedPosts(now), seededAt: now };
}

export interface RegistrationInput {
  method: "google" | "email";
  email: string;
  delegate: { name: string; role: string } | null;
  marketing: boolean;
  changeRequest?: string;
}

interface AppState {
  profiles: Profile[];
  upcoming: UpcomingInterview[];
  settings: Settings;
  persona: Persona;
  memberId: string | null;
  posts: Post[];
  joinedGroups: string[];
  seededAt: number;

  addProfile: (p: Profile, upcomingId?: string) => void;
  mutate: (id: string, fn: (p: Profile) => void) => void;
  editField: (id: string, field: EditableField, value: string) => void;
  setPronouns: (id: string, pronouns: Pronouns) => void;
  regenerateIntro: (id: string) => void;
  undoIntro: (id: string) => void;
  setLinkStatus: (id: string, itemId: string, status: SuggestedLink["status"]) => void;
  resolveConflict: (id: string, conflictId: string, choice: "entered" | "found") => void;
  addFact: (id: string, label: string, value: string) => void;
  removeFact: (id: string, factId: string) => void;
  setPhoto: (id: string, photo: { src?: string; useInitials: boolean; source?: "trc" | "upload" }) => void;
  markReady: (id: string) => void;
  recordPermission: (id: string, value: PermissionValue, note?: string) => void;
  activate: (id: string) => void;
  deactivate: (id: string, reason?: string) => void;
  reactivate: (id: string) => void;
  sendInvite: (id: string, recipient: string, recipientName: string) => void;
  recordVisit: (id: string, viaInvite: boolean) => void;
  sendReminder: (id: string) => void;
  register: (id: string, input: RegistrationInput) => void;
  uploadTranscript: (id: string, fileName: string, text?: string) => void;
  setTranscriptApproved: (id: string, approved: boolean) => void;
  applyTranscript: (id: string, accepted: TranscriptSuggestion[]) => void;
  setCurrentInterview: (id: string, item?: TrcItem) => void;

  setPersona: (persona: Persona, memberId?: string | null) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addPost: (text: string) => void;
  toggleReaction: (postId: string) => void;
  toggleGroup: (groupId: string) => void;
  reset: () => void;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      const mutate = (id: string, fn: (p: Profile) => void) =>
        set((s) => ({
          profiles: s.profiles.map((p) => {
            if (p.id !== id) return p;
            const next = structuredClone(p);
            fn(next);
            return next;
          }),
        }));

      return {
        ...initialData(),
        settings: DEFAULT_SETTINGS,
        persona: "director",
        memberId: null,
        joinedGroups: [],

        addProfile: (p, upcomingId) =>
          set((s) => ({ profiles: [p, ...s.profiles], upcoming: upcomingId ? s.upcoming.filter((u) => u.id !== upcomingId) : s.upcoming })),

        mutate,

        editField: (id, field, value) =>
          mutate(id, (p) => {
            if (p[field] === value) return;
            if (field === "intro") p.introHistory = [p.intro, ...p.introHistory].slice(0, 6);
            p[field] = value;
            if (field === "company" || field === "designation" || field === "country" || field === "industry" || field === "website") {
              p.fieldSources[field] = "editor";
            }
            if (field === "companyAbout") p.fieldSources.about = "editor";
            p.metrics.editCount += 1;
            p.missing = p.missing.filter((m) => !(field === "industry" && m.startsWith("Industry")) && !(field === "website" && m === "Official website"));
            log(p, "edit", `Edited ${FIELD_LABEL[field]}.`);
          }),

        setPronouns: (id, pronouns) =>
          mutate(id, (p) => {
            p.pronouns = pronouns;
            log(p, "edit", `Introduction references set to ${pronouns === "name" ? "name only" : pronouns}.`);
          }),

        regenerateIntro: (id) =>
          mutate(id, (p) => {
            p.introHistory = [p.intro, ...p.introHistory].slice(0, 6);
            p.introVariant = (p.introVariant + 1) % INTRO_STYLES.length;
            p.intro = writeIntro(p, p.introVariant);
            log(p, "regenerate", `Introduction regenerated (${INTRO_STYLES[p.introVariant]} style). Approved details kept.`);
          }),

        undoIntro: (id) =>
          mutate(id, (p) => {
            const [prev, ...rest] = p.introHistory;
            if (!prev) return;
            p.intro = prev;
            p.introHistory = rest;
            log(p, "edit", "Restored the previous introduction.");
          }),

        setLinkStatus: (id, itemId, status) =>
          mutate(id, (p) => {
            const link = p.links.find((l) => l.item.id === itemId);
            if (!link) return;
            link.status = status;
            const verb = status === "confirmed" ? "Confirmed" : status === "removed" ? "Removed" : "Restored";
            log(p, "link", `${verb} TRC link “${link.item.title}”.`);
          }),

        resolveConflict: (id, conflictId, choice) =>
          mutate(id, (p) => {
            const c = p.conflicts.find((x) => x.id === conflictId);
            if (!c) return;
            c.resolved = choice;
            if (choice === "found") {
              p[c.field] = c.found;
              p.fieldSources[c.field] = c.source;
            }
            log(p, "edit", `${c.label} conflict resolved — kept ${choice === "entered" ? `entered value “${c.entered}”` : `HubSpot value “${c.found}”`}.`);
          }),

        addFact: (id, label, value) =>
          mutate(id, (p) => {
            p.facts.push({ id: uid("f_"), label, value, source: "editor" });
            p.metrics.editCount += 1;
            log(p, "edit", `Added company fact “${label}”.`);
          }),

        removeFact: (id, factId) =>
          mutate(id, (p) => {
            const f = p.facts.find((x) => x.id === factId);
            p.facts = p.facts.filter((x) => x.id !== factId);
            p.metrics.editCount += 1;
            if (f) log(p, "edit", `Removed company fact “${f.label}”.`);
          }),

        setPhoto: (id, { src, useInitials, source }) =>
          mutate(id, (p) => {
            if (src !== undefined) {
              p.photo = src;
              p.photoSource = source;
            }
            p.useInitials = useInitials || !p.photo;
            log(p, "edit", useInitials ? "Image set to initials avatar." : source === "upload" ? "Approved photograph uploaded." : "Image set to approved TRC photograph.");
          }),

        markReady: (id) =>
          mutate(id, (p) => {
            const now = new Date().toISOString();
            p.status = "ready";
            p.readyAt = now;
            p.metrics.readyBeforeInterview = Date.now() < new Date(p.interviewAt).getTime();
            p.metrics.reviewMinutesBefore ??= clamp(minutesSince(p.createdAt), 1, 30);
            log(p, "ready", "Saved and marked ready for permission. The URL remains inactive.");
          }),

        recordPermission: (id, value, note) =>
          mutate(id, (p) => {
            p.permission = { value, by: CURRENT_USER.name, at: new Date().toISOString(), note: note?.trim() || undefined };
            if (p.status === "draft") p.status = "ready";
            const label = value === "yes" ? "Yes" : value === "ask_later" ? "Ask later" : "No";
            log(p, "permission", `Verbal response recorded: ${label}.${value === "no" ? " The URL stays inactive." : ""}`);
          }),

        activate: (id) =>
          mutate(id, (p) => {
            if (p.permission.value !== "yes") return;
            p.status = "active";
            p.activatedAt = new Date().toISOString();
            p.deactivatedAt = undefined;
            p.metrics.reviewMinutesAfter ??= clamp(minutesSince(p.permission.at), 1, 20);
            log(p, "activated", "Profile activated — the same URL is now live to verified members.");
          }),

        deactivate: (id, reason) =>
          mutate(id, (p) => {
            p.status = "deactivated";
            p.deactivatedAt = new Date().toISOString();
            log(p, "deactivated", `Profile deactivated${reason ? ` — ${reason}` : ""}. Record retained.`);
          }),

        reactivate: (id) =>
          mutate(id, (p) => {
            p.status = "active";
            p.deactivatedAt = undefined;
            log(p, "activated", "Profile reactivated.");
          }),

        sendInvite: (id, recipient, recipientName) =>
          mutate(id, (p) => {
            const now = Date.now();
            const resend = p.invite.status !== "not_sent";
            p.invite = {
              ...p.invite,
              status: p.invite.status === "not_sent" ? "sent" : p.invite.status,
              sentAt: new Date(now).toISOString(),
              reminderDueAt: new Date(now + 48 * HOUR).toISOString(),
              reminderSentAt: undefined,
              recipient,
              recipientName,
            };
            log(p, "invite", `${resend ? "Invitation re-sent" : "Invitation sent"} to ${recipient}.`);
          }),

        recordVisit: (id, viaInvite) =>
          mutate(id, (p) => {
            p.visits += 1;
            if (viaInvite && p.invite.status === "sent") {
              p.invite.status = "opened";
              p.invite.openedAt = new Date().toISOString();
              log(p, "visit", "Invitation link opened.", "System");
            }
          }),

        sendReminder: (id) =>
          mutate(id, (p) => {
            p.invite.reminderSentAt = new Date().toISOString();
            log(p, "reminder", "Automatic 48-hour reminder sent (time skipped for the demo).", "System");
          }),

        register: (id, input) => {
          mutate(id, (p) => {
            const now = new Date().toISOString();
            p.invite = {
              ...p.invite,
              status: "registered",
              openedAt: p.invite.openedAt ?? now,
              registeredAt: now,
              method: input.method,
              registeredBy: input.delegate,
              recipient: input.email || p.invite.recipient,
              changeRequest: input.changeRequest?.trim() || undefined,
            };
            p.consent = { acceptedAt: now, marketing: input.marketing };
            const actor = input.delegate ? `${input.delegate.name} (${input.delegate.role}, on behalf)` : p.fullName;
            log(p, "registered", `Registered via ${input.method === "google" ? "Google" : "verified email"} and accepted the privacy and membership terms.`, actor);
            if (input.changeRequest?.trim()) log(p, "note", `Change requested: “${input.changeRequest.trim()}”`, actor);
            if (get().settings.activationPolicy === "consent" && p.status !== "active" && p.permission.value === "yes") {
              p.status = "active";
              p.activatedAt = now;
              log(p, "activated", "Profile activated automatically after the CEO accepted the data-protection terms.", "System");
            }
          });
          set({ persona: "member", memberId: id });
        },

        uploadTranscript: (id, fileName, text) =>
          mutate(id, (p) => {
            p.transcript = { fileName, uploadedAt: new Date().toISOString(), approved: false, text };
            log(p, "transcript", `Transcript uploaded: ${fileName}.`);
          }),

        setTranscriptApproved: (id, approved) =>
          mutate(id, (p) => {
            if (!p.transcript) return;
            p.transcript.approved = approved;
            log(p, "transcript", approved ? "Transcript marked as approved." : "Transcript approval withdrawn.");
          }),

        applyTranscript: (id, accepted) =>
          mutate(id, (p) => {
            if (!p.transcript?.approved) return;
            for (const s of accepted) {
              if (s.kind === "insight") p.insight = s.value;
              if (s.kind === "quote") p.quote = { text: s.value, source: "From the TRC interview" };
              if (s.kind === "fact") p.facts.push({ id: uid("f_"), label: s.label, value: s.value, source: "transcript" });
            }
            if (accepted.some((s) => s.kind === "insight")) {
              p.introHistory = [p.intro, ...p.introHistory].slice(0, 6);
              p.intro = writeIntro(p, p.introVariant);
            }
            p.transcript.appliedAt = new Date().toISOString();
            log(p, "transcript", `Profile updated from the approved transcript (${accepted.length} change${accepted.length === 1 ? "" : "s"}).`);
          }),

        setCurrentInterview: (id, item) =>
          mutate(id, (p) => {
            p.currentInterview = item;
            log(p, "link", item ? `Published interview added: “${item.title}”.` : "Published interview link removed.");
          }),

        setPersona: (persona, memberId) => set((s) => ({ persona, memberId: memberId === undefined ? s.memberId : memberId })),
        updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

        addPost: (text) =>
          set((s) => {
            const me = s.profiles.find((p) => p.id === s.memberId) ?? s.profiles.find((p) => p.invite.status === "registered");
            if (!me) return s;
            const post: Post = { id: uid("post_"), authorSlug: me.slug, at: new Date().toISOString(), text, reactions: 0, comments: 0 };
            return { posts: [post, ...s.posts] };
          }),
        toggleReaction: (postId) =>
          set((s) => ({
            posts: s.posts.map((p) => (p.id === postId ? { ...p, reacted: !p.reacted, reactions: p.reactions + (p.reacted ? -1 : 1) } : p)),
          })),
        toggleGroup: (groupId) =>
          set((s) => ({ joinedGroups: s.joinedGroups.includes(groupId) ? s.joinedGroups.filter((g) => g !== groupId) : [...s.joinedGroups, groupId] })),

        reset: () =>
          set({ ...initialData(), settings: DEFAULT_SETTINGS, persona: "director", memberId: null, joinedGroups: [] }),
      };
    },
    {
      name: "ceo-network-demo",
      version: 1,
      // Only touch storage in the browser (Node 26 warns when its global localStorage is probed).
      storage: createJSONStorage(() => (typeof window === "undefined" ? (undefined as unknown as Storage) : window.localStorage)),
      partialize: (s) => ({
        profiles: s.profiles,
        upcoming: s.upcoming,
        settings: s.settings,
        persona: s.persona,
        memberId: s.memberId,
        posts: s.posts,
        joinedGroups: s.joinedGroups,
        seededAt: s.seededAt,
      }),
    },
  ),
);

/** The member the demo is "signed in" as when viewing member pages. */
export function useCurrentMember() {
  return useApp((s) => {
    if (s.persona !== "member") return undefined;
    return s.profiles.find((p) => p.id === s.memberId) ?? s.profiles.find((p) => p.invite.status === "registered");
  });
}
