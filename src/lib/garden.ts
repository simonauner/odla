import { useEffect, useState } from "react";

/** Tills inloggning finns sparas valen lokalt i webbläsaren. */
export interface GardenSettings {
  zone: number | null;
  year: number;
  crops: string[];
}

const KEY = "odla.garden";

function load(): GardenSettings {
  const fallback: GardenSettings = {
    zone: null,
    year: new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0),
    crops: [],
  };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<GardenSettings>) } : fallback;
  } catch {
    return fallback;
  }
}

export function useGarden() {
  const [garden, setGarden] = useState<GardenSettings>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(garden));
    } catch {
      // Privat läge eller blockerad lagring: valen gäller bara den här sessionen.
    }
  }, [garden]);
  return [garden, setGarden] as const;
}
