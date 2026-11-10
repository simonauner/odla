import type { CropTemplate } from "./types";

export const onion: CropTemplate = {
  id: "onion",
  name: "Lök",
  emoji: "🧅",
  zones: { min: 1, max: 7 },
  steps: [
    {
      id: "plant_out",
      kind: "plant_out",
      title: "Sätt sättlök",
      description:
        "Tryck ned lökarna så att toppen precis syns, 10 cm isär. Fågelnät hindrar fåglar från att dra upp dem.",
      anchor: { type: "last_frost" },
      window: [-14, 0],
    },
    {
      id: "harvest",
      kind: "harvest",
      title: "Skörda löken",
      description: "När blasten vissnat och lagt sig. Låt löken torka i sol eller under tak innan du lagrar den.",
      anchor: { type: "step", step: "plant_out" },
      window: [90, 120],
    },
  ],
};
