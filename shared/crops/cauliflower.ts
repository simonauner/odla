import type { CropTemplate } from "./types";

export const cauliflower: CropTemplate = {
  id: "cauliflower",
  name: "Blomkål",
  emoji: "🥦",
  zones: { min: 1, max: 7 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså blomkål",
      description: "Så 1 cm djupt i små krukor. Kålplantor vill stå svalt och ljust när de har grott.",
      anchor: { type: "last_frost" },
      window: [-42, -28],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut blomkålen",
      description: "50 cm mellan plantorna. Blomkål vill ha jämn tillgång på vatten och näring.",
      anchor: { type: "last_frost" },
      window: [0, 14],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda blomkålen",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-7, -2],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda blomkål",
      description: "Skär huvudet medan det är vitt och fast. Vik bladen över huvudet så håller det sig vitt.",
      anchor: { type: "step", step: "plant_out" },
      window: [60, 90],
    },
  ],
};
