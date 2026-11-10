import { Link } from "@tanstack/react-router";
import { findCrop } from "@shared/crops";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Season } from "@/lib/garden";

/** Crops as small cards with a symbol that open each crop's page; closed ones are dimmed and marked. */
export function CropChips({ plantings }: { plantings: Season["plantings"] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
      {plantings.map((p) => {
        const crop = findCrop(p.crop_id);
        return (
          <li key={p.id}>
            <Link
              to="/odling/$plantingId"
              params={{ plantingId: p.id }}
              className={cn(
                "flex h-full flex-col items-center gap-1 rounded-lg bg-secondary px-2 py-3 text-center text-sm font-medium text-secondary-foreground outline-none hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring",
                p.closed_at && "bg-transparent text-muted-foreground ring-1 ring-border",
              )}
            >
              <span aria-hidden className="text-3xl leading-none">
                {crop?.emoji ?? "🌱"}
              </span>
              {crop?.name ?? p.crop_id}
              {p.closed_at && <Badge variant="outline">Avslutad</Badge>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
