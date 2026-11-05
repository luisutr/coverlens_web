#!/usr/bin/env python3
import paramiko
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("195.110.59.186", 22, "root", __import__("vps_creds").PASSWORD, timeout=30)

cmds = [
    "ls -la /home/covers.cholloweb.es/public_html/index.html",
    'curl -s -o /dev/null -w "https_root:%{http_code}" https://covers.cholloweb.es/',
    'curl -s -o /dev/null -w "http_root:%{http_code}" http://covers.cholloweb.es/',
]

browse_cmd = (
    'curl -s -o /dev/null -w "browse_ms:%{time_total}" '
    '-H "Host: covers.cholloweb.es" '
    '"https://covers.cholloweb.es/api/browse.php?page=1&limit=48"'
)

for cmd in cmds:
    _, o, e = c.exec_command(cmd)
    print(">", cmd)
    print(o.read().decode() or e.read().decode())

t0 = time.time()
_, o, _ = c.exec_command(browse_cmd)
out = o.read().decode().strip()
print(">", browse_cmd)
print(out, f"(wall {time.time()-t0:.2f}s)")

_, o, _ = c.exec_command(
    'curl -s "https://covers.cholloweb.es/api/browse.php?page=1&limit=2" | head -c 200'
)
print("browse sample:", o.read().decode())

c.close()
