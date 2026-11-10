import type { CropTemplate } from "./types";

export const chard: CropTemplate = {
  id: "chard",
  name: "Mangold",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så mangold på friland",
      description: "Så 2 cm djupt och gallra till 20–30 cm mellan plantorna.",
      anchor: { type: "last_frost" },
      window: [0, 14],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda mangold",
      description: "Plocka de yttre bladen löpande så växer nya fram ända till frosten.",
      anchor: { type: "step", step: "sow" },
      window: [50, 130],
    },
  ],
};
