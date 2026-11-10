import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

const messages: Record<string, string> = {
  weak_password: "Lösenordet är för svagt. Använd minst 8 tecken.",
  same_password: "Välj ett annat lösenord än det du hade förut.",
};

/** Landing page for the reset link; the link signs the user in, so this only sets the password. */
export function NewPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError((error.code && messages[error.code]) ?? error.message);
    navigate({ to: "/" });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4">
      <PageHeader title="Nytt lösenord" />
      <div className="space-y-2">
        <Label htmlFor="new-password">Nytt lösenord</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" size="lg" disabled={busy} className="w-full">
        Spara lösenord
      </Button>
    </form>
  );
}
