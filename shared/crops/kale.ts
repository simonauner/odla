import type { CropTemplate } from "./types";

export const kale: CropTemplate = {
  id: "kale",
  name: "Grönkål",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså grönkål",
      description: "Så 1 cm djupt i små krukor. Kålplantor vill stå svalt och ljust när de har grott.",
      anchor: { type: "last_frost" },
      window: [-42, -28],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut grönkålen",
      description: "50 cm mellan plantorna i näringsrik jord. Täck med insektsnät mot kålfjärilar.",
      anchor: { type: "last_frost" },
      window: [-7, 7],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda grönkålen",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-7, -2],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda grönkål",
      description:
        "Plocka de nedre bladen löpande. Efter några frostnätter blir kålen sötare, och den tål kyla långt in på vintern.",
      anchor: { type: "first_frost" },
      window: [-21, 56],
    },
  ],
};
