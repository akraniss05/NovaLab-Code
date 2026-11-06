# Eigene Domain für LiveryLab Academy

Wunschadresse: **https://github.liverylabacademy.app**

## Status (6. November 2026)

Diese Adresse ist eine gewünschte Domain, noch **nicht aktiviert oder verifiziert**. Bitte **nicht** automatisch als Live-Link in Registrierungen oder Social-Media-Profilen verbreiten.

Derzeit erreichbar: https://akraniss05.github.io/liverylab-academy/

Die Website wird via **GitHub Actions** als GitHub Pages veröffentlicht. Bei dieser Veröffentlichungsart wird eine CNAME-Datei im Repository ignoriert, und eine solche Datei allein würde die Wunschadresse nicht aktivieren.

## Einrichtung durch den Domaininhaber

1. Stelle sicher, dass du **liverylabacademy.app** registriert hast und die DNS-Einträge verwalten kannst.
2. Verifiziere die Domain unter GitHub-Account → Settings → Pages → Add domain, indem du den dort angegebenen TXT-Eintrag in deiner DNS-Verwaltung setzt. Dies schützt gegen Domain-Takeover.
3. Gehe im Repository **akraniss05/liverylab-academy** zu **Settings → Pages → Custom domain** und gib **github.liverylabacademy.app** ein.
4. Lege beim DNS-Anbieter folgenden Datensatz an:

| Typ | Host / Name | Ziel |
|---|---|---|
| CNAME | github | akraniss05.github.io |

Ein DNS-CNAME akzeptiert nur Hostnamen, keinen Pfad mit /liverylab-academy. Andere DNS-Einträge bleiben unverändert.
5. Warte auf GitHubs DNS-Prüfung und aktiviere **Enforce HTTPS** nach erfolgreicher Zertifikatsausstellung. Das kann bis zu 24 Stunden dauern.
6. Ergänze in Supabase Auth die Redirect-URL **https://github.liverylabacademy.app/** und passe den Registrierungs-Redirect in site/academy.js erst an, wenn die Domain live ist.
7. Teste Anmeldung und Registrierung inklusive E-Mail-Bestätigung.

GitHub-Dokumentation:
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages

Made with 💙 from NyxAtheris (LiveryLab Studios)
