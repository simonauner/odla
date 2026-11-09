// The one place that picks the display locale, so the app can be translated later.
export const locale = "sv-SE";

const dayFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

/** "2027-05-20" → "20 maj". */
export const formatDay = (iso: string) => dayFmt.format(new Date(`${iso}T12:00:00Z`));
