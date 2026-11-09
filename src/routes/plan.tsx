import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { addDays, startOfWeek } from "@shared/dates";
import { tasksBetween, type PlannedTask } from "@shared/plan";
import { api } from "@/lib/api";
import { useGarden } from "@/lib/garden";

const dateFmt = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" });
const monthFmt = new Intl.DateTimeFormat("sv-SE", { month: "long" });
const fmt = (iso: string) => dateFmt.format(new Date(`${iso}T12:00:00Z`));

function TaskRow({ task }: { task: PlannedTask }) {
  return (
    <li className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex justify-between gap-4">
        <span className="font-medium">{task.title}</span>
        <span className="shrink-0 text-sm text-stone-500">
          {task.start === task.end ? fmt(task.start) : `${fmt(task.start)}–${fmt(task.end)}`}
        </span>
      </div>
      {task.description && <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{task.description}</p>}
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
        <Link to="/setup" className="text-leaf-700 underline">
          välja zon och grödor
        </Link>
        .
      </p>
    );
  }
  if (plan.isPending) return <p>Räknar fram din plan…</p>;
  if (plan.isError) return <p>Kunde inte hämta planen.</p>;

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
            <p className="mb-3 text-stone-500">Inget att göra just nu. Härnäst:</p>
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
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
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
