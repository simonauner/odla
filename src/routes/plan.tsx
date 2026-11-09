import { Link } from "@tanstack/react-router";
import { addDays, startOfWeek } from "@shared/dates";
import { tasksBetween } from "@shared/plan";
import { planSeason, type SeasonTask } from "@shared/season";
import type { Zone } from "@shared/zones";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { seasonYear, useSeason, useToggleTask } from "@/lib/garden";

const dateFmt = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" });
const monthFmt = new Intl.DateTimeFormat("sv-SE", { month: "long" });
const fmt = (iso: string) => dateFmt.format(new Date(`${iso}T12:00:00Z`));

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function TaskRow({ task }: { task: SeasonTask }) {
  const toggle = useToggleTask();
  const done = task.log?.status === "done";
  return (
    <li>
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Checkbox
              aria-label={`${task.title} klart`}
              checked={done}
              disabled={toggle.isPending}
              onCheckedChange={(checked) =>
                toggle.mutate({
                  plantingId: task.plantingId,
                  stepKey: task.stepKey,
                  done: checked === true,
                  doneOn: localToday(),
                })
              }
            />
            <span className={done ? "text-muted-foreground line-through" : undefined}>{task.title}</span>
          </CardTitle>
          <CardAction className="text-sm text-muted-foreground">
            {done
              ? `Klart ${fmt(task.log!.done_on)}`
              : task.start === task.end
                ? fmt(task.start)
                : `${fmt(task.start)}–${fmt(task.end)}`}
          </CardAction>
        </CardHeader>
        {task.description && !done && <CardContent className="text-muted-foreground">{task.description}</CardContent>}
        {toggle.isError && (
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
