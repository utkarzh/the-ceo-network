"use client";

import { ArrowLeft, Copy, Database, Ellipsis, Eye, Globe, History, Lock, PauseCircle, PenLine, Presentation, RefreshCw, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ActivateDialog,
  ActivityPanel,
  DeactivateDialog,
  InvitationTracker,
  InviteDialog,
  NextStepCard,
  PermissionDialog,
  PreviewPanel,
  SourcesPanel,
  StageTracker,
  copyLink,
  useOpenAsCeo,
} from "@/components/admin/workspace-flow";
import { CompanyEditor, DetailsEditor, ImageEditor, IntroEditor, LinksEditor, TranscriptPanel } from "@/components/admin/workspace-editors";
import { Avatar } from "@/components/profile/portrait";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger, Tabs, TabsContent, TabsList, TabsTrigger, Tip } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/primitives";
import { STAGE_META, stageOf } from "@/lib/stage";
import { useApp } from "@/lib/store";
import { SITE_HOST, cn } from "@/lib/utils";

type Dialog = "permission" | "activate" | "invite" | "deactivate" | null;

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const p = useApp((s) => s.profiles.find((x) => x.id === id));
  const policy = useApp((s) => s.settings.activationPolicy);
  const reactivate = useApp((s) => s.reactivate);
  const openAsCeo = useOpenAsCeo();
  const [dialog, setDialog] = useState<Dialog>(null);

  if (!p) {
    return (
      <EmptyState
        title="Profile not found"
        action={
          <Button asChild>
            <Link href="/admin/profiles">Back to profiles</Link>
          </Button>
        }
      >
        It may have been removed when the demo data was reset.
      </EmptyState>
    );
  }

  const meta = STAGE_META[stageOf(p)];
  const live = p.status === "active";
  const canRecord = p.status === "draft" || p.status === "ready";
  const toggle = (d: Exclude<Dialog, null>) => (v: boolean) => setDialog(v ? d : null);

  return (
    <>
      <title>{`${p.fullName} · TRC Console`}</title>
      <Link href="/admin/profiles" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-navy-900">
        <ArrowLeft className="size-4" /> Profiles
      </Link>

      <header className="mb-6 mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar profile={p} size="2xl" className="rounded-2xl" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="display text-[2rem] leading-tight text-navy-950">{p.fullName}</h1>
              <Badge tone={meta.tone} dot>
                {meta.label}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              {p.designation} · {p.company} · {p.country}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => copyLink(p)}
                className={cn(
                  "group inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] ring-1 ring-inset transition",
                  live ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300",
                )}
              >
                {live ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
                <span className="truncate">
                  {SITE_HOST}/p/{p.slug}
                </span>
                <span className="font-medium">· {live ? "Live" : p.status === "deactivated" ? "Deactivated" : "Inactive"}</span>
                <Copy className="size-3.5 opacity-50 group-hover:opacity-100" />
              </button>
              <span className="text-[12.5px] text-slate-400">
                {p.report} · {p.projectDirector}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Tip content="Open the unique URL as TRC staff">
            <Button variant="secondary" asChild>
              <Link href={`/p/${p.slug}`}>
                <Eye /> Preview
              </Link>
            </Button>
          </Tip>
          <Button variant="secondary" asChild>
            <Link href={`/present/${p.id}`}>
              <Presentation /> Presentation
            </Link>
          </Button>
          <Menu>
            <MenuTrigger asChild>
              <Button variant="secondary" size="icon" aria-label="More actions">
                <Ellipsis />
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem icon={<Copy />} onSelect={() => copyLink(p)}>
                Copy link
              </MenuItem>
              <MenuItem icon={<PenLine />} disabled={!canRecord} onSelect={() => setDialog("permission")}>
                {p.permission.value === "pending" ? "Record permission" : "Update permission response"}
              </MenuItem>
              {p.invite.status !== "not_sent" && (
                <>
                  <MenuItem icon={<Send />} onSelect={() => setDialog("invite")}>
                    Resend invitation
                  </MenuItem>
                  <MenuItem icon={<Eye />} onSelect={() => openAsCeo(p)}>
                    Open invitation as the CEO
                  </MenuItem>
                </>
              )}
              {(p.status === "active" || p.status === "deactivated") && <MenuSeparator />}
              {p.status === "active" && (
                <MenuItem danger icon={<PauseCircle />} onSelect={() => setDialog("deactivate")}>
                  Deactivate profile
                </MenuItem>
              )}
              {p.status === "deactivated" && (
                <MenuItem
                  icon={<RefreshCw />}
                  onSelect={() => {
                    reactivate(p.id);
                    toast.success("Profile reactivated");
                  }}
                >
                  Reactivate profile
                </MenuItem>
              )}
            </MenuContent>
          </Menu>
        </div>
      </header>

      <StageTracker p={p} />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="min-w-0 space-y-6">
          <NextStepCard p={p} open={setDialog} />
          <InvitationTracker p={p} />
          <DetailsEditor p={p} />
          <IntroEditor p={p} />
          <ImageEditor p={p} />
          <CompanyEditor p={p} />
          <LinksEditor p={p} />
          <TranscriptPanel p={p} />
        </div>
        <div className="min-w-0 xl:sticky xl:top-20 xl:self-start">
          <Tabs defaultValue="preview">
            <TabsList className="mb-3">
              <TabsTrigger value="preview">
                <Eye /> Live preview
              </TabsTrigger>
              <TabsTrigger value="sources">
                <Database /> Sources
              </TabsTrigger>
              <TabsTrigger value="activity">
                <History /> Activity
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="outline-none">
              <PreviewPanel p={p} />
            </TabsContent>
            <TabsContent value="sources" className="max-h-[calc(100vh-10rem)] overflow-y-auto outline-none">
              <SourcesPanel p={p} />
            </TabsContent>
            <TabsContent value="activity" className="max-h-[calc(100vh-10rem)] overflow-y-auto outline-none">
              <ActivityPanel p={p} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PermissionDialog
        key={`perm-${dialog === "permission"}`}
        p={p}
        open={dialog === "permission"}
        onOpenChange={toggle("permission")}
        onRecorded={(v) => {
          if (v === "yes") {
            toast.success("Permission recorded: Yes", {
              description: policy === "verbal" ? "Activate Profile is now available." : "Send the invitation for the CEO's consent.",
              action: { label: policy === "verbal" ? "Activate" : "Invite", onClick: () => setDialog(policy === "verbal" ? "activate" : "invite") },
            });
          } else toast(`Response recorded: ${v === "no" ? "No" : "Ask later"}`, { description: "Nothing has been published." });
        }}
      />
      <ActivateDialog
        p={p}
        open={dialog === "activate"}
        onOpenChange={toggle("activate")}
        onActivated={() =>
          toast.success("Profile is live", {
            description: `${SITE_HOST}/p/${p.slug} now appears in the verified member directory.`,
            action: { label: "Send invitation", onClick: () => setDialog("invite") },
          })
        }
      />
      <InviteDialog key={`inv-${dialog === "invite"}`} p={p} open={dialog === "invite"} onOpenChange={toggle("invite")} />
      <DeactivateDialog key={`deact-${dialog === "deactivate"}`} p={p} open={dialog === "deactivate"} onOpenChange={toggle("deactivate")} />
    </>
  );
}
