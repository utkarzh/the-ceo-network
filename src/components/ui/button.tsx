import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-navy-900 text-white shadow-[0_1px_2px_rgb(13_21_38/0.25)] hover:bg-navy-800 active:bg-navy-950 disabled:bg-navy-900/35",
  secondary:
    "bg-white text-navy-900 ring-1 ring-inset ring-slate-200 shadow-[0_1px_1px_rgb(16_24_40/0.04)] hover:bg-slate-50 hover:ring-slate-300 disabled:text-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-navy-950 disabled:text-slate-300",
  gold: "bg-gold-500 text-white shadow-[0_1px_2px_rgb(95_67_34/0.3)] hover:bg-gold-600 disabled:bg-gold-500/40",
  success: "bg-emerald-700 text-white shadow-[0_1px_2px_rgb(6_78_59/0.3)] hover:bg-emerald-800 disabled:bg-emerald-700/40",
  danger: "bg-white text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 disabled:text-rose-300",
  inverse: "bg-white text-navy-950 hover:bg-gold-50",
  "ghost-inverse": "text-white/75 hover:bg-white/10 hover:text-white",
  link: "h-auto px-0 text-link underline-offset-4 hover:underline",
} as const;

const sizes = {
  xs: "h-7 gap-1.5 rounded-md px-2.5 text-xs [&_svg]:size-3.5",
  sm: "h-8 gap-1.5 rounded-lg px-3 text-[13px] [&_svg]:size-4",
  md: "h-10 gap-2 rounded-lg px-4 text-sm [&_svg]:size-4",
  lg: "h-12 gap-2.5 rounded-xl px-5 text-[15px] [&_svg]:size-[18px]",
  icon: "size-9 rounded-lg [&_svg]:size-4",
  "icon-sm": "size-8 rounded-md [&_svg]:size-4",
} as const;

export type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", asChild, loading, className, children, disabled, ...props }: ButtonProps) {
  const classes = cn(
    "inline-flex select-none items-center justify-center font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 disabled:pointer-events-none [&_svg]:shrink-0",
    sizes[size],
    variants[variant],
    variant === "link" && "h-auto px-0",
    className,
  );
  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <LoaderCircle className="animate-spin" />}
      {children}
    </button>
  );
}
