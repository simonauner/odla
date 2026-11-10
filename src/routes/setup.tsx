import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { guessLastFrost, type GardenKind, type Zone } from "@shared/zones";
import { CropToggles } from "@/components/crop-toggles";
import { ErrorAlert } from "@/components/error-alert";
import { PlaceFields, radioCard } from "@/components/place-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatDay } from "@/lib/format";
import { frostHint, placeLabel, seasonYear, useCreateSeason, useGardens, useSeasons } from "@/lib/garden";

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
            <PlaceFields
              name={name}
              kind={kind}
              zone={zone}
              onName={setName}
              onKind={(k) => {
                setKind(k);
                setLastFrost(null);
              }}
              onZone={(z) => {
                setZone(z);
                setLastFrost(null);
              }}
            />
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
