export type ProfileStatus = "draft" | "ready" | "active" | "deactivated";
export type PermissionValue = "pending" | "yes" | "ask_later" | "no";
export type SourceKind = "user" | "hubspot" | "trc" | "gemini" | "transcript" | "editor";
export type Pronouns = "name" | "he" | "she" | "they";
export type Persona = "director" | "member" | "guest";
export type ActivationPolicy = "verbal" | "consent";

export interface Fact {
  id: string;
  label: string;
  value: string;
  source: SourceKind;
}

export type TrcItemType = "article" | "profile" | "report" | "interview";

export interface TrcItem {
  id: string;
  type: TrcItemType;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  url: string;
  publication: string;
  entities: string[];
}

export interface SuggestedLink {
  item: TrcItem;
  status: "suggested" | "confirmed" | "removed";
  matchedOn: "ceo" | "company" | "both";
  confidence: number;
}

export interface HubspotContact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  companyId: string;
  owner: string;
  lastActivity: string;
}

export interface HubspotCompany {
  id: string;
  name: string;
  domain: string;
  industry: string;
  city: string;
  country: string;
  employees?: string;
  founded?: string;
  markets?: string;
  lifecycle: "Customer" | "Past advertiser" | "Lead" | "Prospect";
  pastAdvertiser?: string[];
  description?: string;
  descriptor?: string;
  updatedAt: string;
}

export interface HubspotMatch {
  matched: boolean;
  contact?: HubspotContact;
  company?: HubspotCompany;
  confidence: number;
  importedFields: string[];
}

export interface Conflict {
  id: string;
  field: "designation" | "country" | "company";
  label: string;
  entered: string;
  found: string;
  source: SourceKind;
  note?: string;
  resolved?: "entered" | "found";
}

export interface ResearchSource {
  title: string;
  url: string;
}

export interface GeminiResearch {
  ran: boolean;
  reason: string;
  sources: ResearchSource[];
  findings: string[];
  ranAt?: string;
}

export interface ActivityEvent {
  id: string;
  at: string;
  actor: string;
  kind:
    | "generated"
    | "source"
    | "edit"
    | "regenerate"
    | "ready"
    | "permission"
    | "activated"
    | "deactivated"
    | "invite"
    | "visit"
    | "reminder"
    | "registered"
    | "transcript"
    | "link"
    | "note";
  message: string;
}

export interface Invitation {
  status: "not_sent" | "sent" | "opened" | "registered";
  token: string;
  recipient?: string;
  recipientName?: string;
  sentAt?: string;
  openedAt?: string;
  reminderDueAt?: string;
  reminderSentAt?: string;
  registeredAt?: string;
  registeredBy?: { name: string; role: string } | null;
  method?: "google" | "email";
  changeRequest?: string;
}

export interface Transcript {
  fileName: string;
  uploadedAt: string;
  approved: boolean;
  text?: string;
  appliedAt?: string;
}

export interface TranscriptSuggestion {
  id: string;
  kind: "insight" | "quote" | "fact";
  label: string;
  value: string;
}

export interface Profile {
  id: string;
  slug: string;
  fullName: string;
  designation: string;
  company: string;
  country: string;
  industry: string;
  shortName: string;
  pronouns: Pronouns;
  photo?: string;
  photoSource?: "trc" | "upload";
  useInitials: boolean;

  intro: string;
  introHistory: string[];
  introVariant: number;
  insight?: string;
  quote?: { text: string; source: string };

  companyAbout: string;
  descriptor?: string;
  website?: string;
  facts: Fact[];
  links: SuggestedLink[];
  currentInterview?: TrcItem;

  hubspot: HubspotMatch;
  gemini: GeminiResearch;
  trcSearch: { terms: string[]; results: number };
  conflicts: Conflict[];
  missing: string[];
  completeness: number;
  fieldSources: Partial<Record<"designation" | "company" | "country" | "industry" | "about" | "website", SourceKind>>;

  transcript?: Transcript;

  status: ProfileStatus;
  permission: { value: PermissionValue; by?: string; at?: string; note?: string };
  invite: Invitation;
  consent?: { acceptedAt: string; marketing: boolean };
  visits: number;

  interviewAt: string;
  report: string;
  projectDirector: string;
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
  activatedAt?: string;
  deactivatedAt?: string;

  metrics: {
    manualResearch: boolean;
    editCount: number;
    reviewMinutesBefore?: number;
    reviewMinutesAfter?: number;
    readyBeforeInterview?: boolean;
  };
  activity: ActivityEvent[];
}

export interface UpcomingInterview {
  id: string;
  fullName: string;
  designation: string;
  company: string;
  country: string;
  interviewAt: string;
  report: string;
  projectDirector: string;
  scenario: string;
}

export interface Settings {
  activationPolicy: ActivationPolicy;
  reminderEnabled: boolean;
  inviteSubject: string;
  inviteBody: string;
}

export interface GenerationInput {
  fullName: string;
  designation: string;
  company: string;
  country: string;
  interviewAt?: string;
  report?: string;
  projectDirector?: string;
}

export type StepKey = "base" | "hubspot" | "trc" | "completeness" | "gemini" | "draft" | "url";

export interface PipelineStep {
  key: StepKey;
  title: string;
  status: "done" | "skipped" | "warning";
  summary: string;
  details: string[];
  ms: number;
}
