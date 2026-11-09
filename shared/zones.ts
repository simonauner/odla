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
 * Median last spring frost and first autumn frost (daily minimum air temperature below 0 °C
 * at 2 m) for 1991–2020, computed from SMHI open station data (parameter 19) and rounded to
 * the nearest 5 days. Stations per zone:
 *   I: Lund, Ängelholm, Kristianstad, Visby   II: Göteborg, Varberg, Kalmar, Ronneby
 *   III: Stockholm-Bromma, Uppsala, Linköping, Vänersborg, Borås, Eskilstuna
 *   IV: Karlstad, Jönköping   V: Falun, Borlänge, Hudiksvall, Mora
 *   VI: Sundsvall, Härnösand, Östersund   VII: Umeå, Luleå, Piteå, Arvidsjaur
 *   VIII: Kiruna, Gällivare, Lycksele
 * Growing zones reflect winter cold and season length, not frost, so the coast in zones V–VI
 * gets spring as early as zone IV. A more northern zone never gets an earlier spring frost or
 * a later autumn frost than the zone south of it. A median means frost after the date every
 * other year, and local climate can differ by several weeks.
 */
export const ZONES: readonly ZoneInfo[] = [
  {
    zone: 1,
    label: "Zon I",
    lastFrost: [5, 5],
    firstFrost: [10, 15],
    examples: "Skåne, Blekinge kust, Öland, Gotland",
  },
  { zone: 2, label: "Zon II", lastFrost: [5, 5], firstFrost: [10, 10], examples: "Halland, västkusten, Kalmar" },
  {
    zone: 3,
    label: "Zon III",
    lastFrost: [5, 10],
    firstFrost: [10, 5],
    examples: "Stockholm, Mälardalen, Östergötland",
  },
  {
    zone: 4,
    label: "Zon IV",
    lastFrost: [5, 15],
    firstFrost: [9, 25],
    examples: "Västmanland, Värmland, inre Götaland",
  },
  { zone: 5, label: "Zon V", lastFrost: [5, 15], firstFrost: [9, 25], examples: "Gävleborg kust, Dalarna söder" },
  { zone: 6, label: "Zon VI", lastFrost: [5, 15], firstFrost: [9, 25], examples: "Norrlandskusten, Jämtland söder" },
  { zone: 7, label: "Zon VII", lastFrost: [5, 20], firstFrost: [9, 15], examples: "Inre Norrland, Norrbottens kust" },
  { zone: 8, label: "Zon VIII", lastFrost: [6, 5], firstFrost: [9, 1], examples: "Fjällnära områden, Lappland" },
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
