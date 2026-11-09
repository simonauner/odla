import type { CropTemplate } from "./types";

export const potato: CropTemplate = {
  id: "potato",
  name: "Potatis",
  zones: { min: 1, max: 8 },
  steps: [
    {
      id: "chit",
      kind: "sow_indoor",
      title: "Förgro sättpotatisen",
      description: "Lägg potatisen i ett ljust och svalt rum, 10–15 °C, tills den fått korta, kraftiga groddar.",
      anchor: { type: "last_frost" },
      window: [-42, -28],
    },
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Sätt potatisen",
      description: "Sätt 10 cm djupt med 30 cm mellanrum. Täck med fiberduk om det blir frost efter uppkomsten.",
      anchor: { type: "last_frost" },
      window: [-14, 0],
    },
    {
      id: "hill",
      kind: "hill",
      title: "Kupa potatisen",
      description: "Dra upp jord runt blasten när den är 15–20 cm, så blir inga knölar gröna.",
      anchor: { type: "step", step: "plant_out" },
      window: [35, 49],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda potatis",
      description: "Färskpotatis när plantorna blommar. Lagringspotatis när blasten vissnat.",
      anchor: { type: "step", step: "plant_out" },
      window: [70, 120],
    },
  ],
};
