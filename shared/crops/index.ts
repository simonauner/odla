import { basil } from "./basil";
import { bean } from "./bean";
import { carrot } from "./carrot";
import { chili } from "./chili";
import { cucumber } from "./cucumber";
import { lettuce } from "./lettuce";
import { onion } from "./onion";
import { pea } from "./pea";
import { potato } from "./potato";
import { radish } from "./radish";
import { tomato } from "./tomato";
import { zucchini } from "./zucchini";
import type { CropTemplate } from "./types";

export const CROPS: readonly CropTemplate[] = [
  tomato,
  chili,
  cucumber,
  zucchini,
  basil,
  lettuce,
  radish,
  carrot,
  pea,
  bean,
  potato,
  onion,
];

export function findCrop(id: string): CropTemplate | undefined {
  return CROPS.find((c) => c.id === id);
}

export type { CropTemplate, CropStep, TaskKind } from "./types";
