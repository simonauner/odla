import type { CropTemplate } from "./types";

export const parsnip: CropTemplate = {
  id: "parsnip",
  name: "Palsternacka",
  emoji: "🥕",
  zones: { min: 1, max: 6 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så palsternacka på friland",
      description: "Använd färska frön och så 1–2 cm djupt. Fröna gror långsamt, håll jorden fuktig i 3–4 veckor.",
      anchor: { type: "last_frost" },
      window: [-14, 7],
    },
    {
      id: "thin",
      kind: "thin",
      title: "Gallra palsternackorna",
      description: "Gallra till 10–15 cm mellan plantorna.",
      anchor: { type: "step", step: "sow" },
      window: [35, 49],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda palsternacka",
      description: "Vänta till efter några frostnätter, då blir rötterna sötare. De kan stå kvar i jorden länge.",
      anchor: { type: "first_frost" },
      window: [0, 60],
    },
  ],
};
