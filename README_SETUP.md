# Vue 101 セットアップガイド

## ローカル開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
# または
yarn install
```

### 2. Firebase設定

`.env.local`ファイルをプロジェクトルートに作成し、以下の内容を追加してください：

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Firebase設定の取得方法：**
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択（または新規作成）
3. プロジェクト設定（⚙️）→ 全般 → マイアプリ
4. Webアプリを追加（または既存のアプリを選択）
5. 設定値をコピーして`.env.local`に貼り付け

### 3. Firestoreセキュリティルールの設定

Firebase Consoleで、Firestore Databaseのセキュリティルールを設定してください。
`firestore.rules`ファイルの内容を参考にしてください。

### 4. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

## トラブルシューティング

### "CREATE GAME"をクリックしても動作しない

1. **Firebase設定の確認**
   - `.env.local`ファイルが存在するか確認
   - 環境変数が正しく設定されているか確認
   - 開発サーバーを再起動

2. **ブラウザのコンソールを確認**
   - F12キーで開発者ツールを開く
   - Consoleタブでエラーメッセージを確認

3. **Firestoreのセキュリティルール**
   - Firebase ConsoleでFirestoreのセキュリティルールを確認
   - テストモードになっている場合は、一時的にすべての読み書きを許可

### よくあるエラー

- **"Firebase設定エラー"**: `.env.local`ファイルが存在しない、または設定値が間違っている
- **"権限エラー"**: Firestoreのセキュリティルールで読み書きが許可されていない
- **"Network error"**: インターネット接続またはFirebaseプロジェクトの設定を確認

## 次のステップ

アプリが正常に動作することを確認したら：
1. Firestoreのセキュリティルールを本番環境用に設定
2. Cloud Functionsをデプロイ（必要に応じて）
3. 本番環境にデプロイ
