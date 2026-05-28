#!/usr/bin/env python3
"""
Repara HTTPS: copia certificados a ruta legible por LiteSpeed y actualiza vhost.
También instala cert con acme.sh --install-cert y recarga LiteSpeed.
"""
import paramiko
import sys

HOST = "195.110.59.186"
USER = "root"
PASSWORD = "***REMOVED***"
DOMAIN = "covers.cholloweb.es"
VH_ROOT = f"/home/{DOMAIN}"
SSL_DIR = f"{VH_ROOT}/ssl"
ACME_DIR = f"/root/.acme.sh/{DOMAIN}_ecc"
VHOST_PATH = f"/usr/local/lsws/conf/vhosts/{DOMAIN}/vhost.conf"

INSTALL_CERT = f"""
/root/.acme.sh/acme.sh --install-cert -d {DOMAIN} \\
  --key-file {SSL_DIR}/{DOMAIN}.key \\
  --fullchain-file {SSL_DIR}/fullchain.cer \\
  --reloadcmd "/usr/local/lsws/bin/lswsctrl reload" 2>&1
"""

VHSSL_BLOCK = f"""
vhssl {{
  keyFile                 {SSL_DIR}/{DOMAIN}.key
  certFile                {SSL_DIR}/fullchain.cer
  certChain               1
  enableECDHE             1
  renegProtection         1
  sslSessionCache         1
  enableSpdy              15
  enableStapling          1
  ocspRespMaxAge          86400
}}
"""


def run(client, cmd, timeout=120):
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    code = stdout.channel.recv_exit_status()
    return code, out, err


def main() -> int:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=22, username=USER, password=PASSWORD, timeout=30)

    print("=== Renovar certificado (si hace falta) ===")
    _, out, _ = run(
        client,
        f"/root/.acme.sh/acme.sh --issue -d {DOMAIN} -w {VH_ROOT}/public_html --force 2>&1",
        timeout=180,
    )
    print(out[-2000:] if len(out) > 2000 else out)

    print("\n=== Crear directorio SSL y permisos ===")
    run(client, f"mkdir -p {SSL_DIR} && chmod 755 {SSL_DIR}")

    print("\n=== Instalar cert en ruta del vhost ===")
    _, out, err = run(client, INSTALL_CERT, timeout=120)
    print(out or err)

    run(
        client,
        f"chmod 644 {SSL_DIR}/fullchain.cer && chmod 600 {SSL_DIR}/{DOMAIN}.key && "
        f"chown root:root {SSL_DIR}/*",
    )

    print("\n=== Actualizar bloque vhssl en vhost ===")
    patch = f"""
python3 << 'PYEOF'
import re
from pathlib import Path
p = Path("{VHOST_PATH}")
text = p.read_text()
block = '''{VHSSL_BLOCK.strip()}'''
if re.search(r'vhssl\\s*{{', text):
    text = re.sub(r'vhssl\\s*{{[^}}]*}}', block.strip(), text, count=1, flags=re.DOTALL)
    print("vhssl actualizado")
else:
    text = text.rstrip() + "\\n\\n" + block + "\\n"
    print("vhssl añadido")
p.write_text(text)
PYEOF
"""
    _, out, err = run(client, patch)
    print(out or err)

    print("\n=== Asegurar map SSL en listeners ===")
    fix_map = """
python3 << 'PYEOF'
from pathlib import Path
p = Path("/usr/local/lsws/conf/httpd_config.conf")
text = p.read_text()
domain = "{DOMAIN}"
map_line = "  map                     " + domain + " " + domain + "\\n"
for listener in ("listener Default {{", "listener SSL {{", "listener SSL IPv6 {{"):
    if listener not in text:
        continue
    idx = text.index(listener)
    end = text.index("}}", idx)
    chunk = text[idx:end]
    if domain not in chunk:
        text = text[:end] + map_line + text[end:]
        print("map añadido en", listener)
p.write_text(text)
PYEOF
""".replace("{DOMAIN}", DOMAIN)
    _, out, _ = run(client, fix_map)
    print(out)

    print("\n=== Reload LiteSpeed ===")
    _, out, err = run(client, "/usr/local/lsws/bin/lswsctrl reload")
    print(out.strip() or err.strip())

    print("\n=== Verificación ===")
    checks = [
        f"ls -la {SSL_DIR}/",
        f"openssl verify -CAfile {ACME_DIR}/ca.cer {SSL_DIR}/fullchain.cer 2>&1",
        f"echo | openssl s_client -connect {DOMAIN}:443 -servername {DOMAIN} 2>/dev/null | openssl x509 -noout -subject -issuer",
        f"curl -sI https://{DOMAIN}/ | head -3",
    ]
    for cmd in checks:
        _, out, _ = run(client, cmd)
        print(cmd, "->", out.strip()[:120])

    client.close()
    print("\nListo. Prueba https://covers.cholloweb.es en el navegador (Ctrl+F5).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
