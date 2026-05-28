#!/usr/bin/env python3
"""HSTS y CSP upgrade-insecure-requests en el vhost; browse.php HTTPS forzado."""
import paramiko

HOST = "195.110.59.186"
USER = "root"
PASSWORD = "***REMOVED***"
DOMAIN = "covers.cholloweb.es"
VHOST_PATH = f"/usr/local/lsws/conf/vhosts/{DOMAIN}/vhost.conf"
BROWSE_PHP = f"/home/{DOMAIN}/public_html/api/browse.php"

REMOTE_PY = r'''
from pathlib import Path
import re

vhost = Path("VHOST_PATH")
text = vhost.read_text()
new_ctx = """context / {
  allowBrowse             1
  extraHeaders            <<<END_extraHeaders
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: upgrade-insecure-requests
  END_extraHeaders
}"""
if re.search(r"context / \{", text):
    text = re.sub(r"context / \{[^}]*\}", new_ctx.strip(), text, count=1, flags=re.DOTALL)
    vhost.write_text(text)
    print("vhost: HSTS + CSP")
else:
    print("vhost: ERROR context /")

browse = Path("BROWSE_PHP")
bt = browse.read_text()
marker = "// Producción CoverLens: nunca devolver portadas por HTTP"
if marker in bt:
    print("browse.php: ya parcheado")
else:
    old = (
        "$baseUrl = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http')\n"
        "    . '://' . ($_SERVER['HTTP_HOST'] ?? 'covers.cholloweb.es');"
    )
    new = (
        "$host = $_SERVER['HTTP_HOST'] ?? 'covers.cholloweb.es';\n"
        "$scheme = 'https';\n"
        "if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {\n"
        "    $scheme = $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'http' ? 'http' : 'https';\n"
        "} elseif (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {\n"
        "    $scheme = 'http';\n"
        "}\n"
        "$baseUrl = $scheme . '://' . $host;\n"
        "// Producción CoverLens: nunca devolver portadas por HTTP (evita contenido mixto en HTTPS).\n"
        "if ($host === 'covers.cholloweb.es' || str_ends_with($host, '.covers.cholloweb.es')) {\n"
        "    $baseUrl = 'https://' . $host;\n"
        "}"
    )
    if old not in bt:
        print("browse.php: ERROR patrón no encontrado")
    else:
        browse.write_text(bt.replace(old, new))
        print("browse.php: HTTPS forzado")
'''.replace("VHOST_PATH", VHOST_PATH).replace("BROWSE_PHP", BROWSE_PHP)


def run(client, cmd, timeout=120):
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    stdout.channel.recv_exit_status()
    return out, err


def main() -> int:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=22, username=USER, password=PASSWORD, timeout=30)

    print("=== Parches en VPS ===")
    cmd = "python3 << 'PYEOF'\n" + REMOTE_PY + "\nPYEOF"
    out, err = run(client, cmd)
    print(out or err)

    print("\n=== Reload LiteSpeed ===")
    out, err = run(client, "/usr/local/lsws/bin/lswsctrl reload")
    print((out or err).strip())

    print("\n=== Cabeceras ===")
    for path in ("/", "/catalogo"):
        out, _ = run(
            client,
            f"curl -sI 'https://{DOMAIN}{path}' | grep -iE 'strict-transport|content-security'",
        )
        print(f"https://{DOMAIN}{path}", "->", out.strip() or "(ninguna)")

    client.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
