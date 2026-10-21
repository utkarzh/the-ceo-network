"use client";

import { LayoutDashboard, LogOut, Menu as MenuIcon, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { GoogleG, Logo } from "@/components/brand";
import { Avatar } from "@/components/profile/portrait";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger, Modal } from "@/components/ui/overlay";
import { useApp, useCurrentMember } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/directory", label: "Directory" },
  { href: "/#about", label: "About" },
];
const SOCIAL = [
  { href: "/feed", label: "Feed" },
  { href: "/messages", label: "Messages" },
  { href: "/groups", label: "Groups" },
];

function NavLink({ href, children, preview }: { href: string; children: ReactNode; preview?: boolean }) {
  const pathname = usePathname();
  const active = href !== "/#about" && pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors",
        active ? "text-white" : "text-white/65 hover:text-white",
      )}
    >
      {children}
      {preview && <span className="ml-1.5 rounded bg-white/10 px-1 py-px align-[1px] text-[9px] font-semibold uppercase tracking-wider text-gold-300">Preview</span>}
      {active && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-gold-400" />}
    </Link>
  );
}

export function SignInDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const profiles = useApp((s) => s.profiles);
  const setPersona = useApp((s) => s.setPersona);
  const demoMember = profiles.find((p) => p.invite.status === "registered" && p.status === "active");
  const signIn = (how: string) => {
    if (!demoMember) return;
    setPersona("member", demoMember.id);
    onOpenChange(false);
    toast.success(`Signed in with ${how}`, { description: `Demo: you are viewing as ${demoMember.fullName}, a verified member.` });
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} size="sm" title="Sign in to the CEO Network" description="Membership is by invitation. Verified members sign in with Google or their verified email address.">
      <div className="space-y-3 pb-2">
        <Button variant="secondary" size="lg" className="w-full" onClick={() => signIn("Google")}>
          <GoogleG className="size-5" /> Continue with Google
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={() => signIn("verified email")}>
          Continue with verified email
        </Button>
        {demoMember && (
          <p className="pt-2 text-center text-xs text-slate-500">
            Demo — you will be signed in as <span className="font-medium text-slate-700">{demoMember.fullName}</span>.
          </p>
        )}
      </div>
    </Modal>
  );
}

export function SiteHeader() {
  const persona = useApp((s) => s.persona);
  const setPersona = useApp((s) => s.setPersona);
  const member = useCurrentMember();
  const router = useRouter();
  const [signInOpen, setSignInOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = persona === "guest" ? NAV : [...NAV, ...SOCIAL];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/5 bg-navy-950/95 text-white backdrop-blur supports-[backdrop-filter]:bg-navy-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center md:flex">
          {NAV.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}
          {persona !== "guest" &&
            SOCIAL.map((l) => (
              <NavLink key={l.href} href={l.href} preview>
                {l.label}
              </NavLink>
            ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {persona === "director" && (
            <Button asChild variant="inverse" size="sm" className="hidden sm:inline-flex">
              <Link href="/admin">
                <LayoutDashboard /> TRC Console
              </Link>
            </Button>
          )}
          {persona === "member" && member && (
            <Menu>
              <MenuTrigger className="flex items-center gap-2 rounded-full p-0.5 pr-3 text-sm text-white/85 transition hover:bg-white/10">
                <Avatar profile={member} size="sm" />
                <span className="hidden sm:inline">{member.fullName.split(" ")[0]}</span>
              </MenuTrigger>
              <MenuContent>
                <MenuLabel>Signed in as {member.fullName}</MenuLabel>
                <MenuItem icon={<UserRound />} onSelect={() => router.push(`/p/${member.slug}`)}>
                  My profile
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  icon={<LogOut />}
                  onSelect={() => {
                    setPersona("guest");
                    toast("Signed out");
                  }}
                >
                  Sign out
                </MenuItem>
              </MenuContent>
            </Menu>
          )}
          {persona === "guest" && (
            <>
              <span className="mr-1 hidden h-5 w-px bg-white/20 sm:block" />
              <Button variant="ghost-inverse" size="sm" onClick={() => setSignInOpen(true)}>
                Sign in
              </Button>
            </>
          )}
          <Button variant="ghost-inverse" size="icon" className="md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            {mobileOpen ? <X /> : <MenuIcon />}
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden" onClick={() => setMobileOpen(false)}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white">
              {l.label}
            </Link>
          ))}
          {persona === "director" && (
            <Link href="/admin" className="block rounded-lg px-3 py-2.5 text-sm text-gold-300 hover:bg-white/5">
              TRC Console
            </Link>
          )}
        </nav>
      )}
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-slate-200/80 bg-white">
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Logo tone="dark" />
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            A private, verified network for the chief executives and business leaders featured in TRC reports. Every profile is prepared by TRC and published only with the
            leader&apos;s permission.
          </p>
        </div>
        <div>
          <p className="eyebrow text-slate-400">Network</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link href="/directory" className="hover:text-navy-950">
                Member directory
              </Link>
            </li>
            <li>
              <Link href="/#how" className="hover:text-navy-950">
                How membership works
              </Link>
            </li>
            <li>
              <Link href="/#principles" className="hover:text-navy-950">
                Our principles
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-slate-400">Trust</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Privacy notice</li>
            <li>Membership terms</li>
            <li>Data protection requests</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:px-6 lg:px-8">
          <p>© 2026 TRC · CEO Network</p>
          <p>Prototype — all data is simulated in your browser.</p>
        </div>
      </div>
    </footer>
  );
}

/** Wraps member-only pages. Directors (TRC staff) and members pass; guests see a gate. */
export function MemberGate({ children, title = "Members only", blurb }: { children: ReactNode; title?: string; blurb?: ReactNode }) {
  const persona = useApp((s) => s.persona);
  const [open, setOpen] = useState(false);
  if (persona !== "guest") return <>{children}</>;
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none max-h-[70vh] overflow-hidden opacity-60 blur-[6px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center bg-gradient-to-b from-canvas/40 via-canvas/80 to-canvas pt-24">
        <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-pop ring-1 ring-slate-200">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-navy-950 text-gold-300">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 1 1 8 0v3" />
            </svg>
          </div>
          <h2 className="display mt-5 text-2xl text-navy-950">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {blurb ?? "The CEO Network directory is available to verified members only. Leaders featured in TRC reports receive a personal invitation."}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => setOpen(true)}>Sign in</Button>
            <Button variant="secondary" asChild>
              <Link href="/#how">How to join</Link>
            </Button>
          </div>
        </div>
      </div>
      <SignInDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
