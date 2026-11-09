/** Datum hanteras som ISO-strängar (YYYY-MM-DD) och räknas i UTC för att slippa sommartidsfel. */
export type IsoDate = string;

export function isoDate(year: number, month: number, day: number): IsoDate {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function diffDays(from: IsoDate, to: IsoDate): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Måndag i ISO-veckan som innehåller datumet. */
export function startOfWeek(date: IsoDate): IsoDate {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = söndag
  return addDays(date, -((weekday + 6) % 7));
}
