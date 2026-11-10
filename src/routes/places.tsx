import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Ellipsis } from "lucide-react";
import { findCrop } from "@shared/crops";
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
import { useDeleteGarden, useGardens, useSeasons, useUpdatePlantings, type Garden, type Season } from "@/lib/garden";
import { ErrorAlert, placeLabel } from "./setup";

const growing = (s: Season) =>
  s.plantings.filter((p) => !p.closed_at).map((p) => findCrop(p.crop_id)?.name ?? p.crop_id);

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
  const updatePlantings = useUpdatePlantings();
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
                  Avsluta alla grödor {s.year}
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
          <p key={s.id}>
            {s.year}: {growing(s).join(", ")}
          </p>
        ))}
        <Button asChild variant="ghost" size="sm">
          <Link to="/plats/$gardenId" params={{ gardenId: garden.id }}>
            {seasons.length > 0 ? "Ändra grödor" : "Lägg till grödor"}
          </Link>
        </Button>
        {updatePlantings.isError && <ErrorAlert>Kunde inte avsluta grödorna.</ErrorAlert>}
      </CardContent>
      <ConfirmDialog
        open={closing !== null}
        onOpenChange={(open) => !open && setClosing(null)}
        title={`Avsluta alla grödor ${closing?.year} på ${garden.name}?`}
        description="Grödorna försvinner ur din plan. Det du har bockat av och antecknat sparas."
        action="Avsluta grödorna"
        destructive={false}
        onConfirm={() =>
          closing &&
          updatePlantings.mutateAsync({
            plantingIds: closing.plantings.filter((p) => !p.closed_at).map((p) => p.id),
            closed: true,
          })
        }
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
    open: seasons.data.filter((s) => s.garden.id === g.id && growing(s).length > 0),
  }));
  // Active: something is growing, in any season.
  const groups = Map.groupBy(places, (p) => (p.open.length > 0 ? "active" : "idle"));
  const sections = [
    { key: "active", title: "Där något växer" },
    { key: "idle", title: "Där inget växer just nu" },
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
