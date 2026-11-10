import type { CropTemplate } from "./types";

export const beetroot: CropTemplate = {
  id: "beetroot",
  name: "Rödbeta",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så rödbetor på friland",
      description: "Så 2 cm djupt med 5 cm mellanrum. Varje frö ger flera plantor.",
      anchor: { type: "last_frost" },
      window: [0, 21],
    },
    {
      id: "thin",
      kind: "thin",
      title: "Gallra rödbetorna",
      description: "Gallra till 8–10 cm mellan plantorna. De små bladen går att äta i sallad.",
      anchor: { type: "step", step: "sow" },
      window: [21, 35],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda rödbetor",
      description: "Ta de första när de är stora som pingisbollar och låt resten växa till sig.",
      anchor: { type: "step", step: "sow" },
      window: [60, 100],
    },
  ],
};
