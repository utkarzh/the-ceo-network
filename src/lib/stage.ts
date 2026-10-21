import type { Profile } from "@/lib/types";

export type Stage =
  | "draft"
  | "ready"
  | "ask_later"
  | "declined"
  | "approved"
  | "active"
  | "invited"
  | "opened"
  | "registered"
  | "deactivated";

export type Tone = "slate" | "navy" | "gold" | "green" | "amber" | "rose" | "sky" | "violet";

export const STAGE_META: Record<Stage, { label: string; tone: Tone; hint: string }> = {
  draft: { label: "Draft", tone: "slate", hint: "Review the draft before the interview" },
  ready: { label: "Ready for permission", tone: "amber", hint: "Ask for permission at the end of the interview" },
  ask_later: { label: "Ask later", tone: "amber", hint: "Follow up with the CEO" },
  declined: { label: "Declined", tone: "rose", hint: "Not published — record retained" },
  approved: { label: "Permission: yes", tone: "navy", hint: "Final check, then activate" },
  active: { label: "Active", tone: "green", hint: "Send the invitation" },
  invited: { label: "Invited", tone: "sky", hint: "Waiting for the CEO to open the link" },
  opened: { label: "Link opened", tone: "violet", hint: "CEO has visited — registration pending" },
  registered: { label: "Registered", tone: "green", hint: "Member of the CEO Network" },
  deactivated: { label: "Deactivated", tone: "rose", hint: "Removed from member access" },
};

export function stageOf(p: Profile): Stage {
  if (p.status === "deactivated") return "deactivated";
  if (p.invite.status === "registered") return "registered";
  if (p.invite.status === "opened") return "opened";
  if (p.invite.status === "sent") return "invited";
  if (p.status === "active") return "active";
  if (p.permission.value === "no") return "declined";
  if (p.permission.value === "ask_later") return "ask_later";
  if (p.permission.value === "yes") return "approved";
  if (p.status === "ready") return "ready";
  return "draft";
}

export const MILESTONES = ["Generated", "Reviewed", "Permission", "Active", "Invited", "Registered"] as const;

/** Index of the furthest milestone reached (0-based). */
export function milestoneIndex(p: Profile) {
  if (p.invite.status === "registered") return 5;
  if (p.invite.status !== "not_sent") return 4;
  if (p.status === "active" || p.status === "deactivated") return 3;
  if (p.permission.value === "yes") return 2;
  if (p.status === "ready" || p.permission.value !== "pending") return 1;
  return 0;
}

export const FILTERS: { key: string; label: string; match: (s: Stage) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "draft", label: "Draft", match: (s) => s === "draft" },
  { key: "permission", label: "Awaiting permission", match: (s) => s === "ready" || s === "ask_later" || s === "approved" },
  { key: "active", label: "Active", match: (s) => s === "active" || s === "invited" || s === "opened" },
  { key: "registered", label: "Registered", match: (s) => s === "registered" },
  { key: "closed", label: "Declined / deactivated", match: (s) => s === "declined" || s === "deactivated" },
];
