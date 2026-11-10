import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserId } from "./auth";
import { unwrap } from "./garden";
import { supabase } from "./supabase";

export function useProfile() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () =>
      unwrap(await supabase.from("profiles").select("display_name, premium").eq("id", userId).single()),
  });
}

export function useUpdateProfile() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (change: { display_name?: string; premium?: boolean }) => {
      unwrap(await supabase.from("profiles").update(change).eq("id", userId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", userId] }),
  });
}

/** Everyone the user has invited to their account, and the accounts the user is in or invited to. */
export function useMemberships() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["memberships", userId],
    queryFn: async () => {
      const rows = unwrap(
        await supabase
          .from("account_members")
          .select(
            "account_id, email, user_id, owner:profiles!account_id(display_name), member:profiles!user_id(display_name)",
          )
          .order("created_at"),
      );
      return {
        members: rows.filter((r) => r.account_id === userId),
        joined: rows.filter((r) => r.user_id === userId),
        invites: rows.filter((r) => r.account_id !== userId && !r.user_id),
      };
    },
  });
}

export type Membership = NonNullable<ReturnType<typeof useMemberships>["data"]>["members"][number];

/** Changes to memberships change which places and seasons the user sees, so everything is refetched. */
function useMembershipMutation<T>(mutationFn: (args: T) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => qc.invalidateQueries() });
}

export function useInvite() {
  const userId = useUserId();
  return useMembershipMutation(async (email: string) => {
    unwrap(await supabase.from("account_members").insert({ account_id: userId, email: email.trim().toLowerCase() }));
  });
}

export function useAcceptInvite() {
  const userId = useUserId();
  return useMembershipMutation(async (m: Pick<Membership, "account_id" | "email">) => {
    unwrap(
      await supabase
        .from("account_members")
        .update({ user_id: userId })
        .eq("account_id", m.account_id)
        .eq("email", m.email),
    );
  });
}

/** Removes a member or invite (owner), leaves an account (member) or declines an invite. */
export function useRemoveMembership() {
  return useMembershipMutation(async (m: Pick<Membership, "account_id" | "email">) => {
    unwrap(await supabase.from("account_members").delete().eq("account_id", m.account_id).eq("email", m.email));
  });
}
