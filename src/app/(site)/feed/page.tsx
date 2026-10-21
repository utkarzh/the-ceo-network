"use client";

import { ArrowRight, Lightbulb, MessageCircle, Share2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PreviewRibbon, Seal } from "@/components/brand";
import { Avatar, Cover } from "@/components/profile/portrait";
import { MemberGate } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/primitives";
import { TRC_REPORTS } from "@/lib/data/sources";
import { useApp, useCurrentMember } from "@/lib/store";
import type { TrcItem } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

export default function FeedPage() {
  const posts = useApp((s) => s.posts);
  const profiles = useApp((s) => s.profiles);
  const addPost = useApp((s) => s.addPost);
  const toggleReaction = useApp((s) => s.toggleReaction);
  const me = useCurrentMember();
  const [text, setText] = useState("");

  const bySlug = useMemo(() => Object.fromEntries(profiles.map((p) => [p.slug, p])), [profiles]);
  const items = useMemo(() => {
    const map = new Map<string, TrcItem>(TRC_REPORTS.map((r) => [r.id, r]));
    for (const p of profiles) if (p.currentInterview) map.set(p.currentInterview.id, p.currentInterview);
    return map;
  }, [profiles]);
  const suggestions = useMemo(() => profiles.filter((p) => p.status === "active" && p.id !== me?.id).slice(3, 6), [profiles, me]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <title>Feed · CEO Network</title>
      <PreviewRibbon>The member feed is a preview of a future release and is not part of the MVP. Posts you write stay in this browser.</PreviewRibbon>
      <MemberGate title="Member feed">
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
              {me ? (
                <form
                  className="flex gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!text.trim()) return;
                    addPost(text.trim());
                    setText("");
                    toast.success("Shared with members");
                  }}
                >
                  <Avatar profile={me} size="md" />
                  <div className="flex-1">
                    <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Share a perspective with verified members…" className="ring-slate-200/80" />
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" disabled={!text.trim()}>
                        Post
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-slate-500">You are viewing as TRC staff. Switch to a verified member in the Demo menu to post.</p>
              )}
            </div>

            {posts.map((post) => {
              const author = bySlug[post.authorSlug];
              if (!author) return null;
              const link = post.linkId ? items.get(post.linkId) : undefined;
              return (
                <article key={post.id} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200/70">
                  <header className="flex items-center gap-3">
                    <Link href={`/p/${author.slug}`}>
                      <Avatar profile={author} size="lg" />
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/p/${author.slug}`} className="flex items-center gap-1.5 font-medium text-navy-950 hover:underline">
                        {author.fullName} <Seal className="size-3.5" tip={false} />
                      </Link>
                      <p className="truncate text-[12.5px] text-slate-500">
                        {author.designation}, {author.company} · {timeAgo(post.at)}
                      </p>
                    </div>
                  </header>
                  <p className="mt-4 text-[15px] leading-relaxed text-slate-700">{post.text}</p>
                  {link && (
                    <div className="group mt-4 flex overflow-hidden rounded-xl ring-1 ring-slate-200">
                      <Cover src={link.image} alt="" className="w-36 shrink-0" sizes="144px" />
                      <div className="p-4">
                        <p className="eyebrow text-slate-400">TRC · {link.publication}</p>
                        <p className="mt-1 font-serif text-lg leading-snug text-navy-950">{link.title}</p>
                      </div>
                    </div>
                  )}
                  <footer className="mt-4 flex gap-1 border-t border-slate-100 pt-3">
                    <Button variant="ghost" size="sm" className={cn(post.reacted && "text-gold-700")} onClick={() => toggleReaction(post.id)}>
                      <Lightbulb className={cn(post.reacted && "fill-gold-200")} /> Insightful · {post.reactions}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast("Comments arrive with the social release")}>
                      <MessageCircle /> {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast("Sharing stays inside the network")}>
                      <Share2 /> Share
                    </Button>
                  </footer>
                </article>
              );
            })}
          </div>

          <aside className="min-w-0 space-y-4">
            {me && (
              <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">
                <div className="h-14 bg-navy-950" />
                <div className="-mt-8 px-5 pb-5">
                  <Avatar profile={me} size="xl" ring />
                  <p className="mt-3 flex items-center gap-1.5 font-serif text-xl text-navy-950">
                    {me.fullName} <Seal className="size-4" tip={false} />
                  </p>
                  <p className="text-[13px] text-slate-500">
                    {me.designation}, {me.company}
                  </p>
                  <Link href={`/p/${me.slug}`} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-link">
                    View my profile <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            )}
            <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200/70">
              <p className="text-sm font-semibold text-navy-950">Leaders you may know</p>
              <p className="text-xs text-slate-400">Recommendations are a future feature</p>
              <ul className="mt-4 space-y-3.5">
                {suggestions.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <Avatar profile={p} size="md" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/p/${p.slug}`} className="block truncate text-sm font-medium text-navy-950 hover:underline">
                        {p.fullName}
                      </Link>
                      <p className="truncate text-xs text-slate-500">{p.company}</p>
                    </div>
                    <Button size="icon-sm" variant="secondary" aria-label={`Connect with ${p.fullName}`} onClick={() => toast.success(`Connection request sent to ${p.fullName}`, { description: "Demo only." })}>
                      <UserPlus />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </MemberGate>
    </main>
  );
}
