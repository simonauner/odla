import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { CROPS } from "@shared/crops";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { seasonTarget, seasonYear, useAddCrops, useGardens, useSeasons } from "@/lib/garden";
import { CropToggles, ErrorAlert, placeLabel, radioCard } from "./setup";

/** Adds crops for a year at one of the user's places. `?plats=` picks the place up front. */
export function AddCropsPage() {
  const navigate = useNavigate();
  const { plats } = useSearch({ strict: false });
  const gardens = useGardens();
  const seasons = useSeasons();
  const add = useAddCrops();
  const [gardenChoice, setGardenChoice] = useState<string | undefined>(plats);
  const [year, setYear] = useState(seasonYear);
  const [cropIds, setCropIds] = useState<string[]>([]);

  if (gardens.isPending || seasons.isPending) return <p className="text-muted-foreground">Laddar…</p>;
  if (gardens.isError || seasons.isError) return <ErrorAlert>Kunde inte hämta dina uppgifter.</ErrorAlert>;

  const garden = gardens.data.find((g) => g.id === gardenChoice) ?? gardens.data[0];
  if (!garden)
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">Lägg till platsen där du odlar först.</p>
        <Button asChild>
          <Link to="/setup">Kom igång</Link>
        </Button>
      </div>
    );

  const target = seasonTarget(seasons.data, garden.id, year);
  const choices = CROPS.filter((c) => !target.season?.plantings.some((p) => p.crop_id === c.id));
  // Crops picked before the place or year changed may already grow there.
  const picked = cropIds.filter((id) => choices.some((c) => c.id === id));

  return (
    <div className="space-y-8">
      <PageHeader title="Lägg till grödor" />

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Var?</h2>
        <RadioGroup value={garden.id} onValueChange={setGardenChoice} className="grid gap-2 sm:grid-cols-2">
          {gardens.data.map((g) => (
            <Label key={g.id} className={radioCard}>
              <RadioGroupItem value={g.id} className="mt-0.5" />
              <span>
                <span className="font-medium">{g.name}</span>
                <span className="block text-xs text-muted-foreground">{placeLabel(g)}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
        <Button asChild variant="ghost" size="sm">
          <Link to="/setup">Ny plats</Link>
        </Button>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Vilket år?</h2>
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
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Vilka grödor?</h2>
        {choices.length === 0 ? (
          <p className="text-muted-foreground">
            Du odlar redan allt vi har på {garden.name} {year}.
          </p>
        ) : (
          <CropToggles
            crops={choices}
            zone={garden.zone}
            kind={garden.kind}
            isSelected={(id) => picked.includes(id)}
            onToggle={(id) => setCropIds(picked.includes(id) ? picked.filter((c) => c !== id) : [...picked, id])}
          />
        )}
      </section>

      <Button
        size="lg"
        disabled={picked.length === 0 || add.isPending}
        onClick={() => add.mutate({ target, cropIds: picked }, { onSuccess: () => navigate({ to: "/odlingar" }) })}
      >
        Lägg till
      </Button>
      {add.isError && <ErrorAlert>Kunde inte lägga till grödorna.</ErrorAlert>}
    </div>
  );
}
