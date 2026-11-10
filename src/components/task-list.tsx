import { useState } from "react";
import {
  Carrot,
  Droplets,
  FlaskConical,
  Flower2,
  Leaf,
  ListFilter,
  Mountain,
  Scissors,
  Shovel,
  Sprout,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type { TaskKind } from "@shared/crops/types";
import type { SeasonTask } from "@shared/season";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDay, localToday } from "@/lib/format";
import { useUserId } from "@/lib/auth";
import { useLogTask } from "@/lib/garden";

/** A task, with the place's name when the user grows in more than one place. */
export type Task = SeasonTask & { place?: string };

const kindIcon: Record<TaskKind, LucideIcon> = {
  sow_indoor: Sprout,
  pot_up: Flower2,
  thin: ListFilter,
  hill: Mountain,
  harden_off: Sun,
  plant_out: Shovel,
  sow_outdoor: Sprout,
  fertilize: FlaskConical,
  water: Droplets,
  prune: Scissors,
  harvest: Carrot,
  clear: Leaf,
};

function TaskRow({ task }: { task: Task }) {
  const save = useLogTask();
  const userId = useUserId();
  const [open, setOpen] = useState(false);
  const log = task.log;
  const done = log?.status === "done";
  const skipped = log?.status === "skipped";
  const id = `task-${task.key}`;
  const ids = { plantingId: task.plantingId, stepKey: task.stepKey };
  const Icon = kindIcon[task.kind];
  // Name whoever else in a shared account did the step.
  const byOther = log?.by && log.by.id !== userId ? ` av ${log.by.display_name}` : "";

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
            <Icon aria-hidden className="size-4 shrink-0 text-primary" />
            <span className={log ? "text-muted-foreground line-through" : undefined}>{task.title}</span>
            {task.place && <Badge variant="outline">{task.place}</Badge>}
            {skipped && <Badge variant="secondary">Överhoppad{byOther}</Badge>}
          </CardTitle>
          <CardAction className="flex items-center gap-2 text-sm text-muted-foreground">
            {done
              ? `Klart ${formatDay(log!.done_on)}${byOther}`
              : task.start === task.end
                ? formatDay(task.start)
                : `${formatDay(task.start)}–${formatDay(task.end)}`}
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

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <TaskRow key={t.key} task={t} />
      ))}
    </ul>
  );
}
