import type { CropTemplate } from "./types";

export const zucchini: CropTemplate = {
  id: "zucchini",
  name: "Squash",
  zones: { min: 1, max: 6 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså squash inomhus",
      description: "Så ett frö per kruka på högkant, 2 cm djupt. Gror på några dagar i rumstemperatur.",
      anchor: { type: "last_frost" },
      window: [-28, -21],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut squashen",
      description: "I näringsrik jord med gott om plats, ungefär en kvadratmeter per planta.",
      anchor: { type: "last_frost" },
      window: [7, 14],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda squashplantorna",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-7, -2],
    },
    {
      id: "fertilize",
      kind: "fertilize",
      title: "Gödsla squashen",
      description: "Flytande gödsel varannan vecka och rikligt med vatten.",
      anchor: { type: "step", step: "plant_out" },
      window: [21, 21],
      repeat: { everyDays: 14, untilDaysFromFirstFrost: -14 },
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda squash",
      description: "Skörda när frukterna är 15–20 cm, gärna flera gånger i veckan.",
      anchor: { type: "step", step: "plant_out" },
      window: [45, 100],
    },
    {
      id: "clear",
      kind: "clear",
      title: "Avsluta squashsäsongen",
      description: "Ta bort plantorna och kompostera dem om de är friska.",
      anchor: { type: "first_frost" },
      window: [-7, 0],
    },
  ],
};
