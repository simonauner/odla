import type { CropTemplate } from "./types";

export const leek: CropTemplate = {
  id: "leek",
  name: "Purjolök",
  emoji: "🧅",
  zones: { min: 1, max: 7 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså purjolök",
      description:
        "Så tätt i en låda, 1 cm djupt. Klipp bladen till 10 cm när de blir långa så blir plantorna kraftigare.",
      anchor: { type: "last_frost" },
      window: [-84, -63],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut purjolöken",
      description: "Stick hål 15 cm djupt, sätt en planta i varje och vattna ner den utan att fylla med jord.",
      anchor: { type: "last_frost" },
      window: [0, 14],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda purjolöken",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-7, -2],
    },
    {
      id: "hill",
      kind: "hill",
      title: "Kupa purjolöken",
      description: "Dra upp jord runt stammen så blir den vita delen längre.",
      anchor: { type: "step", step: "plant_out" },
      window: [42, 56],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda purjolök",
      description: "Skörda när stammarna är tjocka nog. Purjolök tål frost och kan stå kvar långt in på hösten.",
      anchor: { type: "first_frost" },
      window: [-30, 45],
    },
  ],
};
