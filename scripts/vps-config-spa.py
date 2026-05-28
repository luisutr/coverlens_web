#!/usr/bin/env python3
"""Restaura vhost desde backup y aplica config SPA corregida."""
import paramiko
import sys

HOST = "195.110.59.186"
USER = "root"
PASSWORD = "***REMOVED***"
DOMAIN = "covers.cholloweb.es"
VH_ROOT = f"/home/{DOMAIN}"
SSL_DIR = f"{VH_ROOT}/ssl"
VHOST_PATH = f"/usr/local/lsws/conf/vhosts/{DOMAIN}/vhost.conf"

# allowBrowse 1 en / es necesario para servir index.html en OpenLiteSpeed
VHOST_CONF = f"""docRoot                   $VH_ROOT/public_html
vhDomain                  {DOMAIN}
vhAliases                 www.{DOMAIN}
adminEmails               luisutr@gmail.com
enableGzip                1
enableIpGeo               1

errorlog $VH_ROOT/logs/{DOMAIN}.error_log {{
  useServer               0
  logLevel                WARN
  rollingSize             10M
}}

accesslog $VH_ROOT/logs/{DOMAIN}.access_log {{
  useServer               0
  logFormat               "%h %l %u %t \\"%r\\" %>s %b \\"%{{Referer}}i\\" \\"%{{User-Agent}}i\\""
  logHeaders              5
  rollingSize             10M
  keepDays                10
  compressArchive         1
}}

index {{
  useServer               0
  indexFiles              index.html
}}

context /.well-known/acme-challenge {{
  location                $VH_ROOT/public_html/.well-known/acme-challenge
  allowBrowse             1
  addDefaultCharset       off
}}

context /api/ {{
  location                $VH_ROOT/public_html/api/
  allowBrowse             1
  addDefaultCharset       off
}}

context /games/ {{
  location                $VH_ROOT/public_html/games/
  allowBrowse             1
  addDefaultCharset       off
  extraHeaders            <<<END_gamesHeaders
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
Cache-Control: public, max-age=3600
  END_gamesHeaders
}}

context /covers/ {{
  location                $VH_ROOT/public_html/covers/
  allowBrowse             1
  addDefaultCharset       off
  extraHeaders            <<<END_coversHeaders
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Cache-Control: public, max-age=604800
  END_coversHeaders
}}

context /assets/ {{
  location                $VH_ROOT/public_html/assets/
  allowBrowse             1
  extraHeaders            <<<END_assetsHeaders
Cache-Control: public, max-age=31536000, immutable
  END_assetsHeaders
}}

context / {{
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
}}

rewrite {{
  enable                  1
  rules                   <<<END_rules
RewriteCond %{{HTTPS}} !on
RewriteRule ^(.*)$ https://%{{HTTP_HOST}}/$1 [R=301,L]
RewriteCond %{{REQUEST_FILENAME}} !-f
RewriteCond %{{REQUEST_FILENAME}} !-d
RewriteCond %{{REQUEST_URI}} !^/api/
RewriteCond %{{REQUEST_URI}} !^/games/
RewriteCond %{{REQUEST_URI}} !^/covers/
RewriteCond %{{REQUEST_URI}} !^/assets/
RewriteRule .* /index.html [L]
  END_rules
}}

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

scripthandler {{
  add                     lsapi:lsphp81 php
}}

extprocessor lsphp81 {{
  type                    lsapi
  address                 UDS://tmp/lshttpd/lsphp81.sock
  maxConns                10
  env                     LSAPI_CHILDREN=10
  initTimeout             60
  retryTimeout            0
  persistConn             1
  respBuffer              0
  autoStart               1
  path                    /usr/local/lsws/lsphp81/bin/lsphp
  memSoftLimit            2047M
  memHardLimit            2047M
  procSoftLimit           400
  procHardLimit           500
}}
"""


def main() -> int:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=22, username=USER, password=PASSWORD, timeout=30)

    sftp = client.open_sftp()
    with sftp.file(VHOST_PATH, "w") as f:
        f.write(VHOST_CONF)
    sftp.close()

    _, stdout, stderr = client.exec_command("/usr/local/lsws/bin/lswsctrl reload")
    print(stdout.read().decode() or stderr.read().decode())

    _, stdout, _ = client.exec_command(
        'curl -s -o /dev/null -w "local:%{http_code}" -H "Host: covers.cholloweb.es" http://127.0.0.1/'
    )
    print("Test /:", stdout.read().decode())

    _, stdout, _ = client.exec_command(
        'curl -s -H "Host: covers.cholloweb.es" "http://127.0.0.1/api/browse.php?platform=ps5&page=1&limit=1" | head -c 120'
    )
    print("Test browse:", stdout.read().decode())

    client.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
