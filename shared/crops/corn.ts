import type { CropTemplate } from "./types";

export const corn: CropTemplate = {
  id: "corn",
  name: "Majs",
  emoji: "🌽",
  zones: { min: 1, max: 4 },
  steps: [
    {
      id: "sow",
      kind: "sow_indoor",
      title: "Förså majs inomhus",
      description: "Så 2–3 frön per kruka, 3 cm djupt. Majs gror snabbt i värme.",
      anchor: { type: "last_frost" },
      window: [-28, -21],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Plantera ut majsen",
      description: "Plantera i block, inte i en rad, så pollineras kolvarna bättre. 30–40 cm mellan plantorna.",
      anchor: { type: "last_frost" },
      window: [7, 14],
    },
    {
      id: "harden_off",
      kind: "harden_off",
      title: "Avhärda majsplantorna",
      description: "Ställ ut plantorna några timmar om dagen i lä och öka gradvis.",
      anchor: { type: "step", step: "plant_out" },
      window: [-7, -2],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda majs",
      description: "När tofsen har vissnat och saften i kärnorna är mjölkig när du trycker på dem.",
      anchor: { type: "step", step: "plant_out" },
      window: [80, 110],
    },
  ],
};
