import type { FormEvent } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { ErrorAlert } from "@/components/error-alert";
import { PageHeader } from "@/components/page-header";
import { SlowLoading } from "@/components/slow-loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAcceptInvite,
  useInvite,
  useMemberships,
  useProfile,
  useRemoveMembership,
  useUpdateProfile,
} from "@/lib/account";
import { useSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function ProfilePage() {
  const session = useSession();
  const profile = useProfile();
  const memberships = useMemberships();
  const update = useUpdateProfile();
  const invite = useInvite();
  const accept = useAcceptInvite();
  const remove = useRemoveMembership();

  if (profile.isPending || memberships.isPending) return <SlowLoading loading />;
  if (profile.isError || memberships.isError) return <ErrorAlert>Kunde inte hämta profilen.</ErrorAlert>;
  const { premium, display_name } = profile.data;
  const { members, joined, invites } = memberships.data;
  const hasMembers = members.some((m) => m.user_id);

  // shortcut: language and units are fixed, make them selectable once more languages exist.
  const rows = [
    ["Inloggad som", session?.user.email ?? "–"],
    ["Språk", "Svenska"],
    ["Enheter", "Metriska (cm, °C)"],
  ];

  function saveName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name")).trim();
    if (name) update.mutate({ display_name: name });
  }

  function sendInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    invite.mutate(String(new FormData(form).get("email")), { onSuccess: () => form.reset() });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profil" />

      {/* A member is in one shared account at a time. */}
      {joined.length === 0 &&
        invites.map((m) => (
          <Card key={m.account_id}>
            <CardHeader>
              <CardTitle>{m.owner?.display_name ?? "Någon"} vill dela sin odling med dig</CardTitle>
              <CardDescription>
                {hasMembers
                  ? "Andra är med i din odling. Ta bort dem under Premium först om du vill gå med."
                  : "Ni ser och bockar av samma platser och grödor, och ser vem som gjorde vad. Dina egna platser vilar medan du är med och kommer tillbaka om du lämnar."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button disabled={hasMembers || accept.isPending} onClick={() => accept.mutate(m)}>
                Gå med
              </Button>
              <Button variant="outline" disabled={remove.isPending} onClick={() => remove.mutate(m)}>
                Nej tack
              </Button>
            </CardContent>
          </Card>
        ))}

      <Card>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="break-all">{value}</dd>
              </div>
            ))}
          </dl>
          <form onSubmit={saveName} className="space-y-1">
            <Label htmlFor="name">Namn</Label>
            <p className="text-sm text-muted-foreground">Syns för dem du delar odlingen med.</p>
            <div className="flex gap-2">
              <Input id="name" name="name" defaultValue={display_name ?? ""} maxLength={60} required />
              <Button type="submit" variant="outline" disabled={update.isPending}>
                Spara
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {joined.map((m) => (
        <Card key={m.account_id} size="sm">
          <CardHeader>
            <CardTitle>Du delar odling med {m.owner?.display_name ?? "någon"}</CardTitle>
            <CardAction>
              <ConfirmButton
                size="sm"
                title="Lämna odlingen?"
                description="Du ser inte längre platserna och grödorna. Det du har gjort finns kvar där, och dina egna platser kommer tillbaka."
                action="Lämna"
                onConfirm={() => remove.mutateAsync(m)}
              >
                Lämna
              </ConfirmButton>
            </CardAction>
          </CardHeader>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Premium {premium && <Badge variant="sun">Aktiv</Badge>}
          </CardTitle>
          <CardDescription>
            Dela din odling med familj och vänner. De loggar in med sina egna konton, ser samma platser och grödor, och
            ni ser vem som bockade av vad.
          </CardDescription>
          <CardAction>
            <Button
              variant={premium ? "outline" : "default"}
              disabled={update.isPending}
              onClick={() => update.mutate({ premium: !premium })}
            >
              {premium ? "Avsluta" : "Aktivera"}
            </Button>
          </CardAction>
        </CardHeader>
        {premium && (
          <CardContent className="space-y-4">
            {/* Members work in someone else's account, so they have nothing of their own to share. */}
            {joined.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                Du kan dela din egen odling när du har lämnat den du delar med{" "}
                {joined[0]?.owner?.display_name ?? "någon"}.
              </p>
            ) : (
              <form onSubmit={sendInvite} className="space-y-1">
                <Label htmlFor="invite">Bjud in med e-post</Label>
                <div className="flex gap-2">
                  <Input id="invite" name="email" type="email" required placeholder="namn@exempel.se" />
                  <Button type="submit" variant="secondary" disabled={invite.isPending}>
                    Bjud in
                  </Button>
                </div>
              </form>
            )}
            {members.length > 0 && (
              <ul className="space-y-2">
                {members.map((m) => (
                  <li key={m.email} className="flex items-center justify-between gap-2 text-sm">
                    <span className="break-all">
                      {m.member?.display_name ?? m.email} {!m.user_id && <Badge variant="secondary">Inbjuden</Badge>}
                    </span>
                    <ConfirmButton
                      size="sm"
                      title={m.user_id ? "Ta bort från odlingen?" : "Dra tillbaka inbjudan?"}
                      description={`${m.email} ser inte längre din odling.`}
                      action="Ta bort"
                      onConfirm={() => remove.mutateAsync(m)}
                    >
                      Ta bort
                    </ConfirmButton>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        )}
      </Card>

      {(update.isError || invite.isError || accept.isError || remove.isError) && (
        <ErrorAlert>Kunde inte spara. Har du redan bjudit in den e-postadressen?</ErrorAlert>
      )}

      <Button variant="outline" onClick={() => supabase.auth.signOut()}>
        Logga ut
      </Button>
    </div>
  );
}
