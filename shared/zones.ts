import { isoDate, type IsoDate } from "./dates";

export type Zone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ZoneInfo {
  zone: Zone;
  label: string;
  /** Ungefärligt datum för sista vårfrost [månad, dag]. */
  lastFrost: [number, number];
  /** Ungefärligt datum för första höstfrost [månad, dag]. */
  firstFrost: [number, number];
  examples: string;
}

/**
 * Grova schablonvärden per odlingszon. De ska kalibreras mot SMHI:s frostdata
 * och användarens egna erfarenheter; lokalklimatet kan skilja flera veckor.
 */
export const ZONES: readonly ZoneInfo[] = [
  {
    zone: 1,
    label: "Zon I",
    lastFrost: [5, 1],
    firstFrost: [10, 25],
    examples: "Skåne, Blekinge kust, Öland, Gotland",
  },
  { zone: 2, label: "Zon II", lastFrost: [5, 10], firstFrost: [10, 15], examples: "Halland, västkusten, Kalmar" },
  {
    zone: 3,
    label: "Zon III",
    lastFrost: [5, 15],
    firstFrost: [10, 5],
    examples: "Stockholm, Mälardalen, Östergötland",
  },
  {
    zone: 4,
    label: "Zon IV",
    lastFrost: [5, 20],
    firstFrost: [9, 25],
    examples: "Västmanland, Värmland, inre Götaland",
  },
  { zone: 5, label: "Zon V", lastFrost: [5, 25], firstFrost: [9, 20], examples: "Gävleborg kust, Dalarna söder" },
  { zone: 6, label: "Zon VI", lastFrost: [6, 1], firstFrost: [9, 10], examples: "Norrlandskusten, Jämtland söder" },
  { zone: 7, label: "Zon VII", lastFrost: [6, 10], firstFrost: [9, 1], examples: "Inre Norrland, Norrbottens kust" },
  { zone: 8, label: "Zon VIII", lastFrost: [6, 15], firstFrost: [8, 25], examples: "Fjällnära områden, Lappland" },
];

export function zoneInfo(zone: Zone): ZoneInfo {
  const info = ZONES.find((z) => z.zone === zone);
  if (!info) throw new Error(`Okänd odlingszon: ${zone}`);
  return info;
}

export function frostDates(zone: Zone, year: number): { lastFrost: IsoDate; firstFrost: IsoDate } {
  const { lastFrost, firstFrost } = zoneInfo(zone);
  return {
    lastFrost: isoDate(year, lastFrost[0], lastFrost[1]),
    firstFrost: isoDate(year, firstFrost[0], firstFrost[1]),
  };
}
