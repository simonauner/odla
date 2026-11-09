import { lettuce } from "./lettuce";
import { tomato } from "./tomato";
import type { CropTemplate } from "./types";

export const CROPS: readonly CropTemplate[] = [tomato, lettuce];

export function findCrop(id: string): CropTemplate | undefined {
  return CROPS.find((c) => c.id === id);
}

export type { CropTemplate, CropStep, TaskKind } from "./types";
