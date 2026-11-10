import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

const contact = (
  <a href="mailto:hej@hackskaduha.se" className="text-primary underline underline-offset-4">
    hej@hackskaduha.se
  </a>
);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={`Senast uppdaterad ${updated}`} />
      {children}
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage title="Integritetspolicy" updated="10 november 2026">
      <Section title="Vem ansvarar för dina uppgifter?">
        <p>Hack ska du ha AB är personuppgiftsansvarig för Grodla. Frågor och begäranden skickar du till {contact}.</p>
      </Section>
      <Section title="Vilka uppgifter vi sparar">
        <ul className="list-disc space-y-1 pl-5">
          <li>Din e-postadress och ditt lösenord (lösenordet sparas bara krypterat).</li>
          <li>Det du lägger in i appen: odlingsplatser, odlingszon, frostdatum, odlingar och avbockade steg.</li>
          <li>Tekniska loggar, till exempel IP-adress, som uppstår när du använder tjänsten.</li>
        </ul>
      </Section>
      <Section title="Varför vi sparar dem">
        <p>
          Uppgifterna behövs för att du ska kunna logga in och få din odlingsplan, alltså för att uppfylla avtalet med
          dig. Vi använder dem inte till reklam, säljer dem inte och spårar dig inte med analysverktyg.
        </p>
      </Section>
      <Section title="Vilka som behandlar uppgifterna åt oss">
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase lagrar databasen och sköter inloggning och e-post. Datan ligger i Stockholm.</li>
          <li>Cloudflare levererar webbplatsen och hanterar tekniska loggar.</li>
        </ul>
      </Section>
      <Section title="Hur länge vi sparar dem">
        <p>
          Så länge du har ett konto. Ber du oss radera kontot tar vi bort det och allt du lagt in inom 30 dagar.
          Uppgifter kan finnas kvar i säkerhetskopior en kort tid innan de skrivs över.
        </p>
      </Section>
      <Section title="Lagring i webbläsaren">
        <p>
          Appen sparar din inloggning i webbläsarens lokala lagring så att du förblir inloggad. Det behövs för att
          tjänsten ska fungera, och vi använder inga andra kakor.
        </p>
      </Section>
      <Section title="Dina rättigheter">
        <p>
          Du har rätt att få veta vilka uppgifter vi har om dig, få dem rättade, få en kopia och få dem raderade. Hör av
          dig till {contact}. Tycker du att vi hanterar dina uppgifter fel kan du klaga hos Integritetsskyddsmyndigheten
          (IMY).
        </p>
      </Section>
    </LegalPage>
  );
}

export function TermsPage() {
  return (
    <LegalPage title="Användarvillkor" updated="10 november 2026">
      <Section title="Tjänsten">
        <p>
          Grodla är en gratis tjänst som hjälper dig planera din odling. Du behöver ett konto, och du ansvarar för att
          hålla ditt lösenord hemligt.
        </p>
      </Section>
      <Section title="Råden är vägledning">
        <p>
          Datum och råd i appen bygger på generella odlingszoner och tumregler. Väder och förhållanden där du bor kan
          skilja sig, så använd ditt eget omdöme. Vi ansvarar inte för hur odlingen går.
        </p>
      </Section>
      <Section title="Ändringar och avslut">
        <p>
          Vi kan ändra tjänsten, villkoren eller lägga ner den. Större ändringar meddelar vi i förväg. Du kan när som
          helst be oss radera ditt konto via {contact}. Vi kan stänga konton som missbrukar tjänsten.
        </p>
      </Section>
      <Section title="Dina uppgifter">
        <p>
          Hur vi hanterar dina personuppgifter står i{" "}
          <Link to="/integritet" className="text-primary underline underline-offset-4">
            integritetspolicyn
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
