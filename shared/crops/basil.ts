import type { CropTemplate } from "./types";

export const basil: CropTemplate = {
  id: "basil",
  name: "Basilika",
  zones: { min: 1, max: 4 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså basilika inomhus",
      description: "Så ytligt och tryck till. Basilika vill ha värme, 20–25 °C, och mycket ljus.",
      anchor: { type: "last_frost" },
      window: [-42, -28],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut basilikan",
      description: "I kruka, växthus eller varmt läge i lä. Basilika tål inte kalla nätter.",
      anchor: { type: "last_frost" },
      window: [14, 21],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda basilikan",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-7, -2],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda basilika",
      description: "Nyp toppskotten ovanför ett bladpar, så förgrenar sig plantan. Nyp bort blommor.",
      anchor: { type: "step", step: "plant_out" },
      window: [14, 90],
    },
  ],
};
