import type { CropTemplate } from "./types";

export const cabbage: CropTemplate = {
  id: "cabbage",
  name: "Vitkål",
  zones: { min: 1, max: 7 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså vitkål",
      description: "Så 1 cm djupt i små krukor. Kålplantor vill stå svalt och ljust när de har grott.",
      anchor: { type: "last_frost" },
      window: [-49, -35],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut vitkålen",
      description: "50–60 cm mellan plantorna i näringsrik jord. Täck med insektsnät mot kålfjärilar.",
      anchor: { type: "last_frost" },
      window: [0, 14],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda vitkålen",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-7, -2],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda vitkål",
      description: "Skär huvudena när de känns fasta. Sena sorter tål lätt frost.",
      anchor: { type: "step", step: "plant_out" },
      window: [90, 130],
    },
  ],
};
