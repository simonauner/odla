import type { CropTemplate } from "./types";

export const radish: CropTemplate = {
  id: "radish",
  name: "Rädisa",
  emoji: "🌱",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så rädisor",
      description: "Så 1 cm djupt. Så lite i taget varannan vecka för jämn skörd.",
      anchor: { type: "last_frost" },
      window: [-21, -7],
      repeat: { everyDays: 14, untilDaysFromFirstFrost: -30 },
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda rädisor",
      description: "Skörda när de är som en stor kula. Väntar du för länge blir de porösa.",
      anchor: { type: "step", step: "sow" },
      window: [25, 35],
    },
  ],
};
