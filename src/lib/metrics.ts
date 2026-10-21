import { milestoneIndex } from "@/lib/stage";
import type { Profile, UpcomingInterview } from "@/lib/types";
import { hoursBetween, median, pct } from "@/lib/utils";

export type KpiStatus = "on_track" | "below" | "no_data" | "progress";

export interface Kpi {
  key: string;
  label: string;
  value: string;
  detail: string;
  target: string;
  /** 0–1 fill for the meter, and where the target sits on it. */
  meter: number | null;
  targetAt: number | null;
  status: KpiStatus;
}

export const PILOT_TARGET = 20;

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function computeMetrics(profiles: Profile[], upcoming: UpcomingInterview[]) {
  const now = Date.now();
  const total = Math.max(PILOT_TARGET, profiles.length + upcoming.length);
  const generated = profiles.length;
  const noManual = profiles.filter((p) => !p.metrics.manualResearch).length;
  const past = profiles.filter((p) => new Date(p.interviewAt).getTime() < now);
  const readyBefore = past.filter((p) => p.metrics.readyBeforeInterview).length;
  const invited = profiles.filter((p) => p.invite.sentAt);
  const speeds = invited
    .map((p) => hoursBetween(p.permission.at ?? p.activatedAt, p.invite.sentAt))
    .filter((h): h is number => h != null && h >= 0);
  const medSpeed = median(speeds);
  const within6 = speeds.filter((h) => h <= 6).length;
  const within24 = speeds.filter((h) => h <= 24).length;
  const visited = invited.filter((p) => p.invite.openedAt).length;
  const registered = invited.filter((p) => p.invite.registeredAt).length;
  const reviewed = profiles.filter((p) => p.status !== "draft");
  const minorOnly = reviewed.filter((p) => p.metrics.editCount <= 3).length;
  const before = avg(profiles.map((p) => p.metrics.reviewMinutesBefore).filter((x): x is number => x != null));
  const after = avg(profiles.map((p) => p.metrics.reviewMinutesAfter).filter((x): x is number => x != null));

  const rate = (n: number, d: number, target: number, label: string, key: string, detail: string, targetLabel: string): Kpi => {
    const v = pct(n, d);
    return {
      key,
      label,
      value: v == null ? "—" : `${v}%`,
      detail,
      target: targetLabel,
      meter: v == null ? null : v / 100,
      targetAt: target / 100,
      status: v == null ? "no_data" : v >= target ? "on_track" : "below",
    };
  };

  const kpis: Kpi[] = [
    {
      key: "pilot",
      label: "Pilot progress",
      value: `${generated} of ${PILOT_TARGET}`,
      detail: upcoming.length ? `${upcoming.length} scheduled interview${upcoming.length === 1 ? "" : "s"} still to generate` : "Every scheduled interview has a profile",
      target: `Pilot target · ${PILOT_TARGET} CEOs`,
      meter: Math.min(1, generated / PILOT_TARGET),
      targetAt: null,
      status: generated >= PILOT_TARGET ? "on_track" : "progress",
    },
    rate(noManual, generated, 90, "Generation completion", "generation", `${noManual} of ${generated} without manual research`, "Target ≥ 90%"),
    rate(readyBefore, past.length, 90, "Draft readiness", "readiness", `${readyBefore} of ${past.length} ready before the interview`, "Target ≥ 90%"),
    {
      key: "speed",
      label: "Invitation speed",
      value: medSpeed == null ? "—" : `${medSpeed < 10 ? medSpeed.toFixed(1) : Math.round(medSpeed)} h`,
      detail: speeds.length ? `Median · ${within6} of ${speeds.length} within 6 h, ${within24} within 1 business day` : "No invitations sent yet",
      target: "Aim 6 h · max 1 business day",
      meter: speeds.length ? within24 / speeds.length : null,
      targetAt: 1,
      status: medSpeed == null ? "no_data" : medSpeed <= 6 && within24 === speeds.length ? "on_track" : "below",
    },
    rate(visited, invited.length, 60, "Profile visit rate", "visits", `${visited} of ${invited.length} invited CEOs opened their link`, "Target ≥ 60%"),
    rate(registered, invited.length, 60, "Registration rate", "registration", `${registered} of ${invited.length} invited CEOs registered`, "Aim 60%"),
    rate(minorOnly, reviewed.length, 80, "Profile quality", "quality", `${minorOnly} of ${reviewed.length} needed minor edits only`, "Target ≥ 80%"),
    {
      key: "review",
      label: "Manual review time",
      value: before == null ? "—" : `${Math.round(before)} / ${after == null ? "—" : Math.round(after)} min`,
      detail: "Average before / after the interview",
      target: "10 min before · 5 min after",
      meter: before == null ? null : Math.min(1, 10 / Math.max(before, 1)),
      targetAt: null,
      status: before == null ? "no_data" : before <= 10 && (after == null || after <= 5) ? "on_track" : "below",
    },
  ];

  const funnel = [
    { label: "Profiles generated", value: generated },
    { label: "Reviewed before interview", value: profiles.filter((p) => milestoneIndex(p) >= 1).length },
    { label: "Permission: yes", value: profiles.filter((p) => p.permission.value === "yes").length },
    { label: "Activated", value: profiles.filter((p) => p.activatedAt).length },
    { label: "Invitation sent", value: invited.length },
    { label: "Profile visited", value: visited },
    { label: "Registered", value: registered },
  ];

  return { kpis, funnel, total, generated, registered, invited: invited.length };
}
