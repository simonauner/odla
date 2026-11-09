import { Link } from "@tanstack/react-router";
import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { seasonYear, useDeleteGarden, useGardens, useSeasons } from "@/lib/garden";
import { ErrorAlert, placeLabel } from "./setup";

/** All the user's growing places, with this year's list for each one that has it. */
export function PlacesPage() {
  const gardens = useGardens();
  const seasons = useSeasons();
  const deleteGarden = useDeleteGarden();

  if (gardens.isPending || seasons.isPending) return <p className="text-muted-foreground">Laddar…</p>;
  if (gardens.isError || seasons.isError) return <ErrorAlert>Kunde inte hämta dina odlingsplatser.</ErrorAlert>;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Odlingsplatser</h1>
      {gardens.data.length === 0 ? (
        <p className="text-muted-foreground">Du har inga odlingsplatser än.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {gardens.data.map((g) => {
            const season = seasons.data.find((s) => s.garden.id === g.id);
            const count = season?.plantings.length ?? 0;
            return (
              <li key={g.id}>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>{g.name}</CardTitle>
                    <CardAction className="flex gap-1">
                      {season && (
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/plats/$seasonId" params={{ seasonId: season.id }}>
                            Ändra
                          </Link>
                        </Button>
                      )}
                      <ConfirmButton
                        size="sm"
                        title={`Ta bort ${g.name}?`}
                        description="Alla planer, grödor och anteckningar för platsen försvinner och går inte att få tillbaka."
                        action="Ta bort"
                        onConfirm={() => deleteGarden.mutateAsync(g.id)}
                      >
                        Ta bort
                      </ConfirmButton>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    {placeLabel(g)} ·{" "}
                    {season ? `${count} ${count === 1 ? "gröda" : "grödor"}` : `Ingen plan för ${seasonYear}`}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      {deleteGarden.isError && <ErrorAlert>Kunde inte ta bort platsen.</ErrorAlert>}
      <Button asChild>
        <Link to="/setup">Lägg till plats</Link>
      </Button>
    </div>
  );
}
