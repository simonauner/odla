import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { guessLastFrost } from "@shared/zones";
import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDay } from "@/lib/format";
import {
  isOpen,
  useDeleteGarden,
  useGardens,
  useSeasons,
  useSetLastFrost,
  useUpdateGarden,
  useUpdatePlantings,
  type Garden,
  type Season,
} from "@/lib/garden";
import { CropChips } from "./crops";
import { ErrorAlert, frostHint, PlaceFields, placeLabel } from "./setup";

function FrostSection({ season }: { season: Season }) {
  const setLastFrost = useSetLastFrost();
  const guess = guessLastFrost(season.garden.zone, season.year, season.garden.kind);
  const lastFrost = season.last_frost ?? guess;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("lastFrost"));
    if (value) setLastFrost.mutate({ seasonId: season.id, lastFrost: value === guess ? null : value });
  }

  return (
    <div>
      <h3 className="mb-1 font-semibold">När är det frostfritt {season.year}?</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        {season.last_frost && season.last_frost !== guess
          ? `Du har satt frostfritt från ${formatDay(lastFrost)}. Vi gissade ${formatDay(guess)}. `
          : `Vi gissar frostfritt från ${formatDay(guess)}. `}
        {frostHint(lastFrost)} Flyttar du datumet flyttas alla steg som inte är avbockade.
      </p>
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor={`last-frost-${season.year}`}>Frostfritt från</Label>
          <Input
            key={lastFrost}
            id={`last-frost-${season.year}`}
            name="lastFrost"
            type="date"
            required
            defaultValue={lastFrost}
            min={`${season.year}-03-01`}
            max={`${season.year}-07-31`}
          />
        </div>
        <Button type="submit" variant="secondary" disabled={setLastFrost.isPending}>
          Spara datum
        </Button>
        {season.last_frost && season.last_frost !== guess && (
          <Button
            type="button"
            variant="ghost"
            disabled={setLastFrost.isPending}
            onClick={() => setLastFrost.mutate({ seasonId: season.id, lastFrost: null })}
          >
            Använd vår gissning
          </Button>
        )}
      </form>
      {setLastFrost.isError && <ErrorAlert>Kunde inte spara datumet.</ErrorAlert>}
    </div>
  );
}

/** One season's crops at the place, each linking to its own page, and the season's frost date. */
function SeasonSection({ season }: { season: Season }) {
  const updatePlantings = useUpdatePlantings();
  const growing = season.plantings.filter((p) => !p.closed_at);

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-2xl font-semibold">Grödor {season.year}</h2>
      <CropChips plantings={season.plantings} />
      {growing.length > 0 && (
        <ConfirmButton
          variant="outline"
          size="sm"
          destructive={false}
          title={`Avsluta alla grödor ${season.year} på ${season.garden.name}?`}
          description="Grödorna försvinner ur din plan. Det du har bockat av och antecknat sparas."
          action="Avsluta grödorna"
          onConfirm={() => updatePlantings.mutateAsync({ plantingIds: growing.map((p) => p.id), closed: true })}
        >
          Avsluta alla grödor {season.year}
        </ConfirmButton>
      )}
      {updatePlantings.isError && <ErrorAlert>Kunde inte avsluta grödorna.</ErrorAlert>}
      <FrostSection season={season} />
    </section>
  );
}

/** Renames the place or changes its kind or zone. */
function EditPlace({ garden }: { garden: Garden }) {
  const update = useUpdateGarden();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(garden.name);
  const [kind, setKind] = useState(garden.kind);
  const [zone, setZone] = useState(garden.zone);

  if (!open)
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Ändra platsen
      </Button>
    );

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        update.mutate({ id: garden.id, name: name.trim(), kind, zone }, { onSuccess: () => setOpen(false) });
      }}
    >
      <h2 className="font-heading text-2xl font-semibold">Ändra platsen</h2>
      <PlaceFields name={name} kind={kind} zone={zone} onName={setName} onKind={setKind} onZone={setZone} />
      <div className="flex gap-2">
        <Button type="submit" disabled={name.trim() === "" || update.isPending}>
          Spara
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Avbryt
        </Button>
      </div>
      {update.isError && <ErrorAlert>Kunde inte spara platsen.</ErrorAlert>}
    </form>
  );
}

/** A place: what grows there now, its frost dates, and editing or deleting it. */
export function PlacePage() {
  const { gardenId } = useParams({ strict: false });
  const navigate = useNavigate();
  const gardens = useGardens();
  const seasons = useSeasons();
  const deleteGarden = useDeleteGarden();

  if (gardens.isPending || seasons.isPending) return <p className="text-muted-foreground">Laddar…</p>;
  if (gardens.isError || seasons.isError) return <ErrorAlert>Kunde inte hämta dina uppgifter.</ErrorAlert>;
  const garden = gardens.data.find((g) => g.id === gardenId);
  if (!garden) return <ErrorAlert>Hittade inte odlingsplatsen.</ErrorAlert>;
  // Seasons with something still growing; closed crops show there until the whole season is done.
  const current = seasons.data.filter((s) => s.garden.id === garden.id && isOpen(s) && s.plantings.length > 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold">{garden.name}</h1>
        <p className="text-muted-foreground">{placeLabel(garden)}</p>
      </div>

      {current.length === 0 && <p className="text-muted-foreground">Inget växer här just nu.</p>}
      {current.map((s) => (
        <SeasonSection key={s.id} season={s} />
      ))}

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/odlingar/ny" search={{ plats: garden.id }}>
            Lägg till grödor här
          </Link>
        </Button>
      </div>

      <EditPlace key={garden.id} garden={garden} />

      <div>
        <ConfirmButton
          title={`Ta bort ${garden.name}?`}
          description="Alla säsonger, grödor och anteckningar för platsen försvinner och går inte att få tillbaka."
          action="Ta bort"
          onConfirm={() => deleteGarden.mutateAsync(garden.id, { onSuccess: () => navigate({ to: "/odlingar" }) })}
        >
          Ta bort platsen
        </ConfirmButton>
        {deleteGarden.isError && <ErrorAlert>Kunde inte ta bort platsen.</ErrorAlert>}
      </div>
    </div>
  );
}
