"""Credenciales del VPS: NO van en el repo.
Orden: variable de entorno VPS_PASSWORD -> fichero COVERLENS/_SECRETS/vps.env (fuera de Git).
"""
import os
from pathlib import Path

HOST = "195.110.59.186"
USER = "root"
PORT = 22
PASSWORD = os.environ.get("VPS_PASSWORD", "")

if not PASSWORD:
    _f = Path(__file__).resolve().parents[2] / "_SECRETS" / "vps.env"
    if _f.exists():
        for _l in _f.read_text(encoding="utf-8").splitlines():
            if "=" in _l and not _l.lstrip().startswith("#"):
                _k, _v = _l.split("=", 1)
                if _k.strip() == "VPS_PASSWORD":
                    PASSWORD = _v.strip()
if not PASSWORD:
    raise SystemExit("Falta VPS_PASSWORD (entorno o ..\\_SECRETS\\vps.env)")