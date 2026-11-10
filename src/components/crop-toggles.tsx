import { CROPS } from "@shared/crops";
import { zoneInfo, type GardenKind, type Zone } from "@shared/zones";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { needsGreenhouse } from "@/lib/garden";

export function CropToggles(props: {
  /** The crops to offer, all by default. */
  crops?: readonly (typeof CROPS)[number][];
  zone: Zone;
  kind: GardenKind;
  isSelected: (cropId: string) => boolean;
  onToggle: (cropId: string) => void;
  disabled?: boolean;
}) {
  const crops = props.crops ?? CROPS;
  const outside = (c: (typeof CROPS)[number]) => needsGreenhouse(c, props);
  return (
    <div className="space-y-3">
      {crops.some(outside) && (
        <p className="text-sm text-muted-foreground">
          Grödor märkta <Badge variant="warning">Kräver växthus</Badge> är svåra på friland i{" "}
          {zoneInfo(props.zone).label.replace("Zon", "zon")}.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {crops.map((c) => {
          const outsideZone = outside(c);
          return (
            <Toggle
              key={c.id}
              variant="outline"
              pressed={props.isSelected(c.id)}
              disabled={props.disabled}
              onPressedChange={() => props.onToggle(c.id)}
              shape="pill"
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
