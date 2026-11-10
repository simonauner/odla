import type { CropTemplate } from "./types";

export const broccoli: CropTemplate = {
  id: "broccoli",
  name: "Broccoli",
  zones: { min: 1, max: 7 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså broccoli",
      description: "Så 1 cm djupt i små krukor. Kålplantor vill stå svalt och ljust när de har grott.",
      anchor: { type: "last_frost" },
      window: [-42, -28],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut broccolin",
      description: "40–50 cm mellan plantorna i näringsrik jord. Täck med insektsnät mot kålfjärilar.",
      anchor: { type: "last_frost" },
      window: [-7, 7],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda broccolin",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-7, -2],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda broccoli",
      description: "Skär huvudet medan knopparna är täta. Sidoskotten ger sedan fler små huvuden.",
      anchor: { type: "step", step: "plant_out" },
      window: [60, 100],
    },
  ],
};
