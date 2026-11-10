import { describe, expect, it } from "vitest";
import { CROPS } from "./crops";
import { garlic } from "./crops/garlic";
import { lettuce } from "./crops/lettuce";
import { tomato } from "./crops/tomato";
import type { CropTemplate } from "./crops/types";
import { planCrop, tasksBetween } from "./plan";
import { ZONES } from "./zones";

const byStep = (tasks: ReturnType<typeof planCrop>, stepId: string) => tasks.filter((t) => t.stepId === stepId);

describe("planCrop för tomat i zon III 2027 (sista frost 20 maj, första frost 5 okt)", () => {
  const plan = planCrop({ crop: tomato, zone: 3, year: 2027 });

  it("förså 6–8 veckor före sista frost", () => {
    expect(byStep(plan, "sow")).toMatchObject([{ start: "2027-03-25", end: "2027-04-08" }]);
  });

  it("skolar om 3–4 veckor efter sådd", () => {
    expect(byStep(plan, "pot_up")).toMatchObject([{ start: "2027-04-15", end: "2027-04-22" }]);
  });

  it("planterar ut en till två veckor efter sista frost och avhärdar före", () => {
    expect(byStep(plan, "plant_out")).toMatchObject([{ start: "2027-05-27", end: "2027-06-03" }]);
    expect(byStep(plan, "harden_off")).toMatchObject([{ start: "2027-05-17", end: "2027-05-24" }]);
  });

  it("gödslar varje vecka från två veckor efter utplantering till två veckor före frost", () => {
    const fertilize = byStep(plan, "fertilize");
    expect(fertilize[0]!.start).toBe("2027-06-10");
    expect(fertilize.at(-1)!.start).toBe("2027-09-16");
    expect(fertilize).toHaveLength(15);
  });

  it("returnerar uppgifterna i datumordning med unika nycklar", () => {
    const starts = plan.map((t) => t.start);
    expect(starts).toEqual(starts.toSorted());
    expect(new Set(plan.map((t) => t.key)).size).toBe(plan.length);
  });
});

describe("faktiska datum", () => {
  it("flyttar beroende steg när sådden gjordes senare än planerat", () => {
    const plan = planCrop({ crop: tomato, zone: 3, year: 2027, actuals: { sow: "2027-04-01" } });
    expect(byStep(plan, "sow")[0]!.start).toBe("2027-04-01");
    expect(byStep(plan, "pot_up")[0]!.start).toBe("2027-04-22");
    // Utplanteringen räknas från frosten, inte från sådden.
    expect(byStep(plan, "plant_out")[0]!.start).toBe("2027-05-27");
  });

  it("räknar om gödslingen från den verkliga utplanteringen", () => {
    const plan = planCrop({ crop: tomato, zone: 3, year: 2027, actuals: { plant_out: "2027-06-01" } });
    expect(byStep(plan, "fertilize")[0]!.start).toBe("2027-06-15");
    expect(byStep(plan, "harden_off")[0]!.start).toBe("2027-05-22");
  });
});

describe("own last frost date", () => {
  it("replaces the zone's date for everything anchored on last frost", () => {
    const plan = planCrop({ crop: tomato, zone: 3, year: 2027, lastFrost: "2027-05-01" });
    expect(byStep(plan, "sow")[0]!.start).toBe("2027-03-06");
    expect(byStep(plan, "plant_out")[0]!.start).toBe("2027-05-08");
    // First frost still comes from the zone.
    expect(byStep(plan, "clear")[0]!.start).toBe("2027-09-28");
  });
});

describe("upprepade steg", () => {
  it("ger en skörd per sallatssådd", () => {
    const plan = planCrop({ crop: lettuce, zone: 3, year: 2027 });
    const sowings = byStep(plan, "sow");
    expect(sowings.length).toBeGreaterThan(3);
    expect(byStep(plan, "harvest")).toHaveLength(sowings.length);
  });
});

describe("zoner", () => {
  it("lägger allt senare i nordligare zoner", () => {
    const south = planCrop({ crop: tomato, zone: 1, year: 2027 });
    const north = planCrop({ crop: tomato, zone: 6, year: 2027 });
    expect(byStep(north, "plant_out")[0]!.start > byStep(south, "plant_out")[0]!.start).toBe(true);
  });

  it.each(ZONES.map((z) => z.zone))("alla grödor går att planera i zon %i", (zone) => {
    for (const crop of CROPS) expect(planCrop({ crop, zone, year: 2027 }).length).toBeGreaterThan(0);
  });

  // Autumn-planted crops (garlic) start in the autumn before the season.
  it.each(ZONES.map((z) => z.zone))("alla grödors uppgifter ligger inom året i zon %i", (zone) => {
    const outside = CROPS.flatMap((crop) => planCrop({ crop, zone, year: 2027 }))
      .filter((t) => t.start < "2026-08-01" || t.end > "2027-12-31")
      .map((t) => t.key);
    expect(outside).toEqual([]);
  });
});

describe("vitlök", () => {
  it("sätts hösten före säsongen och skördas på sommaren", () => {
    const plan = planCrop({ crop: garlic, zone: 3, year: 2027 });
    expect(byStep(plan, "plant_out")).toMatchObject([{ start: "2026-09-14", end: "2026-10-12" }]);
    expect(byStep(plan, "harvest")[0]!.start).toBe("2027-07-14");
  });
});

describe("grödbiblioteket", () => {
  it("har unika id:n och en skörd per gröda", () => {
    expect(new Set(CROPS.map((c) => c.id)).size).toBe(CROPS.length);
    expect(CROPS.filter((c) => !c.steps.some((s) => s.kind === "harvest")).map((c) => c.id)).toEqual([]);
  });
});

describe("felaktiga mallar", () => {
  it("upptäcker cirkulära beroenden", () => {
    const broken: CropTemplate = {
      id: "broken",
      name: "Trasig",
      emoji: "🌱",
      zones: { min: 1, max: 8 },
      steps: [
        { id: "a", kind: "sow_indoor", title: "A", anchor: { type: "step", step: "b" }, window: [0, 0] },
        { id: "b", kind: "pot_up", title: "B", anchor: { type: "step", step: "a" }, window: [0, 0] },
      ],
    };
    expect(() => planCrop({ crop: broken, zone: 3, year: 2027 })).toThrow(/Cirkulärt/);
  });
});

describe("tasksBetween", () => {
  it("tar med uppgifter vars fönster överlappar veckan", () => {
    const plan = planCrop({ crop: tomato, zone: 3, year: 2027 });
    const week = tasksBetween(plan, "2027-03-29", "2027-04-04");
    expect(week.map((t) => t.stepId)).toEqual(["sow"]);
  });
});
