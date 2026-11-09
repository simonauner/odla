# Designsystem

Odla använder [shadcn/ui](https://ui.shadcn.com) (stil `radix-nova`) på Tailwind v4. Komponenterna ligger i `src/components/ui/` och är vår egen kod. Färger, radier och typsnitt är tokens i `src/index.css`.

## Grundregler

1. **Använd tokens, aldrig råa färger.** Skriv `bg-primary`, `text-muted-foreground`, `border-border`. Skriv aldrig `bg-green-600`, `text-stone-500` eller hex/oklch i komponenter. Behövs en ny färg lägger du till en token i `index.css` (både ljust och mörkt läge) och dokumenterar den här.
2. **Använd en komponent innan du bygger en.** Finns den i `src/components/ui/`, använd den. Finns den i shadcn, lägg till den med `npx shadcn@latest add <namn>`. Bygg egen markup bara när inget av det passar.
3. **Ändra utseendet i komponenten, inte på varje ställe.** Om alla knappar ska se annorlunda ut ändrar du `button.tsx`. `className` på en enskild instans är till för layout (marginal, bredd, grid), inte för färg eller form.
4. **Inga `dark:`-klasser i sidor.** Mörkt läge följer systemet (`prefers-color-scheme`) och sköts helt av tokens. Behövs `dark:` är det ett tecken på att en token saknas.
5. **Svenska i all text.** Korta, vardagliga ord: "Visa min plan", inte "Generera odlingsschema".

## Färger

Känslan ska vara fräsch och peppig men ordnad. Ljust läge är en varm, gräddvit bakgrund med friskt bladgrönt som huvudfärg och solgult som glädjeaccent. Mörkt läge är djupt skogsgrönt med ljusare grönt.

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

## Komponenter

| Behov                                   | Komponent                                                                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Handling                                | `Button`. `default` för huvudhandlingen, `outline`/`secondary` för övriga, `ghost` i verktygsrader, `destructive` för att ta bort |
| Välj ett av flera                       | `RadioGroup` + `RadioGroupItem` inuti `Label` (hela rutan klickbar, se zonvalet i `setup.tsx`)                                    |
| Slå av/på ett val, flera tillåtna       | `Toggle variant="outline"` (se grödvalet)                                                                                         |
| En uppgift, gröda eller post i en lista | `Card size="sm"` med `CardHeader`/`CardTitle`, metadata i `CardAction`, brödtext i `CardContent`                                  |
| Status eller kort etikett               | `Badge` (`warning` för varningar, `secondary` för neutral info)                                                                   |
| Fel- eller infomeddelande               | `Alert` (`variant="destructive"` för fel)                                                                                         |
| Etikett till formulärfält               | `Label`                                                                                                                           |
| Textfält                                | `Input` med `Label htmlFor` (se `login.tsx`)                                                                                      |
| Bocka av                                | `Checkbox` (se uppgifterna i `plan.tsx`)                                                                                          |

Lägg till fler med `npx shadcn@latest add <namn>` när de behövs, och lägg in dem i tabellen.

## Typografi och mellanrum

- Typsnitt: Geist (variabelt) för brödtext via `font-sans`. Fraunces (variabel serif) för rubriker via `font-heading`; `CardTitle` använder den automatiskt.
- Sidans stora rubrik (hälsning): `<h1 className="font-heading text-4xl font-semibold">`. Sidrubrik i sektion: `<h2 className="font-heading text-2xl font-semibold">`. Underrubrik: `<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">`.
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
