# NovaLab Code Desktop
Builds the **existing NovaLab-Code/site source** as a secure, local-protocol Electron desktop application. It does not replace lessons, course engine, quizzes, authentication, or Supabase.

## Build on Windows
cd desktop
npm install
npm run check
npm run build:win
python scripts/package-build.py 1.0.3

The Windows NSIS installer is in desktop/dist. The launcher downloads the ZIP from GitHub Releases, validates its SHA-256, installs it in the NovaLab managed directory and opens `NovaLab Code.exe`.

## Security, availability and limitations
- The frontend is bundled in Electron resources/site and uses `novalab-code://app` secure local origin.
- Online Supabase Auth, courses, remote lesson content and jsDelivr CDN require Internet connectivity.
- Node integration is disabled and the renderer is sandboxed.
- The desktop origin differs from the hosted website. Users may need to sign in again; there is no SSO.
- App userData and existing browser-learning progress remain untouched; updates replace only the packaged app folder.
- Code signing and true Windows end-to-end verification (login, courses, quiz, local persistence) are not yet complete.
- Do not market this release as fully offline or as proven working until tested on a Windows device.

## Release pipeline
GitHub Actions `.github/workflows/novalab-code-desktop.yml` builds the Windows installer and ZIP. A commit containing `[publish-code]` publishes `code-v1.0.3` with installer, launcher ZIP, SHA-256 and manifest.

To update NovaLab Launcher, copy the exact verified sha256, URL, version and file size from the Release's `launcher-manifest.json` to the `novalab-code` catalog entry. Never use a placeholder SHA-256.

Build target: code-v1.0.3 (Windows x64 Early Access).

Version 1.0.3 vendors Python/Lua learning runtimes and Supabase SDK into the app distribution. The restricted reference-data.js is explicitly excluded to match the production website build. Backend requests still need Internet.

Release: code-v1.0.3 · geprüfte Paketstruktur und gebündelte Lern-Laufzeiten.
