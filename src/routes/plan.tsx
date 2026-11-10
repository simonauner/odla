import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { addDays, startOfWeek } from "@shared/dates";
import { tasksBetween } from "@shared/plan";
import { planSeason, shouldAskToClose } from "@shared/season";
import { guessLastFrost } from "@shared/zones";
import { TaskList, type Task } from "@/components/task-list";
import { SlowLoading } from "@/components/slow-loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { locale, localToday } from "@/lib/format";
import { findCrop } from "@shared/crops";
import { isOpen, useSeasons, useUpdatePlantings, type Season } from "@/lib/garden";
import { cn } from "@/lib/utils";

const monthFmt = new Intl.DateTimeFormat(locale, { month: "long" });
const longDateFmt = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" });

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 10) return "God morgon";
  if (hour < 17) return "Hej";
  return "God kväll";
}

/** Asks, per place, whether the crops that are done or past their last task can be closed, or to be reminded later. */
function ClosePrompt({ season, due, today }: { season: Season; due: Season["plantings"]; today: string }) {
  const update = useUpdatePlantings();
  const name = (p: (typeof due)[number]) => findCrop(p.crop_id)?.name ?? p.crop_id;
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Klart för säsongen på {season.garden.name}?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground">
          När du avslutar en gröda försvinner den ur planen. Det du har bockat av och antecknat sparas.
        </p>
        <ul className="space-y-2">
          {due.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2">
              {name(p)} {season.year}
              <Button
                size="sm"
                disabled={update.isPending}
                onClick={() => update.mutate({ plantingIds: [p.id], closed: true })}
              >
                Avsluta
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Påminn mig om</span>
          {[1, 2, 4].map((weeks) => (
            <Button
              key={weeks}
              variant="outline"
              size="sm"
              disabled={update.isPending}
              onClick={() => update.mutate({ plantingIds: due.map((p) => p.id), remindOn: addDays(today, weeks * 7) })}
            >
              {weeks} {weeks === 1 ? "vecka" : "veckor"}
            </Button>
          ))}
        </div>
        {update.isError && (
          <Alert variant="destructive">
            <AlertDescription>Kunde inte spara.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export function PlanPage() {
  const seasons = useSeasons();

  if (seasons.isPending) return <SlowLoading loading />;
  if (seasons.isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>Kunde inte hämta planen.</AlertDescription>
      </Alert>
    );
  // Crops stay in the plan until the user closes them, also after the year has turned.
  const open = seasons.data.filter(isOpen).map((s) => ({ ...s, plantings: s.plantings.filter((p) => !p.closed_at) }));
  if (!open.some((s) => s.plantings.length > 0)) {
    return (
      <section className="space-y-4 rounded-3xl bg-secondary p-6 text-secondary-foreground sm:p-8">
        <Sprout aria-hidden className="size-10" />
        <h1 className="font-heading text-3xl font-semibold">Dags att planera säsongen!</h1>
        <p className="max-w-md">
          Välj var du bor och vad du vill odla, så räknar vi ut när du ska så, plantera och skörda.
        </p>
        <Button asChild size="lg">
          <Link to="/setup">Kom igång</Link>
        </Button>
      </section>
    );
  }

  const today = localToday();
  const several = open.length > 1;
  const planned = open.map((s) => ({
    season: s,
    tasks: planSeason(
      s.garden.zone,
      s.year,
      s.plantings,
      s.last_frost ?? guessLastFrost(s.garden.zone, s.year, s.garden.kind),
    ),
  }));
  const toClose = planned
    .map((p) => ({
      season: p.season,
      due: p.season.plantings.filter((pl) =>
        shouldAskToClose(
          pl,
          p.tasks.filter((t) => t.plantingId === pl.id),
          today,
        ),
      ),
    }))
    .filter((p) => p.due.length > 0);
  const tasks: Task[] = planned
    .flatMap((p) => p.tasks.map((t) => (several ? { ...t, place: p.season.garden.name } : t)))
    .toSorted((a, b) => a.start.localeCompare(b.start) || a.key.localeCompare(b.key));
  const years = [...new Set(open.map((s) => s.year))];
  const seasonLabel = `Säsong ${years.join(" och ")}`;
  const monday = startOfWeek(today);
  const sunday = addDays(monday, 6);
  // Den här veckan, plus missade uppgifter som inte är avbockade.
  const thisWeek = tasks.filter((t) => tasksBetween([t], monday, sunday).length > 0 || (!t.log && t.end < monday));
  const upcoming = tasks.filter((t) => !t.log && t.start > sunday).slice(0, 3);
  const byMonth = Map.groupBy(tasks, (t) => t.start.slice(0, 7));
  const thisMonth = today.slice(0, 7);
  const openThisWeek = thisWeek.filter((t) => !t.log).length;
  const doneCount = tasks.filter((t) => t.log).length;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8">
        <Sprout aria-hidden className="absolute -right-8 -bottom-10 size-52 opacity-15" />
        <p className="text-sm font-medium first-letter:uppercase">
          {longDateFmt.format(new Date(`${today}T12:00:00`))}
        </p>
        <h1 className="mt-1 font-heading text-4xl font-semibold sm:text-5xl">{greeting()}!</h1>
        <p className="mt-2 max-w-md text-lg">
          {openThisWeek > 0
            ? `${openThisWeek} ${openThisWeek === 1 ? "sak" : "saker"} att göra i odlingen den här veckan.`
            : "Inget brådskande just nu. Njut av lugnet!"}
        </p>
        <div className="mt-6 max-w-sm">
          <div className="mb-1.5 flex justify-between text-sm font-medium">
            <span>{seasonLabel}</span>
            <span>
              {doneCount} av {tasks.length} klara
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={seasonLabel}
            aria-valuemin={0}
            aria-valuemax={tasks.length}
            aria-valuenow={doneCount}
            className="h-2.5 overflow-hidden rounded-full bg-primary-foreground/20"
          >
            <div className="h-full rounded-full bg-sun" style={{ width: `${(doneCount / tasks.length) * 100}%` }} />
          </div>
        </div>
      </section>

      {toClose.map((p) => (
        <ClosePrompt key={p.season.id} season={p.season} due={p.due} today={today} />
      ))}

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-2xl font-semibold">
          Den här veckan
          {openThisWeek > 0 && <Badge variant="sun">{openThisWeek} kvar</Badge>}
        </h2>
        {thisWeek.length > 0 ? (
          <TaskList tasks={thisWeek} />
        ) : (
          <>
            <p className="mb-3 text-muted-foreground">Inget att göra just nu. Härnäst:</p>
            <TaskList tasks={upcoming} />
          </>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-heading text-2xl font-semibold">Årsplan {years.join(" och ")}</h2>
        <ol className="space-y-8 border-l-2 border-border pl-6">
          {[...byMonth].map(([month, monthTasks]) => (
            <li key={month} className="relative">
              <span
                aria-hidden
                className={cn(
                  "absolute top-1 -left-7.75 size-3 rounded-full ring-4 ring-background",
                  month === thisMonth ? "bg-sun" : month < thisMonth ? "bg-border" : "bg-primary",
                )}
              />
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {monthFmt.format(new Date(`${month}-15T12:00:00Z`))}
                {years.length > 1 && ` ${month.slice(0, 4)}`}
                {month === thisMonth && <Badge variant="sun">Nu</Badge>}
              </h3>
              <TaskList tasks={monthTasks} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
