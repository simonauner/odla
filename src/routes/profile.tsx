import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function ProfilePage() {
  const session = useSession();
  // shortcut: language and units are fixed, make them selectable once more languages exist.
  const rows = [
    ["Inloggad som", session?.user.email ?? "–"],
    ["Språk", "Svenska"],
    ["Enheter", "Metriska (cm, °C)"],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Profil" />
      <Card>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <Button variant="outline" onClick={() => supabase.auth.signOut()}>
        Logga ut
      </Button>
    </div>
  );
}
