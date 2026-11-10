import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { findCrop } from "@shared/crops";
import { cropSpan, planSeason } from "@shared/season";
import { guessLastFrost } from "@shared/zones";
import { ConfirmButton } from "@/components/confirm-button";
import { ErrorAlert } from "@/components/error-alert";
import { PageHeader } from "@/components/page-header";
import { radioCard } from "@/components/place-fields";
import { TaskList } from "@/components/task-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatSpan } from "@/lib/format";
import {
  needsGreenhouse,
  placeLabel,
  seasonTarget,
  useGardens,
  useMovePlanting,
  useRemoveCrop,
  useSeasons,
  useUpdatePlantings,
  type Season,
} from "@/lib/garden";

/** Moves the crop to another place the same year. Places that already grow it that year are left out. */
function MoveCrop({ season, planting }: { season: Season; planting: Season["plantings"][number] }) {
  const gardens = useGardens();
  const seasons = useSeasons();
  const move = useMovePlanting();
  const [open, setOpen] = useState(false);
  const [gardenId, setGardenId] = useState<string>();

  if (!gardens.data || !seasons.data) return null;
  const crop = findCrop(planting.crop_id);
  const places = gardens.data.filter(
    (g) =>
      !seasons.data.some(
        (s) =>
          s.garden.id === g.id && s.year === season.year && s.plantings.some((p) => p.crop_id === planting.crop_id),
      ),
  );
  if (places.length === 0) return null;
  if (!open)
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Flytta till en annan plats
      </Button>
    );

  const chosen = places.find((g) => g.id === gardenId) ?? places[0]!;
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-2xl font-semibold">Flytta till en annan plats</h2>
      <p className="text-sm text-muted-foreground">
        Det du har bockat av och antecknat följer med. Datumen räknas om efter den nya platsens zon.
      </p>
      <RadioGroup value={chosen.id} onValueChange={setGardenId} className="grid gap-2 sm:grid-cols-2">
        {places.map((g) => (
          <Label key={g.id} className={radioCard}>
            <RadioGroupItem value={g.id} className="mt-0.5" />
            <span>
              <span className="font-medium">{g.name}</span>
              <span className="block text-xs text-muted-foreground">{placeLabel(g)}</span>
              {crop && needsGreenhouse(crop, g) && <Badge variant="warning">Kräver växthus</Badge>}
            </span>
          </Label>
        ))}
      </RadioGroup>
      <div className="flex gap-2">
        <Button
          disabled={move.isPending}
          onClick={() =>
            move.mutate(
              { plantingId: planting.id, target: seasonTarget(seasons.data, chosen.id, season.year) },
              { onSuccess: () => setOpen(false) },
            )
          }
        >
          Flytta
        </Button>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Avbryt
        </Button>
      </div>
      {move.isError && <ErrorAlert>Kunde inte flytta grödan.</ErrorAlert>}
    </section>
  );
}

/** One crop in one place and year: when it grows, its steps, and closing, moving or removing it. */
export function CropPage() {
  const { plantingId } = useParams({ strict: false });
  const navigate = useNavigate();
  const seasons = useSeasons();
  const update = useUpdatePlantings();
  const remove = useRemoveCrop();

  if (seasons.isPending) return <p className="text-muted-foreground">Laddar…</p>;
  if (seasons.isError) return <ErrorAlert>Kunde inte hämta grödan.</ErrorAlert>;
  const season = seasons.data.find((s) => s.plantings.some((p) => p.id === plantingId));
  const planting = season?.plantings.find((p) => p.id === plantingId);
  if (!season || !planting) return <ErrorAlert>Hittade inte grödan.</ErrorAlert>;

  const crop = findCrop(planting.crop_id);
  const name = crop?.name ?? planting.crop_id;
  const { zone, kind } = season.garden;
  const lastFrost = season.last_frost ?? guessLastFrost(zone, season.year, kind);
  const span = crop && cropSpan(crop, zone, season.year, lastFrost);
  const tasks = planSeason(zone, season.year, [planting], lastFrost);

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <PageHeader
          title={
            <>
              {name} {season.year}
              {planting.closed_at && <Badge variant="secondary">Avslutad</Badge>}
            </>
          }
          description={
            <>
              <Link to="/plats/$gardenId" params={{ gardenId: season.garden.id }} className="hover:underline">
                {season.garden.name}
              </Link>
              {span && ` · ${formatSpan(span.start, span.end)}`}
            </>
          }
          actions={
            <>
              <Button
                variant="outline"
                disabled={update.isPending}
                onClick={() => update.mutate({ plantingIds: [planting.id], closed: !planting.closed_at })}
              >
                {planting.closed_at ? "Öppna igen" : "Avsluta grödan"}
              </Button>
              <ConfirmButton
                title={`Ta bort ${name.toLowerCase()} ${season.year} från ${season.garden.name}?`}
                description="Det du har bockat av och antecknat för grödan försvinner och går inte att få tillbaka."
                action="Ta bort"
                onConfirm={() => remove.mutateAsync(planting.id, { onSuccess: () => navigate({ to: "/odlingar" }) })}
              >
                Ta bort
              </ConfirmButton>
            </>
          }
        />
        {(update.isError || remove.isError) && <ErrorAlert>Kunde inte spara grödan.</ErrorAlert>}
      </div>

      <section>
        <h2 className="mb-3 font-heading text-2xl font-semibold">Steg</h2>
        <TaskList tasks={tasks} />
      </section>

      <MoveCrop key={season.id} season={season} planting={planting} />
    </div>
  );
}
