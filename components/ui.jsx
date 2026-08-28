import Link from "next/link";
import { clsx } from "@/lib/clsx";

export function Screen({ children, tone = "dark", className }) {
  return (
    <div
      className={clsx(
        "mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8",
        tone === "dark" && "bg-bcs-navy text-white",
        tone === "light" && "bg-slate-100 text-bcs-navy",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Card({ children, className }) {
  return (
    <div className={clsx("rounded-card bg-white p-6 text-bcs-navy shadow-lg", className)}>
      {children}
    </div>
  );
}

export function Button({ children, as = "button", href, variant = "primary", className, ...props }) {
  const base =
    "flex w-full items-center justify-center rounded-full px-6 py-4 text-center text-base font-bold transition active:scale-[.99] disabled:opacity-40";
  const variants = {
    primary: "bg-bcs-blue-600 text-white",
    light: "bg-white text-bcs-blue-600",
    ghost: "bg-transparent text-bcs-blue-600",
    outline: "border border-white/30 bg-transparent text-white",
  };
  const cn = clsx(base, variants[variant], className);
  if (as === "link" && href) {
    return (
      <Link href={href} className={cn} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cn} {...props}>
      {children}
    </button>
  );
}

export function Amount({ children, className }) {
  return <span className={clsx("font-extrabold tabular-nums", className)}>{children}</span>;
}
