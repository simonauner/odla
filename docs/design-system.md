# Designsystem

Grodla använder [shadcn/ui](https://ui.shadcn.com) (stil `radix-nova`) på Tailwind v4. Komponenterna ligger i `src/components/ui/` och är vår egen kod. Färger, radier och typsnitt är tokens i `src/index.css`.

## Grundregler

1. **Använd tokens, aldrig råa färger.** Skriv `bg-primary`, `text-muted-foreground`, `border-border`. Skriv aldrig `bg-green-600`, `text-stone-500` eller hex/oklch i komponenter. Behövs en ny färg lägger du till en token i `index.css` (både ljust och mörkt läge) och dokumenterar den här.
2. **Använd en komponent innan du bygger en.** Finns den i `src/components/ui/`, använd den. Finns den i shadcn, lägg till den med `npx shadcn@latest add <namn>`. Bygg egen markup bara när inget av det passar.
3. **Ändra utseendet i komponenten, inte på varje ställe.** Om alla knappar ska se annorlunda ut ändrar du `button.tsx`. `className` på en enskild instans är till för layout (marginal, bredd, grid), inte för färg eller form.
4. **Inga `dark:`-klasser i sidor.** Mörkt läge följer systemet (`prefers-color-scheme`) och sköts helt av tokens. Behövs `dark:` är det ett tecken på att en token saknas.
5. **Svenska i all text.** Korta, vardagliga ord: "Visa min plan", inte "Generera odlingsschema".

## Färger

Känslan ska vara fräsch och peppig men ordnad. Ljust läge är en varm, gräddvit bakgrund med friskt bladgrönt som huvudfärg och solgult som glädjeaccent. Mörkt läge är djupt skogsgrönt med ljusare grönt. Logotypen använder samma grön som `primary`.

| Token                                | Används till                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `background` / `foreground`          | Sidans bakgrund och brödtext                                                                                     |
| `card` / `card-foreground`           | Kort, ytor som ligger ovanpå bakgrunden                                                                          |
| `primary` / `primary-foreground`     | Den viktigaste handlingen på sidan, logotyp, länkar, valt läge på radioknappar. Högst en primärknapp per vy      |
| `secondary` / `secondary-foreground` | Valt tillstånd (vald gröda, vald zon), sekundära knappar. Ljusgrönt                                              |
| `muted` / `muted-foreground`         | Hjälptext, datum, etiketter, tomma lägen                                                                         |
| `accent` / `accent-foreground`       | Hover på menyer och listor (shadcn sköter det)                                                                   |
| `destructive`                        | Fel och handlingar som tar bort data                                                                             |
| `sun` / `sun-foreground`             | Glädjeaccent: framsteg, "nu"-markering, räknare. Sparsamt, högst ett par ställen per vy. `<Badge variant="sun">` |
| `warning` / `warning-foreground`     | Varningar som inte är fel, t.ex. gröda som är svår i zonen. Används via `<Badge variant="warning">`              |
| `border`, `input`, `ring`            | Kanter, formulärfält, fokusring                                                                                  |

`chart-*` och `sidebar-*` är shadcn:s standardvärden och ska få egna färger först när vi bygger diagram eller sidomeny.

## Logotyp

Filerna ligger i `public/`: `grodla-logo.svg` (ordbild med sol, byter färg själv i mörkt läge), `grodla.svg` (favicon) och `grodla-icon-192/512.png` (appikoner). Visa ordbilden som `<img src="/grodla-logo.svg" alt="Grodla">` i 148×36, och aldrig mindre än 110 px bred. Färga inte om, beskär inte och lägg den inte på `bg-primary`; den ska stå på `background` eller `card`.

Logotypens hex-färger är det enda undantaget från tokenregeln. Den gröna är `primary` omräknad till hex (`#007f35` ljust, `#6ed274` mörkt), solen är `#df970b` ljust och `#ffc343` mörkt. Ändrar du `primary`, uppdatera `grodla-logo.svg` och `grodla.svg` och generera om PNG-ikonerna från `grodla.svg`.

## Komponenter

| Behov                                                   | Komponent                                                                                                                                                                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sidrubrik med sidans handlingar                         | `PageHeader` från `src/components/page-header.tsx` med `title`, `description` och `actions` (knappar till höger, `default` för huvudhandlingen)                                                                                             |
| Handling                                                | `Button`. `default` för huvudhandlingen, `outline`/`secondary` för övriga, `ghost` i verktygsrader, `destructive-ghost` för att ta bort                                                                                                     |
| Välj ett av flera                                       | `RadioGroup` + `RadioGroupItem` inuti `Label` (hela rutan klickbar, klassen `radioCard` från `place-fields.tsx`)                                                                                                                            |
| Slå av/på ett val, flera tillåtna                       | `Toggle variant="outline" shape="pill"` (se `CropToggles`)                                                                                                                                                                                  |
| En uppgift, gröda eller post i en lista                 | `Card size="sm"` med `CardHeader`/`CardTitle`, metadata i `CardAction`, brödtext i `CardContent`                                                                                                                                            |
| Kort man går in i (platser)                             | `Card` med `relative`, länken i `CardTitle` sträcks över hela kortet med `after:absolute after:inset-0`, `CardAction` får `relative` så menyn ligger ovanpå. Innehåll som `Badge variant="secondary"`, kapat med "+N till" (se `crops.tsx`) |
| Status eller kort etikett                               | `Badge` (`warning` för varningar, `secondary` för neutral info)                                                                                                                                                                             |
| Fel- eller infomeddelande                               | `Alert` (`variant="destructive"` för fel)                                                                                                                                                                                                   |
| Etikett till formulärfält                               | `Label`                                                                                                                                                                                                                                     |
| Textfält                                                | `Input` med `Label htmlFor` (se `login.tsx`)                                                                                                                                                                                                |
| Bekräfta innan något tas bort                           | `ConfirmButton` från `src/components/confirm-button.tsx` (`variant="destructive-ghost"`), öppnar en `AlertDialog` med Avbryt och en `destructive`-knapp. Från en meny: `ConfirmDialog` med `open`                                           |
| Fler val på ett kort                                    | `DropdownMenu` bakom en `ghost`-knapp med `Ellipsis`-ikon (`size="icon-sm"`, `aria-label`). Ta bort-val har `variant="destructive"`                                                                                                         |
| Bocka av                                                | `Checkbox` (se `TaskList`)                                                                                                                                                                                                                  |
| Felmeddelande när något inte gick att hämta eller spara | `ErrorAlert` från `src/components/error-alert.tsx`                                                                                                                                                                                          |
| Namn, typ och zon för en plats                          | `PlaceFields` från `src/components/place-fields.tsx`                                                                                                                                                                                        |
| Välja grödor                                            | `CropToggles` från `src/components/crop-toggles.tsx`, markerar grödor som kräver växthus i zonen                                                                                                                                            |
| Grödor som små kort med symbol                          | `CropChips` från `src/components/crop-chips.tsx`                                                                                                                                                                                            |
| Uppgifter att bocka av                                  | `TaskList` från `src/components/task-list.tsx`                                                                                                                                                                                              |
| Sidan laddar                                            | `SlowLoading` från `src/components/slow-loading.tsx`: `if (query.isPending) return <SlowLoading loading />;`. Visar ingenting de första två sekunderna, sedan "Det här tar ovanligt lång tid…"                                              |

Lägg till fler med `npx shadcn@latest add <namn>` när de behövs, och lägg in dem i tabellen. Komponenter som används på mer än en sida ligger i `src/components/`, aldrig i en fil under `src/routes/`.

## Typografi och mellanrum

- Typsnitt: Geist (variabelt) för brödtext via `font-sans`. Fraunces (variabel serif) för rubriker via `font-heading`; `CardTitle` använder den automatiskt.
- Varje sida har exakt en `h1`, och det är `PageHeader` (`font-heading text-3xl font-semibold`). Undantag är startsidans hero-yta, där rubriken är en egen `h1`: hälsningen i `font-heading text-4xl font-semibold sm:text-5xl`, det tomma läget i `font-heading text-3xl font-semibold`.
- Sektionsrubrik: `<h2 className="font-heading text-2xl font-semibold">`.
- Fråga eller steg i ett formulär (som i `setup.tsx`): `<h2 className="text-lg font-semibold">`, eller `h3` om den ligger under en sektionsrubrik.
- Etikett över en grupp (som månaderna i årsplanen): `<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">`.
- Hjälptext: `text-sm text-muted-foreground`.
- Mellanrum mellan sektioner: `space-y-8`–`space-y-10`. Mellan kort i en lista: `space-y-2`.
- Radie styrs av `--radius`. Använd `rounded-lg` (standard), `rounded-3xl` för stora ytor som hero-rutan på startsidan, eller `rounded-full` för piller; inga godtyckliga värden.
- Hero-yta överst på en sida: `rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8` (se `plan.tsx`). Tom sida: samma form med `bg-secondary`.
- Tidslinje (årsplanen): `ol` med `border-l-2` och en prick per månad, `bg-sun` för innevarande månad.

## Publika startsidan

`/` är `index.html`: statisk HTML utan React eller skript, så den laddar direkt. Appen ligger under `/app` (`app.html`). Startsidan använder samma tokens och Tailwind-klasser; länkar som ser ut som knappar efterliknar `Button`-klasserna. Skärmdumparna ligger i `public/screenshots/` (ljust läge, 420 px bred vy i 2x).

## Tillgänglighet

- Kontrast minst WCAG AA. Ändrar du en token, kontrollera både ljust och mörkt läge.
- Allt klickbart ska vara en `Button`, `Toggle`, länk eller formulärkontroll, aldrig en `div` med `onClick`.
- Lita inte på färg ensam för att visa status. Lägg till text eller ikon (t.ex. `Badge` med ord).
