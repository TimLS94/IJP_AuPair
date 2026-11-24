import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { company, site } from '../data/site'

function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="container-x py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
        <div className="card mt-10 space-y-10 p-6 text-sm leading-relaxed text-ink/80 sm:p-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:text-ink [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-medium [&_h3]:text-ink [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </div>
  )
}

function Address() {
  return (
    <p>
      {company.name}
      <br />
      {company.street}
      <br />
      {company.city}
      <br />
      Deutschland
      <br />
      E-Mail:{' '}
      <a href={`mailto:${site.email}`} className="underline underline-offset-4 hover:text-coral">
        {site.email}
      </a>
    </p>
  )
}

export function Impressum() {
  return (
    <LegalPage eyebrow="Rechtliches" title="Impressum">
      <section>
        <h2>Angaben gemäß § 5 DDG</h2>
        <Address />
        <p>
          Kontaktformular:{' '}
          <Link to="/kontakt" className="underline underline-offset-4 hover:text-coral">
            IJP kontaktieren
          </Link>
        </p>
      </section>

      <section>
        <h2>Handelsregister</h2>
        <p>
          Registergericht: {company.court}
          <br />
          Registernummer: {company.register}
        </p>
      </section>

      <section>
        <h2>Vertretungsberechtigter Geschäftsführer</h2>
        <p>{company.ceo}</p>
      </section>

      <section>
        <h2>Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
          <br />
          {company.vatId}
        </p>
      </section>

      <section>
        <h2>Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </section>

      <section>
        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
          verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Bei Bekanntwerden
          von Rechtsverletzungen entfernen wir entsprechende Inhalte umgehend.
        </p>
        <p>
          Die Profile der Au-pairs werden von den Au-pairs selbst erstellt. Wir prüfen sie vor der Veröffentlichung,
          übernehmen aber keine Gewähr für die Richtigkeit der Angaben.
        </p>
      </section>

      <section>
        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot kann Links zu externen Websites Dritter enthalten, auf deren Inhalte wir keinen Einfluss haben.
          Für diese fremden Inhalte übernehmen wir keine Gewähr. Verantwortlich ist stets der jeweilige Anbieter oder
          Betreiber der Seiten.
        </p>
      </section>

      <section>
        <h2>Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
          Urheberrecht. Fotos auf den Informationsseiten stammen von Unsplash (unsplash.com).
        </p>
      </section>
    </LegalPage>
  )
}

