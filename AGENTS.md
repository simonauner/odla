# Grodla

UI följer designsystemet i [docs/design-system.md](docs/design-system.md): shadcn-komponenter från `src/components/ui/`, färger bara via tokens (`bg-primary`, `text-muted-foreground`), inga råa Tailwind-färger och inga `dark:`-klasser i sidor.

All kod, kommentarer, commit-meddelanden och PR:er skrivs på engelska. Undantag: texter som användaren ser i appen är på svenska som standard, men ska gå att översätta till engelska, så hårdkoda inte svenska som enda alternativ (t.ex. `sv-SE` i `Intl`).

## Testa inloggat lokalt

Använd lokal Supabase med testdata, aldrig produktionsprojektet. Det kräver Docker.

```bash
npm run db:start   # startar lokal Supabase, kör migreringar och supabase/seed.sql
npm run dev:local  # appen mot lokal Supabase (eller preview "odla-local" i .claude/launch.json)
npm run db:reset   # nollställer databasen till seed-datan
```

Logga in som `agent@odla.test` / `odla-test-123` (odlingsplatsen Hemma i zon 3 med tomat och sallat, tomatsådden avbockad, och Lantstället i zon 6 med en oavslutad säsong från förra året, sallat och potatis). Studio finns på http://127.0.0.1:54323. Ny testdata läggs i `supabase/seed.sql`.
