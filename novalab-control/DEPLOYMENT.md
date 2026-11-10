# Root-Server Installation (Docker / Termius)

Diese Anleitung verwendet ausschließlich `akraniss05/NovaLab-Code`. Der Bot liegt im Unterordner `novalab-control`. Kein DiscordBot1-Code wird verwendet.

## 1. Einmalig herunterladen

```bash
git clone --branch novalab-control-v2 --single-branch https://github.com/akraniss05/NovaLab-Code.git ~/NovaLab-Code
cd ~/NovaLab-Code/novalab-control
cp .env.example .env
nano .env
```

In `.env` müssen **DISCORD_BOT_TOKEN**, **DISCORD_GUILD_ID**, **DISCORD_CLIENT_ID**, **DISCORD_CLIENT_SECRET**, **PUBLIC_URL** und **SESSION_SECRET** gesetzt werden. Für SESSION_SECRET eine lange zufällige Zeichenfolge verwenden. `PUBLIC_URL` ist die tatsächliche HTTPS-Adresse des Dashboards (z.B. `https://bot.example.com`). Im Discord Developer Portal muss die Redirect URI exakt `https://bot.example.com/auth/callback` lauten.

**Bot-Intents:** Guilds. Berechtigungen nach Bedarf: Manage Channels, Manage Roles, View Channel, Send Messages, Embed Links, Read Message History. Die Bot-Rolle muss oberhalb der zu vergebenden Rollen stehen.

## 2. Start

```bash
cd ~/NovaLab-Code/novalab-control && sh deploy.sh
```

Prüfe `docker compose logs -f --tail=50`. Dashboard wird auf `127.0.0.1:3100` bereitgestellt; für externen Zugriff einen HTTPS-Reverse-Proxy konfigurieren. Der Port darf nicht ungeschützt ins Internet geöffnet werden.

## 3. Updates (nach erster Einrichtung)

```bash
cd ~/NovaLab-Code && git pull --ff-only && cd novalab-control && sh deploy.sh
```

**Wichtig:** Das zieht den Entwicklungsbranch `novalab-control-v2`, solange dieser ausgecheckt ist. Der Bot wird mit `docker compose up -d --no-deps` aktualisiert. Die `.env` bleibt erhalten, der benannte Docker-Daten-Volume ebenfalls. Bei einem fehlgeschlagenen Build bleibt der bisherige Container bestehen; bei einem Start-/Healthcheck-Fehler ist ein manueller Rollback nötig.

## 4. Diagnose

```bash
cd ~/NovaLab-Code/novalab-control
docker compose ps
docker compose logs --tail=100
curl -i http://127.0.0.1:3100/api/health
```

Erwartet: HTTP 200 und `{"ready":true}`, wenn der Bot bei Discord eingeloggt ist.

## Status

Dieser Branch ist ein **Test-Build**. Nicht alle geplanten Carl-bot-ähnlichen Funktionen existieren; insbesondere Automod/Anti-Raid/erweiterte Logs fehlen. Noch keine echten Root-/Discord-Integrationstests durchgeführt.
