import { Link, useParams } from "@tanstack/react-router";
import { guessLastFrost } from "@shared/zones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDay } from "@/lib/format";
import { useSeasons, useSetLastFrost, useToggleCrop, type Season } from "@/lib/garden";
import { CropToggles, ErrorAlert, frostHint, placeLabel } from "./setup";

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
    <section>
      <h2 className="mb-1 text-lg font-semibold">När är det frostfritt?</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        {season.last_frost && season.last_frost !== guess
          ? `Du har satt frostfritt från ${formatDay(lastFrost)}. Vi gissade ${formatDay(guess)}. `
          : `Vi gissar frostfritt från ${formatDay(guess)}. `}
        {frostHint(lastFrost)} Flyttar du datumet flyttas alla steg som inte är avbockade.
      </p>
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="last-frost">Frostfritt från</Label>
          <Input
            key={lastFrost}
            id="last-frost"
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
    </section>
  );
}

/** Edit one place's to-do list for the year: frost date and crops. */
export function PlacePage() {
  const { seasonId } = useParams({ strict: false });
  const seasons = useSeasons();
  const toggleCrop = useToggleCrop();

  if (seasons.isPending) return <p className="text-muted-foreground">Laddar…</p>;
  if (seasons.isError) return <ErrorAlert>Kunde inte hämta dina uppgifter.</ErrorAlert>;
  const season = seasons.data.find((s) => s.id === seasonId);
  if (!season) return <ErrorAlert>Hittade inte odlingsplatsen.</ErrorAlert>;

  const plantings = season.plantings;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">{season.garden.name}</h1>
        <p className="text-muted-foreground">
          {placeLabel(season.garden)} · Odlingsår {season.year}
        </p>
      </div>

      <FrostSection season={season} />

      <section>
        <h2 className="mb-1 text-lg font-semibold">Grödor</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Tar du bort en gröda försvinner också det du har bockat av för den.
        </p>
        <CropToggles
          zone={season.garden.zone}
          kind={season.garden.kind}
          disabled={toggleCrop.isPending}
          isSelected={(id) => plantings.some((p) => p.crop_id === id)}
          onToggle={(id) =>
            toggleCrop.mutate({
              seasonId: season.id,
              cropId: id,
              plantingId: plantings.find((p) => p.crop_id === id)?.id,
            })
          }
        />
        {toggleCrop.isError && <ErrorAlert>Kunde inte spara grödan.</ErrorAlert>}
      </section>

      <Button asChild size="lg">
        <Link to="/">Visa min plan</Link>
      </Button>
    </div>
  );
}
