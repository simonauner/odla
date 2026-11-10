// The one place that picks the display locale, so the app can be translated later.
export const locale = "sv-SE";

const dayFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

/** "2027-05-20" → "20 maj". */
export const formatDay = (iso: string) => dayFmt.format(new Date(`${iso}T12:00:00Z`));

/** Today in the user's time zone as "YYYY-MM-DD". */
export function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const monthFmt = new Intl.DateTimeFormat(locale, { month: "short" });
const month = (iso: string) => monthFmt.format(new Date(`${iso}T12:00:00Z`));

/** "apr.–sep. 2026", or "sep. 2026–aug. 2027" across a new year. */
export function formatSpan(start: string, end: string): string {
  const [from, to] = [start.slice(0, 4), end.slice(0, 4)];
  return from === to ? `${month(start)}–${month(end)} ${to}` : `${month(start)} ${from}–${month(end)} ${to}`;
}
