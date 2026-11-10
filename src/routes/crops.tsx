import { Link } from "@tanstack/react-router";
import { findCrop } from "@shared/crops";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isOpen, seasonYear, useGardens, useSeasons, type Season } from "@/lib/garden";
import { ErrorAlert, placeLabel } from "./setup";

/** Crops as round buttons that open each crop's page; closed ones are marked. */
export function CropChips({ plantings }: { plantings: Season["plantings"] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {plantings.map((p) => (
        <li key={p.id}>
          <Button asChild variant={p.closed_at ? "ghost" : "secondary"} size="sm" className="rounded-full">
            <Link to="/odling/$plantingId" params={{ plantingId: p.id }}>
              {findCrop(p.crop_id)?.name ?? p.crop_id}
              {p.closed_at && <Badge variant="outline">Avslutad</Badge>}
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

/** One place's crops in a year, each linking to its own page. */
function PlaceCrops({ season }: { season: Season }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <Link to="/plats/$gardenId" params={{ gardenId: season.garden.id }} className="hover:underline">
            {season.garden.name}
          </Link>
        </CardTitle>
        <CardDescription>{placeLabel(season.garden)}</CardDescription>
      </CardHeader>
      <CardContent>
        <CropChips plantings={season.plantings} />
      </CardContent>
    </Card>
  );
}

function YearSection({ year, seasons }: { year: number; seasons: Season[] }) {
  return (
    <section>
      <h2 className="mb-3 font-heading text-2xl font-semibold">{year}</h2>
      <ul className="space-y-2">
        {seasons.map((s) => (
          <li key={s.id}>
            <PlaceCrops season={s} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Everything the user grows, by year and then by place. Places come second, at the bottom. */
export function CropsPage() {
  const gardens = useGardens();
  const seasons = useSeasons();

  if (gardens.isPending || seasons.isPending) return <p className="text-muted-foreground">Laddar…</p>;
  if (gardens.isError || seasons.isError) return <ErrorAlert>Kunde inte hämta dina odlingar.</ErrorAlert>;

  const withCrops = seasons.data.filter((s) => s.plantings.length > 0);
  // Years still going come first; years where every crop is closed are history.
  const current = Map.groupBy(
    withCrops.filter((s) => s.year >= seasonYear || isOpen(s)),
    (s) => s.year,
  );
  const earlier = Map.groupBy(withCrops.filter((s) => s.year < seasonYear && !isOpen(s)).toReversed(), (s) => s.year);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-3xl font-semibold">Odlingar</h1>
        {gardens.data.length > 0 && (
          <Button asChild>
            <Link to="/odlingar/ny">Lägg till grödor</Link>
          </Button>
        )}
      </div>

      {gardens.data.length === 0 ? (
        <div className="space-y-3">
          <p className="text-muted-foreground">Börja med att lägga till platsen där du odlar.</p>
          <Button asChild>
            <Link to="/setup">Kom igång</Link>
          </Button>
        </div>
      ) : (
        current.size === 0 && <p className="text-muted-foreground">Inget växer just nu.</p>
      )}

      {[...current].map(([year, list]) => (
        <YearSection key={year} year={year} seasons={list} />
      ))}

      {earlier.size > 0 && (
        <details className="group space-y-8">
          <summary className="cursor-pointer font-heading text-2xl font-semibold text-muted-foreground">
            Tidigare år
          </summary>
          {[...earlier].map(([year, list]) => (
            <YearSection key={year} year={year} seasons={list} />
          ))}
        </details>
      )}

      {gardens.data.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold">Platser</h2>
          <ul className="mb-4 grid gap-2 sm:grid-cols-2">
            {gardens.data.map((g) => (
              <li key={g.id}>
                <Card size="sm" className="relative has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring">
                  <CardHeader>
                    <CardTitle>
                      {/* The ::after stretches the link over the whole card. */}
                      <Link
                        to="/plats/$gardenId"
                        params={{ gardenId: g.id }}
                        className="outline-none after:absolute after:inset-0"
                      >
                        {g.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{placeLabel(g)}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline">
            <Link to="/setup">Lägg till plats</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
