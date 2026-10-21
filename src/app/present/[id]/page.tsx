"use client";

import { ArrowLeft, Expand, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { Mark, Seal } from "@/components/brand";
import { ProfileView } from "@/components/profile/profile-view";
import { ScaledFrame } from "@/components/profile/scaled-frame";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { SITE_HOST } from "@/lib/utils";

export default function PresentPage() {
  const { id } = useParams<{ id: string }>();
  const p = useApp((s) => s.profiles.find((x) => x.id === id));
  const slide = useRef<HTMLDivElement>(null);

  if (!p) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy-950 text-white">
        <p>Profile not found.</p>
      </div>
    );
  }

  const reportName = p.report.replace(/\s\d{4}$/, "");

  return (
    <div className="min-h-screen bg-[#0a101d] print:bg-white">
      <title>{`Presentation · ${p.fullName}`}</title>
      <style>{`@media print { @page { size: A4 landscape; margin: 0; } }`}</style>
      <div className="no-print mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-4 text-white">
        <Button asChild variant="ghost-inverse" size="sm">
          <Link href={`/admin/profiles/${p.id}`}>
            <ArrowLeft /> Back to review
          </Link>
        </Button>
        <p className="hidden text-xs text-white/45 md:block">Interview presentation · one slide, part of the overall package</p>
        <div className="flex gap-2">
          <Button variant="ghost-inverse" size="sm" onClick={() => slide.current?.requestFullscreen?.()}>
            <Expand /> Full screen
          </Button>
          <Button variant="inverse" size="sm" onClick={() => window.print()}>
            <Printer /> Print / PDF
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pb-12 print:p-0">
        <div ref={slide} className="mx-auto grid aspect-video w-full place-items-center bg-[#0a101d] print:aspect-auto print:h-screen">
          <div className="@container relative grid aspect-video w-full overflow-hidden rounded-2xl bg-paper shadow-pop print:rounded-none print:shadow-none [grid-template-columns:38%_62%]">
            {/* Left: the pitch, kept brief */}
            <div className="relative flex flex-col bg-navy-950 p-[4.5cqw] text-white">
              <div className="grain absolute inset-0" />
              <div className="relative flex items-center gap-[0.8cqw]">
                <Mark className="size-[2.4cqw]" />
                <span className="display text-[1.7cqw]">CEO Network</span>
              </div>
              <p className="relative mt-[5cqw] text-[0.95cqw] font-semibold uppercase tracking-[0.12em] text-gold-300">Included in your TRC package</p>
              <h1 className="display relative mt-[1.2cqw] text-[3.3cqw] leading-[1.06] text-balance">A place in TRC&apos;s private network of leaders</h1>
              <ul className="relative mt-[2.6cqw] space-y-[1.3cqw] text-[1.25cqw] leading-snug text-white/80">
                {[
                  "A verified profile, prepared for you by TRC — nothing to fill in",
                  "A private directory of the CEOs featured in TRC reports",
                  "Published only with your permission, and yours to change at any time",
                ].map((t) => (
                  <li key={t} className="flex gap-[1cqw]">
                    <Seal className="mt-[0.2cqw] size-[1.5cqw]" tip={false} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="relative mt-auto text-[0.95cqw] text-white/45">For leaders featured in {reportName}</p>
            </div>

            {/* Right: browser mock-up of their own prepared profile */}
            <div className="relative flex items-center justify-center bg-[radial-gradient(120%_120%_at_100%_0%,#e5e9f1_0%,#f4f5f7_60%)] p-[3.2cqw]">
              <div className="w-full overflow-hidden rounded-[1cqw] bg-white shadow-pop ring-1 ring-slate-900/10">
                <div className="flex items-center gap-[0.6cqw] border-b border-slate-200 bg-slate-50 px-[1.2cqw] py-[0.8cqw]">
                  <span className="size-[0.75cqw] rounded-full bg-slate-300" />
                  <span className="size-[0.75cqw] rounded-full bg-slate-300" />
                  <span className="size-[0.75cqw] rounded-full bg-slate-300" />
                  <span className="mx-auto rounded-full bg-white px-[1.5cqw] py-[0.3cqw] text-[0.85cqw] text-slate-500 ring-1 ring-slate-200">
                    {SITE_HOST}/p/{p.slug}
                  </span>
                </div>
                <div className="relative h-[35cqw] overflow-hidden">
                  <div className="flex h-[3.4cqw] items-center gap-[1.6cqw] bg-navy-950 px-[2cqw] text-white">
                    <span className="display text-[1.35cqw]">CEO Network</span>
                    <span className="text-[0.8cqw] text-white/60">Directory</span>
                    <span className="text-[0.8cqw] text-white/60">About</span>
                  </div>
                  <div className="bg-canvas p-[1.4cqw]">
                    <ScaledFrame width={1080}>
                      <ProfileView profile={p} mode="preview" showAside={false} />
                    </ScaledFrame>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[6cqw] bg-gradient-to-t from-white to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="no-print mt-5 text-center text-xs text-white/40">
          Present briefly as part of the full offer. A verbal yes here signals interest only — permission is asked separately at the end of the interview.
        </p>
      </div>
    </div>
  );
}
