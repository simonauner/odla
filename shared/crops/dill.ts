import type { CropTemplate } from "./types";

export const dill: CropTemplate = {
  id: "dill",
  name: "Dill",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så dill på friland",
      description:
        "Så direkt på växtplatsen, dill tål inte omplantering. Så om var 3:e vecka för färsk dill hela sommaren.",
      anchor: { type: "last_frost" },
      window: [-7, 14],
      repeat: { everyDays: 21, untilDaysFromFirstFrost: -60 },
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda dill",
      description: "Klipp bladdill när plantorna är 20 cm. Låt några gå i blom om du vill ha kronill.",
      anchor: { type: "step", step: "sow" },
      window: [35, 50],
    },
  ],
};
