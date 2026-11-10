# NovaLab Control V2

Fresh standalone Discord bot + web dashboard, developed **only** in the NovaLab-Code repository. No code or assets from DiscordBot1. The existing Academy is untouched.

## Implemented

- Discord OAuth2 login (identify + guilds) with server-side Manage Guild / Administrator access checks, HttpOnly session cookies, CSRF protection for writes, and logout.
- Live Discord roles (name, color, hierarchy, managed/assignable) and categorized channels (permissions + search).
- Responsive dark desktop/mobile dashboard with overview, panel editor, live Discord embed preview, activity and settings.
- **Working informational panel publishing** to real Discord text channels, with permissions validation and persisted message IDs.
- JSON file persistence for panels, settings drafts and audit events; atomic writes.
- Server health endpoint and basic security tests.

## Not implemented (deliberately disabled)

Interactive ticket/application/verification buttons and handlers, welcome/leave events, autoroles, automod, antiraid, honeypot, staff management, selfroles, Discord log events, billing and advanced analytics. Settings for welcome/leave are **drafts only**. These features must not be advertised as functional.

## Deployment

1. Install Node.js 22+ on the server, copy the `novalab-control` folder, run `npm install`.
2. Copy `.env.example` to `.env` and fill in credentials. Never commit the .env file.
3. Configure a Discord OAuth2 redirect URI matching `PUBLIC_URL/auth/callback` exactly.
4. Start with `npm run check`, then `npm start`. Put an HTTPS reverse proxy in front of 127.0.0.1:3100.
5. Enable the bot's needed Discord permissions in the target guild. For informational panels: View Channel, Send Messages, Embed Links.
6. Keep `data/control.json` backed up; it stores published panel references and draft settings.

The bot and web dashboard share one Node process. GitHub Pages cannot run this backend. GitHub pushes do not automatically update the root server.

## Security notes

- Never put the bot token or Discord client secret in the frontend.
- Rotate any previously disclosed Discord OAuth client secrets.
- Session state is in process memory; restarting logs users out. Production scaling to multiple instances requires a shared session store.
- The panel API has no per-user rate limiting; place it behind a rate-limited reverse proxy before exposing it publicly.
- The OAuth authorization relies on Discord guild permissions returned for the authenticated user.
- File storage is suitable for one instance only; for larger production deployments use a database and transactional audit trail.

## Quality status

Source files were committed through GitHub. **No live Discord connection, browser/mobile end-to-end tests, CI run or root deployment has been performed here.** The implementation is an early functional slice, not a production-complete bot.
