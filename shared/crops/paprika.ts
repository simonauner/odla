import type { CropTemplate } from "./types";

export const paprika: CropTemplate = {
  id: "paprika",
  name: "Paprika",
  zones: { min: 1, max: 3 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså paprika inomhus",
      description: "Så 0,5 cm djupt i fuktig såjord. Paprika gror långsamt och vill ha 25 °C, gärna med värmematta.",
      anchor: { type: "last_frost" },
      // Paprika needs about 5 months to ripe fruit, so sow in January–February.
      window: [-120, -90],
    },
    {
      id: "pot_up",
      kind: "pot_up",
      title: "Skola om paprikaplantorna",
      description: "När plantorna har två äkta blad: flytta till 9–10 cm krukor.",
      anchor: { type: "step", step: "sow" },
      window: [28, 35],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut paprika",
      description: "I växthus eller stor kruka i varmt läge när nätterna håller över 12 °C.",
      anchor: { type: "last_frost" },
      window: [14, 21],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda paprikaplantorna",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-10, -3],
    },
    {
      id: "fertilize",
      kind: "fertilize",
      title: "Gödsla paprikan",
      description: "Flytande gödsel varannan vecka när plantorna börjar blomma.",
      anchor: { type: "step", step: "plant_out" },
      window: [21, 21],
      repeat: { everyDays: 14, untilDaysFromFirstFrost: -21 },
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda paprika",
      description: "Plocka gröna eller låt dem mogna till full färg, då blir de sötare.",
      anchor: { type: "step", step: "plant_out" },
      window: [70, 120],
    },
    {
      id: "clear",
      kind: "clear",
      title: "Avsluta paprikasäsongen",
      description: "Plocka de sista frukterna och ta bort plantorna.",
      anchor: { type: "first_frost" },
      window: [-7, 0],
    },
  ],
};
