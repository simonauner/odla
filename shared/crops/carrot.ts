import type { CropTemplate } from "./types";

export const carrot: CropTemplate = {
  id: "carrot",
  name: "Morot",
  emoji: "🥕",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så morötter på friland",
      description:
        "Så glest, 1 cm djupt i luckrad jord utan färsk gödsel. Håll jorden fuktig tills fröna grott, det tar 2–3 veckor.",
      anchor: { type: "last_frost" },
      window: [-14, 14],
    },
    {
      id: "thin",
      kind: "thin",
      title: "Gallra morötterna",
      description: "Gallra till 3–5 cm mellan plantorna. Gör det en mulen kväll så lockas inte morotsflugan.",
      anchor: { type: "step", step: "sow" },
      window: [28, 42],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda morötter",
      description: "Dra upp de första som knippmorötter och låt resten växa till sig.",
      anchor: { type: "step", step: "sow" },
      window: [75, 130],
    },
  ],
};
