import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentSeasonYear } from "@shared/season";
import type { CROPS } from "@shared/crops";
import { tomato } from "@shared/crops/tomato";
import { addDays } from "@shared/dates";
import { zoneInfo, type GardenKind, type Zone } from "@shared/zones";
import { formatDay } from "./format";
import { useUserId } from "./auth";
import { supabase } from "./supabase";

export const seasonYear = currentSeasonYear();

export const kindLabel: Record<GardenKind, string> = { open: "Friland", greenhouse: "Växthus" };

export function placeLabel(garden: { zone: Zone; kind: GardenKind }): string {
  return `${zoneInfo(garden.zone).label}, ${kindLabel[garden.kind].toLowerCase()}`;
}

const tomatoPlantOut = tomato.steps.find((s) => s.id === "plant_out")!.window;

/** Explains what the frost date means, with tomato planting out as the example. */
export function frostHint(lastFrost: string): string {
  return `Frostkänsliga plantor som tomater kan då planteras ut ${formatDay(addDays(lastFrost, tomatoPlantOut[0]))}–${formatDay(addDays(lastFrost, tomatoPlantOut[1]))}.`;
}

/** Whether a crop is hard on open ground in the zone, so it needs a greenhouse there. */
export function needsGreenhouse(crop: (typeof CROPS)[number], place: { zone: Zone; kind: GardenKind }): boolean {
  return place.kind === "open" && (place.zone < crop.zones.min || place.zone > crop.zones.max);
}

/** Throws the request's error. Without one, select, insert and single always return data. */
function unwrap<T>({ data, error }: { data: T; error: unknown }): NonNullable<T> {
  if (error) throw error;
  return data as NonNullable<T>;
}

export function useGardens() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["gardens", userId],
    queryFn: async () =>
      unwrap(await supabase.from("gardens").select("id, name, zone, kind").order("created_at")).map((g) => ({
        ...g,
        zone: g.zone as Zone,
        kind: g.kind as GardenKind,
      })),
  });
}

/** Every season the user has had, all years, oldest first. Pages pick the open ones or one year. */
// shortcut: loads every year with its logs, add a year filter when history grows large.
export function useSeasons() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["seasons", userId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("seasons")
          .select(
            "id, year, last_frost, garden:gardens!inner(id, name, zone, kind), plantings(id, crop_id, closed_at, remind_on, created_at, task_logs(step_key, status, done_on, note))",
          )
          .order("year")
          .order("created_at"),
      ).map((s) => ({ ...s, garden: { ...s.garden, zone: s.garden.zone as Zone, kind: s.garden.kind as GardenKind } })),
  });
}

export type Garden = NonNullable<ReturnType<typeof useGardens>["data"]>[number];
export type Season = NonNullable<ReturnType<typeof useSeasons>["data"]>[number];

/** A season is over when every crop in it is closed. One without crops yet is still being planned. */
export function isOpen(season: Season): boolean {
  return season.plantings.length === 0 || season.plantings.some((p) => !p.closed_at);
}

export interface NewSeason {
  /** An existing place, or a new one to create. */
  garden: { id: string } | { name: string; zone: Zone; kind: GardenKind };
  lastFrost: string;
  cropIds: string[];
}

/** Creates a place's to-do list for the year: the place if new, the season and its crops. Returns the season id. */
export function useCreateSeason(year = seasonYear) {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ garden, lastFrost, cropIds }: NewSeason) => {
      // shortcut: three requests without a transaction, so a failure can leave a place or an empty season behind; move to an RPC if that happens.
      const gardenId =
        "id" in garden
          ? garden.id
          : unwrap(
              await supabase
                .from("gardens")
                .insert({ ...garden, user_id: userId })
                .select("id")
                .single(),
            ).id;
      const season = unwrap(
        await supabase
          .from("seasons")
          .insert({ user_id: userId, garden_id: gardenId, year, last_frost: lastFrost })
          .select("id")
          .single(),
      );
      unwrap(
        await supabase
          .from("plantings")
          .insert(cropIds.map((crop_id) => ({ season_id: season.id, user_id: userId, crop_id }))),
      );
      return season.id;
    },
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["gardens", userId] }),
        qc.invalidateQueries({ queryKey: ["seasons", userId] }),
      ]),
  });
}

