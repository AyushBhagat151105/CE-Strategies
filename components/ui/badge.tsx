import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "critical" | "high" | "medium" | "low";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
    outline: "text-foreground border-border",
    critical: "border-red-800 bg-red-950/80 text-red-300 font-bold",
    high: "border-amber-800 bg-amber-950/80 text-amber-300",
    medium: "border-blue-800 bg-blue-950/80 text-blue-300",
    low: "border-slate-800 bg-slate-900 text-slate-300",
  };

  return (
    <div
      className={twMerge(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
