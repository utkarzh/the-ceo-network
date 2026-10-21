"use client";

import {
  Building2,
  Check,
  FileText,
  FileUp,
  ImageIcon,
  Newspaper,
  PenLine,
  Plus,
  RefreshCw,
  RotateCcw,
  TriangleAlert,
  Undo2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Cover, Portrait } from "@/components/profile/portrait";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tip } from "@/components/ui/overlay";
import { Card, CardHeader, Checkbox, Field, Input, Select, Switch, Textarea } from "@/components/ui/primitives";
import { COUNTRIES, INDUSTRIES } from "@/lib/data/reference";
import { INTRO_STYLES, extractTranscriptSuggestions, sourceLabel } from "@/lib/engine";
import { useApp, type EditableField } from "@/lib/store";
import type { Conflict, Profile, Pronouns, SourceKind, TranscriptSuggestion } from "@/lib/types";
import { cn, fmtDate, timeAgo, uid, wordCount } from "@/lib/utils";

/* ------------------------------ helpers ------------------------------ */

const SOURCE_STYLE: Record<SourceKind, string> = {
  user: "bg-slate-100 text-slate-600",
  hubspot: "bg-orange-50 text-orange-700",
  trc: "bg-navy-50 text-navy-700",
  gemini: "bg-violet-50 text-violet-700",
  transcript: "bg-emerald-50 text-emerald-700",
  editor: "bg-gold-50 text-gold-800",
};

export function SourcePill({ source, label }: { source?: SourceKind; label?: string }) {
  if (!source && !label) return null;
  return (
    <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium", source ? SOURCE_STYLE[source] : "bg-amber-50 text-amber-800")}>
      {label ?? sourceLabel(source)}
    </span>
  );
}

export function EditorCard({ id, icon, title, description, action, children }: { id?: string; icon: ReactNode; title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader icon={icon} title={title} description={description} action={action} />
      <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">{children}</div>
    </Card>
  );
}

