import type { CropTemplate } from "./types";

export const spinach: CropTemplate = {
  id: "spinach",
  name: "Spenat",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så spenat på friland",
      description: "Så tidigt, spenat trivs i svalt väder och går i blom när dagarna blir långa och varma.",
      anchor: { type: "last_frost" },
      window: [-28, -7],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda spenat",
      description: "Plocka bladen innan plantorna börjar skjuta i blom.",
      anchor: { type: "step", step: "sow" },
      window: [35, 55],
    },
  ],
};
