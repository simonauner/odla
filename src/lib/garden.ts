import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentSeasonYear } from "@shared/season";
import { useUserId } from "./auth";
import { supabase } from "./supabase";

export const seasonYear = currentSeasonYear();

function unwrap<T>({ data, error }: { data: T; error: unknown }): T {
  if (error) throw error;
  return data;
}

export function useProfile() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => unwrap(await supabase.from("profiles").select("*").eq("id", userId).single()),
  });
}

export function useSeason(year = seasonYear) {
  const userId = useUserId();
  return useQuery({
    queryKey: ["season", userId, year],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("seasons")
          .select("id, year, zone, plantings(id, crop_id, created_at, task_logs(step_key, status, done_on))")
          .eq("year", year)
          .maybeSingle(),
      ),
  });
}

/** Sparar zonen som standard i profilen och för säsongen (skapar säsongen vid behov). */
export function useSetZone(year = seasonYear) {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (zone: number) => {
      unwrap(await supabase.from("profiles").update({ zone }).eq("id", userId));
      unwrap(await supabase.from("seasons").upsert({ user_id: userId, year, zone }, { onConflict: "user_id,year" }));
    },
    onSuccess: () =>
      qc
        .invalidateQueries({ queryKey: ["profile", userId] })
        .then(() => qc.invalidateQueries({ queryKey: ["season", userId] })),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["season", userId] }),
  });
}

export function useToggleTask() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { plantingId: string; stepKey: string; done: boolean; doneOn: string }) => {
      if (args.done) {
        unwrap(
          await supabase.from("task_logs").upsert(
            {
              planting_id: args.plantingId,
              user_id: userId,
              step_key: args.stepKey,
              status: "done",
              done_on: args.doneOn,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["season", userId] }),
  });
}
