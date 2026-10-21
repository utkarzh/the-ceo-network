"use client";

import { Check, Globe, Lock, Plus } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { PreviewRibbon } from "@/components/brand";
import { Avatar, Cover } from "@/components/profile/portrait";
import { MemberGate } from "@/components/site/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GROUPS } from "@/lib/data/social";
import { useApp } from "@/lib/store";

export default function GroupsPage() {
  const profiles = useApp((s) => s.profiles);
  const joined = useApp((s) => s.joinedGroups);
  const toggle = useApp((s) => s.toggleGroup);
  const bySlug = useMemo(() => Object.fromEntries(profiles.map((p) => [p.slug, p])), [profiles]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <title>Groups · CEO Network</title>
      <PreviewRibbon>Peer groups are a preview of a future release and are not part of the MVP.</PreviewRibbon>
      <div className="mt-8">
        <p className="eyebrow text-gold-700">Peer groups</p>
        <h1 className="display mt-2 text-[2.4rem] text-navy-950">Closed circles for candid conversations</h1>
        <p className="mt-2 max-w-2xl text-[15px] text-slate-500">Groups by sector, region and theme — moderated by TRC, open only to verified members.</p>
      </div>
      <MemberGate title="Peer groups">
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((g) => {
            const isIn = joined.includes(g.id);
            const members = g.memberSlugs.map((s) => bySlug[s]).filter(Boolean);
            return (
              <article key={g.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">
                <div className="relative">
                  <Cover src={g.cover} alt="" className="aspect-[16/8]" sizes="(min-width: 1024px) 400px, 100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
                  <Badge tone={g.private ? "gold" : "slate"} icon={g.private ? <Lock /> : <Globe />} className="absolute left-3 top-3">
                    {g.private ? "Private" : "Open to members"}
                  </Badge>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-serif text-[1.35rem] leading-snug text-navy-950">{g.name}</h2>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">{g.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {members.map((m) => (
                          <Avatar key={m!.id} profile={m!} size="sm" ring />
                        ))}
                      </div>
                      <span className="ml-2.5 text-xs text-slate-500">{g.members + (isIn ? 1 : 0)} members</span>
                    </div>
                    <Button
                      size="sm"
                      variant={isIn ? "secondary" : "primary"}
                      onClick={() => {
                        toggle(g.id);
                        toast(isIn ? `Left ${g.name}` : g.private ? `Request sent to join ${g.name}` : `Joined ${g.name}`);
                      }}
                    >
                      {isIn ? (
                        <>
                          <Check /> {g.private ? "Requested" : "Joined"}
                        </>
                      ) : (
                        <>
                          <Plus /> {g.private ? "Request" : "Join"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </MemberGate>
    </main>
  );
}
