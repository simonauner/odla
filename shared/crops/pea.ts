import type { CropTemplate } from "./types";

export const pea: CropTemplate = {
  id: "pea",
  name: "Ärter",
  emoji: "🫛",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så ärter på friland",
      description:
        "Så 4–5 cm djupt så fort jorden går att bruka. Ärter tål lätt frost. Sätt upp ris eller nät att klättra på.",
      anchor: { type: "last_frost" },
      window: [-21, -7],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda ärter",
      description: "Plocka när baljorna är fyllda men fortfarande gröna och saftiga. Plocka ofta.",
      anchor: { type: "step", step: "sow" },
      window: [60, 90],
    },
  ],
};
