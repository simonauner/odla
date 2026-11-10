import type { CropTemplate } from "./types";

export const chili: CropTemplate = {
  id: "chili",
  name: "Chili",
  zones: { min: 1, max: 4 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså chili inomhus",
      description:
        "Så 0,5 cm djupt i fuktig såjord. Chili gror långsamt och vill ha 25–28 °C, gärna med värmematta, och växtbelysning så här tidigt. Starka sorter som habanero först.",
      anchor: { type: "last_frost" },
      // Chili needs 5+ months from sowing to ripe fruit; sowing around New Year is the norm in Mälardalen.
      window: [-150, -110],
    },
    {
      id: "pot_up",
      kind: "pot_up",
      title: "Skola om chiliplantorna",
      description: "När plantorna har två äkta blad: flytta till 9–10 cm krukor.",
      anchor: { type: "step", step: "sow" },
      window: [28, 35],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut chili",
      description: "I växthus, stor kruka eller varmt läge när nätterna håller över 12 °C.",
      anchor: { type: "last_frost" },
      window: [14, 21],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda chiliplantorna",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-10, -3],
    },
    {
      id: "fertilize",
      kind: "fertilize",
      title: "Gödsla chilin",
      description: "Flytande gödsel varannan vecka när plantorna börjar blomma.",
      anchor: { type: "step", step: "plant_out" },
      window: [21, 21],
      repeat: { everyDays: 14, untilDaysFromFirstFrost: -21 },
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda chili",
      description: "Plocka gröna eller låt dem mogna till full färg. Ju mer du plockar, desto fler frukter.",
      anchor: { type: "step", step: "plant_out" },
      window: [60, 110],
    },
    {
      id: "clear",
      kind: "clear",
      title: "Avsluta chilisäsongen",
      description: "Plocka de sista frukterna. Plantor i kruka kan övervintra ljust och svalt inomhus.",
      anchor: { type: "first_frost" },
      window: [-7, 0],
    },
  ],
};
