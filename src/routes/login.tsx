import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

type Mode = "signIn" | "signUp" | "reset";

const messages: Record<string, string> = {
  invalid_credentials: "Fel e-postadress eller lösenord.",
  email_not_confirmed: "Bekräfta din e-postadress först – kolla inkorgen.",
  user_already_exists: "Det finns redan ett konto med den e-postadressen.",
  weak_password: "Lösenordet är för svagt. Använd minst 8 tecken.",
  over_email_send_rate_limit: "För många mejl på kort tid. Vänta en stund och försök igen.",
};

export function LoginPage() {
  const [mode, setMode] = useState<Mode>(() => (location.hash === "#skapa-konto" ? "signUp" : "signIn"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/app/nytt-losenord`,
      });
      setBusy(false);
      if (error) return setError((error.code && messages[error.code]) ?? error.message);
      return setCheckEmail(true);
    }
    const { data, error } =
      mode === "signIn"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/app` },
          });
    setBusy(false);
    if (error) return setError((error.code && messages[error.code]) ?? error.message);
    // Utan session vid registrering krävs e-postbekräftelse.
    if (mode === "signUp" && !data.session) setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <div className="mx-auto max-w-sm space-y-3">
        <PageHeader title="Kolla din mejl" />
        <p>
          {mode === "reset"
            ? `Om det finns ett konto för ${email} har vi skickat en länk dit. Klicka på den för att välja ett nytt lösenord.`
            : `Vi har skickat en bekräftelselänk till ${email}. Klicka på den och logga sedan in här.`}
        </p>
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
      <PageHeader title={{ signIn: "Logga in", signUp: "Skapa konto", reset: "Glömt lösenord" }[mode]} />
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
      {mode === "reset" ? (
        <p className="text-sm text-muted-foreground">Vi mejlar dig en länk där du kan välja ett nytt lösenord.</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">Lösenord</Label>
            {mode === "signIn" && (
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-sm"
                onClick={() => {
                  setMode("reset");
                  setError(null);
                }}
              >
                Glömt lösenord?
              </Button>
            )}
          </div>
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
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {mode === "signUp" && (
        <p className="text-sm text-muted-foreground">
          Genom att skapa konto godkänner du våra{" "}
          <Link to="/villkor" className="text-primary underline underline-offset-4">
            användarvillkor
          </Link>{" "}
          och bekräftar att du har läst vår{" "}
          <Link to="/integritet" className="text-primary underline underline-offset-4">
            integritetspolicy
          </Link>
          .
        </p>
      )}
      <Button type="submit" size="lg" disabled={busy} className="w-full">
        {{ signIn: "Logga in", signUp: "Skapa konto", reset: "Skicka länk" }[mode]}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "signIn" ? "Inget konto än? " : mode === "signUp" ? "Har du redan ett konto? " : "Kom du på det? "}
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
