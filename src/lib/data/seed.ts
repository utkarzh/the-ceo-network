import { generateProfile, writeIntro } from "@/lib/engine";
import type { ActivityEvent, Pronouns, Profile, TrcItem, UpcomingInterview } from "@/lib/types";
import { DAY, HOUR, uid } from "@/lib/utils";

const MIN = 60_000;

type Stage = "draft" | "ready" | "yes" | "ask_later" | "no" | "invited" | "opened" | "reminded" | "registered" | "deactivated";

interface Spec {
  fullName: string;
  designation: string;
  company: string;
  country: string;
  report: string;
  pd: string;
  interview: number;
  stage: Stage;
  code: string;
  generatedAt?: number;
  inviteH?: number;
  openH?: number;
  regH?: number;
  edits?: number;
  before?: number;
  after?: number;
  readyBefore?: boolean;
  manual?: boolean;
  visits?: number;
  pronouns?: Pronouns;
  shortName?: string;
  intro?: string;
  variant?: number;
  method?: "google" | "email";
  delegate?: { name: string; role: string };
  quote?: string;
  insight?: string;
  currentInterview?: TrcItem;
  permissionNote?: string;
}

const ALEX_INTRO =
  "As Chief Executive Officer of Northstar Technologies, Alex Morgan leads the company's strategic direction and growth, drawing on extensive experience in technology and global business. He is focused on building high-performing teams, driving innovation and creating long-term value for customers, partners and shareholders. Founded in 2004 and headquartered in London, Northstar Technologies employs around 2,400 people and serves customers in more than 30 countries. Under his leadership, the company has expanded its cloud and data businesses and strengthened its position as a trusted partner for organisations modernising their operations. He has previously contributed to TRC's coverage of global technology, including the Global Technology and Innovation Report.";

