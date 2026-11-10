export type TaskKind =
  | "sow_indoor"
  | "pot_up"
  | "thin"
  | "hill"
  | "harden_off"
  | "plant_out"
  | "sow_outdoor"
  | "fertilize"
  | "water"
  | "prune"
  | "harvest"
  | "clear";

/**
 * Vad ett steg räknas från: sista vårfrost, första höstfrost eller ett annat steg i samma gröda.
 * `previousYear` puts the step in the autumn before the season, for crops planted in autumn (garlic).
 */
export type Anchor =
  { type: "last_frost" } | { type: "first_frost"; previousYear?: boolean } | { type: "step"; step: string };

export interface CropStep {
  id: string;
  kind: TaskKind;
  title: string;
  description?: string;
  anchor: Anchor;
  /** Fönster i dagar från ankaret: [tidigast, senast]. */
  window: [number, number];
  /** Upprepa var n:e dag tills (inklusive) en viss dag räknat från första höstfrost. */
  repeat?: { everyDays: number; untilDaysFromFirstFrost: number };
}

export interface CropTemplate {
  id: string;
  name: string;
  /** Symbol shown next to the name on crop cards. */
  emoji: string;
  /** Lägsta zon (I = 1) där grödan normalt lyckas på friland/i växthus enligt mallen. */
  zones: { min: number; max: number };
  steps: CropStep[];
}
