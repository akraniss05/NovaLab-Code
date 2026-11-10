from pathlib import Path
import json
import hashlib
import zipfile
import sys

version = sys.argv[1]
root = Path(__file__).resolve().parent.parent
folder = root / "dist" / "win-unpacked"
assert (folder / "NovaLab Code.exe").is_file(), "Desktop executable missing"
out = root / "dist" / f"NovaLab-Code-win-x64-v{version}.zip"
entries = [p for p in folder.rglob("*") if p.is_file()]
assert entries and any(p.name == "app.asar" for p in entries), "Packaged app or resources missing"
with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as z:
    for p in entries:
        z.write(p, p.relative_to(folder).as_posix())
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
sha = hashlib.sha256(out.read_bytes()).hexdigest()
manifest = {
    "id": "novalab-code", "title": "NovaLab Code", "type": "app",
    "version": version, "format": "windows", "entry": "NovaLab Code.exe",
    "size": out.stat().st_size, "sha256": sha,
    "url": f"https://github.com/akraniss05/NovaLab-Code/releases/download/code-v{version}/{out.name}",
}
(root / "dist" / "launcher-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
(root / "dist" / f"{out.name}.sha256").write_text(sha + "  " + out.name + "\n", encoding="ascii")
print(json.dumps(manifest, indent=2))
