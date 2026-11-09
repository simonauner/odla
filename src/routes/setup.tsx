import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toggle } from "@/components/ui/toggle";
import { api } from "@/lib/api";
import { useGarden } from "@/lib/garden";

export function SetupPage() {
  const [garden, setGarden] = useGarden();
  const navigate = useNavigate();
  const zones = useQuery({ queryKey: ["zones"], queryFn: api.zones });
  const crops = useQuery({ queryKey: ["crops"], queryFn: api.crops });

  const toggleCrop = (id: string) =>
    setGarden((g) => ({ ...g, crops: g.crops.includes(id) ? g.crops.filter((c) => c !== id) : [...g.crops, id] }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-1 text-lg font-semibold">Var odlar du?</h2>
        <p className="mb-3 text-sm text-muted-foreground">Välj odlingszon. Karta och förslag utifrån din position kommer senare.</p>
        <RadioGroup
          value={garden.zone === null ? "" : String(garden.zone)}
          onValueChange={(v) => setGarden((g) => ({ ...g, zone: Number(v) }))}
          className="grid gap-2 sm:grid-cols-2"
        >
          {zones.data?.map((z) => (
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
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Vad vill du odla {garden.year}?</h2>
        <div className="flex flex-wrap gap-2">
          {crops.data?.map((c) => {
            const outsideZone = garden.zone !== null && (garden.zone < c.zones.min || garden.zone > c.zones.max);
            return (
              <Toggle
                key={c.id}
                variant="outline"
                pressed={garden.crops.includes(c.id)}
                onPressedChange={() => toggleCrop(c.id)}
                className="rounded-full px-4"
                title={outsideZone ? "Svårt i din zon utan växthus" : undefined}
              >
                {c.name}
                {outsideZone && <Badge variant="warning">Växthus</Badge>}
              </Toggle>
            );
          })}
        </div>
      </section>

      <Button
        size="lg"
        disabled={garden.zone === null || garden.crops.length === 0}
        onClick={() => navigate({ to: "/" })}
      >
        Visa min plan
      </Button>
    </div>
  );
}
