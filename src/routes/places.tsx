import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Ellipsis } from "lucide-react";
import { findCrop } from "@shared/crops";
import { ConfirmDialog } from "@/components/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteGarden, useGardens, useSeasons, useUpdatePlantings, type Garden, type Season } from "@/lib/garden";
import { ErrorAlert, placeLabel } from "./setup";

const MAX_CHIPS = 5;

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
    <Card size="sm" className="relative has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring">
      <CardHeader>
        <CardTitle>
          {/* The ::after stretches the link over the whole card; the menu sits above it. */}
          <Link
            to="/plats/$gardenId"
            params={{ gardenId: garden.id }}
            className="outline-none after:absolute after:inset-0"
          >
            {garden.name}
          </Link>
        </CardTitle>
        <CardDescription>{placeLabel(garden)}</CardDescription>
        <CardAction className="relative">
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
      <CardContent className="space-y-2">
        {seasons.length === 0 && <p className="text-sm text-muted-foreground">Inget växer just nu</p>}
        {seasons.map((s) => {
          const crops = growing(s);
          return (
            <div key={s.id} className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-sm text-muted-foreground">{s.year}</span>
              {crops.slice(0, MAX_CHIPS).map((name) => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))}
              {crops.length > MAX_CHIPS && <Badge variant="outline">+{crops.length - MAX_CHIPS} till</Badge>}
            </div>
          );
        })}
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
  // Places where something grows come first.
  places.sort((a, b) => Number(b.open.length > 0) - Number(a.open.length > 0));

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold">Odlingsplatser</h1>
      {gardens.data.length === 0 ? (
        <p className="text-muted-foreground">Du har inga odlingsplatser än.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {places.map((p) => (
            <li key={p.garden.id}>
              <PlaceCard garden={p.garden} seasons={p.open} onDelete={() => deleteGarden.mutateAsync(p.garden.id)} />
            </li>
          ))}
        </ul>
      )}
      {deleteGarden.isError && <ErrorAlert>Kunde inte ta bort platsen.</ErrorAlert>}
      <Button asChild>
        <Link to="/setup">Lägg till plats</Link>
      </Button>
    </div>
  );
}
