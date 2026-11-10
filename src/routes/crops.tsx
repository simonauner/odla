import { Link } from "@tanstack/react-router";
import { CollapsibleSection } from "@/components/collapsible-section";
import { CropChips } from "@/components/crop-chips";
import { ErrorAlert } from "@/components/error-alert";
import { PageHeader } from "@/components/page-header";
import { SlowLoading } from "@/components/slow-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemberships } from "@/lib/account";
import { isOpen, placeLabel, seasonYear, useGardens, useSeasons, type Season } from "@/lib/garden";

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
  // The header line can wait for this; the page does not.
  const owner = useMemberships().data?.joined[0]?.owner?.display_name;

  if (gardens.isPending || seasons.isPending) return <SlowLoading loading />;
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
      <PageHeader
        title="Odlingar"
        description={owner && `Du delar odling med ${owner}`}
        actions={
          gardens.data.length > 0 && (
            <>
              <Button asChild variant="outline">
                <Link to="/setup">Lägg till plats</Link>
              </Button>
              <Button asChild>
                <Link to="/odlingar/ny">Lägg till grödor</Link>
              </Button>
            </>
          )
        }
      />

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
        <CollapsibleSection
          title="Tidigare år"
          storageKey="crops.earlierYearsOpen"
          defaultOpen={false}
          className="space-y-8"
          summaryClassName="text-muted-foreground"
        >
          {[...earlier].map(([year, list]) => (
            <YearSection key={year} year={year} seasons={list} />
          ))}
        </CollapsibleSection>
      )}

      {gardens.data.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold">Platser</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
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
        </section>
      )}
    </div>
  );
}
