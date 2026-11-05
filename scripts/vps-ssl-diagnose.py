#!/usr/bin/env python3
"""Diagnóstico SSL para covers.cholloweb.es."""
import paramiko

HOST = "195.110.59.186"
USER = "root"
PASSWORD = __import__("vps_creds").PASSWORD
DOMAIN = "covers.cholloweb.es"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, 22, "root", PASSWORD, timeout=30)

cmds = [
    f"grep -A20 vhssl /usr/local/lsws/conf/vhosts/{DOMAIN}/vhost.conf 2>/dev/null | head -25",
    f"ls -la /root/.acme.sh/{DOMAIN}_ecc/ 2>/dev/null || echo 'no acme dir'",
    f"openssl x509 -in /root/.acme.sh/{DOMAIN}_ecc/fullchain.cer -noout -subject -issuer -dates 2>/dev/null || echo 'no cert'",
    f"grep -n '{DOMAIN}' /usr/local/lsws/conf/httpd_config.conf | head -20",
    f"echo | openssl s_client -connect {DOMAIN}:443 -servername {DOMAIN} 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>/dev/null || echo 's_client fail'",
    f"curl -sI https://{DOMAIN}/ 2>&1 | head -8",
]

for cmd in cmds:
    print("===", cmd[:70], "===")
    _, o, e = client.exec_command(cmd, timeout=60)
    print((o.read() + e.read()).decode())

client.close()
