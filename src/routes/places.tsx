import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Ellipsis } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteGarden, useGardens, useSeasons, useUpdateSeason, type Garden, type Season } from "@/lib/garden";
import { ErrorAlert, placeLabel } from "./setup";

function PlaceCard({
  garden,
  seasons,
  onDelete,
}: {
  garden: Garden;
  /** The place's open seasons, usually one. */
  seasons: Season[];
  onDelete: () => Promise<unknown>;
}) {
  const updateSeason = useUpdateSeason();
  const [closing, setClosing] = useState<Season | null>(null);
  const [deleting, setDeleting] = useState(false);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{garden.name}</CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Fler val för ${garden.name}`}>
                <Ellipsis aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {seasons.map((s) => (
                <DropdownMenuItem key={s.id} onSelect={() => setClosing(s)}>
                  Avsluta säsong {s.year}
                </DropdownMenuItem>
              ))}
              {seasons.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(true)}>
                Ta bort platsen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-1 text-muted-foreground">
        <p>{placeLabel(garden)}</p>
        {seasons.map((s) => (
          <p key={s.id} className="flex items-center justify-between gap-2">
            Säsong {s.year} · {s.plantings.length} {s.plantings.length === 1 ? "gröda" : "grödor"}
            <Button asChild variant="ghost" size="sm">
              <Link to="/plats/$seasonId" params={{ seasonId: s.id }}>
                Ändra
              </Link>
            </Button>
          </p>
        ))}
        {updateSeason.isError && <ErrorAlert>Kunde inte avsluta säsongen.</ErrorAlert>}
      </CardContent>
      <ConfirmDialog
        open={closing !== null}
        onOpenChange={(open) => !open && setClosing(null)}
        title={`Avsluta säsong ${closing?.year} på ${garden.name}?`}
        description="Säsongen försvinner ur din plan. Det du har bockat av och antecknat sparas."
        action="Avsluta säsongen"
        destructive={false}
        onConfirm={() => closing && updateSeason.mutateAsync({ seasonId: closing.id, closed: true })}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Ta bort ${garden.name}?`}
        description="Alla säsonger, grödor och anteckningar för platsen försvinner och går inte att få tillbaka."
        action="Ta bort"
        onConfirm={onDelete}
      />
    </Card>
  );
}

/** All the user's growing places, each with its open seasons. */
export function PlacesPage() {
  const gardens = useGardens();
  const seasons = useSeasons();
  const deleteGarden = useDeleteGarden();

  if (gardens.isPending || seasons.isPending) return <p className="text-muted-foreground">Laddar…</p>;
  if (gardens.isError || seasons.isError) return <ErrorAlert>Kunde inte hämta dina odlingsplatser.</ErrorAlert>;

  const places = gardens.data.map((g) => ({
    garden: g,
    open: seasons.data.filter((s) => s.garden.id === g.id && !s.closed_at),
  }));
  // Active: something is growing this season, i.e. an open season with crops.
  const groups = Map.groupBy(places, (p) => (p.open.some((s) => s.plantings.length > 0) ? "active" : "idle"));
  const sections = [
    { key: "active", title: "Med pågående säsong" },
    { key: "idle", title: "Utan pågående säsong" },
  ] as const;

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold">Odlingsplatser</h1>
      {gardens.data.length === 0 && <p className="text-muted-foreground">Du har inga odlingsplatser än.</p>}
      {sections.map(
        ({ key, title }) =>
          groups.has(key) && (
            <section key={key}>
              <h2 className="mb-3 font-heading text-2xl font-semibold">{title}</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {groups.get(key)!.map((p) => (
                  <li key={p.garden.id}>
                    <PlaceCard
                      garden={p.garden}
                      seasons={p.open}
                      onDelete={() => deleteGarden.mutateAsync(p.garden.id)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
      {deleteGarden.isError && <ErrorAlert>Kunde inte ta bort platsen.</ErrorAlert>}
      <Button asChild>
        <Link to="/setup">Lägg till plats</Link>
      </Button>
    </div>
  );
}
