# Supabase einrichten

1. Neues Projekt anlegen: in einer Organisation mit **Free**-Tarif, Region **Frankfurt (eu-central-1)**.
2. **SQL Editor** → Inhalt von `schema.sql` einfügen → *Run*.
   Danach genauso `02_families_matching.sql` (Familienprofile und Matching) und
   `03_matching_details.sql` (Details für das Matching) ausführen.
3. **Project Settings → API**: `Project URL` und `anon public` Key in `.env` eintragen (Vorlage: `.env.example`).
4. **Authentication → URL Configuration**:
   - Site URL: die spätere Domain der Seite (lokal: `http://localhost:5173`)
   - Redirect URLs: `http://localhost:5173/**` und `https://<domain>/**`
5. Selbst über die Website registrieren, dann im SQL Editor zum Admin machen:
   ```sql
   update public.profiles set role = 'admin'
     where id = (select id from auth.users where email = 'service@internationaljobplacement.com');
   ```
6. Vor dem Livegang: **Authentication → Emails → SMTP** eigenen Mailserver eintragen
   (Absender z. B. service@internationaljobplacement.com). Der eingebaute Supabase-Mailversand
   schickt nur sehr wenige Mails pro Stunde und ist nur zum Testen gedacht.
   Die E-Mail-Vorlagen dort am besten auch auf Deutsch umstellen.
