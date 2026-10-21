/**
 * Simulated profile engine. Mirrors the production workflow step for step —
 * base record → HubSpot → TRC reports → completeness check → conditional
 * Gemini research → draft → inactive URL — but runs entirely in the browser
 * against fixtures. Conflicts and gaps are flagged, never papered over.
 */
import { CONTEXT, FOCUS, GOAL, INDUSTRY_KEYWORDS } from "@/lib/data/reference";
import { GEMINI_KB, HUBSPOT_COMPANIES, HUBSPOT_CONTACTS, TRC_PHOTOS, TRC_REPORTS } from "@/lib/data/sources";
import type {
  ActivityEvent,
  Conflict,
  Fact,
  GenerationInput,
  GeminiResearch,
  HubspotMatch,
  PipelineStep,
  Profile,
  SourceKind,
  SuggestedLink,
  TranscriptSuggestion,
} from "@/lib/types";
import { DAY, SITE_HOST, fmtDate, lastName, normalize, sentences, shortCode, slugify, uid, wordCount } from "@/lib/utils";

/* ----------------------------- matching ----------------------------- */

function canonTitle(t: string) {
  return normalize(t)
    .replace(/\bceo\b/g, "chief executive officer")
    .replace(/\bmd\b/g, "managing director")
    .replace(/\b(group|and)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sameTitle(a: string, b: string) {
  const x = canonTitle(a);
  const y = canonTitle(b);
  return x === y || x.includes(y) || y.includes(x);
}

export function sameName(a: string, b: string) {
  const x = normalize(a).split(" ");
  const y = normalize(b).split(" ");
  if (x.join(" ") === y.join(" ")) return true;
  return x.length > 1 && y.length > 1 && x[0] === y[0] && x[x.length - 1] === y[y.length - 1];
}

function companyKey(s: string) {
  return normalize(s)
    .replace(/\b(group|holdings|corporation|company|partners)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sameCompany(a: string, b: string) {
  const x = companyKey(a);
  const y = companyKey(b);
  if (x.length < 3 || y.length < 3) return false;
  return x === y || x.startsWith(`${y} `) || y.startsWith(`${x} `);
}

export function inferIndustry(text: string) {
  const t = text.toLowerCase();
  for (const [re, industry] of INDUSTRY_KEYWORDS) if (re.test(t)) return industry;
  return null;
}

function orgNoun(company: string, industry: string) {
  const c = company.toLowerCase();
  if (/authority|ministry|agency|council|commission|board|foundation|university|institute/.test(c) || industry === "Public Sector") return "organisation";
  if (/\bgroup\b|holdings/.test(c)) return "group";
  return "company";
}

/* ------------------------------ writing ------------------------------ */

type IntroSource = Pick<
  Profile,
  "fullName" | "designation" | "company" | "industry" | "shortName" | "pronouns" | "companyAbout" | "facts" | "links" | "report" | "insight" | "descriptor"
>;

function refs(p: IntroSource) {
  const n = p.shortName?.trim() || lastName(p.fullName);
  switch (p.pronouns) {
    case "he":
      return { subj: "he", Subj: "He", poss: "his", Poss: "His", plural: false };
    case "she":
      return { subj: "she", Subj: "She", poss: "her", Poss: "Her", plural: false };
    case "they":
      return { subj: "they", Subj: "They", poss: "their", Poss: "Their", plural: true };
    default:
      return { subj: n, Subj: n, poss: `${n}'s`, Poss: `${n}'s`, plural: false };
  }
}

function factValue(p: Pick<Profile, "facts">, label: string) {
  return p.facts.find((f) => f.label.toLowerCase() === label)?.value;
}

function factsSentence(p: IntroSource, org: string) {
  const founded = factValue(p, "founded");
  const hq = factValue(p, "headquarters");
  const emp = factValue(p, "employees");
  const markets = factValue(p, "markets")?.replace(/(\d+)\+\s*/, "more than $1 ");
  const empPhrase = emp ? `employs around ${emp.replace(/^approx\.?\s*/i, "")} people` : null;
  const reach = markets ? ` and serves customers in ${markets}` : "";
  if (founded && hq && empPhrase) return `Founded in ${founded} and headquartered in ${hq}, the ${org} ${empPhrase}${reach}.`;
  if (hq && empPhrase) return `Headquartered in ${hq}, the ${org} ${empPhrase}${reach}.`;
  if (founded && hq) return `Founded in ${founded}, the ${org} is headquartered in ${hq}.`;
  if (hq) return `The ${org} is headquartered in ${hq}.`;
  if (empPhrase) return `The ${org} ${empPhrase}.`;
  return null;
}

function trcSentence(p: IntroSource, R: ReturnType<typeof refs>) {
  const live = p.links.filter((l) => l.status !== "removed");
  const personal = live.find((l) => l.matchedOn !== "company" && (l.item.type === "article" || l.item.type === "profile"));
  if (personal) return `${R.Subj} ${R.plural ? "have" : "has"} previously contributed to TRC's coverage, including “${personal.item.title}”.`;
  const company = live.find((l) => l.item.type === "report") ?? live[0];
  if (company) return `${p.company} has previously featured in TRC's “${company.item.title}”.`;
  return null;
}

export const INTRO_STYLES = ["Balanced", "Role-led", "Narrative"] as const;

export function writeIntro(p: IntroSource, variant = 0): string {
  const R = refs(p);
  const v = (base: string, third: string) => (R.plural ? base : third);
  const org = orgNoun(p.company, p.industry);
  const about = sentences(p.companyAbout || "");
  const focus = FOCUS[p.industry] ?? FOCUS["Business Services"];
  const goal = GOAL[p.industry] ?? GOAL["Business Services"];
  const context = CONTEXT[p.industry] ?? CONTEXT["Business Services"];
  const facts = factsSentence(p, org);
  const trc = trcSentence(p, R);
  const insight = p.insight ? `In conversation with TRC, ${R.subj} highlighted ${p.insight}.` : null;
  const used = new Set<string>();
  const take = (s?: string | null) => {
    if (s) used.add(s);
    return s ?? null;
  };

  let parts: (string | null)[];
  switch (((variant % 3) + 3) % 3) {
    case 1:
      parts = [
        `${p.fullName} is ${p.designation} of ${p.company}${p.descriptor ? `, ${p.descriptor}` : ""}.`,
        `In this role, ${R.subj} ${v("are", "is")} responsible for the ${org}'s strategy, performance and long-term growth.`,
        take(p.descriptor ? (about[1] ?? about[0]) : about[0]),
        facts,
        `${R.Subj} ${v("place", "places")} particular emphasis on ${focus}.`,
        insight,
        trc,
      ];
      break;
    case 2:
      parts = [
        `${p.fullName} leads ${p.company} as ${p.designation}, guiding the ${org} through ${context}.`,
        take(about[0]),
        take(about[1]),
        `${R.Poss} priorities include ${focus}.`,
        facts,
        insight,
        trc,
      ];
      break;
    default:
      parts = [
        `As ${p.designation} of ${p.company}, ${p.fullName} leads the ${org}'s strategic direction and growth.`,
        take(about[0]),
        `${R.Subj} ${v("are", "is")} focused on ${focus}.`,
        facts,
        insight,
        trc,
        `Under ${R.poss} leadership, ${p.company} continues to ${goal}.`,
      ];
  }

  let out = parts.filter(Boolean) as string[];
  // Reach the 100-word floor with grounded material only — never invented achievements.
  const padding = [
    ...about.filter((s) => !used.has(s)),
    variant % 3 === 1 ? null : `In this role, ${R.subj} ${v("work", "works")} closely with the board, leadership team and partners to deliver the ${org}'s strategy.`,
    p.report ? `${p.company} is featured in TRC's ${p.report}.` : null,
  ].filter(Boolean) as string[];
  let at = Math.min(out.length, 3);
  for (const s of padding) {
    if (wordCount(out.join(" ")) >= 100) break;
    out.splice(at++, 0, s);
  }
  while (wordCount(out.join(" ")) > 200 && out.length > 2) out = out.slice(0, -1);
  return out.join(" ");
}

/* ----------------------------- generation ---------------------------- */

const STEP_MS: Record<PipelineStep["key"], number> = {
  base: 650,
  hubspot: 1300,
  trc: 1200,
  completeness: 800,
  gemini: 2100,
  draft: 1700,
  url: 650,
};

function completenessChecks(x: {
  designation: string;
  industryOk: boolean;
  about: string;
  website?: string;
  facts: Fact[];
  links: SuggestedLink[];
  contactMatched: boolean;
}) {
  return [
    { label: "Current designation", ok: !!x.designation, weight: 15 },
    { label: "Company or organisation", ok: true, weight: 10 },
    { label: "Country", ok: true, weight: 10 },
    { label: "Confirmed industry", ok: x.industryOk, weight: 10 },
    { label: "Company overview", ok: !!x.about, weight: 20 },
    { label: "Official website", ok: !!x.website, weight: 10 },
    { label: "Basic company facts", ok: x.facts.length >= 2, weight: 10 },
    { label: "Verified role or TRC coverage", ok: x.links.length > 0 || x.contactMatched, weight: 15 },
  ];
}

export function generateProfile(
  input: GenerationInput,
  opts: { now?: number; code?: string } = {},
): { profile: Profile; steps: PipelineStep[] } {
  const now = opts.now ?? Date.now();
  const nowIso = new Date(now).toISOString();
  const fullName = input.fullName.trim();
  const designation = input.designation.trim();
  const company = input.company.trim();
  const country = input.country.trim();
  const steps: PipelineStep[] = [];

  /* 1 — base record */
  steps.push({
    key: "base",
    title: "Create base record",
    status: "done",
    summary: "CEO record created from the four entered fields.",
    details: [fullName, designation, company, country],
    ms: STEP_MS.base,
  });

  /* 2 — HubSpot */
  const contact = HUBSPOT_CONTACTS.find((c) => sameName(c.name, fullName));
  const contactCompany = contact ? HUBSPOT_COMPANIES.find((co) => co.id === contact.companyId) : undefined;
  const companyRec =
    contactCompany && sameCompany(contactCompany.name, company)
      ? contactCompany
      : HUBSPOT_COMPANIES.find((co) => sameCompany(co.name, company));

  const conflicts: Conflict[] = [];
  if (contact && !sameTitle(contact.title, designation)) {
    conflicts.push({
      id: uid("cf_"),
      field: "designation",
      label: "Designation",
      entered: designation,
      found: contact.title,
      source: "hubspot",
      note: `HubSpot contact last updated ${fmtDate(contact.lastActivity)}.`,
    });
  }
  if (contact && contactCompany && !sameCompany(contactCompany.name, company)) {
    conflicts.push({ id: uid("cf_"), field: "company", label: "Company", entered: company, found: contactCompany.name, source: "hubspot", note: "The HubSpot contact is linked to a different company." });
  }
  if (companyRec && companyRec.country !== country) {
    conflicts.push({ id: uid("cf_"), field: "country", label: "Country", entered: country, found: companyRec.country, source: "hubspot", note: "HubSpot lists a different headquarters country." });
  }

  const importedFields: string[] = [];
  if (companyRec) importedFields.push("website", "industry", "headquarters", "company overview");
  if (companyRec?.employees) importedFields.push("employees");
  if (companyRec?.founded) importedFields.push("founding year");
  if (contact) importedFields.push("contact email", "account owner");
  const hubspot: HubspotMatch = {
    matched: !!(contact || companyRec),
    contact,
    company: companyRec,
    confidence: contact && companyRec ? 96 : companyRec ? 78 : contact ? 70 : 0,
    importedFields,
  };

  if (hubspot.matched) {
    const years = companyRec?.pastAdvertiser?.map((r) => r.match(/\d{4}/)?.[0]).filter(Boolean).join(", ");
    const pastAdv = years ? (companyRec?.lifecycle === "Past advertiser" ? ` (${years})` : ` · past advertiser (${years})`) : "";
    steps.push({
      key: "hubspot",
      title: "Check HubSpot",
      status: conflicts.length ? "warning" : "done",
      summary: conflicts.length
        ? `Match found (${hubspot.confidence}% confidence) — ${conflicts.length} conflict${conflicts.length > 1 ? "s" : ""} flagged for review`
        : contact && companyRec
          ? `Contact and company matched (${hubspot.confidence}% confidence)`
          : `Company matched — no contact record for ${fullName}`,
      details: [
        ...(contact ? [`Contact #${contact.id} · ${contact.name} · ${contact.title}`] : []),
        ...(companyRec ? [`${companyRec.name} · ${companyRec.lifecycle}${pastAdv}`] : []),
        ...conflicts.map((c) => `Conflict — ${c.label}: entered “${c.entered}”, HubSpot “${c.found}”`),
        ...(importedFields.length ? [`Imported: ${importedFields.join(", ")}`] : []),
      ],
      ms: STEP_MS.hubspot,
    });
  } else {
    steps.push({
      key: "hubspot",
      title: "Check HubSpot",
      status: "done",
      summary: "No HubSpot record found — continuing without it",
      details: [`Searched contacts for “${fullName}” and companies for “${company}”.`, "A HubSpot record is optional."],
      ms: STEP_MS.hubspot,
    });
  }

  /* 3 — TRC past reports */
  const links: SuggestedLink[] = TRC_REPORTS.flatMap((item): SuggestedLink[] => {
    const ceo = item.entities.some((e) => sameName(e, fullName));
    const co = item.entities.some((e) => sameCompany(e, company));
    if (!ceo && !co) return [];
    return [{ item, status: "suggested", matchedOn: ceo && co ? "both" : ceo ? "ceo" : "company", confidence: ceo && co ? 95 : ceo ? 88 : 72 }];
  })
    .sort((a, b) => b.confidence - a.confidence || b.item.date.localeCompare(a.item.date))
    .slice(0, 6);

  steps.push({
    key: "trc",
    title: "Search TRC past reports",
    status: "done",
    summary: links.length ? `${links.length} relevant item${links.length > 1 ? "s" : ""} found — each needs your confirmation` : "No past TRC coverage found",
    details: links.length
      ? links.map((l) => `${l.item.type[0].toUpperCase()}${l.item.type.slice(1)} · ${l.item.title} (${l.matchedOn === "both" ? "CEO + company" : l.matchedOn === "ceo" ? "CEO name" : "company name"})`)
      : [`Searched for “${fullName}” and “${company}” across 4,812 indexed items.`],
    ms: STEP_MS.trc,
  });

  /* Gather what internal sources gave us */
  const fieldSources: Profile["fieldSources"] = { designation: "user", company: "user", country: "user" };
  let industry = companyRec?.industry ?? null;
  let industryOk = !!industry;
  if (industry) fieldSources.industry = "hubspot";
  if (!industry) {
    industry = inferIndustry(`${company} ${designation}`) ?? "Business Services";
    fieldSources.industry = "editor";
  }
  let about = companyRec?.description ?? "";
  if (about) fieldSources.about = "hubspot";
  let website = companyRec?.domain;
  if (website) fieldSources.website = "hubspot";
  let descriptor = companyRec?.descriptor;
  const facts: Fact[] = [];
  if (companyRec) {
    facts.push({ id: uid("f_"), label: "Headquarters", value: `${companyRec.city}, ${companyRec.country}`, source: "hubspot" });
    if (companyRec.founded) facts.push({ id: uid("f_"), label: "Founded", value: companyRec.founded, source: "hubspot" });
    if (companyRec.employees) facts.push({ id: uid("f_"), label: "Employees", value: companyRec.employees, source: "hubspot" });
    if (companyRec.markets) facts.push({ id: uid("f_"), label: "Markets", value: companyRec.markets, source: "hubspot" });
  }

  /* 4 — completeness */
  const checks = completenessChecks({ designation, industryOk, about, website, facts, links, contactMatched: !!contact });
  const score = checks.reduce((s, c) => s + (c.ok ? c.weight : 0), 0);
  const stale = contact ? now - new Date(contact.lastActivity).getTime() > 365 * DAY : false;
  const needsCheck = conflicts.length > 0 || stale;
  const runGemini = score < 80 || needsCheck;
  const missingBefore = checks.filter((c) => !c.ok).map((c) => c.label);

  steps.push({
    key: "completeness",
    title: "Check information completeness",
    status: runGemini ? "warning" : "done",
    summary: runGemini
      ? score < 80
        ? `Information incomplete (${score}%) — external research required`
        : `Current check required — ${stale ? `HubSpot record last updated ${fmtDate(contact!.lastActivity)}` : "conflicting details found"}`
      : `Information sufficient (${score}%) — external research not required`,
    details: missingBefore.length ? missingBefore.map((m) => `Missing: ${m}`) : ["Designation, overview, website, facts and coverage all available."],
    ms: STEP_MS.completeness,
  });

  /* 5 — conditional Gemini research */
  let gemini: GeminiResearch = { ran: false, reason: "Existing information was sufficient.", sources: [], findings: [] };
  if (runGemini) {
    const reason =
      score < 80 ? `Internal sources covered ${score}% of required information.` : stale ? "HubSpot details were more than 12 months old." : "Conflicting details needed a current check.";
    const kb = GEMINI_KB[normalize(company)];
    if (kb) {
      if (!about || stale) {
        about = kb.about;
        fieldSources.about = "gemini";
      }
      if (!website) {
        website = kb.website;
        fieldSources.website = "gemini";
      }
      if (!industryOk) {
        industry = kb.industry;
        industryOk = true;
        fieldSources.industry = "gemini";
      }
      descriptor ??= kb.descriptor;
      for (const f of kb.facts) {
        if (!facts.some((x) => x.label === f.label)) facts.push({ id: uid("f_"), ...f, source: "gemini" });
      }
      if (kb.roleCheck) {
        for (const c of conflicts) {
          if (c.field !== "designation") continue;
          c.note = `${c.note ?? ""} Gemini: ${kb.roleCheck.note}`.trim();
          if (sameTitle(kb.roleCheck.title, c.entered)) c.note += " The entered title appears to be current.";
        }
      }
      gemini = { ran: true, reason, sources: kb.sources, findings: kb.findings, ranAt: new Date(now + 4000).toISOString() };
    } else {
      // Unknown entity — record what little was found and flag it rather than guess.
      if (!about) {
        about = `${company} is ${/^[aeiou]/i.test(industry) ? "an" : "a"} ${industry.toLowerCase().replace("&", "and")} ${orgNoun(company, industry)} based in ${country}.`;
        fieldSources.about = "gemini";
      }
      gemini = {
        ran: true,
        reason,
        sources: [
          { title: `${company} — public company information`, url: `https://www.google.com/search?q=${encodeURIComponent(company)}` },
          { title: `${fullName} — public profile mentions`, url: `https://www.google.com/search?q=${encodeURIComponent(`${fullName} ${company}`)}` },
        ],
        findings: ["Limited public information — company overview needs verification", "Official website could not be confirmed"],
        ranAt: new Date(now + 4000).toISOString(),
      };
    }
    steps.push({
      key: "gemini",
      title: "Run Gemini research",
      status: kb ? "done" : "warning",
      summary: kb ? `${gemini.findings.length} findings verified from ${gemini.sources.length} sources` : "Limited public information found — flagged for review",
      details: [...gemini.findings, ...gemini.sources.map((s) => `Source: ${s.title}`)],
      ms: STEP_MS.gemini,
    });
  } else {
    steps.push({
      key: "gemini",
      title: "Run Gemini research",
      status: "skipped",
      summary: "Not required — internal sources were sufficient",
      details: ["Gemini runs only when HubSpot and TRC records are incomplete or out of date."],
      ms: 450,
    });
  }

  const finalChecks = completenessChecks({ designation, industryOk, about, website, facts, links, contactMatched: !!contact });
  const completeness = finalChecks.reduce((s, c) => s + (c.ok ? c.weight : 0), 0);
  let missing = finalChecks.filter((c) => !c.ok).map((c) => c.label);
  if (fieldSources.industry === "editor") {
    missing = missing.filter((m) => m !== "Confirmed industry");
    missing.push("Industry inferred from company name — please confirm");
  }

  /* 6 — draft */
  const code = opts.code ?? shortCode();
  const slug = `${slugify(fullName)}-${code}`;
  const photo = TRC_PHOTOS[normalize(fullName)];
  const profile: Profile = {
    id: uid("p_"),
    slug,
    fullName,
    designation,
    company,
    country,
    industry: industry ?? "Business Services",
    shortName: lastName(fullName),
    pronouns: "name",
    photo,
    photoSource: photo ? "trc" : undefined,
    useInitials: !photo,
    intro: "",
    introHistory: [],
    introVariant: 0,
    companyAbout: about,
    descriptor,
    website,
    facts,
    links,
    hubspot,
    gemini,
    trcSearch: { terms: [fullName, company], results: links.length },
    conflicts,
    missing,
    completeness,
    fieldSources,
    status: "draft",
    permission: { value: "pending" },
    invite: { status: "not_sent", token: shortCode(10), recipient: contact?.email, recipientName: fullName },
    visits: 0,
    interviewAt: input.interviewAt ?? new Date(now + 2 * DAY).toISOString(),
    report: input.report?.trim() || `${country} 2026 report`,
    projectDirector: input.projectDirector ?? "Sarah Whitfield",
    createdAt: nowIso,
    updatedAt: nowIso,
    metrics: { manualResearch: completeness < 70, editCount: 0 },
    activity: [],
  };
  profile.intro = writeIntro(profile, 0);

  steps.push({
    key: "draft",
    title: "Write the draft profile",
    status: "done",
    summary: `Introduction drafted (${wordCount(profile.intro)} words) and profile fields filled`,
    details: [
      "Basic details from your entry",
      photo ? "Image: approved TRC photograph found" : "Image: professional initials avatar",
      `Company details: ${facts.length} facts${website ? " + official website" : ""}`,
      `${links.length} suggested TRC link${links.length === 1 ? "" : "s"} awaiting confirmation`,
      ...(conflicts.length ? [`${conflicts.length} conflict${conflicts.length > 1 ? "s" : ""} kept for your review — nothing assumed`] : []),
    ],
    ms: STEP_MS.draft,
  });

  /* 7 — URL */
  steps.push({
    key: "url",
    title: "Create the unique profile URL",
    status: "done",
    summary: `${SITE_HOST}/p/${slug}`,
    details: ["Status: Draft — the page stays inactive until you activate it."],
    ms: STEP_MS.url,
  });

  const events: ActivityEvent[] = [
    { id: uid("a_"), at: nowIso, actor: profile.projectDirector, kind: "generated", message: "Profile generated from four required fields." },
    {
      id: uid("a_"),
      at: new Date(now + 2000).toISOString(),
      actor: "System",
      kind: "source",
      message: hubspot.matched ? `HubSpot match imported (${hubspot.confidence}% confidence).` : "No HubSpot record found — continued without it.",
    },
    ...(gemini.ran ? [{ id: uid("a_"), at: gemini.ranAt!, actor: "System", kind: "source" as const, message: `Gemini research ran — ${gemini.reason}` }] : []),
    { id: uid("a_"), at: new Date(now + 6000).toISOString(), actor: "System", kind: "generated", message: `Draft created. URL reserved at /p/${slug} (inactive).` },
  ];
  profile.activity = events.reverse();

  return { profile, steps };
}

/* ----------------------------- transcript ---------------------------- */

const TRANSCRIPT_CANNED: Record<string, { insight: string; quote: string; fact: { label: string; value: string } }> = {
  Technology: {
    insight: "plans to expand the company's engineering hubs and invest further in AI-enabled services for enterprise customers",
    quote: "Technology only creates lasting value when it earns the trust of the people who use it.",
    fact: { label: "Strategic priority", value: "AI-enabled enterprise services" },
  },
  Telecommunications: {
    insight: "plans to extend fibre to a further two million homes by 2028",
    quote: "Connectivity is no longer a luxury — it is the infrastructure every other industry runs on.",
    fact: { label: "Network target", value: "2 million additional fibre homes by 2028" },
  },
  "Financial Services": {
    insight: "the growing role of real-time payments in bringing small businesses into the formal economy",
    quote: "Trust is our product. Everything else is technology.",
    fact: { label: "Strategic priority", value: "Digital payments for small businesses" },
  },
  Energy: {
    insight: "a programme to add new renewable capacity while strengthening grid reliability",
    quote: "Reliable power is the foundation on which every other industry is built.",
    fact: { label: "Investment plan", value: "New renewable capacity by 2030" },
  },
  "Logistics & Transport": {
    insight: "investment in digital customs and multimodal corridors linking Africa, Asia and Europe",
    quote: "Trade moves at the speed of trust between partners.",
    fact: { label: "Strategic priority", value: "Multimodal trade corridors" },
  },
  "Healthcare & Life Sciences": {
    insight: "plans to extend telemedicine and diagnostics to rural communities",
    quote: "Quality care should not depend on where you happen to live.",
    fact: { label: "Strategic priority", value: "Rural diagnostics and telemedicine" },
  },
  "Agriculture & Food": {
    insight: "the importance of fair prices and access to finance for smallholder farmers",
    quote: "When farmers prosper, entire communities move forward.",
    fact: { label: "Partner network", value: "Smallholder cooperatives" },
  },
  Manufacturing: {
    insight: "investment in automation and skills to compete with the world's leading producers",
    quote: "Precision is a culture, not a machine.",
    fact: { label: "Strategic priority", value: "Automation and skills" },
  },
};

const TRANSCRIPT_DEFAULT = {
  insight: "the importance of long-term partnerships and investment in local talent",
  quote: "Our growth depends on the people we develop and the partners we choose.",
  fact: { label: "Strategic priority", value: "Talent and long-term partnerships" },
};

export function extractTranscriptSuggestions(p: Profile, text?: string): TranscriptSuggestion[] {
  const canned = TRANSCRIPT_CANNED[p.industry] ?? TRANSCRIPT_DEFAULT;
  let quote = canned.quote;
  if (text) {
    // Prefer a verbatim first-person line spoken by the interviewee — drop interviewer
    // lines and "Name:" speaker labels before choosing.
    const spoken = text
      .split(/\n+/)
      .filter((l) => !/^\s*(TRC|Interviewer|Q)\s*:/i.test(l))
      .map((l) => l.replace(/^\s*[A-Z][\w.'-]*(?:\s+[A-Z][\w.'-]*){0,4}\s*:\s*/, ""))
      .join(" ");
    const candidate = sentences(spoken.replace(/\s+/g, " ")).find((s) => /\b(we|our|i)\b/i.test(s) && s.length > 50 && s.length < 220);
    if (candidate) quote = candidate.replace(/^["“]|["”]$/g, "");
  }
  return [
    { id: uid("ts_"), kind: "insight", label: "Add to introduction", value: canned.insight },
    { id: uid("ts_"), kind: "quote", label: "Pull quote for the profile", value: quote },
    { id: uid("ts_"), kind: "fact", label: canned.fact.label, value: canned.fact.value },
  ];
}

export function sourceLabel(s?: SourceKind) {
  switch (s) {
    case "user":
      return "Your entry";
    case "hubspot":
      return "HubSpot";
    case "trc":
      return "TRC reports";
    case "gemini":
      return "Gemini research";
    case "transcript":
      return "Approved transcript";
    case "editor":
      return "Edited";
    default:
      return "—";
  }
}
