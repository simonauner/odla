import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { addDays, startOfWeek } from "@shared/dates";
import { tasksBetween, type PlannedTask } from "@shared/plan";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useGarden } from "@/lib/garden";

const dateFmt = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" });
const monthFmt = new Intl.DateTimeFormat("sv-SE", { month: "long" });
const fmt = (iso: string) => dateFmt.format(new Date(`${iso}T12:00:00Z`));

function TaskRow({ task }: { task: PlannedTask }) {
  return (
    <li>
      <Card size="sm">
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <CardAction className="text-sm text-muted-foreground">
            {task.start === task.end ? fmt(task.start) : `${fmt(task.start)}–${fmt(task.end)}`}
          </CardAction>
        </CardHeader>
        {task.description && <CardContent className="text-muted-foreground">{task.description}</CardContent>}
      </Card>
    </li>
  );
}

export function PlanPage() {
  const [garden] = useGarden();
  const ready = garden.zone !== null && garden.crops.length > 0;
  const plan = useQuery({
    queryKey: ["plan", garden.zone, garden.year, garden.crops],
    queryFn: () => api.plan(garden.zone!, garden.year, garden.crops),
    enabled: ready,
  });

  if (!ready) {
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
  if (plan.isPending) return <p className="text-muted-foreground">Räknar fram din plan…</p>;
  if (plan.isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>Kunde inte hämta planen.</AlertDescription>
      </Alert>
    );

  const tasks = plan.data.tasks;
  // oxlint-disable-next-line react/purity -- "idag" ska läsas om vid varje render
  const monday = startOfWeek(new Date().toISOString().slice(0, 10));
  const thisWeek = tasksBetween(tasks, monday, addDays(monday, 6));
  const upcoming = tasks.filter((t) => t.start > addDays(monday, 6)).slice(0, 3);

  const byMonth = Map.groupBy(tasks, (t) => t.start.slice(0, 7));

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Att göra den här veckan</h2>
        {thisWeek.length > 0 ? (
          <ul className="space-y-2">
            {thisWeek.map((t) => (
              <TaskRow key={t.key} task={t} />
            ))}
          </ul>
        ) : (
          <>
            <p className="mb-3 text-muted-foreground">Inget att göra just nu. Härnäst:</p>
            <ul className="space-y-2">
              {upcoming.map((t) => (
                <TaskRow key={t.key} task={t} />
              ))}
            </ul>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Årsplan {garden.year}</h2>
        <div className="space-y-6">
          {[...byMonth].map(([month, monthTasks]) => (
            <div key={month}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {monthFmt.format(new Date(`${month}-15T12:00:00Z`))}
              </h3>
              <ul className="space-y-2">
                {monthTasks.map((t) => (
                  <TaskRow key={t.key} task={t} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