function build(spec: Spec, now: number): Profile {
  const iso = (t: number) => new Date(t).toISOString();
  const generatedAt = spec.generatedAt ?? spec.interview - 3 * DAY - 2 * HOUR;
  const { profile: p } = generateProfile(
    {
      fullName: spec.fullName,
      designation: spec.designation,
      company: spec.company,
      country: spec.country,
      interviewAt: iso(spec.interview),
      report: spec.report,
      projectDirector: spec.pd,
    },
    { now: generatedAt, code: spec.code },
  );
  p.id = `p_${spec.code}`; // stable ids keep demo links working across resets
  const events: ActivityEvent[] = [...p.activity];
  const ev = (t: number, actor: string, kind: ActivityEvent["kind"], message: string) => events.push({ id: uid("a_"), at: iso(t), actor, kind, message });

  if (spec.pronouns) p.pronouns = spec.pronouns;
  if (spec.shortName) p.shortName = spec.shortName;
  if (spec.insight) p.insight = spec.insight;
  if (spec.quote) p.quote = { text: spec.quote, source: "From the TRC interview" };
  p.metrics.manualResearch = spec.manual ?? false;
  p.metrics.editCount = spec.edits ?? 1;

  const s = spec.stage;
  const reviewed = s !== "draft";
  const permitted = ["yes", "invited", "opened", "reminded", "registered", "deactivated"].includes(s);
  const invited = ["invited", "opened", "reminded", "registered", "deactivated"].includes(s);
  const opened = ["opened", "reminded", "registered", "deactivated"].includes(s);

  if (reviewed) {
    p.links = p.links.map((l) => ({ ...l, status: "confirmed" as const }));
    p.conflicts = p.conflicts.map((c) => ({ ...c, resolved: "entered" as const }));
    const readyAt = spec.readyBefore === false ? spec.interview + 2 * HOUR : Math.min(generatedAt + 5 * HOUR, spec.interview - HOUR);
    p.status = "ready";
    p.readyAt = iso(readyAt);
    p.metrics.readyBeforeInterview = readyAt < spec.interview;
    p.metrics.reviewMinutesBefore = spec.before ?? 9;
    if (p.links.length) ev(readyAt - 4 * MIN, spec.pd, "link", `Confirmed ${p.links.length} TRC link${p.links.length > 1 ? "s" : ""}.`);
    ev(readyAt, spec.pd, "ready", "Saved and marked ready for permission.");
  }

  const permAt = spec.interview + 55 * MIN;
  if (permitted) {
    p.permission = { value: "yes", by: spec.pd, at: iso(permAt), note: spec.permissionNote ?? "Agreed at the end of the interview." };
    ev(permAt, spec.pd, "permission", "Verbal permission recorded: Yes.");
  } else if (s === "ask_later") {
    p.permission = { value: "ask_later", by: spec.pd, at: iso(permAt), note: spec.permissionNote ?? "Wants to discuss with the communications team first." };
    ev(permAt, spec.pd, "permission", "Response recorded: Ask later.");
  } else if (s === "no") {
    p.permission = { value: "no", by: spec.pd, at: iso(permAt), note: spec.permissionNote ?? "Prefers not to join at this stage." };
    ev(permAt, spec.pd, "permission", "Response recorded: No. The URL stays inactive.");
  }

  if (invited) {
    const activatedAt = permAt + 25 * MIN;
    p.status = "active";
    p.activatedAt = iso(activatedAt);
    p.metrics.reviewMinutesAfter = spec.after ?? 4;
    ev(activatedAt, spec.pd, "activated", "Profile activated — now visible to verified members.");

    const sentAt = permAt + (spec.inviteH ?? 3) * HOUR;
    const recipient = p.hubspot.contact?.email ?? `${p.slug.split("-")[0]}@example.com`;
    p.invite = { ...p.invite, status: "sent", sentAt: iso(sentAt), reminderDueAt: iso(sentAt + 48 * HOUR), recipient, recipientName: p.fullName };
    ev(sentAt, spec.pd, "invite", `Invitation sent to ${recipient}.`);

    let openedAt: number | undefined;
    if (opened) {
      openedAt = sentAt + (spec.openH ?? 3) * HOUR;
      p.invite.status = "opened";
      p.invite.openedAt = iso(openedAt);
      ev(openedAt, "System", "visit", "Invitation link opened.");
    }
    let registeredAt: number | undefined;
    if (s === "registered" && openedAt) {
      registeredAt = openedAt + (spec.regH ?? 1) * HOUR;
      const by = spec.delegate ?? null;
      p.invite.status = "registered";
      p.invite.registeredAt = iso(registeredAt);
      p.invite.method = spec.method ?? "google";
      p.invite.registeredBy = by;
      p.consent = { acceptedAt: iso(registeredAt), marketing: true };
      ev(
        registeredAt,
        by ? `${by.name} (${by.role}, on behalf)` : p.fullName,
        "registered",
        `Registered via ${p.invite.method === "google" ? "Google" : "verified email"} and accepted the privacy and membership terms.`,
      );
    }
    const due = sentAt + 48 * HOUR;
    if ((!registeredAt || registeredAt > due) && now > due && s !== "deactivated") {
      p.invite.reminderSentAt = iso(due);
      ev(due, "System", "reminder", "Automatic 48-hour reminder sent.");
    }
    if (s === "deactivated" && openedAt) {
      const at = openedAt + 30 * HOUR;
      p.status = "deactivated";
      p.deactivatedAt = iso(at);
      ev(at, spec.pd, "deactivated", "Profile deactivated at the CEO's request. Record retained.");
    }
  }

  if (spec.currentInterview) {
    p.currentInterview = spec.currentInterview;
    ev(new Date(spec.currentInterview.date).getTime() + 3 * HOUR, spec.pd, "link", `Published interview added: “${spec.currentInterview.title}”.`);
  }

  p.visits = spec.visits ?? (s === "registered" ? 30 : opened ? 2 : 0);
  p.intro = spec.intro ?? writeIntro(p, spec.variant ?? 0);
  p.createdAt = iso(generatedAt);
  p.activity = events.filter((e) => new Date(e.at).getTime() <= now).sort((a, b) => b.at.localeCompare(a.at));
  p.updatedAt = p.activity[0]?.at ?? p.createdAt;
  return p;
}

