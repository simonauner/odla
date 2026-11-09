# Odla

Planera, följ upp och utvärdera din odling. Du väljer odlingszon och vad du vill odla, och får en årsplan med att göra-listor per vecka: förså, skola om, avhärda, plantera ut, gödsla och skörda.

## Stack

- **Frontend:** React 19 + Vite + TanStack Router/Query + Tailwind (`src/`)
- **API:** Hono på Cloudflare Workers (`worker/`). Samma Worker serverar SPA:n och `/api/*`
- **Delad kod:** planmotor, zoner och grödmallar i TypeScript (`shared/`), som används av både webben och API:t
- **Databas, inloggning och foton:** Supabase (`supabase/migrations/`). Ännu inte inkopplat i koden

## Kom igång

```bash
npm install
npm run dev      # http://localhost:5173 – Vite + Workers-runtime lokalt
npm test         # vitest: planmotor och API
npm run build    # typkontroll + bygge till dist/
npm run deploy   # bygger och driftsätter till Cloudflare (kräver `npx wrangler login`)
```

## Planmotorn

En gröda (`shared/crops/*.ts`) är en lista steg. Varje steg har ett **ankare** (sista vårfrost, första höstfrost eller ett annat steg) och ett **fönster** i dagar från ankaret. Steg kan upprepas, till exempel gödsling varje vecka eller successiv sådd av sallat. `planCrop()` i `shared/plan.ts` gör om mallen till daterade uppgifter för en zon och ett år.

Databasen lagrar inte planen. Den lagrar bara det som faktiskt hände (`task_logs`). Planen räknas om med `actuals`, så att steg som beror på ett försenat steg flyttas med.

Frostdatumen per zon i `shared/zones.ts` är grova schablonvärden och behöver kalibreras, till exempel mot SMHI:s data.

## Nästa steg

1. Nytt Supabase-projekt (eu-north-1/Stockholm), kör migreringen och lägg in `SUPABASE_URL` och den publika nyckeln
2. Inloggning (Supabase Auth). API:t verifierar JWT och sparar säsong, planteringar och utförda steg
3. Bocka av uppgifter och flytta dem (`task_logs` → `actuals`)
4. Foton per plantering (Supabase Storage, privat bucket `photos`)
5. Zonförslag utifrån karta eller position
6. Utvärdering efter säsongen; betalning (Stripe) för obegränsat antal foton och AI-analys