export function Datenschutz() {
  return (
    <LegalPage eyebrow="Rechtliches" title="Datenschutz­erklärung">
      <section>
        <h2>1. Verantwortlicher</h2>
        <Address />
        <p>
          Verantwortlich ist die Stelle, die über die Zwecke und Mittel der Verarbeitung personenbezogener Daten
          entscheidet. Bei Fragen zum Datenschutz schreiben Sie uns einfach an die oben genannte E-Mail-Adresse.
        </p>
      </section>

      <section>
        <h2>2. Überblick</h2>
        <p>
          Wir verarbeiten personenbezogene Daten nur, soweit es für die Vermittlung zwischen Au-pairs und Gastfamilien
          und den Betrieb dieser Website nötig ist. Wir setzen keine Analyse- oder Werbe-Tools ein, binden keine
          Social-Media-Plugins ein und laden Schriften und Bilder von unserem eigenen Server.
        </p>
      </section>

      <section>
        <h2>3. Hosting und Server-Logfiles</h2>
        <p>
          Beim Aufruf der Website verarbeitet unser Hosting-Anbieter technisch notwendige Daten, insbesondere
          IP-Adresse, Datum und Uhrzeit des Abrufs, aufgerufene Seite, Browser und Betriebssystem. Diese Daten sind
          nötig, um die Website auszuliefern und ihre Sicherheit zu gewährleisten, und werden nicht mit anderen Daten
          zusammengeführt.
        </p>
        <p>Hosting-Anbieter: {company.hosting}</p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren, stabilen Betrieb).</p>
      </section>

      <section>
        <h2>4. Datenbank und Anmeldung (Supabase)</h2>
        <p>
          Für Benutzerkonten, Profile, Fotos und Kontaktanfragen nutzen wir den Dienst Supabase der Supabase, Inc.
          (USA). Die Daten werden in einem Rechenzentrum in Frankfurt am Main (EU) gespeichert. Mit Supabase besteht ein
          Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO. Soweit ein Zugriff aus den USA nicht ausgeschlossen
          werden kann, erfolgt er auf Grundlage der EU-Standardvertragsklauseln.
        </p>
        <p>
          Damit Sie angemeldet bleiben, speichert Ihr Browser nach dem Login ein Sitzungs-Token im lokalen Speicher
          (Local Storage). Das ist für die Login-Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Weitere
          Cookies oder vergleichbare Technologien setzen wir nicht ein.
        </p>
      </section>

      <section>
        <h2>5. Benutzerkonto</h2>
        <p>
          Für die Registrierung verarbeiten wir Ihre E-Mail-Adresse, Ihren Namen, Ihre Rolle (Au-pair oder Gastfamilie)
          und Ihr Passwort, das nur verschlüsselt (als Hash) gespeichert wird. Zur Bestätigung der E-Mail-Adresse und
          zum Zurücksetzen des Passworts senden wir Ihnen E-Mails.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Nutzung unseres Vermittlungsangebots bzw. vorvertragliche
          Maßnahmen).
        </p>
      </section>

      <section>
        <h2>6. Au-pair-Profile</h2>
        <p>Wenn Sie als Au-pair ein Profil anlegen, verarbeiten wir:</p>
        <ul>
          <li>Vorname, Alter und Herkunftsland</li>
          <li>Deutschkenntnisse, weitere Sprachen, Erfahrungen und Führerschein</li>
          <li>gewünschter Beginn und Dauer des Au-pair-Jahres</li>
          <li>
            Angaben für das Matching: Schwimmen, Rauchen, Haustiere, Ernährung, Erfahrung mit besonderem Förderbedarf,
            gewünschte Wohnlage und Kinderzahl
          </li>
          <li>Ihren Profiltext und Ihr Foto</li>
        </ul>
        <p>
          Wir prüfen jedes Profil vor der Veröffentlichung. Nach der Freigabe sind die oben genannten Angaben auf dieser
          Website <strong>öffentlich sichtbar</strong>, damit Gastfamilien Sie finden können. Ihre E-Mail-Adresse ist
          nie öffentlich sichtbar; den Kontakt zu Familien stellen ausschließlich wir her.
        </p>
        <p>
          Rechtsgrundlage für die Veröffentlichung ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie beim
          Anlegen des Profils erteilen. Sie können sie jederzeit mit Wirkung für die Zukunft per E-Mail an {site.email}{' '}
          widerrufen; wir nehmen Ihr Profil dann offline. Die Verarbeitung für die Vermittlung selbst stützt sich auf
          Art. 6 Abs. 1 lit. b DSGVO.
        </p>
      </section>

      <section>
        <h2>7. Gastfamilien-Profile, Merklisten und Matches</h2>
        <p>Wenn Sie als Gastfamilie ein Profil anlegen, verarbeiten wir:</p>
        <ul>
          <li>Anzeigename, Wohnort, Bundesland und Wohnlage</li>
          <li>Anzahl und Altersgruppen der Kinder</li>
          <li>Sprachen im Haushalt, gewünschte Deutschkenntnisse, Aufgaben, Führerschein und Haustiere</li>
          <li>Anforderungen an das Au-pair (z. B. Schwimmen, Nichtraucher), alleinerziehend, Ernährung im Haushalt</li>
          <li>
            Ihr Angebot: Wochenstunden, Taschengeld und Zusatzleistungen (z. B. Deutschkurs-Zuschuss, eigenes Bad)
          </li>
          <li>freiwillig: ob ein Kind besonderen Förderbedarf hat</li>
          <li>gewünschter Beginn und Dauer des Au-pair-Aufenthalts</li>
          <li>Ihren Profiltext und, falls hochgeladen, Ihr Foto</li>
        </ul>
        <p>
          Wir prüfen jedes Profil vor der Freigabe. Familienprofile sind <strong>nicht öffentlich</strong>; nach der
          Freigabe sehen sie nur angemeldete Au-pairs. Rechtsgrundlage für diese Sichtbarkeit ist Ihre Einwilligung
          (Art. 6 Abs. 1 lit. a DSGVO), die Sie jederzeit per E-Mail an {site.email} widerrufen können.
        </p>
        <p>
          Die Angabe zum Förderbedarf eines Kindes kann Rückschlüsse auf die Gesundheit zulassen. Sie ist freiwillig;
          wir verarbeiten sie nur mit Ihrer ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a DSGVO), die Sie beim
          Speichern des Profils erteilen und jederzeit widerrufen können. Sie wird angemeldeten Au-pairs nur als „Kind
          mit Förderbedarf“ angezeigt, ohne weitere Details.
        </p>
        <p>
          Aus den Angaben beider Seiten berechnet die Website automatisch, wie gut ein Profil zum eigenen passt (z. B.
          „80 % passend“). Diese Anzeige dient nur der Orientierung; Entscheidungen trifft immer ein Mensch.
        </p>
        <p>
          Gastfamilien und Au-pairs können Profile auf ihre Merkliste setzen; wir speichern diese Auswahl im jeweiligen
          Konto. Die andere Seite erfährt davon nur, wenn beide sich gegenseitig gemerkt haben (Match). Ein Match sehen
          die beiden Beteiligten und IJP. Kontaktdaten werden dabei nicht angezeigt; den Kontakt stellen ausschließlich
          wir her. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
        </p>
      </section>

      <section>
        <h2>8. Kontaktformular und E-Mail</h2>
        <p>
          Wenn Sie uns über das Kontaktformular oder per E-Mail schreiben, verarbeiten wir Ihren Namen, Ihre
          E-Mail-Adresse, optional Ihre Telefonnummer und Ihre Nachricht, um Ihre Anfrage zu beantworten.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO, soweit die Anfrage auf eine Vermittlung oder einen Vertrag
          abzielt, im Übrigen Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).
        </p>
      </section>

      <section>
        <h2>9. Empfänger</h2>
        <p>
          Ihre Daten sehen nur die zuständigen Mitarbeitenden von IJP sowie die oben genannten Dienstleister im Rahmen
          der Auftragsverarbeitung. Freigegebene Au-pair-Profile sind öffentlich sichtbar (siehe Punkt 6). Wenn wir den
          Kontakt zwischen einem Au-pair und einer Gastfamilie herstellen, geben wir die dafür nötigen Kontaktdaten erst
          nach Absprache mit Ihnen weiter.
        </p>
      </section>

      <section>
        <h2>10. Speicherdauer</h2>
        <p>
          Kontodaten, Profile und Merklisten speichern wir, bis Sie Ihr Konto löschen lassen oder Ihre Einwilligung
          widerrufen. Kontaktanfragen löschen wir, sobald sie abschließend bearbeitet sind, soweit keine gesetzlichen
          Aufbewahrungspflichten entgegenstehen. Server-Logfiles werden beim Hosting-Anbieter nach kurzer Zeit
          automatisch gelöscht.
        </p>
        <p>Die Löschung Ihres Kontos können Sie jederzeit per E-Mail an {site.email} verlangen.</p>
      </section>

      <section>
        <h2>11. Ihre Rechte</h2>
        <p>Sie haben jederzeit das Recht auf:</p>
        <ul>
          <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)</li>
          <li>Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
        </ul>
        <p>
          Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO). Für uns zuständig
          ist die Berliner Beauftragte für Datenschutz und Informationsfreiheit, Alt-Moabit 59–61, 10555 Berlin.
        </p>
      </section>

      <section>
        <h2>12. SSL-/TLS-Verschlüsselung</h2>
        <p>
          Diese Website nutzt eine verschlüsselte Verbindung. Sie erkennen sie an „https://“ und dem Schloss-Symbol in
          der Adresszeile Ihres Browsers.
        </p>
      </section>

      <section>
        <h2>13. Änderungen</h2>
        <p>
          Wir passen diese Datenschutzerklärung an, wenn sich unser Angebot oder die Rechtslage ändert. Es gilt die
          jeweils hier veröffentlichte Fassung.
        </p>
        <p className="text-ink/50">Stand: {company.privacyDate}</p>
      </section>
    </LegalPage>
  )
}
