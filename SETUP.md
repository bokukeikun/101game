# セットアップガイド

## クイックスタート

### 1. Node.jsのインストール確認

新しいPowerShellまたはコマンドプロンプトを開いて、以下を実行：

```powershell
node --version
```

Node.jsがインストールされていない場合：
- [Node.js公式サイト](https://nodejs.org/)からダウンロードしてインストール
- または、Voltaを使用している場合は `volta install node@20.11.0`

### 2. Yarn 3のセットアップ

```powershell
# プロジェクトディレクトリに移動
cd C:\Users\oneie\Documents\AI\vue-101

# Corepackを有効化（Node.js 16.10+に含まれています）
corepack enable

# Yarn 3を有効化
corepack prepare yarn@3.6.4 --activate
```

### 3. 依存関係のインストール

```powershell
yarn install
```

### 4. 開発サーバーの起動

```powershell
yarn dev
```

ブラウザで `http://localhost:5173` を開きます。

## 環境変数の設定（オプション）

Firebase機能を使用する場合のみ必要です。

1. `.env.local`ファイルをプロジェクトルートに作成
2. 以下の内容を追加（実際のFirebase設定値に置き換え）：

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## よくある問題

### 問題: `node`コマンドが見つからない

**解決方法:**
1. Node.jsがインストールされているか確認
2. 新しいターミナルウィンドウを開く
3. 環境変数PATHを確認

### 問題: `yarn`コマンドが見つからない

**解決方法:**
```powershell
corepack enable
# または
npm install -g yarn
```

### 問題: 依存関係のインストールが失敗する

**解決方法:**
```powershell
# キャッシュをクリア
yarn cache clean

# node_modulesを削除して再インストール
Remove-Item -Recurse -Force node_modules
yarn install
```

### 問題: ポート5173が既に使用されている

**解決方法:**
別のポートを使用する場合、`vite.config.ts`を編集するか、環境変数で指定：
```powershell
$env:PORT=3000
yarn dev
```
