# Vue用の新しいFirebaseプロジェクト作成ガイド

## ステップ1: Firebase Consoleでプロジェクトを作成

### 1. Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. Googleアカウントでログイン

### 2. 新しいプロジェクトを作成

1. 「プロジェクトを追加」または「Add project」をクリック
2. **プロジェクト名**を入力（例：`vue-101-game`）
3. 「次へ」をクリック
4. **Google Analytics**の設定（オプション）
   - 使用する場合：Google Analyticsアカウントを選択
   - 使用しない場合：「このプロジェクトでGoogle Analyticsを有効にする」のチェックを外す
5. 「プロジェクトを作成」をクリック
6. プロジェクトの作成が完了するまで待機（数秒〜数分）

## ステップ2: Firestore Databaseを有効化

### 1. Firestore Databaseを作成

1. プロジェクトのホーム画面で「Firestore Database」をクリック
2. 「データベースを作成」をクリック
3. **セキュリティルール**を選択：
   - **開発モードで開始**（推奨：開発中はすべての読み書きを許可）
   - または「本番モードで開始」（後でルールを設定）
4. **ロケーション**を選択（例：`asia-northeast1`（東京））
5. 「有効にする」をクリック

### 2. セキュリティルールの設定（開発用）

開発中は、Firestoreのセキュリティルールを一時的に緩和できます：

1. Firestore Database → 「ルール」タブ
2. 以下のルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 開発用: すべての読み書きを許可
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. 「公開」をクリック

**⚠️ 注意：** このルールは開発用です。本番環境では適切なセキュリティルールを設定してください。

**実際のアプリで使用するコレクション：**
- `users` - ルームのユーザー情報
- `initGameState` - ゲームの状態情報

これらのコレクションは認証なしで動作するため、開発中は上記のルールで問題ありません。

## ステップ3: Webアプリを追加

### 1. Webアプリを登録

1. プロジェクトのホーム画面で「</>」アイコン（Webアプリを追加）をクリック
2. **アプリのニックネーム**を入力（例：`vue-101-web`）
3. 「このアプリのFirebase Hostingも設定します」のチェックは外してOK
4. 「アプリを登録」をクリック

### 2. 設定値をコピー

以下のような設定値が表示されます：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "vue-101-game.firebaseapp.com",
  projectId: "vue-101-game",
  storageBucket: "vue-101-game.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**この設定値をコピーしておいてください！**

## ステップ4: .env.localファイルを作成

### 1. ファイルを作成

プロジェクトルート（`C:\Users\oneie\Documents\AI\vue-101`）に`.env.local`ファイルを作成します。

### 2. 設定値を記入

コピーした設定値を以下の形式で記入：

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=vue-101-game.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vue-101-game
VITE_FIREBASE_STORAGE_BUCKET=vue-101-game.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**重要ポイント：**
- `VITE_`プレフィックスを必ず付ける
- 値に引用符（`"`）は不要
- 値にスペースは不要
- `=`の前後にスペースは不要

## ステップ5: Firestoreのコレクション構造を確認

アプリで使用するコレクション：

1. **`users`** コレクション
   - ドキュメントID: ルームコード
   - フィールド: `users`（配列）、`restartUsers`（配列）

2. **`initGameState`** コレクション
   - ドキュメントID: ルームコード
   - フィールド: `startFlag`, `gameOver`, `winner`, `turn`, `playerDecks`, など

3. **`games`** コレクション（オプション）
   - ゲーム履歴を保存する場合

これらのコレクションは、アプリを初めて実行したときに自動的に作成されます。

## ステップ6: 開発サーバーを起動

### 1. 開発サーバーを起動

```bash
cd C:\Users\oneie\Documents\AI\vue-101
npm run dev
```

### 2. 動作確認

1. ブラウザで `http://localhost:5173` にアクセス
2. 名前を入力して「CREATE GAME」をクリック
3. エラーが表示されないことを確認
4. Firestore Consoleでデータが作成されているか確認

## ステップ7: Firestoreのセキュリティルールを設定（本番用）

開発が完了したら、適切なセキュリティルールを設定してください。

`firestore.rules`ファイルの内容を参考に、Firebase Consoleでルールを設定します。

## トラブルシューティング

### エラー: "Firebase設定エラー"

- `.env.local`ファイルが正しい場所にあるか確認
- 環境変数名に`VITE_`プレフィックスが付いているか確認
- 値に余分なスペースや引用符がないか確認
- 開発サーバーを再起動したか確認

### エラー: "権限エラー"

- Firestoreのセキュリティルールを確認
- 開発モードで開始した場合、ルールが緩和されているか確認

### データが作成されない

- Firestore Databaseが有効になっているか確認
- ブラウザのコンソール（F12）でエラーを確認
- Firestore Consoleでコレクションが作成されているか確認

## 次のステップ

1. ✅ Firebaseプロジェクトの作成
2. ✅ Firestore Databaseの有効化
3. ✅ Webアプリの登録
4. ✅ `.env.local`ファイルの作成
5. ✅ 開発サーバーの起動
6. ✅ 動作確認
7. ⏭️ Cloud Functionsの設定（必要に応じて）
8. ⏭️ Firebase Hostingの設定（デプロイ時）
