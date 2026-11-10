import { useEffect, useState, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { scheduleSlowLoading } from "@/lib/slow-loading";

/** Shows nothing while loading, and a message once loading is slow. Without children it stands in for a page that is loading. */
export function SlowLoading({ loading, children }: { loading: boolean; children?: ReactNode }) {
  const [shownAt, setShownAt] = useState<number | null>(null);
  useEffect(() => scheduleSlowLoading(loading, shownAt, setShownAt), [loading, shownAt]);

  if (shownAt !== null)
    return (
      <p role="status" className="mt-8 flex items-center gap-2 text-muted-foreground">
        <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />
        Det här tar ovanligt lång tid…
      </p>
    );

  return loading ? null : children;
}
