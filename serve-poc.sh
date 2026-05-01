#!/bin/bash
# Start HTTP server for PoC testing on port 8080
cd /home/user/_layouts
python3 -m http.server 8080 &
echo "[*] HTTP server started on port 8080"
echo "[*] Preview URL: https://8080-$(hostname).cluster-*.cloudworkstations.dev/"
echo "[*] Test pages:"
echo "    /ws-hijack-poc.html  - WebSocket cross-subdomain hijack test"
echo "    /xss-chain-poc.html  - XSS chain via vscode-remote-resource"
