import type { CropTemplate } from "./types";

export const garlic: CropTemplate = {
  id: "garlic",
  name: "Vitlök",
  emoji: "🧄",
  zones: { min: 1, max: 7 },
  steps: [
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Sätt vitlöksklyftor",
      description:
        "Sätt klyftorna med spetsen upp, 5 cm djupt och 15 cm isär, några veckor innan marken fryser. Täck med löv eller halm.",
      anchor: { type: "first_frost", previousYear: true },
      window: [-21, 7],
    },
    {
      id: "prune",
      kind: "prune",
      title: "Bryt av vitlökens blomstänglar",
      description: "Bryt av stänglarna när de har slagit en ögla, så går kraften till löken. Stänglarna går att äta.",
      anchor: { type: "last_frost" },
      window: [21, 42],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda vitlöken",
      description: "När en tredjedel av bladen har gulnat. Låt lökarna torka luftigt och skuggigt i ett par veckor.",
      anchor: { type: "last_frost" },
      window: [55, 85],
    },
  ],
};
