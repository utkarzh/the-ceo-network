import Image from "next/image";
import type { Profile } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

type PortraitSource = Pick<Profile, "fullName" | "photo" | "useInitials">;

function InitialsArt({ name, ring = true }: { name: string; ring?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(130%_100%_at_15%_0%,#3c4f78_0%,#172239_48%,#0d1526_100%)]">
      <div className="grain absolute inset-0 opacity-60" />
      {ring && <div className="absolute inset-[14%] rounded-full border border-gold-300/20" />}
      <span className="display relative text-[length:34cqw] leading-none tracking-tight text-gold-200">{initials(name)}</span>
    </div>
  );
}

/** Large profile image — approved TRC photograph, or the professional initials avatar. */
export function Portrait({ profile, className, sizes = "(min-width: 1024px) 280px, 60vw", priority }: { profile: PortraitSource; className?: string; sizes?: string; priority?: boolean }) {
  const photo = profile.photo && !profile.useInitials ? profile.photo : null;
  return (
    <div className={cn("@container relative overflow-hidden bg-navy-900", className)}>
      {photo ? (
        <Image src={photo} alt={profile.fullName} fill sizes={sizes} priority={priority} unoptimized={photo.startsWith("data:")} className="object-cover" />
      ) : (
        <InitialsArt name={profile.fullName} />
      )}
    </div>
  );
}

const avatarSizes = { xs: "size-6", sm: "size-8", md: "size-10", lg: "size-12", xl: "size-16", "2xl": "size-20" };

export function Avatar({ profile, size = "md", className, ring }: { profile: PortraitSource; size?: keyof typeof avatarSizes; className?: string; ring?: boolean }) {
  const photo = profile.photo && !profile.useInitials ? profile.photo : null;
  return (
    <div className={cn("@container relative shrink-0 overflow-hidden rounded-full bg-navy-900", avatarSizes[size], ring && "ring-2 ring-white", className)}>
      {photo ? (
        <Image src={photo} alt="" fill sizes="80px" unoptimized={photo.startsWith("data:")} className="object-cover" />
      ) : (
        <InitialsArt name={profile.fullName} ring={false} />
      )}
    </div>
  );
}

export function Cover({ src, alt, className, sizes = "(min-width: 1024px) 420px, 100vw", zoom = true }: { src: string; alt: string; className?: string; sizes?: string; zoom?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden bg-slate-200", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} className={cn("object-cover", zoom && "transition-transform duration-700 ease-out group-hover:scale-[1.04]")} />
    </div>
  );
}
