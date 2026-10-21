"use client";

import { X } from "lucide-react";
import { Dialog, DropdownMenu, Popover, Tabs as RadixTabs, Tooltip } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------- Modal ------------------------------- */

const modalSizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof modalSizes;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-950/45 backdrop-blur-[2px] data-[state=open]:animate-fade" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-pop outline-none data-[state=open]:animate-rise",
            modalSizes[size],
          )}
        >
          <div className="flex gap-4 px-6 pb-1 pt-6 pr-12">
            {icon && <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-800 [&_svg]:size-5">{icon}</div>}
            <div className="min-w-0">
              <Dialog.Title className="display text-[1.6rem] leading-tight text-navy-950">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{typeof title === "string" ? title : "Dialog"}</Dialog.Description>
              )}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
          {footer && <div className="flex flex-wrap items-center justify-end gap-2 rounded-b-2xl border-t border-slate-100 bg-slate-50/70 px-6 py-4">{footer}</div>}
          <Dialog.Close className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            <X className="size-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ------------------------------ Tooltip ------------------------------ */

export function Tip({ content, children, side = "top" }: { content: ReactNode; children: ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side={side}
          sideOffset={6}
          collisionPadding={12}
          className="z-[70] max-w-xs rounded-lg bg-navy-950 px-2.5 py-1.5 text-xs leading-relaxed text-white shadow-lift data-[state=delayed-open]:animate-fade"
        >
          {content}
          <Tooltip.Arrow className="fill-navy-950" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export const TooltipProvider = Tooltip.Provider;

/* -------------------------------- Menu ------------------------------- */

export const Menu = DropdownMenu.Root;
export const MenuTrigger = DropdownMenu.Trigger;

export function MenuContent({ children, align = "end", className }: { children: ReactNode; align?: "start" | "end" | "center"; className?: string }) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={align}
        sideOffset={6}
        collisionPadding={12}
        className={cn("z-50 min-w-52 rounded-xl bg-white p-1.5 shadow-pop ring-1 ring-slate-200 data-[state=open]:animate-fade", className)}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

export function MenuItem({
  children,
  onSelect,
  icon,
  danger,
  disabled,
}: {
  children: ReactNode;
  onSelect?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 outline-none data-[disabled]:cursor-default data-[disabled]:opacity-40 data-[highlighted]:bg-slate-100 data-[highlighted]:text-navy-950 [&_svg]:size-4 [&_svg]:text-slate-400",
        danger && "text-rose-700 data-[highlighted]:bg-rose-50 data-[highlighted]:text-rose-800 [&_svg]:text-rose-400",
      )}
    >
      {icon}
      {children}
    </DropdownMenu.Item>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <DropdownMenu.Label className="px-2.5 pb-1 pt-1.5 text-xs font-medium text-slate-400">{children}</DropdownMenu.Label>;
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />;
}

/* ------------------------------ Popover ------------------------------ */

export const PopoverRoot = Popover.Root;
export const PopoverTrigger = Popover.Trigger;
export const PopoverClose = Popover.Close;

export function PopoverContent({ className, children, ...props }: ComponentProps<typeof Popover.Content>) {
  return (
    <Popover.Portal>
      <Popover.Content
        sideOffset={8}
        collisionPadding={12}
        className={cn("z-[60] rounded-2xl bg-white shadow-pop ring-1 ring-slate-200 outline-none data-[state=open]:animate-rise", className)}
        {...props}
      >
        {children}
      </Popover.Content>
    </Popover.Portal>
  );
}

/* -------------------------------- Tabs ------------------------------- */

export const Tabs = RadixTabs.Root;
export const TabsContent = RadixTabs.Content;

export function TabsList({ className, children }: { className?: string; children: ReactNode }) {
  return <RadixTabs.List className={cn("inline-flex items-center gap-0.5 rounded-lg bg-slate-100 p-1", className)}>{children}</RadixTabs.List>;
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-slate-500 transition hover:text-navy-900 data-[state=active]:bg-white data-[state=active]:text-navy-950 data-[state=active]:shadow-sm [&_svg]:size-3.5",
        className,
      )}
    >
      {children}
    </RadixTabs.Trigger>
  );
}
