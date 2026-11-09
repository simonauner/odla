# Odla

UI följer designsystemet i [docs/design-system.md](docs/design-system.md): shadcn-komponenter från `src/components/ui/`, färger bara via tokens (`bg-primary`, `text-muted-foreground`), inga råa Tailwind-färger och inga `dark:`-klasser i sidor.

## Testa inloggat lokalt

Använd lokal Supabase med testdata, aldrig produktionsprojektet. Det kräver Docker.

```bash
npm run db:start   # startar lokal Supabase, kör migreringar och supabase/seed.sql
npm run dev:local  # appen mot lokal Supabase (eller preview "odla-local" i .claude/launch.json)
npm run db:reset   # nollställer databasen till seed-datan
```

Logga in som `agent@odla.test` / `odla-test-123` (zon 3, tomat och sallat, tomatsådden avbockad). Studio finns på http://127.0.0.1:54323. Ny testdata läggs i `supabase/seed.sql`.
