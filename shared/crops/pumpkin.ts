import type { CropTemplate } from "./types";

export const pumpkin: CropTemplate = {
  id: "pumpkin",
  name: "Pumpa",
  emoji: "🎃",
  zones: { min: 1, max: 5 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså pumpa inomhus",
      description: "Så ett frö per kruka på högkant, 2 cm djupt. Gror på några dagar i rumstemperatur.",
      anchor: { type: "last_frost" },
      window: [-28, -21],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut pumpan",
      description: "I näringsrik jord, gärna på komposten. Varje planta behöver ett par kvadratmeter.",
      anchor: { type: "last_frost" },
      window: [7, 14],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda pumpaplantorna",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-7, -2],
    },
    {
      id: "fertilize",
      kind: "fertilize",
      title: "Gödsla pumpan",
      description: "Flytande gödsel varannan vecka och rikligt med vatten.",
      anchor: { type: "step", step: "plant_out" },
      window: [21, 21],
      repeat: { everyDays: 14, untilDaysFromFirstFrost: -30 },
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda pumporna",
      description:
        "Skörda före frosten med en bit stjälk kvar. Låt dem eftermogna ett par veckor varmt så håller de länge.",
      anchor: { type: "first_frost" },
      window: [-14, 0],
    },
  ],
};
