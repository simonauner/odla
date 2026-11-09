import type { CropTemplate } from "./types";

export const cucumber: CropTemplate = {
  id: "cucumber",
  name: "Gurka",
  zones: { min: 1, max: 5 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså gurka inomhus",
      description: "Så 1–2 frön per kruka, 1 cm djupt. Gurka gror snabbt i 20–25 °C och tål inte att skolas om.",
      anchor: { type: "last_frost" },
      window: [-28, -21],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut gurkan",
      description: "I växthus eller varmt läge när nätterna håller över 10 °C. Sätt upp något att klättra på.",
      anchor: { type: "last_frost" },
      window: [7, 14],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda gurkplantorna",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-7, -2],
    },
    {
      id: "fertilize",
      kind: "fertilize",
      title: "Gödsla gurkan",
      description: "Flytande gödsel en gång i veckan och jämn vattning. Ojämn vattning ger beska gurkor.",
      anchor: { type: "step", step: "plant_out" },
      window: [21, 21],
      repeat: { everyDays: 7, untilDaysFromFirstFrost: -14 },
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda gurka",
      description: "Skörda ofta medan gurkorna är unga, så fortsätter plantan att sätta nya.",
      anchor: { type: "step", step: "plant_out" },
      window: [45, 90],
    },
    {
      id: "clear",
      kind: "clear",
      title: "Avsluta gurksäsongen",
      description: "Ta bort plantorna och kompostera dem om de är friska.",
      anchor: { type: "first_frost" },
      window: [-7, 0],
    },
  ],
};
