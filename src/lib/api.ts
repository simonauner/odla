import type { PlannedTask } from "@shared/plan";
import type { ZoneInfo } from "@shared/zones";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export interface CropSummary {
  id: string;
  name: string;
  zones: { min: number; max: number };
}

export const api = {
  zones: () => getJson<ZoneInfo[]>("/api/zones"),
  crops: () => getJson<CropSummary[]>("/api/crops"),
  plan: (zone: number, year: number, crops: string[]) =>
    getJson<{ tasks: PlannedTask[] }>(`/api/plan?zone=${zone}&year=${year}&crops=${crops.join(",")}`),
};
