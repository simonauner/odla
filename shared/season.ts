import type { IsoDate } from "./dates";
import { findCrop, type CropTemplate } from "./crops";
import { planCrop, type PlannedTask } from "./plan";
import type { Zone } from "./zones";

export interface LoggedStep {
  step_key: string;
  status: string;
  done_on: IsoDate;
  note?: string | null;
}

export interface SeasonPlanting {
  id: string;
  crop_id: string;
  task_logs: LoggedStep[];
}

export interface SeasonTask extends PlannedTask {
  plantingId: string;
  /** Nyckel inom plantering, som lagras i task_logs.step_key: "<stepId>:<löpnummer>". */
  stepKey: string;
  log?: LoggedStep;
}

/** Nyckeln utan grödprefix: "tomato:sow:0" → "sow:0". */
export function stepKeyOf(task: PlannedTask): string {
  return task.key.slice(task.cropId.length + 1);
}

/**
 * Hela säsongens plan för alla planteringar, där utförda steg (första förekomsten)
 * styr datumen för de steg som räknas från dem.
 */
export function planSeason(
  zone: Zone,
  year: number,
  plantings: readonly SeasonPlanting[],
  lastFrost?: IsoDate,
): SeasonTask[] {
  return plantings
    .flatMap((planting) => {
      const crop = findCrop(planting.crop_id);
      if (!crop) return [];
      const logs = new Map(planting.task_logs.map((l) => [l.step_key, l]));
      const actuals: Record<string, IsoDate> = {};
      for (const log of planting.task_logs) {
        const [stepId, index] = log.step_key.split(":");
        if (log.status === "done" && index === "0" && stepId) actuals[stepId] = log.done_on;
      }
      return planCrop({ crop, zone, year, actuals, lastFrost }).map((task): SeasonTask => {
        const stepKey = stepKeyOf(task);
        return { ...task, key: `${planting.id}:${stepKey}`, plantingId: planting.id, stepKey, log: logs.get(stepKey) };
      });
    })
    .toSorted((a, b) => a.start.localeCompare(b.start) || a.key.localeCompare(b.key));
}

/** Säsongen man planerar för: innevarande år, eller nästa år från oktober. */
export function currentSeasonYear(today: Date = new Date()): number {
  return today.getFullYear() + (today.getMonth() >= 9 ? 1 : 0);
}

/**
 * Whether to ask the user to close a crop: when every task is done or skipped, or when its last
 * task's window has passed. A snooze ("remind me in 2 weeks") holds even if everything is done.
 */
export function shouldAskToClose(
  planting: { remind_on?: IsoDate | null },
  tasks: readonly SeasonTask[],
  today: IsoDate,
): boolean {
  if (tasks.length === 0) return false;
  if (planting.remind_on) return today >= planting.remind_on;
  const lastEnd = tasks.reduce((max, t) => (t.end > max ? t.end : max), tasks[0]!.end);
  return tasks.every((t) => t.log) || today > lastEnd;
}

/** First and last day of a crop's plan in a season. Autumn-planted crops start the year before. */
export function cropSpan(
  crop: CropTemplate,
  zone: Zone,
  year: number,
  lastFrost?: IsoDate,
): { start: IsoDate; end: IsoDate } {
  const tasks = planCrop({ crop, zone, year, lastFrost });
  return {
    start: tasks.reduce((min, t) => (t.start < min ? t.start : min), tasks[0]!.start),
    end: tasks.reduce((max, t) => (t.end > max ? t.end : max), tasks[0]!.end),
  };
}
