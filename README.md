# Odla

Planera, följ upp och utvärdera din odling. Du väljer odlingszon och vad du vill odla, och får en årsplan med att göra-listor per vecka: förså, skola om, avhärda, plantera ut, gödsla och skörda.

## Stack

- **Frontend:** React 19 + Vite + TanStack Router/Query + Tailwind + shadcn/ui (`src/`). Regler för färger och komponenter: [docs/design-system.md](docs/design-system.md)
- **Hosting:** Cloudflare Workers (`worker/`) serves the static start page on `/` and the app on `/app`
- **Delad kod:** planmotor, zoner och grödmallar i TypeScript (`shared/`), som används av webben
- **Databas, inloggning och foton:** Supabase-projektet `haiidlamhbdgfugosykm` (eu-north-1, Stockholm). Migreringarna i `supabase/migrations/` körs mot produktion vid deploy. Webben pratar direkt med Supabase via `supabase-js` med användarens session; RLS begränsar allt till egna rader. Den publika URL:en och publishable-nyckeln finns i `wrangler.jsonc` och `.env`; inga hemliga nycklar finns i repot

## Kom igång

```bash
npm install
npm run dev      # http://localhost:5173 – Vite + Workers-runtime lokalt
npm test         # vitest: plan engine
npm run test:db  # pgTAP: who sees what in shared accounts (needs local Supabase running)
npm run build    # typkontroll + bygge till dist/
npm run deploy   # manuell deploy till Cloudflare (kräver `npx wrangler login`); normalt sköter CI det
```

Lokal Supabase med testdata (kräver Docker): `npm run db:start` och sedan `npm run dev:local`. Logga in som `agent@odla.test` / `odla-test-123`. Testdatan finns i `supabase/seed.sql`.

## Driftsättning

Varje push till `main` som klarar CI driftsätts av jobbet `deploy` i `.github/workflows/ci.yml`: först `supabase db push` mot produktionsdatabasen, sedan `npm run deploy` till Cloudflare Workers. Migreringar körs alltså innan den nya koden är ute, så de måste fungera med den gamla koden också (lägg till kolumner först, ta bort dem i en senare release).

Jobbet behöver tre secrets i GitHub (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN`: API-token med mallen _Edit Cloudflare Workers_
- `CLOUDFLARE_ACCOUNT_ID`: konto-id från Cloudflare-dashboarden
- `SUPABASE_DB_URL`: anslutningssträngen för _Session pooler_ (Connect i Supabase-dashboarden) med lösenordet ifyllt. Pooler-adressen behövs eftersom GitHubs runners saknar IPv6

## Inloggning

E-post och lösenord via Supabase Auth (`src/lib/auth.tsx`, `src/routes/login.tsx`). Utloggade ser bara inloggningssidan. Zon, säsong, grödor och avbockade steg sparas i databasen (`src/lib/garden.ts`), och planen räknas fram i webbläsaren med `planSeason()` i `shared/season.ts`.

I Supabase under **Authentication → URL Configuration** ska _Site URL_ vara sajtens adress, och både `https://<domän>/app` och `http://localhost:*/**` ska finnas under _Redirect URLs_ (bekräftelselänken leder till `/app`). Jokertecknet behövs eftersom parallella worktrees får varsin port (5173, 5174 …) via `autoPort` i `.claude/launch.json`. Annars pekar bekräftelselänken i mejlet fel. Supabase inbyggda e-post skickar bara ett fåtal mejl i timmen. Koppla in egen SMTP, t.ex. Resend, före lansering.

**Confirm email** under **Authentication → Sign In / Providers → Email** must stay on in production. Shared-account invites are accepted by whoever signs in with the invited email (`account_members` policies in `supabase/migrations/20261113090000_shared_accounts.sql`). Without confirmation, anyone could sign up with that address and get into the inviter's garden. Local Supabase has it off (`enable_confirmations` in `supabase/config.toml`); that only affects local data.

## Planmotorn

En gröda (`shared/crops/*.ts`) är en lista steg. Varje steg har ett **ankare** (sista vårfrost, första höstfrost eller ett annat steg) och ett **fönster** i dagar från ankaret. Steg kan upprepas, till exempel gödsling varje vecka eller successiv sådd av sallat. `planCrop()` i `shared/plan.ts` gör om mallen till daterade uppgifter för en zon och ett år.

Databasen lagrar inte planen. Den lagrar bara det som faktiskt hände (`task_logs`). Planen räknas om med `actuals`, så att steg som beror på ett försenat steg flyttas med.

Frostdatumen per zon i `shared/zones.ts` är medianer för 1991–2020 ur SMHI:s stationsdata (metod och stationer står i filen). Odlingsfönstren i grödmallarna är grova schablonvärden.

## Nästa steg

1. Foton per plantering (Supabase Storage, privat bucket `photos`)
2. Zonförslag utifrån karta eller position
3. Utvärdering efter säsongen; betalning (Stripe) för obegränsat antal foton och AI-analys
