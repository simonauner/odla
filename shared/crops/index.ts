import { basil } from "./basil";
import { bean } from "./bean";
import { beetroot } from "./beetroot";
import { broccoli } from "./broccoli";
import { cabbage } from "./cabbage";
import { calendula } from "./calendula";
import { carrot } from "./carrot";
import { cauliflower } from "./cauliflower";
import { chard } from "./chard";
import { chili } from "./chili";
import { coriander } from "./coriander";
import { corn } from "./corn";
import { cucumber } from "./cucumber";
import { dill } from "./dill";
import { garlic } from "./garlic";
import { jerusalemArtichoke } from "./jerusalem_artichoke";
import { kale } from "./kale";
import { leek } from "./leek";
import { lettuce } from "./lettuce";
import { onion } from "./onion";
import { paprika } from "./paprika";
import { parsley } from "./parsley";
import { parsnip } from "./parsnip";
import { pea } from "./pea";
import { potato } from "./potato";
import { pumpkin } from "./pumpkin";
import { radish } from "./radish";
import { spinach } from "./spinach";
import { tomato } from "./tomato";
import { zucchini } from "./zucchini";
import type { CropTemplate } from "./types";

export const CROPS: readonly CropTemplate[] = [
  tomato,
  chili,
  paprika,
  cucumber,
  zucchini,
  pumpkin,
  corn,
  basil,
  dill,
  parsley,
  coriander,
  lettuce,
  spinach,
  chard,
  kale,
  broccoli,
  cauliflower,
  cabbage,
  radish,
  carrot,
  beetroot,
  parsnip,
  pea,
  bean,
  potato,
  jerusalemArtichoke,
  onion,
  leek,
  garlic,
  calendula,
];

export function findCrop(id: string): CropTemplate | undefined {
  return CROPS.find((c) => c.id === id);
}

export type { CropTemplate, CropStep, TaskKind } from "./types";
