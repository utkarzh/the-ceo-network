import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site/site-shell";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
