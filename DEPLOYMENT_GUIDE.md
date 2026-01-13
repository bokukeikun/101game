# Firebase Hosting デプロイガイド

## Firebase Hostingの設定

### ステップ1: Firebase Hostingを有効化

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. 左メニューから「Hosting」をクリック
4. 「始める」または「Get started」をクリック
5. セットアップウィザードが表示されます

### ステップ2: Firebase CLIのインストール（まだの場合）

```bash
npm install -g firebase-tools
```

### ステップ3: Firebaseにログイン

```bash
firebase login
```

ブラウザが開くので、Googleアカウントでログインしてください。

### ステップ4: プロジェクトを初期化（まだの場合）

```bash
cd C:\Users\oneie\Documents\AI\vue-101
firebase init
```

以下の選択を行います：
1. **Hosting** を選択（スペースキーで選択、Enterで確定）
2. 既存のプロジェクトを使用する場合：「Use an existing project」を選択
3. プロジェクトを選択：`vue-101-game`を選択
4. **public directory**: `dist` と入力（既に設定済み）
5. **Single-page app**: `Yes` を選択（Vue Routerを使用しているため）
6. **Set up automatic builds**: `No`（GitHub連携しない場合）

### ステップ5: .firebasercファイルの確認

プロジェクトルートに`.firebaserc`ファイルが作成されているか確認：

```json
{
  "projects": {
    "default": "vue-101-game"
  }
}
```

もし作成されていない場合は、手動で作成してください。

## デプロイの実行

### 方法1: すべてをデプロイ

```bash
npm run deploy
```

これは以下を実行します：
1. プロダクションビルド（`npm run build:prod`）
2. Firebaseへのデプロイ（Hosting、Firestore、Functions）

### 方法2: Hostingのみデプロイ

```bash
npm run deploy:hosting
```

### 方法3: 手動でデプロイ

```bash
# ビルド
npm run build:prod

# デプロイ
firebase deploy --only hosting
```

## デプロイ後の確認

1. Firebase Console → Hosting にアクセス
2. デプロイされたサイトのURLが表示されます
3. URLをクリックしてサイトが正常に表示されるか確認

## 環境変数の設定（本番環境）

本番環境でも`.env.local`の設定値を使用するには、Firebase Hostingの環境変数設定が必要です。

ただし、**Firebase Hostingは静的サイトホスティング**のため、環境変数はビルド時に埋め込まれます。

### 本番環境用の環境変数

`.env.production`ファイルを作成（オプション）：

```env
VITE_FIREBASE_API_KEY=AIzaSyCvbgjJWLmfdbGRG9MSQHKF7Jc7iq-LzSs
VITE_FIREBASE_AUTH_DOMAIN=vue-101-game.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vue-101-game
VITE_FIREBASE_STORAGE_BUCKET=vue-101-game.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=40988664104
VITE_FIREBASE_APP_ID=1:40988664104:web:1b241b1fcfac41f97db01d
```

ビルド時に自動的に使用されます。

## トラブルシューティング

### エラー: "Firebase project not found"

`.firebaserc`ファイルを確認し、プロジェクトIDが正しいか確認してください。

### エラー: "Permission denied"

`firebase login`を実行してログイン状態を確認してください。

### デプロイが失敗する

1. ビルドが成功するか確認：`npm run build:prod`
2. `dist`フォルダが作成されているか確認
3. Firebase ConsoleでHostingが有効になっているか確認

## 次のステップ

1. ✅ Firebase Hostingを有効化
2. ✅ Firebase CLIでログイン
3. ✅ プロジェクトを初期化
4. ✅ ビルドとデプロイ
5. ⏭️ カスタムドメインの設定（オプション）
