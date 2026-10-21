"use client";

import { use, type ReactNode } from "react";
import { browser } from "react-dom";
import { Toaster } from "sonner";
import { DemoNavigator } from "@/components/demo-navigator";
import { TooltipProvider } from "@/components/ui/overlay";

export function Providers({ children }: { children: ReactNode }) {
  // Demo state lives in localStorage, so everything below renders in the browser only.
  use(browser("CEO Network prototype data is stored in localStorage."));
  return (
    <TooltipProvider delayDuration={250}>
      {children}
      <DemoNavigator />
      <Toaster
        position="bottom-right"
        closeButton
        toastOptions={{
          classNames: {
            toast: "!rounded-xl !border-slate-200 !shadow-pop !font-sans",
            title: "!text-[13.5px] !font-medium !text-navy-950",
            description: "!text-[12.5px] !text-slate-500",
          },
        }}
      />
    </TooltipProvider>
  );
}
