import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

type Mode = "signIn" | "signUp";

const messages: Record<string, string> = {
  invalid_credentials: "Fel e-postadress eller lösenord.",
  email_not_confirmed: "Bekräfta din e-postadress först – kolla inkorgen.",
  user_already_exists: "Det finns redan ett konto med den e-postadressen.",
  weak_password: "Lösenordet är för svagt. Använd minst 8 tecken.",
  over_email_send_rate_limit: "För många mejl på kort tid. Vänta en stund och försök igen.",
};

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } =
      mode === "signIn"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) return setError((error.code && messages[error.code]) ?? error.message);
    // Utan session vid registrering krävs e-postbekräftelse.
    if (mode === "signUp" && !data.session) setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <div className="mx-auto max-w-sm space-y-3">
        <h2 className="text-lg font-semibold">Kolla din mejl</h2>
        <p>Vi har skickat en bekräftelselänk till {email}. Klicka på den och logga sedan in här.</p>
        <Button
          variant="link"
          className="px-0"
          onClick={() => {
            setCheckEmail(false);
            setMode("signIn");
          }}
        >
          Till inloggningen
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4">
      <h2 className="text-lg font-semibold">{mode === "signIn" ? "Logga in" : "Skapa konto"}</h2>
      <div className="space-y-2">
        <Label htmlFor="email">E-post</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Lösenord</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
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
        {mode === "signIn" ? "Logga in" : "Skapa konto"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "signIn" ? "Inget konto än? " : "Har du redan ett konto? "}
        <Button
          type="button"
          variant="link"
          className="h-auto px-0"
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
        >
          {mode === "signIn" ? "Skapa konto" : "Logga in"}
        </Button>
      </p>
    </form>
  );
}
