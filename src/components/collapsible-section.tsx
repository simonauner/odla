import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** A section with a heading that collapses; its open state is remembered in localStorage under `storageKey`. */
export function CollapsibleSection({
  title,
  storageKey,
  defaultOpen = true,
  className,
  summaryClassName,
  children,
}: {
  title: ReactNode;
  storageKey: string;
  defaultOpen?: boolean;
  className?: string;
  summaryClassName?: string;
  children: ReactNode;
}) {
  const stored = localStorage.getItem(storageKey);
  return (
    <details
      className={cn("group", className)}
      open={stored ? stored === "open" : defaultOpen}
      onToggle={(e) => localStorage.setItem(storageKey, e.currentTarget.open ? "open" : "closed")}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between font-heading text-2xl font-semibold [&::-webkit-details-marker]:hidden",
          summaryClassName,
        )}
      >
        <h2>{title}</h2>
        <ChevronDown aria-hidden className="size-6 transition-transform group-open:rotate-180" />
      </summary>
      {children}
    </details>
  );
}