/** Closes crops (`closed: true`) or reopens them, or snoozes the question about closing to `remindOn`. */
export function useUpdatePlantings() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ plantingIds, ...change }: { plantingIds: string[]; closed?: boolean; remindOn?: string }) => {
      unwrap(
        await supabase
          .from("plantings")
          .update({
            ...(change.closed !== undefined && { closed_at: change.closed ? new Date().toISOString() : null }),
            ...(change.remindOn && { remind_on: change.remindOn }),
          })
          .in("id", plantingIds),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seasons", userId] }),
  });
}

/** Saves the user's own last frost date for the season. `null` goes back to our guess. */
export function useSetLastFrost() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { seasonId: string; lastFrost: string | null }) => {
      unwrap(await supabase.from("seasons").update({ last_frost: args.lastFrost }).eq("id", args.seasonId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seasons", userId] }),
  });
}

/** Deletes a place and, through the database cascade, all its seasons, crops and logs. */
export function useDeleteGarden() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gardenId: string) => {
      unwrap(await supabase.from("gardens").delete().eq("id", gardenId));
    },
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["gardens", userId] }),
        qc.invalidateQueries({ queryKey: ["seasons", userId] }),
      ]),
  });
}

/**
 * Where crops for a place and year go: the place's season that year, or, for a season still to be created,
 * last year's frost date at the place moved to that year.
 */
export function seasonTarget(seasons: Season[], gardenId: string, year: number) {
  const season = seasons.find((s) => s.garden.id === gardenId && s.year === year);
  const previous = seasons.findLast((s) => s.garden.id === gardenId && s.year < year && s.last_frost);
  return {
    gardenId,
    year,
    season,
    lastFrost: season ? season.last_frost : previous ? `${year}${previous.last_frost!.slice(4)}` : null,
  };
}

type SeasonTarget = ReturnType<typeof seasonTarget>;

/** The target's season id, creating the season first if the place has none that year. */
async function seasonIdFor(userId: string, t: SeasonTarget): Promise<string> {
  if (t.season) return t.season.id;
  return unwrap(
    await supabase
      .from("seasons")
      .insert({ user_id: userId, garden_id: t.gardenId, year: t.year, last_frost: t.lastFrost })
      .select("id")
      .single(),
  ).id;
}

/** Adds crops to a place for a season, creating the place's season for that year first if it has none. */
export function useAddCrops() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ target, cropIds }: { target: SeasonTarget; cropIds: string[] }) => {
      // shortcut: two requests without a transaction, so a failure can leave an empty season behind; it shows no crops and does no harm.
      const seasonId = await seasonIdFor(userId, target);
      unwrap(
        await supabase
          .from("plantings")
          .insert(cropIds.map((crop_id) => ({ season_id: seasonId, user_id: userId, crop_id }))),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seasons", userId] }),
  });
}

/** Moves a crop, with everything logged for it, to another place's season. */
export function useMovePlanting() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ plantingId, target }: { plantingId: string; target: SeasonTarget }) => {
      const seasonId = await seasonIdFor(userId, target);
      unwrap(await supabase.from("plantings").update({ season_id: seasonId }).eq("id", plantingId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seasons", userId] }),
  });
}

/** Renames a place or changes its zone or kind. Its crops' dates follow on the next render. */
export function useUpdateGarden() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...change }: { id: string; name: string; zone: Zone; kind: GardenKind }) => {
      unwrap(await supabase.from("gardens").update(change).eq("id", id));
    },
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["gardens", userId] }),
        qc.invalidateQueries({ queryKey: ["seasons", userId] }),
      ]),
  });
}

/** Deletes a crop and, through the database cascade, what the user logged for it. */
export function useRemoveCrop() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plantingId: string) => {
      unwrap(await supabase.from("plantings").delete().eq("id", plantingId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seasons", userId] }),
  });
}

/** Sparar ett steg som klart eller överhoppat, med datum och anteckning. `log: null` ångrar. */
export function useLogTask() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      plantingId: string;
      stepKey: string;
      log: { status: "done" | "skipped"; doneOn: string; note?: string } | null;
    }) => {
      if (args.log) {
        unwrap(
          await supabase.from("task_logs").upsert(
            {
              planting_id: args.plantingId,
              user_id: userId,
              step_key: args.stepKey,
              status: args.log.status,
              done_on: args.log.doneOn,
              note: args.log.note?.trim() || null,
            },
            { onConflict: "planting_id,step_key" },
          ),
        );
      } else {
        unwrap(
          await supabase.from("task_logs").delete().eq("planting_id", args.plantingId).eq("step_key", args.stepKey),
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seasons", userId] }),
  });
}