export function createSeed(now = Date.now()): { profiles: Profile[]; upcoming: UpcomingInterview[] } {
  const dayAt = (offset: number, h: number, m = 0) => {
    const d = new Date(now + offset * DAY);
    d.setHours(h, m, 0, 0);
    return d.getTime();
  };
  const halfHour = 30 * MIN;
  const alexInterview = Math.ceil((now + 2 * HOUR) / halfHour) * halfHour;

  const specs: Spec[] = [
    {
      fullName: "Layla Al-Mansouri", designation: "Group Chief Executive Officer", company: "Gulfstream Logistics Group", country: "United Arab Emirates",
      report: "UAE: The Next Fifty 2026", pd: "James Okoro", interview: dayAt(-19, 10), stage: "registered", code: "q8vd",
      inviteH: 2.5, openH: 1.2, regH: 0.6, edits: 1, before: 8, after: 3, visits: 64, method: "google", variant: 2,
      quote: "Trade moves at the speed of trust between partners.",
      currentInterview: {
        id: "trc-2001", type: "interview", title: "Layla Al-Mansouri on the Next Phase of Gulf Trade",
        excerpt: "Gulfstream's Group CEO on multimodal corridors, digital customs and the partnerships connecting three continents.",
        date: new Date(now - 4 * DAY).toISOString().slice(0, 10), image: "/images/covers/container-ship.jpg",
        url: "https://trc.com/interviews/layla-al-mansouri-gulf-trade", publication: "UAE: The Next Fifty", entities: ["Layla Al-Mansouri", "Gulfstream Logistics Group"],
      },
    },
    {
      fullName: "Kwame Mensah", designation: "Managing Director & CEO", company: "Volta Power Holdings", country: "Ghana",
      report: "Ghana: Powering Prosperity 2026", pd: "Elena Petrova", interview: dayAt(-17, 14, 30), stage: "registered", code: "m3xt",
      inviteH: 4, openH: 2, regH: 3, edits: 2, before: 11, after: 5, visits: 41, method: "email", delegate: { name: "Efua Owusu", role: "Executive Assistant" },
    },
    {
      fullName: "Grace Wanjiru", designation: "Chief Executive Officer", company: "Savanna Agritech", country: "Kenya",
      report: "Kenya: Innovation at Scale 2026", pd: "James Okoro", interview: dayAt(-15, 11), stage: "registered", code: "h7pw",
      inviteH: 3, openH: 0.8, regH: 0.4, edits: 0, before: 7, after: 3, visits: 52, method: "google", variant: 1,
    },
    {
      fullName: "Rahul Mehta", designation: "Founder & Chief Executive Officer", company: "Meridian Digital Payments", country: "India",
      report: "India: The Digital Decade 2026", pd: "Sarah Whitfield", interview: dayAt(-13, 9, 30), stage: "registered", code: "z2kc",
      inviteH: 5.5, openH: 6, regH: 2, edits: 2, before: 12, after: 6, visits: 38, method: "google", variant: 2,
    },
    {
      fullName: "Omar Haddad", designation: "Director General", company: "Atlas Maritime Authority", country: "Morocco",
      report: "Morocco: Gateway to Two Continents 2026", pd: "Elena Petrova", interview: dayAt(-12, 15), stage: "registered", code: "r9fn",
      inviteH: 20, openH: 4, regH: 5, edits: 5, before: 14, after: 7, visits: 29, method: "email",
    },
    {
      fullName: "Sofia Lindqvist", designation: "President & Chief Executive Officer", company: "Nordvik Renewables", country: "Sweden",
      report: "Nordic Energy Transition 2026", pd: "Sarah Whitfield", interview: dayAt(-10, 13), stage: "registered", code: "w4bs",
      inviteH: 4.5, openH: 30, regH: 22, edits: 6, before: 13, after: 5, visits: 22, method: "google", variant: 1,
    },
    {
      fullName: "James Whitaker", designation: "Chief Executive", company: "Thames Advisory Partners", country: "United Kingdom",
      report: "UK: Global Britain in Focus 2026", pd: "Sarah Whitfield", interview: dayAt(-9, 10, 30), stage: "registered", code: "t6jy",
      inviteH: 1.5, openH: 0.5, regH: 0.3, edits: 1, before: 6, after: 3, visits: 47, method: "google",
    },
    {
      fullName: "Mateo Fernández", designation: "Chief Executive Officer", company: "Cordillera Minerals", country: "Peru",
      report: "Peru: Building on Strong Foundations 2026", pd: "Sarah Whitfield", interview: dayAt(-8, 16), stage: "reminded", code: "c5ue",
      inviteH: 6.5, openH: 26, edits: 4, before: 10, after: 4, visits: 3, variant: 2,
    },
    {
      fullName: "Pieter de Vries", designation: "Chief Executive Officer", company: "Hollandia Water Technologies", country: "Netherlands",
      report: "Netherlands: Innovation Delta 2026", pd: "Elena Petrova", interview: dayAt(-7, 11), stage: "deactivated", code: "n8ra",
      inviteH: 3.5, openH: 2, edits: 1, before: 9, after: 4, readyBefore: false, manual: true, visits: 4,
    },
    {
      fullName: "Carlos Mendoza", designation: "Director General", company: "Pacífica Capital", country: "Mexico",
      report: "Mexico: Nearshoring Nation 2026", pd: "James Okoro", interview: dayAt(-6, 12), stage: "no", code: "e3hd", edits: 1, before: 8,
    },
    {
      fullName: "Hannah Schmidt", designation: "Chief Executive Officer", company: "Rheinwerk Industrial", country: "Germany",
      report: "Germany: Engineering the Future 2026", pd: "Elena Petrova", interview: dayAt(-4, 9), stage: "ask_later", code: "b2gm", edits: 2, before: 10, variant: 1,
    },
    {
      fullName: "Mariana Costa", designation: "Chief Executive Officer", company: "Verde Agro Brasil", country: "Brazil",
      report: "Brazil: Agribusiness Powerhouse 2026", pd: "Elena Petrova", interview: dayAt(-2, 14), stage: "opened", code: "f7wq",
      inviteH: 4, openH: 9, edits: 1, before: 7, after: 4, visits: 2,
    },
    {
      fullName: "Aisha Bello", designation: "Chief Executive Officer", company: "Sahel Health Partners", country: "Nigeria",
      report: "Nigeria: Unlocking Potential 2026", pd: "Sarah Whitfield", interview: dayAt(-1, 11, 30), stage: "yes", code: "k4tz", edits: 1, before: 9, variant: 2,
    },
    {
      fullName: "Nguyen Thi Lan", designation: "General Director", company: "Mekong Textiles", country: "Vietnam",
      report: "Vietnam: Rising Manufacturing Hub 2026", pd: "James Okoro", interview: now - 5 * HOUR, stage: "invited", code: "y6mc",
      inviteH: 2, edits: 0, before: 8, after: 3, shortName: "Nguyen Thi Lan",
    },
    {
      fullName: "Alex Morgan", designation: "Chief Executive Officer", company: "Northstar Technologies", country: "United Kingdom",
      report: "UK Technology & Innovation 2026", pd: "Sarah Whitfield", interview: alexInterview, stage: "ready", code: "7k2f",
      generatedAt: now - 26 * HOUR, pronouns: "he", intro: ALEX_INTRO, edits: 1, before: 9,
    },
    {
      fullName: "Thabo Nkosi", designation: "Chief Executive Officer", company: "Ubuntu Telecoms", country: "South Africa",
      report: "South Africa: Investing in Renewal 2026", pd: "Sarah Whitfield", interview: dayAt(2, 10), stage: "draft", code: "u3pk", generatedAt: now - 3 * HOUR, edits: 0,
    },
    {
      fullName: "Siti Rahmawati", designation: "President Director", company: "Nusantara Agro", country: "Indonesia",
      report: "Indonesia: Southeast Asia's Rising Star 2026", pd: "James Okoro", interview: dayAt(4, 13, 30), stage: "draft", code: "s9dv", generatedAt: now - 40 * MIN, edits: 0,
    },
  ];

  const profiles = specs.map((s) => build(s, now));

  const upcoming: UpcomingInterview[] = [
    {
      id: "up_daniel", fullName: "Daniel Reyes", designation: "President & Chief Executive Officer", company: "Archipelago Power Corporation", country: "Philippines",
      interviewAt: new Date(dayAt(3, 10)).toISOString(), report: "Philippines: Powering Growth 2026", projectDirector: "Sarah Whitfield",
      scenario: "Full match — HubSpot, TRC coverage and an approved photograph",
    },
    {
      id: "up_amara", fullName: "Amara Okafor", designation: "Managing Director", company: "Okafor Pharmaceuticals", country: "Nigeria",
      interviewAt: new Date(dayAt(5, 15)).toISOString(), report: "Nigeria: Unlocking Potential 2026", projectDirector: "James Okoro",
      scenario: "HubSpot title conflict — Gemini runs a current check",
    },
    {
      id: "up_fatima", fullName: "Fatima Zahra Benali", designation: "Chief Executive Officer", company: "Maghreb Green Hydrogen", country: "Morocco",
      interviewAt: new Date(dayAt(6, 11, 30)).toISOString(), report: "Morocco: Gateway to Two Continents 2026", projectDirector: "Elena Petrova",
      scenario: "No HubSpot record — Gemini research fills the gaps",
    },
  ];

  return { profiles, upcoming };
}
