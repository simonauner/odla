import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { addDays, startOfWeek } from "@shared/dates";
import { tasksBetween } from "@shared/plan";
import { planSeason, type SeasonTask } from "@shared/season";
import type { Zone } from "@shared/zones";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { seasonYear, useLogTask, useSeason } from "@/lib/garden";

const dateFmt = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" });
const monthFmt = new Intl.DateTimeFormat("sv-SE", { month: "long" });
const fmt = (iso: string) => dateFmt.format(new Date(`${iso}T12:00:00Z`));

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function TaskRow({ task }: { task: SeasonTask }) {
  const save = useLogTask();
  const [open, setOpen] = useState(false);
  const log = task.log;
  const done = log?.status === "done";
  const skipped = log?.status === "skipped";
  const id = `task-${task.key}`;
  const ids = { plantingId: task.plantingId, stepKey: task.stepKey };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const status = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "skipped" ? "skipped" : "done";
    save.mutate(
      { ...ids, log: { status, doneOn: String(form.get("date")) || localToday(), note: String(form.get("note")) } },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <li>
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Checkbox
              aria-label={`${task.title} klart`}
              checked={done}
              disabled={save.isPending}
              onCheckedChange={(checked) =>
                save.mutate({
                  ...ids,
                  log: checked === true ? { status: "done", doneOn: localToday(), note: log?.note ?? undefined } : null,
                })
              }
            />
            <span className={log ? "text-muted-foreground line-through" : undefined}>{task.title}</span>
            {skipped && <Badge variant="secondary">Överhoppad</Badge>}
          </CardTitle>
          <CardAction className="flex items-center gap-2 text-sm text-muted-foreground">
            {done
              ? `Klart ${fmt(log!.done_on)}`
              : task.start === task.end
                ? fmt(task.start)
                : `${fmt(task.start)}–${fmt(task.end)}`}
            <Button variant="ghost" size="sm" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
              {open ? "Stäng" : "Mer"}
            </Button>
          </CardAction>
        </CardHeader>
        {task.description && !log && !open && (
          <CardContent className="text-muted-foreground">{task.description}</CardContent>
        )}
        {log?.note && !open && <CardContent>{log.note}</CardContent>}
        {open && (
          <CardContent>
            <form id={id} onSubmit={onSubmit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                <div className="space-y-1">
                  <Label htmlFor={`${id}-date`}>Datum</Label>
                  <Input id={`${id}-date`} name="date" type="date" defaultValue={log?.done_on ?? localToday()} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`${id}-note`}>Anteckning</Label>
                  <Input
                    id={`${id}-note`}
                    name="note"
                    defaultValue={log?.note ?? ""}
                    placeholder="Sort, antal, väder…"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="secondary" value="done" disabled={save.isPending}>
                  Spara som klart
                </Button>
                <Button type="submit" variant="outline" value="skipped" disabled={save.isPending}>
                  Hoppa över
                </Button>
                {log && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={save.isPending}
                    onClick={() => save.mutate({ ...ids, log: null }, { onSuccess: () => setOpen(false) })}
                  >
                    Ångra
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        )}
        {save.isError && (
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>Kunde inte spara.</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>
    </li>
  );
}

function TaskList({ tasks }: { tasks: SeasonTask[] }) {
  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <TaskRow key={t.key} task={t} />
      ))}
    </ul>
  );
}

export function PlanPage() {
  const season = useSeason();

  if (season.isPending) return <p className="text-muted-foreground">Laddar din plan…</p>;
  if (season.isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>Kunde inte hämta planen.</AlertDescription>
      </Alert>
    );
  if (!season.data || season.data.plantings.length === 0) {
    return (
      <p>
        Börja med att{" "}
        <Link to="/setup" className="text-primary underline underline-offset-4">
          välja zon och grödor
        </Link>
        .
      </p>
    );
  }

  const tasks = planSeason(season.data.zone as Zone, season.data.year, season.data.plantings);
  const today = localToday();
  const monday = startOfWeek(today);
  const sunday = addDays(monday, 6);
  // Den här veckan, plus missade uppgifter som inte är avbockade.
  const thisWeek = tasks.filter((t) => tasksBetween([t], monday, sunday).length > 0 || (!t.log && t.end < monday));
  const upcoming = tasks.filter((t) => !t.log && t.start > sunday).slice(0, 3);
  const byMonth = Map.groupBy(tasks, (t) => t.start.slice(0, 7));

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Att göra den här veckan</h2>
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
        <h2 className="mb-3 text-lg font-semibold">Årsplan {seasonYear}</h2>
        <div className="space-y-6">
          {[...byMonth].map(([month, monthTasks]) => (
            <div key={month}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {monthFmt.format(new Date(`${month}-15T12:00:00Z`))}
              </h3>
              <TaskList tasks={monthTasks} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
