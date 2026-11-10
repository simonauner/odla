import type { CropTemplate } from "./types";

export const jerusalemArtichoke: CropTemplate = {
  id: "jerusalem_artichoke",
  name: "Jordärtskocka",
  zones: { min: 1, max: 7 },
  steps: [
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Sätt jordärtskockor",
      description:
        "Sätt knölarna 10 cm djupt med 40 cm mellanrum. Välj en plats där de får stå, de sprider sig och kommer tillbaka år efter år.",
      anchor: { type: "last_frost" },
      window: [-21, 0],
    },
    {
      id: "hill",
      kind: "hill",
      title: "Kupa jordärtskockorna",
      description: "Dra upp jord runt stjälkarna så står de stadigare och ger fler knölar.",
      anchor: { type: "step", step: "plant_out" },
      window: [42, 56],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda jordärtskockor",
      description:
        "Gräv upp efter första frosten, då blir de sötare. Knölarna klarar vintern i jorden, så du kan skörda vidare till våren.",
      anchor: { type: "first_frost" },
      window: [0, 45],
    },
  ],
};
