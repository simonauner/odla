import { useNavigate } from "@tanstack/react-router";
import { CROPS } from "@shared/crops";
import { tomato } from "@shared/crops/tomato";
import { addDays } from "@shared/dates";
import { frostDates, ZONES, type Zone } from "@shared/zones";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toggle } from "@/components/ui/toggle";
import { formatDay } from "@/lib/format";
import { seasonYear, useProfile, useSeason, useSetLastFrost, useSetZone, useToggleCrop } from "@/lib/garden";

function ErrorAlert({ children }: { children: string }) {
  return (
    <Alert variant="destructive" className="mt-3">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

const tomatoPlantOut = tomato.steps.find((s) => s.id === "plant_out")!.window;

function FrostSection({ season }: { season: { id: string; year: number; zone: number; last_frost: string | null } }) {
  const setLastFrost = useSetLastFrost();
  const zoneGuess = frostDates(season.zone as Zone, season.year).lastFrost;
  const lastFrost = season.last_frost ?? zoneGuess;
  const plantOut = `${formatDay(addDays(lastFrost, tomatoPlantOut[0]))}–${formatDay(addDays(lastFrost, tomatoPlantOut[1]))}`;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("lastFrost"));
    if (value) setLastFrost.mutate({ seasonId: season.id, lastFrost: value === zoneGuess ? null : value });
  }

  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold">När är det frostfritt?</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        {season.last_frost
          ? `Du har satt frostfritt från ${formatDay(lastFrost)}, så frostkänsliga plantor som tomater kan planteras ut ${plantOut}. Utifrån zonen gissade vi ${formatDay(zoneGuess)}.`
          : `Vi gissar utifrån din zon att det är frostfritt från ${formatDay(lastFrost)}, så frostkänsliga plantor som tomater kan planteras ut ${plantOut}. Du kan korrigera datumet om du vet bättre för din plats.`}
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
        {season.last_frost && (
          <Button
            type="button"
            variant="ghost"
            disabled={setLastFrost.isPending}
            onClick={() => setLastFrost.mutate({ seasonId: season.id, lastFrost: null })}
          >
            Använd zonens gissning
          </Button>
        )}
      </form>
      {setLastFrost.isError && <ErrorAlert>Kunde inte spara datumet.</ErrorAlert>}
    </section>
  );
}

export function SetupPage() {
  const navigate = useNavigate();
  const profile = useProfile();
  const season = useSeason();
  const setZone = useSetZone();
  const toggleCrop = useToggleCrop();

  if (profile.isPending || season.isPending) return <p className="text-muted-foreground">Laddar…</p>;
  if (profile.isError || season.isError) return <ErrorAlert>Kunde inte hämta dina uppgifter.</ErrorAlert>;

  const zone = season.data?.zone ?? profile.data?.zone ?? null;
  const plantings = season.data?.plantings ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-1 text-lg font-semibold">Var odlar du?</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Välj odlingszon. Vet du inte vilken zon du har? Kolla på{" "}
          <a
            href="https://zonkartan.se/"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            zonkartan.se
          </a>
          .
        </p>
        <RadioGroup
          value={zone === null ? "" : String(zone)}
          onValueChange={(v) => setZone.mutate(Number(v))}
          disabled={setZone.isPending}
          className="grid gap-2 sm:grid-cols-2"
        >
          {ZONES.map((z) => (
            <Label
              key={z.zone}
              className="cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-data-checked:border-primary has-data-checked:bg-secondary"
            >
              <RadioGroupItem value={String(z.zone)} className="mt-0.5" />
              <span>
                <span className="font-medium">{z.label}</span>
                <span className="block text-xs text-muted-foreground">{z.examples}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
        {setZone.isError && <ErrorAlert>Kunde inte spara zonen.</ErrorAlert>}
      </section>

      {season.data && <FrostSection season={season.data} />}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Vad vill du odla {seasonYear}?</h2>
        {!season.data ? (
          <p className="text-sm text-muted-foreground">Välj zon först.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {CROPS.map((c) => {
              const planting = plantings.find((p) => p.crop_id === c.id);
              const outsideZone = zone !== null && (zone < c.zones.min || zone > c.zones.max);
              return (
                <Toggle
                  key={c.id}
                  variant="outline"
                  pressed={!!planting}
                  disabled={toggleCrop.isPending}
                  onPressedChange={() =>
                    toggleCrop.mutate({ seasonId: season.data!.id, cropId: c.id, plantingId: planting?.id })
                  }
                  className="rounded-full px-4"
                  title={outsideZone ? "Svårt i din zon utan växthus" : undefined}
                >
                  {c.name}
                  {outsideZone && <Badge variant="warning">Växthus</Badge>}
                </Toggle>
              );
            })}
          </div>
        )}
        {toggleCrop.isError && <ErrorAlert>Kunde inte spara grödan.</ErrorAlert>}
      </section>

      <Button size="lg" disabled={!season.data || plantings.length === 0} onClick={() => navigate({ to: "/" })}>
        Visa min plan
      </Button>
    </div>
  );
}
