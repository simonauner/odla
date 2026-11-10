import type { CropTemplate } from "./types";

export const bean: CropTemplate = {
  id: "bean",
  name: "Brytbönor",
  emoji: "🫘",
  zones: { min: 1, max: 5 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så brytbönor på friland",
      description: "Så 3–4 cm djupt när jorden är varm. Bönor ruttnar i kall och blöt jord.",
      anchor: { type: "last_frost" },
      window: [7, 21],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda brytbönor",
      description: "Plocka medan baljorna är unga och knäpper av. Plocka ofta så kommer nya.",
      anchor: { type: "step", step: "sow" },
      window: [55, 85],
    },
  ],
};
