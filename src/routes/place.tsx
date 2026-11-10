import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { CROPS, findCrop } from "@shared/crops";
import { cropSpan } from "@shared/season";
import { guessLastFrost } from "@shared/zones";
import { ConfirmButton } from "@/components/confirm-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatDay, formatSpan } from "@/lib/format";
import {
  isOpen,
  seasonYear,
  useAddCrop,
  useGardens,
  useRemoveCrop,
  useSeasons,
  useSetLastFrost,
  useUpdatePlantings,
  type Garden,
  type Season,
} from "@/lib/garden";
import { ErrorAlert, frostHint, needsGreenhouse, placeLabel, radioCard } from "./setup";

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

const cropName = (id: string) => findCrop(id)?.name ?? id;

/** One season's crops at the place, each with when it grows, and the season's frost date. */
function SeasonSection({ season }: { season: Season }) {
  const remove = useRemoveCrop();
  const updatePlantings = useUpdatePlantings();
  const busy = remove.isPending || updatePlantings.isPending;
  const lastFrost = season.last_frost ?? guessLastFrost(season.garden.zone, season.year, season.garden.kind);

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-2xl font-semibold">Grödor {season.year}</h2>
      <ul className="space-y-2">
        {season.plantings.map((p) => {
          const crop = findCrop(p.crop_id);
          const name = cropName(p.crop_id);
          const span = crop && cropSpan(crop, season.garden.zone, season.year, lastFrost);
          return (
            <li key={p.id}>
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {name}
                    {p.closed_at && <Badge variant="secondary">Avslutad</Badge>}
                  </CardTitle>
                  <CardAction className="flex gap-1">
                    {p.closed_at && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => updatePlantings.mutate({ plantingIds: [p.id], closed: false })}
                      >
                        Öppna igen
                      </Button>
                    )}
                    <ConfirmButton
                      size="sm"
                      disabled={busy}
                      title={`Ta bort ${name.toLowerCase()} ${season.year} från ${season.garden.name}?`}
                      description="Det du har bockat av och antecknat för grödan försvinner och går inte att få tillbaka."
                      action="Ta bort"
                      onConfirm={() => remove.mutateAsync(p.id)}
                    >
                      Ta bort
                    </ConfirmButton>
                  </CardAction>
                </CardHeader>
                {span && (
                  <CardContent className="text-muted-foreground">{formatSpan(span.start, span.end)}</CardContent>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
      {(remove.isError || updatePlantings.isError) && <ErrorAlert>Kunde inte spara grödan.</ErrorAlert>}
      <FrostSection season={season} />
    </section>
  );
}

/** Lets the user add crops for this season or the next; autumn-planted crops start the year before. */
function AddCrop({ garden, seasons }: { garden: Garden; seasons: Season[] }) {
  const add = useAddCrop();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(seasonYear);
  const [added, setAdded] = useState<string | null>(null);

  const season = seasons.find((s) => s.year === year);
  // Last year's frost date at the place, moved to this year, for a season we create.
  const previous = seasons.findLast((s) => s.year < year && s.last_frost);
  const lastFrost = season ? season.last_frost : previous ? `${year}${previous.last_frost!.slice(4)}` : null;
  const choices = CROPS.filter((crop) => !season?.plantings.some((p) => p.crop_id === crop.id)).map((crop) => ({
    crop,
    span: cropSpan(crop, garden.zone, year, lastFrost ?? guessLastFrost(garden.zone, year, garden.kind)),
  }));
  const message = added && (
    <Alert>
      <AlertDescription>{added}</AlertDescription>
    </Alert>
  );

  if (!open)
    return (
      <div className="space-y-3">
        {message}
        <Button variant="outline" onClick={() => setOpen(true)}>
          Lägg till gröda
        </Button>
      </div>
    );

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-2xl font-semibold">Lägg till gröda</h2>
      <div className="space-y-2">
        <p className="text-sm font-medium">För vilket år?</p>
        <RadioGroup
          value={String(year)}
          onValueChange={(v) => setYear(Number(v))}
          className="grid grid-cols-2 gap-2 sm:w-80"
        >
          {[seasonYear, seasonYear + 1].map((y) => (
            <Label key={y} className={radioCard}>
              <RadioGroupItem value={String(y)} className="mt-0.5" />
              <span className="font-medium">{y}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>
      {message}
      <div className="flex flex-wrap gap-2">
        {choices.map(({ crop, span }) => (
          <Button
            key={crop.id}
            variant="outline"
            className="rounded-full"
            disabled={add.isPending}
            onClick={() =>
              add.mutate(
                { gardenId: garden.id, year, cropId: crop.id, seasonId: season?.id, lastFrost },
                {
                  onSuccess: () => setAdded(`${crop.name} ligger under ${year}: ${formatSpan(span.start, span.end)}.`),
                },
              )
            }
          >
            {crop.name}
            {span.start.slice(0, 4) !== String(year) && (
              <Badge variant="secondary">Sätts hösten {span.start.slice(0, 4)}</Badge>
            )}
            {needsGreenhouse(crop, garden) && <Badge variant="warning">Kräver växthus</Badge>}
          </Button>
        ))}
      </div>
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Klar
      </Button>
      {add.isError && <ErrorAlert>Kunde inte lägga till grödan.</ErrorAlert>}
    </section>
  );
}

/** A place with its crops, grouped by the season they belong to. */
export function PlacePage() {
  const { gardenId } = useParams({ strict: false });
  const gardens = useGardens();
  const seasons = useSeasons();

  if (gardens.isPending || seasons.isPending) return <p className="text-muted-foreground">Laddar…</p>;
  if (gardens.isError || seasons.isError) return <ErrorAlert>Kunde inte hämta dina uppgifter.</ErrorAlert>;
  const garden = gardens.data.find((g) => g.id === gardenId);
  if (!garden) return <ErrorAlert>Hittade inte odlingsplatsen.</ErrorAlert>;
  const placeSeasons = seasons.data.filter((s) => s.garden.id === garden.id);
  // Seasons with something still growing; closed crops show there until the whole season is done.
  const current = placeSeasons.filter((s) => isOpen(s) && s.plantings.length > 0);

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

      <AddCrop garden={garden} seasons={placeSeasons} />

      <Button asChild size="lg">
        <Link to="/">Visa min plan</Link>
      </Button>
    </div>
  );
}
