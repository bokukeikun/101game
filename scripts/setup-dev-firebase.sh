#!/usr/bin/env bash
# 開発用 Firebase プロジェクト（vue-101-game-dev）を作成し、
# .env.development.local の生成と Firestore ルールのデプロイまで行う。
#
# 事前に Firebase CLI でログインしてください:
#   firebase login --reauth
#
# 実行:
#   yarn setup:dev-firebase

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ID="${FIREBASE_DEV_PROJECT_ID:-vue-101-game-dev}"
DISPLAY_NAME="${FIREBASE_DEV_DISPLAY_NAME:-101 Game Dev}"
LOCATION="${FIREBASE_DEV_LOCATION:-asia-northeast1}"
WEB_APP_NAME="${FIREBASE_DEV_WEB_APP_NAME:-101 Game Web}"
ENV_FILE="$ROOT_DIR/.env.development.local"
TMP_DIR="${TMPDIR:-/tmp}/101game-firebase-setup"

export VOLTA_HOME="${VOLTA_HOME:-$HOME/.volta}"
export PATH="$VOLTA_HOME/bin:$PATH"

mkdir -p "$TMP_DIR"

echo "==> Firebase 開発プロジェクトのセットアップ: $PROJECT_ID"
echo ""

# --- 1. ログイン確認 ---
if ! firebase projects:list --json > "$TMP_DIR/projects.json" 2>"$TMP_DIR/projects.err"; then
  echo "❌ Firebase CLI にログインできていません。"
  echo ""
  echo "ターミナルで次を実行してから、もう一度お試しください:"
  echo "  firebase login --reauth"
  echo "  yarn setup:dev-firebase"
  echo ""
  if [ -s "$TMP_DIR/projects.err" ]; then
    echo "--- firebase error ---"
    cat "$TMP_DIR/projects.err"
  fi
  exit 1
fi

project_exists() {
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$TMP_DIR/projects.json', 'utf8'));
    const list = data.result || data.results || [];
    const found = list.some((p) => (p.projectId || p.project_id) === '$PROJECT_ID');
    process.exit(found ? 0 : 1);
  "
}

# --- 2. プロジェクト作成 ---
if project_exists; then
  echo "==> プロジェクトは既に存在します: $PROJECT_ID"
else
  echo "==> プロジェクトを作成中: $PROJECT_ID"
  if ! firebase projects:create "$PROJECT_ID" --display-name "$DISPLAY_NAME"; then
    echo ""
    echo "❌ プロジェクト作成に失敗しました。"
    echo "   プロジェクト ID は全世界で一意です。別名を使う場合:"
    echo "   FIREBASE_DEV_PROJECT_ID=あなたの-dev-id yarn setup:dev-firebase"
    exit 1
  fi
  firebase projects:list --json > "$TMP_DIR/projects.json"
fi

# --- 3. Firestore 有効化 ---
echo "==> Firestore を有効化中 (region: ${LOCATION})..."
if firebase firestore:databases:create "(default)" \
  --location "$LOCATION" \
  --project "$PROJECT_ID" 2>"$TMP_DIR/firestore.err"; then
  echo "   Firestore を作成しました"
else
  if grep -qiE 'already exists|ALREADY_EXISTS|database already exists' "$TMP_DIR/firestore.err"; then
    echo "   Firestore は既に有効です"
  else
    echo "⚠️  Firestore の自動作成に失敗しました。Console から手動で有効化してください:"
    echo "   https://console.firebase.google.com/project/$PROJECT_ID/firestore"
    cat "$TMP_DIR/firestore.err" >&2
  fi
fi

# --- 4. Web アプリ ---
echo "==> Web アプリを確認中..."
firebase apps:list WEB --project "$PROJECT_ID" --json > "$TMP_DIR/apps.json" 2>/dev/null || echo '{"result":[]}' > "$TMP_DIR/apps.json"

APP_ID="$(node -e "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('$TMP_DIR/apps.json', 'utf8'));
  const apps = data.result || [];
  const web = apps.find((a) => (a.platform || '').toUpperCase() === 'WEB') || apps[0];
  console.log(web?.appId || web?.app_id || '');
")"

if [ -z "$APP_ID" ]; then
  echo "==> Web アプリを作成中..."
  firebase apps:create WEB "$WEB_APP_NAME" --project "$PROJECT_ID" --json > "$TMP_DIR/app-create.json"
  APP_ID="$(node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$TMP_DIR/app-create.json', 'utf8'));
    console.log(data.result?.appId || data.appId || '');
  ")"
fi

if [ -z "$APP_ID" ]; then
  echo "❌ Web アプリ ID を取得できませんでした"
  exit 1
fi

echo "   Web App ID: $APP_ID"

# --- 5. .env.development.local 生成 ---
echo "==> .env.development.local を生成中..."
firebase apps:sdkconfig WEB "$APP_ID" --project "$PROJECT_ID" -o "$TMP_DIR/sdk.txt"
node "$ROOT_DIR/scripts/parse-firebase-sdk-config.mjs" "$TMP_DIR/sdk.txt" "$ENV_FILE"

# --- 6. 開発用 Firestore ルール ---
echo "==> 開発用 Firestore ルールをデプロイ中..."
(cd "$ROOT_DIR" && export VOLTA_HOME="${VOLTA_HOME:-$HOME/.volta}" && export PATH="$VOLTA_HOME/bin:$PATH" && yarn deploy:firestore:dev)

echo ""
echo "✅ 開発用 Firebase プロジェクトのセットアップが完了しました"
echo ""
echo "次のコマンドで開発を開始できます:"
echo "  yarn dev"
echo ""
echo "Firebase Console:"
echo "  https://console.firebase.google.com/project/$PROJECT_ID"
