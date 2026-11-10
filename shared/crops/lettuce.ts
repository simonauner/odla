import type { CropTemplate } from "./types";

export const lettuce: CropTemplate = {
  id: "lettuce",
  name: "Sallat",
  emoji: "🥬",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så sallat på friland",
      description: "Så grunt i rader. Så om var 3:e vecka för jämn skörd hela sommaren.",
      anchor: { type: "last_frost" },
      window: [-14, 0],
      repeat: { everyDays: 21, untilDaysFromFirstFrost: -45 },
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda sallat",
      description: "Plocka ytterblad löpande eller skörda hela huvuden.",
      anchor: { type: "step", step: "sow" },
      window: [45, 60],
    },
  ],
};
