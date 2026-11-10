import { describe, expect, it } from "vitest";
import { garlic } from "./crops/garlic";
import { tomato } from "./crops/tomato";
import { cropSpan, currentSeasonYear, planSeason, shouldAskToClose, tasksThisWeek, type SeasonTask } from "./season";

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

describe("tasksThisWeek", () => {
  const tasks = planSeason(3, 2027, [{ id: "p1", crop_id: "tomato", task_logs: [] }]);
  const fertilize = tasks.filter((t) => t.stepId === "fertilize");

  it("keeps a missed one-off task but only the latest missed round of a repeated one", () => {
    const monday = "2027-08-02";
    const week = tasksThisWeek(tasks, monday);
    expect(week.filter((t) => t.stepId === "fertilize")).toEqual(
      fertilize.filter((t) => t.end >= monday && t.start <= "2027-08-08"),
    );
    expect(week.some((t) => t.stepId === "sow")).toBe(true);
  });

  it("drops a missed task once it is done", () => {
    const sow = tasks.find((t) => t.stepId === "sow")!;
    const logged = tasks.map((t) =>
      t === sow ? { ...t, log: { step_key: "sow:0", status: "done", done_on: "2027-03-25" } } : t,
    );
    expect(tasksThisWeek(logged, "2027-08-02").some((t) => t.stepId === "sow")).toBe(false);
  });
});

describe("shouldAskToClose", () => {
  const open = { log: undefined, end: "2027-07-31" } as SeasonTask;
  const done = { log: { step_key: "a:0", status: "done", done_on: "2027-05-01" }, end: "2027-06-30" } as SeasonTask;

  it("asks after the crop's last task, or earlier when every task is done", () => {
    expect(shouldAskToClose({}, [open, done], "2027-07-31")).toBe(false);
    expect(shouldAskToClose({}, [open, done], "2027-08-01")).toBe(true);
    expect(shouldAskToClose({}, [done], "2027-05-02")).toBe(true);
    expect(shouldAskToClose({}, [], "2028-01-01")).toBe(false);
  });

  it("waits until a snoozed date, even when everything is done", () => {
    const snoozed = { remind_on: "2027-10-15" };
    expect(shouldAskToClose(snoozed, [done], "2027-10-14")).toBe(false);
    expect(shouldAskToClose(snoozed, [open], "2027-10-15")).toBe(true);
  });
});

describe("cropSpan", () => {
  it("starts garlic in the autumn before its season", () => {
    expect(cropSpan(garlic, 3, 2027)).toMatchObject({ start: "2026-09-14" });
    expect(cropSpan(tomato, 3, 2027).start.slice(0, 4)).toBe("2027");
  });
});
