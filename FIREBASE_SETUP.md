# Firebase設定ガイド

## 方法1: Firebase Consoleから設定を取得する（推奨）

### ステップ1: Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. Googleアカウントでログイン
3. Reactプロジェクトで使用しているFirebaseプロジェクトを選択

### ステップ2: Webアプリの設定を取得

1. プロジェクトの設定（⚙️アイコン）をクリック
2. 「全般」タブを選択
3. 「マイアプリ」セクションまでスクロール
4. 既存のWebアプリを選択するか、「</>」アイコンをクリックして新しいWebアプリを追加

### ステップ3: 設定値をコピー

以下のような設定値が表示されます：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### ステップ4: .env.localファイルを作成

プロジェクトルート（`C:\Users\oneie\Documents\AI\vue-101`）に`.env.local`ファイルを作成し、以下の形式で設定値を入力：

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**重要：**
- `VITE_`プレフィックスを必ず付けてください（Viteの環境変数は`VITE_`で始まる必要があります）
- 値にスペースや引用符は不要です
- `databaseURL`はVueプロジェクトでは使用していません（Reactプロジェクトにはありましたが、Firestoreのみを使用）

## 方法2: Reactプロジェクトの環境変数から取得

Reactプロジェクトで環境変数が設定されている場合：

1. Reactプロジェクトのルートディレクトリを確認
2. `.env`、`.env.local`、`.env.development`などのファイルを探す
3. 以下の形式で設定されている場合：

```env
REACT_APP_API_KEY=...
REACT_APP_AUTH_DOMAIN=...
REACT_APP_PROJECT_ID=...
REACT_APP_STORAGE_BUCKET=...
REACT_APP_MESSAGING_SENDER_ID=...
REACT_APP_APP_ID=...
```

4. Vueプロジェクトの`.env.local`に以下のように変換：

```env
VITE_FIREBASE_API_KEY=...（REACT_APP_API_KEYの値）
VITE_FIREBASE_AUTH_DOMAIN=...（REACT_APP_AUTH_DOMAINの値）
VITE_FIREBASE_PROJECT_ID=...（REACT_APP_PROJECT_IDの値）
VITE_FIREBASE_STORAGE_BUCKET=...（REACT_APP_STORAGE_BUCKETの値）
VITE_FIREBASE_MESSAGING_SENDER_ID=...（REACT_APP_MESSAGING_SENDER_IDの値）
VITE_FIREBASE_APP_ID=...（REACT_APP_APP_IDの値）
```

## 設定後の確認

### 1. ファイルの場所を確認

`.env.local`ファイルは以下の場所に作成してください：
```
C:\Users\oneie\Documents\AI\vue-101\.env.local
```

### 2. 開発サーバーを再起動

環境変数を変更した場合は、**必ず開発サーバーを再起動**してください：

```bash
# 現在のサーバーを停止（Ctrl+C）
# その後、再起動
npm run dev
```

### 3. 動作確認

1. ブラウザで `http://localhost:5173` にアクセス
2. 名前を入力して「CREATE GAME」をクリック
3. エラーが表示されないことを確認

## トラブルシューティング

### エラー: "Firebase設定エラー"

- `.env.local`ファイルが正しい場所にあるか確認
- 環境変数名に`VITE_`プレフィックスが付いているか確認
- 値に余分なスペースや引用符がないか確認
- 開発サーバーを再起動したか確認

### エラー: "権限エラー"

Firestoreのセキュリティルールを確認してください。開発中は一時的に以下のルールを設定できます：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**注意：** このルールは開発用です。本番環境では適切なセキュリティルールを設定してください。

### 設定値が見つからない場合

1. Firebase Consoleでプロジェクトを確認
2. プロジェクト設定 → 全般 → マイアプリ
3. Webアプリが登録されていない場合は、新規追加
4. 設定値をコピー

## 次のステップ

Firebase設定が完了したら：
1. 開発サーバーを起動：`npm run dev`
2. アプリが正常に動作することを確認
3. Firestoreのセキュリティルールを適切に設定
