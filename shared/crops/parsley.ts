import type { CropTemplate } from "./types";

export const parsley: CropTemplate = {
  id: "parsley",
  name: "Persilja",
  emoji: "🌿",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så persilja på friland",
      description: "Blötlägg fröna ett dygn innan sådd. Persilja gror långsamt, ofta efter 3–4 veckor.",
      anchor: { type: "last_frost" },
      window: [-21, 0],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda persilja",
      description: "Klipp de yttre stjälkarna löpande så växer plantan vidare ända till frosten.",
      anchor: { type: "step", step: "sow" },
      window: [70, 140],
    },
  ],
};
