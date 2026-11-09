import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentSeasonYear } from "@shared/season";
import type { GardenKind, Zone } from "@shared/zones";
import { useUserId } from "./auth";
import { supabase } from "./supabase";

export const seasonYear = currentSeasonYear();

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

/** Every place's to-do list for the year. */
export function useSeasons(year = seasonYear) {
  const userId = useUserId();
  return useQuery({
    queryKey: ["seasons", userId, year],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("seasons")
          .select(
            "id, year, last_frost, garden:gardens!inner(id, name, zone, kind), plantings(id, crop_id, created_at, task_logs(step_key, status, done_on, note))",
          )
          .eq("year", year)
          .order("created_at"),
      ).map((s) => ({ ...s, garden: { ...s.garden, zone: s.garden.zone as Zone, kind: s.garden.kind as GardenKind } })),
  });
}

export type Season = NonNullable<ReturnType<typeof useSeasons>["data"]>[number];

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

export function useToggleCrop() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { seasonId: string; cropId: string; plantingId?: string }) => {
      if (args.plantingId) unwrap(await supabase.from("plantings").delete().eq("id", args.plantingId));
      else
        unwrap(
          await supabase.from("plantings").insert({ season_id: args.seasonId, user_id: userId, crop_id: args.cropId }),
        );
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
