import type { CropTemplate } from "./types";

export const calendula: CropTemplate = {
  id: "calendula",
  name: "Ringblomma",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så ringblommor",
      description: "Så direkt på friland, gärna mellan grönsakerna. De lockar pollinerare och nyttiga insekter.",
      anchor: { type: "last_frost" },
      window: [-14, 7],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Plocka ringblommor",
      description: "Plocka blommorna löpande, så kommer nya. Kronbladen går att äta och att torka.",
      anchor: { type: "step", step: "sow" },
      window: [50, 120],
    },
  ],
};