function CommitInput({ value, onCommit, list, placeholder }: { value: string; onCommit: (v: string) => void; list?: string; placeholder?: string }) {
  return (
    <Input
      key={value}
      defaultValue={value}
      list={list}
      placeholder={placeholder}
      onBlur={(e) => {
        const v = e.target.value.trim();
        if (v !== value.trim()) onCommit(v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}

/* ---------------------------- basic details ---------------------------- */

function ConflictCard({ c, onResolve }: { c: Conflict; onResolve: (choice: "entered" | "found") => void }) {
  return (
    <div className="rounded-xl bg-amber-50/70 p-4 ring-1 ring-inset ring-amber-200">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-950">{c.label} differs from HubSpot</p>
          <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-inset ring-amber-200/70">
              <p className="text-[11px] text-slate-500">Your entry</p>
              <p className="text-sm font-medium text-navy-950">{c.entered}</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-inset ring-amber-200/70">
              <p className="text-[11px] text-slate-500">HubSpot</p>
              <p className="text-sm font-medium text-navy-950">{c.found}</p>
            </div>
          </div>
          {c.note && <p className="mt-2.5 text-[12.5px] leading-relaxed text-amber-900/80">{c.note}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="xs" variant="secondary" onClick={() => onResolve("entered")}>
              <Check /> Keep my entry
            </Button>
            <Button size="xs" variant="secondary" onClick={() => onResolve("found")}>
              Use HubSpot value
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DetailsEditor({ p }: { p: Profile }) {
  const editField = useApp((s) => s.editField);
  const setPronouns = useApp((s) => s.setPronouns);
  const resolveConflict = useApp((s) => s.resolveConflict);
  const open = p.conflicts.filter((c) => !c.resolved);
  const resolved = p.conflicts.filter((c) => c.resolved);
  const inferred = p.missing.some((m) => m.startsWith("Industry"));
  const commit = (f: EditableField) => (v: string) => v && editField(p.id, f, v);

  return (
    <EditorCard
      id="details"
      icon={<UserRound />}
      title="Basic details"
      description="Your four entries create the record. Matched sources are offered for review — nothing is overwritten without you."
      action={open.length > 0 && <Badge tone="amber">{open.length} to review</Badge>}
    >
      {open.length > 0 && (
        <div className="mb-5 space-y-3">
          {open.map((c) => (
            <ConflictCard key={c.id} c={c} onResolve={(choice) => resolveConflict(p.id, c.id, choice)} />
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" aside={<SourcePill source="user" />}>
          <CommitInput value={p.fullName} onCommit={commit("fullName")} />
        </Field>
        <Field label="Designation" aside={<SourcePill source={p.fieldSources.designation} />}>
          <CommitInput value={p.designation} onCommit={commit("designation")} />
        </Field>
        <Field label="Company or organisation" aside={<SourcePill source={p.fieldSources.company} />}>
          <CommitInput value={p.company} onCommit={commit("company")} />
        </Field>
        <Field label="Country" aside={<SourcePill source={p.fieldSources.country} />}>
          <CommitInput value={p.country} onCommit={commit("country")} list="ws-countries" />
          <datalist id="ws-countries">
            {COUNTRIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Industry" aside={inferred ? <SourcePill label="Inferred — please confirm" /> : <SourcePill source={p.fieldSources.industry} />}>
          <Select value={p.industry} onChange={(e) => editField(p.id, "industry", e.target.value)}>
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field label="Short name" hint="Used in the text on the next regeneration.">
            <CommitInput value={p.shortName} onCommit={commit("shortName")} />
          </Field>
          <Field label="Pronouns">
            <Select value={p.pronouns} onChange={(e) => setPronouns(p.id, e.target.value as Pronouns)} className="w-32">
              <option value="name">Name only</option>
              <option value="he">He / his</option>
              <option value="she">She / her</option>
              <option value="they">They / their</option>
            </Select>
          </Field>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">The engine never infers gender from a name — it refers to the CEO by name unless you confirm pronouns.</p>
      {resolved.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-[12.5px] text-slate-500">
          {resolved.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <Check className="size-3.5 text-emerald-600" />
              {c.label}: kept {c.resolved === "entered" ? `your entry “${c.entered}”` : `HubSpot value “${c.found}”`}
            </li>
          ))}
        </ul>
      )}
    </EditorCard>
  );
}

/* ----------------------------- introduction ---------------------------- */

function WordMeter({ count }: { count: number }) {
  const max = 250;
  const ok = count >= 100 && count <= 200;
  return (
    <div className="mt-3">
      <div className="relative h-1.5 rounded-full bg-slate-100">
        <div className="absolute inset-y-0 rounded-full bg-navy-100" style={{ left: `${(100 / max) * 100}%`, width: `${(100 / max) * 100}%` }} />
        <div
          className={cn("absolute -top-[3px] size-3 -translate-x-1/2 rounded-full ring-2 ring-white", ok ? "bg-navy-800" : "bg-amber-500")}
          style={{ left: `${(Math.min(count, max) / max) * 100}%` }}
        />
      </div>
      <p className={cn("mt-2 text-xs", ok ? "text-slate-500" : "text-amber-700")}>
        {count} words · {ok ? "within the 100–200 word range" : count < 100 ? "below the 100-word minimum" : "above the 200-word maximum"}
      </p>
    </div>
  );
}

export function IntroEditor({ p }: { p: Profile }) {
  const editField = useApp((s) => s.editField);
  const regenerate = useApp((s) => s.regenerateIntro);
  const undo = useApp((s) => s.undoIntro);
  const [busy, setBusy] = useState(false);
  const next = INTRO_STYLES[(p.introVariant + 1) % INTRO_STYLES.length];

  return (
    <EditorCard
      id="intro"
      icon={<PenLine />}
      title="Introduction"
      description="A clear professional paragraph of about 100–200 words, written from the approved sources."
      action={
        <>
          {p.introHistory.length > 0 && (
            <Tip content="Restore the previous version">
              <Button variant="ghost" size="sm" onClick={() => undo(p.id)}>
                <Undo2 /> Undo
              </Button>
            </Tip>
          )}
          <Button
            variant="secondary"
            size="sm"
            loading={busy}
            onClick={() => {
              setBusy(true);
              setTimeout(() => {
                regenerate(p.id);
                setBusy(false);
                toast.success("Introduction regenerated", { description: `${next} style. Basic details, links and image were not changed.` });
              }, 900);
            }}
          >
            {!busy && <RefreshCw />} Regenerate
          </Button>
        </>
      }
    >
      <Textarea
        key={p.intro}
        defaultValue={p.intro}
        rows={9}
        className={cn("text-[14.5px] leading-7", busy && "opacity-50")}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v && v !== p.intro) editField(p.id, "intro", v);
        }}
      />
      <WordMeter count={wordCount(p.intro)} />
      <p className="mt-1 text-xs text-slate-400">
        Current style: {INTRO_STYLES[p.introVariant]} · Regenerating rewrites only this paragraph{p.insight ? " and keeps the transcript insight" : ""}.
      </p>
    </EditorCard>
  );
}

/* -------------------------------- image -------------------------------- */

async function downscale(file: File, max = 520): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function OptionRow({ selected, disabled, onClick, title, sub }: { selected: boolean; disabled?: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 ring-inset transition disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "bg-navy-50/70 ring-navy-300" : "ring-slate-200 hover:ring-slate-300",
      )}
    >
      <span className={cn("grid size-4 place-items-center rounded-full ring-1 ring-inset", selected ? "bg-navy-800 ring-navy-800" : "ring-slate-300")}>
        {selected && <span className="size-1.5 rounded-full bg-white" />}
      </span>
      <span>
        <span className="block text-sm font-medium text-navy-950">{title}</span>
        <span className="block text-xs text-slate-500">{sub}</span>
      </span>
    </button>
  );
}

export function ImageEditor({ p }: { p: Profile }) {
  const setPhoto = useApp((s) => s.setPhoto);
  const photoSelected = !!p.photo && !p.useInitials;
  return (
    <EditorCard id="image" icon={<ImageIcon />} title="Image" description="Approved TRC photograph when available; otherwise a professional initials avatar.">
      <div className="flex flex-col gap-5 sm:flex-row">
        <Portrait profile={p} className="aspect-[4/5] w-32 shrink-0 rounded-xl" sizes="128px" />
        <div className="flex-1 space-y-2">
          <OptionRow
            selected={photoSelected}
            disabled={!p.photo}
            onClick={() => setPhoto(p.id, { useInitials: false })}
            title="Approved photograph"
            sub={p.photoSource === "upload" ? "Uploaded and approved by TRC" : p.photo ? "Found in TRC's files" : "No approved photograph on file"}
          />
          <OptionRow selected={!photoSelected} onClick={() => setPhoto(p.id, { useInitials: true })} title="Initials avatar" sub="Professional fallback when no photograph is approved" />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 text-[13px] font-medium text-link hover:underline">
            <Upload className="size-4" /> Upload an approved photograph
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const src = await downscale(file);
                  setPhoto(p.id, { src, useInitials: false, source: "upload" });
                  toast.success("Photograph uploaded");
                } catch {
                  toast.error("That file could not be read as an image");
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </EditorCard>
  );
}

/* ------------------------------- company ------------------------------- */

export function CompanyEditor({ p }: { p: Profile }) {
  const editField = useApp((s) => s.editField);
  const addFact = useApp((s) => s.addFact);
  const removeFact = useApp((s) => s.removeFact);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  return (
    <EditorCard id="company" icon={<Building2 />} title="Company details" description="Official website and a small number of verified basic facts.">
      <div className="space-y-4">
        <Field label="Company overview" aside={<SourcePill source={p.fieldSources.about} />}>
          <Textarea
            key={p.companyAbout}
            defaultValue={p.companyAbout}
            rows={4}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== p.companyAbout) editField(p.id, "companyAbout", v);
            }}
          />
        </Field>
        <Field label="Official website" aside={p.website ? <SourcePill source={p.fieldSources.website} /> : <SourcePill label="Missing — please add" />}>
          <CommitInput value={p.website ?? ""} onCommit={(v) => editField(p.id, "website", v)} placeholder="company.com" />
        </Field>
        <div>
          <p className="text-[13px] font-medium text-slate-700">Key facts</p>
          <ul className="mt-2 divide-y divide-slate-100 rounded-xl ring-1 ring-inset ring-slate-200">
            {p.facts.map((f) => (
              <li key={f.id} className="flex items-center gap-3 px-3.5 py-2.5 text-sm">
                <span className="w-32 shrink-0 text-slate-500">{f.label}</span>
                <span className="min-w-0 flex-1 truncate font-medium text-navy-950">{f.value}</span>
                <SourcePill source={f.source} />
                <button className="rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600" onClick={() => removeFact(p.id, f.id)} aria-label={`Remove ${f.label}`}>
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
            {!p.facts.length && <li className="px-3.5 py-3 text-sm text-slate-500">No verified facts yet.</li>}
          </ul>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!label.trim() || !value.trim()) return;
              addFact(p.id, label.trim(), value.trim());
              setLabel("");
              setValue("");
            }}
          >
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label, e.g. Founded" className="h-9 w-40" />
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Verified value" className="h-9 flex-1" />
            <Button type="submit" variant="secondary" size="sm" className="h-9" disabled={!label.trim() || !value.trim()}>
              <Plus /> Add
            </Button>
          </form>
        </div>
      </div>
    </EditorCard>
  );
}

/* ------------------------------ TRC links ------------------------------ */

export function LinksEditor({ p }: { p: Profile }) {
  const setLinkStatus = useApp((s) => s.setLinkStatus);
  const setCurrentInterview = useApp((s) => s.setCurrentInterview);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const confirmed = p.links.filter((l) => l.status === "confirmed").length;
  const suggested = p.links.filter((l) => l.status === "suggested").length;

  return (
    <EditorCard
      id="links"
      icon={<Newspaper />}
      title="TRC coverage"
      description="Suggested from TRC's past reports database. Only links you confirm appear on the profile."
      action={p.links.length > 0 && <Badge tone={suggested ? "amber" : "green"}>{suggested ? `${suggested} to confirm` : `${confirmed} confirmed`}</Badge>}
    >
      {p.links.length === 0 && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No past coverage found for this CEO or company. The current interview can be added once published.</p>}
      <ul className="space-y-2.5">
        {p.links.map((l) => (
          <li
            key={l.item.id}
            className={cn("group flex gap-3.5 rounded-xl p-2.5 ring-1 ring-inset transition", l.status === "removed" ? "opacity-50 ring-slate-200" : l.status === "confirmed" ? "ring-emerald-200 bg-emerald-50/30" : "ring-slate-200")}
          >
            <Cover src={l.item.image} alt="" className="h-16 w-24 shrink-0 rounded-lg" sizes="96px" zoom={false} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {l.item.type} · {fmtDate(l.item.date, { month: "short", year: "numeric" })}
              </p>
              <p className="truncate text-sm font-medium text-navy-950">{l.item.title}</p>
              <p className="truncate text-xs text-slate-500">
                Matched on {l.matchedOn === "both" ? "CEO and company" : l.matchedOn === "ceo" ? "CEO name" : "company name"} · {l.confidence}% · {l.item.publication}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {l.status === "suggested" && (
                <>
                  <Button size="xs" variant="success" onClick={() => setLinkStatus(p.id, l.item.id, "confirmed")}>
                    <Check /> Confirm
                  </Button>
                  <Tip content="Remove suggestion">
                    <Button size="icon-sm" variant="ghost" onClick={() => setLinkStatus(p.id, l.item.id, "removed")} aria-label="Remove">
                      <X />
                    </Button>
                  </Tip>
                </>
              )}
              {l.status === "confirmed" && (
                <>
                  <Badge tone="green" icon={<Check />}>
                    Confirmed
                  </Badge>
                  <Tip content="Remove from profile">
                    <Button size="icon-sm" variant="ghost" onClick={() => setLinkStatus(p.id, l.item.id, "removed")} aria-label="Remove">
                      <X />
                    </Button>
                  </Tip>
                </>
              )}
              {l.status === "removed" && (
                <Button size="xs" variant="ghost" onClick={() => setLinkStatus(p.id, l.item.id, "suggested")}>
                  <RotateCcw /> Restore
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/70">
        <p className="text-[13px] font-medium text-navy-950">Current TRC connection</p>
        <p className="mt-0.5 text-xs text-slate-500">Add the article or report from this interview when it is published.</p>
        {p.currentInterview ? (
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-white p-2.5 ring-1 ring-inset ring-slate-200">
            <Cover src={p.currentInterview.image} alt="" className="h-12 w-16 shrink-0 rounded-md" sizes="64px" zoom={false} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy-950">{p.currentInterview.title}</p>
              <p className="text-xs text-slate-500">Published {fmtDate(p.currentInterview.date)}</p>
            </div>
            <Button size="xs" variant="ghost" onClick={() => setCurrentInterview(p.id, undefined)}>
              Remove
            </Button>
          </div>
        ) : (
          <form
            className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              setCurrentInterview(p.id, {
                id: uid("trc-"),
                type: "interview",
                title: title.trim(),
                excerpt: `TRC's interview with ${p.fullName}, ${p.designation} of ${p.company}.`,
                date: new Date().toISOString().slice(0, 10),
                image: p.links[0]?.item.image ?? "/images/covers/meeting.jpg",
                url: url.trim() || "https://trc.com/interviews",
                publication: p.report,
                entities: [p.fullName, p.company],
              });
              setTitle("");
              setUrl("");
              toast.success("Published interview added to the profile");
            }}
          >
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article or report title" className="h-9" />
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://trc.com/…" className="h-9" />
            <Button type="submit" size="sm" variant="secondary" className="h-9" disabled={!title.trim()}>
              <Plus /> Add
            </Button>
          </form>
        )}
      </div>
    </EditorCard>
  );
}

/* ------------------------------ transcript ----------------------------- */

const SAMPLE = (p: Profile) =>
  `TRC: Thank you for joining us. How would you describe ${p.company}'s priorities for the next three years?\n${p.fullName}: We are focused on growth that lasts. Our plan is to invest in our people and in the partnerships that let us serve customers better. We want to be known as the most trusted company in our sector, and that means being transparent about what we do and how we do it.\nTRC: What role do international partners play?\n${p.fullName}: A central one. We have learned that our best results come when we combine local knowledge with international expertise.`;

export function TranscriptPanel({ p }: { p: Profile }) {
  const upload = useApp((s) => s.uploadTranscript);
  const setApproved = useApp((s) => s.setTranscriptApproved);
  const apply = useApp((s) => s.applyTranscript);
  const [suggestions, setSuggestions] = useState<TranscriptSuggestion[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const t = p.transcript;

  const onFile = async (file: File) => {
    const text = file.type === "text/plain" || file.name.endsWith(".txt") ? await file.text() : undefined;
    upload(p.id, file.name, text);
    setSuggestions(null);
  };

  return (
    <EditorCard
      id="transcript"
      icon={<FileText />}
      title="Interview transcript"
      description="Once the transcript is approved, upload it to update the profile with the latest approved information."
      action={t?.appliedAt && <Badge tone="green">Applied {timeAgo(t.appliedAt)}</Badge>}
    >
      {!t ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 text-center">
          <div className="mx-auto grid size-10 place-items-center rounded-xl bg-navy-50 text-navy-700">
            <FileUp className="size-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-navy-950">Upload the approved transcript</p>
          <p className="mt-0.5 text-xs text-slate-500">.txt, .docx or .pdf · text files are read in the browser</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-[13px] font-medium text-navy-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-50">
              <Upload className="size-4" /> Choose file
              <input type="file" accept=".txt,.doc,.docx,.pdf,text/plain" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </label>
            <Button size="sm" variant="ghost" onClick={() => upload(p.id, `Transcript — ${p.fullName}.txt`, SAMPLE(p))}>
              Use sample transcript
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-inset ring-slate-200">
            <div className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-500">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy-950">{t.fileName}</p>
              <p className="text-xs text-slate-500">Uploaded {timeAgo(t.uploadedAt)}</p>
            </div>
            <label className="flex items-center gap-2 text-[13px] text-slate-600">
              Approved
              <Switch checked={t.approved} onCheckedChange={(v) => setApproved(p.id, v)} label="Transcript approved" />
            </label>
          </div>
          {!t.approved && <p className="text-xs text-amber-700">Mark the transcript as approved before it can be used. Unapproved material never reaches the profile.</p>}
          {t.approved && !suggestions && (
            <Button
              variant="secondary"
              loading={busy}
              onClick={() => {
                setBusy(true);
                setTimeout(() => {
                  const s = extractTranscriptSuggestions(p, t.text);
                  setSuggestions(s);
                  setPicked(new Set(s.map((x) => x.id)));
                  setBusy(false);
                }, 1100);
              }}
            >
              {!busy && <RefreshCw />} Extract suggested updates
            </Button>
          )}
          {suggestions && (
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/80">
              <p className="text-[13px] font-medium text-navy-950">Suggested updates from the approved transcript</p>
              <p className="text-xs text-slate-500">Simulated extraction — quotes are taken verbatim when a text transcript is provided.</p>
              <ul className="mt-3 space-y-2">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-inset ring-slate-200">
                      <Checkbox
                        checked={picked.has(s.id)}
                        onChange={(e) => {
                          const next = new Set(picked);
                          if (e.target.checked) next.add(s.id);
                          else next.delete(s.id);
                          setPicked(next);
                        }}
                        className="mt-0.5"
                      />
                      <span className="text-sm">
                        <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">{s.label}</span>
                        <span className="text-navy-950">{s.kind === "quote" ? `“${s.value}”` : s.value}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  disabled={!picked.size}
                  onClick={() => {
                    apply(
                      p.id,
                      suggestions.filter((s) => picked.has(s.id)),
                    );
                    setSuggestions(null);
                    toast.success("Profile updated from the transcript", { description: "The introduction was refreshed with the approved insight." });
                  }}
                >
                  Apply {picked.size} update{picked.size === 1 ? "" : "s"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSuggestions(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </EditorCard>
  );
}
