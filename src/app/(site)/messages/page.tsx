"use client";

import { ArrowLeft, Lock, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PreviewRibbon, Seal } from "@/components/brand";
import { Avatar } from "@/components/profile/portrait";
import { MemberGate } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import { CANNED_REPLIES, seedThreads, type Thread } from "@/lib/data/social";
import { useApp } from "@/lib/store";
import { cn, fmtTime, timeAgo } from "@/lib/utils";

export default function MessagesPage() {
  const profiles = useApp((s) => s.profiles);
  const [threads, setThreads] = useState<Thread[]>(() => seedThreads(Date.now()));
  const [activeId, setActiveId] = useState(threads[0]?.id);
  const [mobileThread, setMobileThread] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  const bySlug = useMemo(() => Object.fromEntries(profiles.map((p) => [p.slug, p])), [profiles]);
  const active = threads.find((t) => t.id === activeId);
  const other = active ? bySlug[active.withSlug] : undefined;

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active?.messages.length, typing]);

  const send = () => {
    if (!text.trim() || !active) return;
    const id = active.id;
    setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, messages: [...t.messages, { from: "me", text: text.trim(), at: new Date().toISOString() }] } : t)));
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setThreads((ts) =>
        ts.map((t) => (t.id === id ? { ...t, messages: [...t.messages, { from: "them", text: CANNED_REPLIES[t.messages.length % CANNED_REPLIES.length], at: new Date().toISOString() }] } : t)),
      );
    }, 1600);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <title>Messages · CEO Network</title>
      <PreviewRibbon>Direct messaging is a preview of a future release and is not part of the MVP. Replies are simulated.</PreviewRibbon>
      <MemberGate title="Messages">
        <div className="mt-6 grid grid-cols-1 h-[640px] overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70 md:grid-cols-[300px_1fr]">
          <aside className={cn("border-r border-slate-100 md:block", mobileThread && "hidden")}>
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="font-serif text-xl text-navy-950">Messages</p>
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Lock className="size-3" /> Private between verified members
              </p>
            </div>
            <ul>
              {threads.map((t) => {
                const p = bySlug[t.withSlug];
                if (!p) return null;
                const last = t.messages[t.messages.length - 1];
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => {
                        setActiveId(t.id);
                        setMobileThread(true);
                      }}
                      className={cn("flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors", t.id === activeId ? "bg-slate-50" : "hover:bg-slate-50/60")}
                    >
                      <Avatar profile={p} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-medium text-navy-950">{p.fullName}</p>
                          <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(last.at)}</span>
                        </div>
                        <p className="truncate text-[12.5px] text-slate-500">
                          {last.from === "me" ? "You: " : ""}
                          {last.text}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
          {active && other ? (
            <section className={cn("flex min-h-0 flex-col", !mobileThread && "hidden md:flex")}>
              <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
                <button className="md:hidden" onClick={() => setMobileThread(false)} aria-label="Back">
                  <ArrowLeft className="size-5 text-slate-500" />
                </button>
                <Avatar profile={other} size="md" />
                <div className="min-w-0">
                  <Link href={`/p/${other.slug}`} className="flex items-center gap-1.5 text-sm font-medium text-navy-950 hover:underline">
                    {other.fullName} <Seal className="size-3.5" tip={false} />
                  </Link>
                  <p className="truncate text-xs text-slate-500">
                    {other.designation}, {other.company}
                  </p>
                </div>
              </header>
              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 px-5 py-5">
                {active.messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed", m.from === "me" ? "rounded-br-md bg-navy-900 text-white" : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200/80")}>
                      {m.text}
                      <p className={cn("mt-1 text-[10.5px]", m.from === "me" ? "text-white/50" : "text-slate-400")}>{fmtTime(m.at)}</p>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex">
                    <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 ring-1 ring-slate-200/80">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={end} />
              </div>
              <form
                className="flex gap-2 border-t border-slate-100 p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message ${other.fullName.split(" ")[0]}…`}
                  className="h-10 flex-1 rounded-lg bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-transparent placeholder:text-slate-400 focus:bg-white focus:ring-navy-300"
                />
                <Button disabled={!text.trim()} aria-label="Send">
                  <Send />
                </Button>
              </form>
            </section>
          ) : null}
        </div>
      </MemberGate>
    </main>
  );
}
