import { Hono } from "hono";
import { CROPS, findCrop } from "../shared/crops";
import { planCrop } from "../shared/plan";
import { ZONES, type Zone } from "../shared/zones";

export const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.get("/health", (c) => c.json({ ok: true }));

app.get("/zones", (c) => c.json(ZONES));

app.get("/crops", (c) => c.json(CROPS.map(({ id, name, zones }) => ({ id, name, zones }))));

/** Stateless plan: /api/plan?zone=3&year=2027&crops=tomato,lettuce */
app.get("/plan", (c) => {
  const zone = Number(c.req.query("zone"));
  const year = Number(c.req.query("year") ?? new Date().getUTCFullYear());
  const cropIds = (c.req.query("crops") ?? "").split(",").filter(Boolean);

  if (!ZONES.some((z) => z.zone === zone)) return c.json({ error: "invalidZone" }, 400);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return c.json({ error: "invalidYear" }, 400);
  const crops = cropIds.map(findCrop);
  if (crops.length === 0 || crops.some((c) => !c)) return c.json({ error: "unknownCrop" }, 400);

  const tasks = crops
    .flatMap((crop) => planCrop({ crop: crop!, zone: zone as Zone, year }))
    .sort((a, b) => a.start.localeCompare(b.start) || a.key.localeCompare(b.key));
  return c.json({ zone, year, tasks });
});

app.notFound((c) => c.json({ error: "notFound" }, 404));
