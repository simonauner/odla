import { describe, expect, it } from "vitest";
import { app } from "./app";

const get = (path: string) => app.request(path, {}, {} as Env);

describe("API", () => {
  it("returnerar en plan för tomat i zon III", async () => {
    const res = await get("/api/plan?zone=3&year=2027&crops=tomato");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tasks: { stepId: string; start: string }[] };
    expect(body.tasks[0]).toMatchObject({ stepId: "sow", start: "2027-03-25" });
  });

  it.each([
    ["/api/plan?zone=9&crops=tomato", "invalidZone"],
    ["/api/plan?zone=3&crops=banan", "unknownCrop"],
    ["/api/plan?zone=3", "unknownCrop"],
  ])("avvisar %s", async (path, error) => {
    const res = await get(path);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error });
  });
});
