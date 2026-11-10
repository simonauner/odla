import { describe, expect, it } from "vitest";
import { currentSeasonYear, planSeason, shouldAskToClose, type SeasonTask } from "./season";

describe("planSeason", () => {
  it("märker uppgifter med plantering och logg", () => {
    const tasks = planSeason(3, 2027, [
      { id: "p1", crop_id: "tomato", task_logs: [{ step_key: "sow:0", status: "done", done_on: "2027-03-25" }] },
    ]);
    const sow = tasks.find((t) => t.stepKey === "sow:0")!;
    expect(sow).toMatchObject({ key: "p1:sow:0", plantingId: "p1", start: "2027-03-25", log: { status: "done" } });
    // Omskolningen räknas från den verkliga sådden.
    expect(tasks.find((t) => t.stepKey === "pot_up:0")).toMatchObject({ start: "2027-04-15", log: undefined });
  });

  it("låter överhoppade steg ligga kvar på planerat datum", () => {
    const tasks = planSeason(3, 2027, [
      { id: "p1", crop_id: "tomato", task_logs: [{ step_key: "sow:0", status: "skipped", done_on: "2027-04-10" }] },
    ]);
    expect(tasks.find((t) => t.stepKey === "sow:0")!.start).toBe("2027-03-25");
  });

  it("passes the user's own last frost date to every planting", () => {
    const tasks = planSeason(3, 2027, [{ id: "p1", crop_id: "tomato", task_logs: [] }], "2027-05-01");
    expect(tasks.find((t) => t.stepKey === "plant_out:0")!.start).toBe("2027-05-08");
  });

  it("hoppar över okända grödor och håller två planteringar isär", () => {
    const tasks = planSeason(3, 2027, [
      { id: "a", crop_id: "tomato", task_logs: [] },
      { id: "b", crop_id: "tomato", task_logs: [] },
      { id: "c", crop_id: "banan", task_logs: [] },
    ]);
    expect(new Set(tasks.map((t) => t.plantingId))).toEqual(new Set(["a", "b"]));
    expect(new Set(tasks.map((t) => t.key)).size).toBe(tasks.length);
  });
});

describe("currentSeasonYear", () => {
  it("planerar nästa år från oktober", () => {
    expect(currentSeasonYear(new Date(2026, 8, 30))).toBe(2026);
    expect(currentSeasonYear(new Date(2026, 10, 9))).toBe(2027);
  });
});

describe("shouldAskToClose", () => {
  const open = { log: undefined } as SeasonTask;
  const done = { log: { step_key: "a:0", status: "done", done_on: "2027-05-01" } } as SeasonTask;

  it("asks from 1 October, or earlier when every task is done", () => {
    expect(shouldAskToClose({ year: 2027 }, [open, done], "2027-09-30")).toBe(false);
    expect(shouldAskToClose({ year: 2027 }, [open, done], "2027-10-01")).toBe(true);
    expect(shouldAskToClose({ year: 2027 }, [done], "2027-08-01")).toBe(true);
    expect(shouldAskToClose({ year: 2027 }, [], "2027-08-01")).toBe(false);
  });

  it("waits until a snoozed date, even when everything is done", () => {
    const snoozed = { year: 2027, remind_on: "2027-10-15" };
    expect(shouldAskToClose(snoozed, [done], "2027-10-14")).toBe(false);
    expect(shouldAskToClose(snoozed, [open], "2027-10-15")).toBe(true);
  });
});
