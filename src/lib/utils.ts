import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

export function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 10);
}

export function shortCode(len = 4) {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Lower-case, strip accents, punctuation and legal suffixes so "Northstar Technologies Ltd." matches "northstar technologies". */
export function normalize(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\b(ltd|limited|plc|inc|llc|sa|ag|gmbh|bv|corp|co|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
}

export function wordCount(s: string) {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function sentences(s: string) {
  return (s.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [s]).map((x) => x.trim()).filter(Boolean);
}

export function lowerFirst(s: string) {
  return s ? s[0].toLowerCase() + s.slice(1) : s;
}

const LOCALE = "en-GB";

export function fmtDate(iso?: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(LOCALE, opts);
}

export function fmtTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
}

export function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  return `${fmtDate(iso, { day: "numeric", month: "short" })}, ${fmtTime(iso)}`;
}

function startOfDay(t: number) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function relativeDay(iso: string, now = Date.now()) {
  const diff = Math.round((startOfDay(new Date(iso).getTime()) - startOfDay(now)) / DAY);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return new Date(iso).toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", month: "short" });
}

export function timeAgo(iso?: string, now = Date.now()): string {
  if (!iso) return "—";
  const diff = now - new Date(iso).getTime();
  if (diff < 0) return timeUntil(iso, now);
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(diff / HOUR);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(diff / DAY);
  if (d < 14) return `${d} day${d === 1 ? "" : "s"} ago`;
  return fmtDate(iso);
}

export function timeUntil(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return timeAgo(iso, now);
  const m = Math.round(diff / 60_000);
  if (m < 60) return `in ${m} min`;
  const h = Math.round(diff / HOUR);
  if (h < 24) return `in ${h} h`;
  const d = Math.round(diff / DAY);
  return `in ${d} day${d === 1 ? "" : "s"}`;
}

export function hoursBetween(a?: string, b?: string) {
  if (!a || !b) return null;
  return (new Date(b).getTime() - new Date(a).getTime()) / HOUR;
}

export function formatHours(h: number | null) {
  if (h == null) return "—";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 10) return `${h.toFixed(1).replace(/\.0$/, "")} h`;
  return `${Math.round(h)} h`;
}

export function median(nums: number[]) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : null;
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

export const SITE_HOST = "ceonetwork.trc.com";
