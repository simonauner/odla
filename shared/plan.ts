import { addDays, diffDays, type IsoDate } from "./dates";
import type { CropStep, CropTemplate, TaskKind } from "./crops/types";
import { frostDates, type Zone } from "./zones";

export interface PlannedTask {
  /** Stabilt id: gröda, steg och löpnummer för upprepningar. */
  key: string;
  cropId: string;
  stepId: string;
  kind: TaskKind;
  title: string;
  description?: string;
  /** Första och sista lämpliga dag. */
  start: IsoDate;
  end: IsoDate;
}

export interface PlanInput {
  crop: CropTemplate;
  zone: Zone;
  year: number;
  /**
   * Faktiska datum för utförda steg (stepId → datum). Steg som räknas från ett
   * utfört steg flyttas efter det verkliga datumet i stället för det planerade.
   */
  actuals?: Record<string, IsoDate>;
  /** The user's own last spring frost date, replacing the zone's. */
  lastFrost?: IsoDate;
}

/** Bygger en årsplan för en gröda: ett fönster per steg och upprepning. */
export function planCrop({ crop, zone, year, actuals = {}, lastFrost: ownLastFrost }: PlanInput): PlannedTask[] {
  const { lastFrost: zoneLastFrost, firstFrost } = frostDates(zone, year);
  const lastFrost = ownLastFrost ?? zoneLastFrost;
  const stepsById = new Map(crop.steps.map((s) => [s.id, s]));
  const memo = new Map<string, IsoDate[]>();

  /** Startdatum för varje förekomst av ett steg. */
  function occurrences(step: CropStep, visiting: Set<string>): IsoDate[] {
    const cached = memo.get(step.id);
    if (cached) return cached;
    if (visiting.has(step.id))
      throw new Error(`Cirkulärt beroende i ${crop.id}: ${[...visiting, step.id].join(" → ")}`);
    visiting.add(step.id);

    let anchors: IsoDate[];
    switch (step.anchor.type) {
      case "last_frost":
        anchors = [lastFrost];
        break;
      case "first_frost":
        anchors = [firstFrost];
        break;
      case "step": {
        const anchorStep = stepsById.get(step.anchor.step);
        if (!anchorStep) throw new Error(`${crop.id}.${step.id} räknas från okänt steg ${step.anchor.step}`);
        anchors = occurrences(anchorStep, visiting);
        break;
      }
    }

    let starts = anchors.map((a) => addDays(a, step.window[0]));
    if (step.repeat) {
      const until = addDays(firstFrost, step.repeat.untilDaysFromFirstFrost);
      starts = starts.flatMap((first) => {
        const out: IsoDate[] = [];
        for (let d = first; diffDays(d, until) >= 0; d = addDays(d, step.repeat!.everyDays)) out.push(d);
        return out;
      });
    }

    const actual = actuals[step.id];
    if (actual && starts.length > 0) {
      // Det verkliga datumet ersätter första förekomsten; upprepningar räknas om från det.
      const shift = diffDays(starts[0]!, actual);
      starts = starts.map((s) => addDays(s, shift));
    }

    visiting.delete(step.id);
    memo.set(step.id, starts);
    return starts;
  }

  const tasks = crop.steps.flatMap((step) =>
    occurrences(step, new Set()).map((start, i): PlannedTask => {
      const length = step.window[1] - step.window[0];
      const end = addDays(start, length);
      return {
        key: `${crop.id}:${step.id}:${i}`,
        cropId: crop.id,
        stepId: step.id,
        kind: step.kind,
        title: step.title,
        description: step.description,
        start,
        end,
      };
    }),
  );

  return tasks.toSorted((a, b) => a.start.localeCompare(b.start) || a.key.localeCompare(b.key));
}

/** Uppgifter vars fönster överlappar perioden [from, to] (båda inklusive). */
export function tasksBetween(tasks: readonly PlannedTask[], from: IsoDate, to: IsoDate): PlannedTask[] {
  return tasks.filter((t) => t.start <= to && t.end >= from);
}
