import type { CropTemplate } from "./types";

export const tomato: CropTemplate = {
  id: "tomato",
  name: "Tomat",
  emoji: "🍅",
  zones: { min: 1, max: 6 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså tomater inomhus",
      description:
        "Så 0,5 cm djupt i fuktig såjord, 22–25 °C tills groddarna syns. Ge mycket ljus direkt efter groning.",
      anchor: { type: "last_frost" },
      window: [-56, -42],
    },
    {
      id: "pot_up",
      kind: "pot_up",
      title: "Skola om tomatplantorna",
      description: "När plantorna har två äkta blad: flytta till 9–10 cm krukor och plantera djupare än förut.",
      anchor: { type: "step", step: "sow" },
      window: [21, 28],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut tomaterna",
      description: "När nätterna håller över 10 °C. Plantera djupt, sätt stöd direkt och vattna ordentligt.",
      anchor: { type: "last_frost" },
      window: [7, 14],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda tomatplantorna",
      description: "Ställ ut plantorna några timmar om dagen i skugga/lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-10, -3],
    },
    {
      id: "fertilize",
      kind: "fertilize",
      title: "Gödsla tomaterna",
      description: "Näringsrik flytande gödsel (t.ex. tomatgödsel) en gång i veckan när första blomklasen slagit ut.",
      anchor: { type: "step", step: "plant_out" },
      window: [14, 14],
      repeat: { everyDays: 7, untilDaysFromFirstFrost: -14 },
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda tomater",
      description: "Plocka när frukten fått full färg. Gröna tomater kan eftermogna inomhus före frosten.",
      anchor: { type: "step", step: "plant_out" },
      window: [60, 100],
    },
    {
      id: "clear",
      kind: "clear",
      title: "Avsluta tomatsäsongen",
      description: "Ta in kvarvarande frukt och kompostera friska plantor före första frosten.",
      anchor: { type: "first_frost" },
      window: [-7, 0],
    },
  ],
};
