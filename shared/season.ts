import type { IsoDate } from "./dates";
import { findCrop } from "./crops";
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
export function planSeason(zone: Zone, year: number, plantings: readonly SeasonPlanting[]): SeasonTask[] {
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
      return planCrop({ crop, zone, year, actuals }).map((task): SeasonTask => {
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
