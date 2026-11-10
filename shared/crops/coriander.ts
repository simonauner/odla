import type { CropTemplate } from "./types";

export const coriander: CropTemplate = {
  id: "coriander",
  name: "Koriander",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_outdoor",
      title: "Så koriander",
      description: "Så i halvskugga. Koriander går snabbt i blom, så så om var 3:e vecka.",
      anchor: { type: "last_frost" },
      window: [-7, 14],
      repeat: { everyDays: 21, untilDaysFromFirstFrost: -50 },
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda koriander",
      description: "Klipp bladen innan plantan blommar. Låt några gå i frö om du vill ha korianderfrön.",
      anchor: { type: "step", step: "sow" },
      window: [30, 45],
    },
  ],
};
