#!/usr/bin/env python3
"""Sube la SPA (dist/) a covers.cholloweb.es sin tocar games/, covers/ ni api/."""
import sys
from pathlib import Path

import paramiko

HOST = "195.110.59.186"
USER = "root"
PASSWORD = __import__("vps_creds").PASSWORD
REMOTE_BASE = "/home/covers.cholloweb.es/public_html"

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


def ensure_remote_dir(sftp, remote: str) -> None:
    parts = remote.strip("/").split("/")
    cur = ""
    for p in parts:
        cur = f"{cur}/{p}" if cur else f"/{p}"
        try:
            sftp.stat(cur)
        except OSError:
            sftp.mkdir(cur)


def upload_tree(sftp, local: Path, remote: str) -> int:
    count = 0
    for path in sorted(local.rglob("*")):
        rel = path.relative_to(local).as_posix()
        target = f"{remote}/{rel}" if rel != "." else remote
        if path.is_dir():
            ensure_remote_dir(sftp, target)
            continue
        ensure_remote_dir(sftp, "/".join(target.split("/")[:-1]))
        sftp.put(str(path), target)
        count += 1
        print(f"  + {rel}")
    return count


def main() -> int:
    if not DIST.is_dir():
        print("Ejecuta npm run build antes de desplegar.", file=sys.stderr)
        return 1

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=22, username=USER, password=PASSWORD, timeout=30)
    sftp = client.open_sftp()

    print(f"Subiendo dist/ -> {REMOTE_BASE}/")
    n = upload_tree(sftp, DIST, REMOTE_BASE)
    sftp.close()
    client.close()
    print(f"Listo: {n} archivos.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
