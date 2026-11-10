import { ZONES, type GardenKind, type Zone } from "@shared/zones";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { kindLabel } from "@/lib/garden";

export const radioCard =
  "cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-data-checked:border-primary has-data-checked:bg-secondary";

/** Name, kind and zone of a place, for a new place or one being edited. */
export function PlaceFields(props: {
  name: string;
  kind: GardenKind;
  zone: Zone | null;
  onName: (name: string) => void;
  onKind: (kind: GardenKind) => void;
  onZone: (zone: Zone) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="garden-name">Namn på platsen</Label>
        <Input
          id="garden-name"
          value={props.name}
          maxLength={60}
          placeholder="Till exempel Hemma, Växthuset eller Lantstället"
          onChange={(e) => props.onName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Friland eller växthus?</p>
        <RadioGroup
          value={props.kind}
          onValueChange={(v) => props.onKind(v as GardenKind)}
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
          value={props.zone === null ? "" : String(props.zone)}
          onValueChange={(v) => props.onZone(Number(v) as Zone)}
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
  );
}
