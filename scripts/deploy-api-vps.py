#!/usr/bin/env python3
"""Sube browse.php y platforms.json al VPS (rápido, sin sync completo del catálogo)."""
import sys
from pathlib import Path

import paramiko

HOST = "195.110.59.186"
USER = "root"
PASSWORD = "***REMOVED***"
REMOTE_BASE = "/home/covers.cholloweb.es/public_html"

RESOURCE = Path(__file__).resolve().parents[2] / "coverlens_resource"
FILES = [
    (RESOURCE / "api" / "browse.php", f"{REMOTE_BASE}/api/browse.php"),
    (RESOURCE / "data" / "games" / "platforms.json", f"{REMOTE_BASE}/games/platforms.json"),
    (RESOURCE / "data" / "games" / "browse_index.json", f"{REMOTE_BASE}/games/browse_index.json"),
]


def main() -> int:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=22, username=USER, password=PASSWORD, timeout=30)
    sftp = client.open_sftp()

    for local, remote in FILES:
        if not local.is_file():
            print(f"Falta: {local}", file=sys.stderr)
            return 1
        sftp.put(str(local), remote)
        print(f"  + {local.name} -> {remote}")

    sftp.close()
    client.close()
    print("API web desplegada.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
