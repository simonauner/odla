import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CROPS } from "@shared/crops";
import { tomato } from "@shared/crops/tomato";
import { addDays } from "@shared/dates";
import { guessLastFrost, zoneInfo, ZONES, type GardenKind, type Zone } from "@shared/zones";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toggle } from "@/components/ui/toggle";
import { formatDay } from "@/lib/format";
import { seasonYear, useCreateSeason, useGardens, useSeasons } from "@/lib/garden";

export function ErrorAlert({ children }: { children: string }) {
  return (
    <Alert variant="destructive" className="mt-3">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export const kindLabel: Record<GardenKind, string> = { open: "Friland", greenhouse: "Växthus" };

export function placeLabel(garden: { zone: Zone; kind: GardenKind }): string {
  return `${zoneInfo(garden.zone).label}, ${kindLabel[garden.kind].toLowerCase()}`;
}

const tomatoPlantOut = tomato.steps.find((s) => s.id === "plant_out")!.window;

/** Explains what the frost date means, with tomato planting out as the example. */
export function frostHint(lastFrost: string): string {
  return `Frostkänsliga plantor som tomater kan då planteras ut ${formatDay(addDays(lastFrost, tomatoPlantOut[0]))}–${formatDay(addDays(lastFrost, tomatoPlantOut[1]))}.`;
}

export const radioCard =
  "cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-data-checked:border-primary has-data-checked:bg-secondary";

/** Whether a crop is hard on open ground in the zone, so it needs a greenhouse there. */
export function needsGreenhouse(crop: (typeof CROPS)[number], place: { zone: Zone; kind: GardenKind }): boolean {
  return place.kind === "open" && (place.zone < crop.zones.min || place.zone > crop.zones.max);
}

export function CropToggles(props: {
  zone: Zone;
  kind: GardenKind;
  isSelected: (cropId: string) => boolean;
  onToggle: (cropId: string) => void;
  disabled?: boolean;
}) {
  const outside = (c: (typeof CROPS)[number]) => needsGreenhouse(c, props);
  return (
    <div className="space-y-3">
      {CROPS.some(outside) && (
        <p className="text-sm text-muted-foreground">
          Grödor märkta <Badge variant="warning">Kräver växthus</Badge> är svåra på friland i{" "}
          {zoneInfo(props.zone).label.replace("Zon", "zon")}.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {CROPS.map((c) => {
          const outsideZone = outside(c);
          return (
            <Toggle
              key={c.id}
              variant="outline"
              pressed={props.isSelected(c.id)}
              disabled={props.disabled}
              onPressedChange={() => props.onToggle(c.id)}
              className="rounded-full px-4"
            >
              {c.name}
              {outsideZone && <Badge variant="warning">Kräver växthus</Badge>}
            </Toggle>
          );
        })}
      </div>
    </div>
  );
}

const NEW = "new";

/** Step by step: pick or create a place, set the frost date, pick crops. Creates that place's to-do list for the year. */
export function SetupPage() {
  const navigate = useNavigate();
  const gardens = useGardens();
  const seasons = useSeasons();
  const create = useCreateSeason();
  const [step, setStep] = useState(1);
  const [gardenChoice, setGardenChoice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [zone, setZone] = useState<Zone | null>(null);
  const [kind, setKind] = useState<GardenKind>("open");
  const [lastFrost, setLastFrost] = useState<string | null>(null);
  // null until the user changes them: then we suggest last year's crops at the place.
  const [cropIds, setCropIds] = useState<string[] | null>(null);

  if (gardens.isPending || seasons.isPending) return <p className="text-muted-foreground">Laddar…</p>;
  if (gardens.isError || seasons.isError) return <ErrorAlert>Kunde inte hämta dina uppgifter.</ErrorAlert>;

  // A place has at most one list per year, so only places without one this year can be picked.
  const free = gardens.data.filter((g) => !seasons.data.some((s) => s.garden.id === g.id && s.year === seasonYear));
  const choice = gardenChoice ?? free[0]?.id ?? NEW;
  const existing = free.find((g) => g.id === choice);
  const place = existing ?? (zone === null ? null : { zone, kind });
  const guess = place ? guessLastFrost(place.zone, seasonYear, place.kind) : null;
  // Last year's season at the place, if any, to start from the same crops and frost date.
  const previous = existing && seasons.data.findLast((s) => s.garden.id === existing.id && s.year < seasonYear);
  const previousFrost = previous && previous.last_frost ? `${seasonYear}${previous.last_frost.slice(4)}` : null;
  const frost = lastFrost ?? previousFrost ?? guess;
  const crops = cropIds ?? previous?.plantings.map((p) => p.crop_id) ?? [];

  function chooseGarden(id: string) {
    setGardenChoice(id);
    setLastFrost(null);
    setCropIds(null);
  }
  const placeReady = !!existing || (name.trim() !== "" && zone !== null);

  function submit() {
    if (!place || !frost) return;
    create.mutate(
      {
        garden: existing ? { id: existing.id } : { name: name.trim(), zone: place.zone, kind: place.kind },
        lastFrost: frost,
        cropIds: crops,
      },
      { onSuccess: () => navigate({ to: "/" }) },
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Steg {step} av 3 · Odlingsår {seasonYear}
      </p>

      {step === 1 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Var ska du odla?</h2>
          {free.length > 0 && (
            <RadioGroup value={choice} onValueChange={chooseGarden} className="grid gap-2 sm:grid-cols-2">
              {free.map((g) => (
                <Label key={g.id} className={radioCard}>
                  <RadioGroupItem value={g.id} className="mt-0.5" />
                  <span>
                    <span className="font-medium">{g.name}</span>
                    <span className="block text-xs text-muted-foreground">{placeLabel(g)}</span>
                  </span>
                </Label>
              ))}
              <Label className={radioCard}>
                <RadioGroupItem value={NEW} className="mt-0.5" />
                <span className="font-medium">Ny odlingsplats</span>
              </Label>
            </RadioGroup>
          )}

          {!existing && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="garden-name">Namn på platsen</Label>
                <Input
                  id="garden-name"
                  value={name}
                  maxLength={60}
                  placeholder="Till exempel Hemma, Växthuset eller Lantstället"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Friland eller växthus?</p>
                <RadioGroup
                  value={kind}
                  onValueChange={(v) => {
                    setKind(v as GardenKind);
                    setLastFrost(null);
                  }}
                  className="grid gap-2 sm:grid-cols-2"
                >
                  {(["open", "greenhouse"] as const).map((k) => (
                    <Label key={k} className={radioCard}>
                      <RadioGroupItem value={k} className="mt-0.5" />
                      <span>
                        <span className="font-medium">{kindLabel[k]}</span>
                        <span className="block text-xs text-muted-foreground">
                          {k === "open" ? "Bäddar, pallkragar och odlingslotter" : "Oeldat växthus eller tunnel"}
                        </span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Odlingszon</p>
                <p className="text-sm text-muted-foreground">
                  Vet du inte vilken zon platsen har? Kolla på{" "}
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
                  onValueChange={(v) => {
                    setZone(Number(v) as Zone);
                    setLastFrost(null);
                  }}
                  className="grid gap-2 sm:grid-cols-2"
                >
                  {ZONES.map((z) => (
                    <Label key={z.zone} className={radioCard}>
                      <RadioGroupItem value={String(z.zone)} className="mt-0.5" />
                      <span>
                        <span className="font-medium">{z.label}</span>
                        <span className="block text-xs text-muted-foreground">{z.examples}</span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          <Button size="lg" disabled={!placeReady} onClick={() => setStep(2)}>
            Nästa
          </Button>
        </section>
      )}

      {step === 2 && frost && guess && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">När är det frostfritt?</h2>
          <p className="text-sm text-muted-foreground">
            {previous && previousFrost
              ? `Förra året satte du frostfritt från ${formatDay(previous.last_frost!)}, så vi har fyllt i samma dag. Vår gissning utifrån zonen är ${formatDay(guess)}.`
              : `Vi gissar ${formatDay(guess)} utifrån zonen${place?.kind === "greenhouse" ? " och att det är ett växthus" : ""}.`}{" "}
            {frostHint(frost)} Ändra datumet om du vet bättre för platsen, det går också att flytta det senare.
          </p>
          <div className="space-y-1">
            <Label htmlFor="last-frost">Frostfritt från</Label>
            <Input
              id="last-frost"
              type="date"
              className="w-auto"
              value={frost}
              min={`${seasonYear}-03-01`}
              max={`${seasonYear}-07-31`}
              onChange={(e) => setLastFrost(e.target.value || null)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>
              Tillbaka
            </Button>
            <Button size="lg" onClick={() => setStep(3)}>
              Nästa
            </Button>
          </div>
        </section>
      )}

      {step === 3 && place && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Vad vill du odla här {seasonYear}?</h2>
          {previous && cropIds === null && (
            <p className="text-sm text-muted-foreground">Vi har valt det du odlade här {previous.year}.</p>
          )}
          <CropToggles
            zone={place.zone}
            kind={place.kind}
            isSelected={(id) => crops.includes(id)}
            onToggle={(id) => setCropIds(crops.includes(id) ? crops.filter((c) => c !== id) : [...crops, id])}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="lg" disabled={create.isPending} onClick={() => setStep(2)}>
              Tillbaka
            </Button>
            <Button size="lg" disabled={crops.length === 0 || create.isPending} onClick={submit}>
              Skapa plan
            </Button>
          </div>
          {create.isError && <ErrorAlert>Kunde inte spara planen.</ErrorAlert>}
        </section>
      )}
    </div>
  );
}
