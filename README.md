# Vue 101 Deploy

Vue 3 + Vite + Firebase を使用したカードゲームアプリケーション

## 技術スタック

- Vue 3.4+ (Composition API)
- Vite 5.x
- Pinia (状態管理)
- Vue Router 4
- Firebase v10+
- Sass/SCSS
- TypeScript
- Yarn 3

## 環境構築

### 前提条件

- Node.js 20.11.0以上
- Yarn 3.6.4

### セットアップ

#### 1. Node.jsの確認
```bash
node --version
# v20.11.0以上であることを確認
```

#### 2. Yarn 3のセットアップ（初回のみ）

**方法1: Corepackを使用（推奨）**
```bash
corepack enable
corepack prepare yarn@3.6.4 --activate
```

**方法2: 手動でYarn 3をセットアップ**
```bash
npm install -g yarn
# または
npm install -g corepack
corepack enable
```

#### 3. 依存関係のインストール
```bash
cd C:\Users\oneie\Documents\AI\vue-101
yarn install
```

#### 4. 環境変数の設定
`.env.local`ファイルを作成し、Firebase設定を追加：
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**注意**: 開発環境でFirebase設定がない場合でも、アプリは起動しますが、Firebase機能は動作しません。

#### 5. 開発サーバーの起動
```bash
yarn dev
```

ブラウザで `http://localhost:5173` を開いて確認してください。

### トラブルシューティング

#### Node.jsが見つからない場合
- Node.jsがインストールされているか確認
- 新しいPowerShell/ターミナルウィンドウを開く
- 環境変数PATHにNode.jsが含まれているか確認

#### Yarnが見つからない場合
```bash
# Corepackを有効化
corepack enable

# または、npmでyarnをインストール
npm install -g yarn
```

#### 依存関係のインストールエラー
```bash
# キャッシュをクリア
yarn cache clean
# 再インストール
yarn install
```

## プロジェクト構造

```
vue-101-deploy/
├── src/
│   ├── assets/          # 画像、スタイル
│   ├── components/      # Vueコンポーネント
│   ├── composables/     # Composition APIの再利用可能なロジック
│   ├── stores/          # Piniaストア
│   ├── router/          # Vue Router設定
│   ├── services/        # API通信、外部サービス
│   ├── utils/           # ユーティリティ関数
│   ├── types/           # TypeScript型定義
│   └── views/           # ページコンポーネント
├── public/              # 静的ファイル
└── functions/           # Cloud Functions
```

## スクリプト

- `yarn dev` - 開発サーバーを起動
- `yarn build` - 本番用ビルド
- `yarn preview` - ビルド結果のプレビュー
- `yarn build:prod` - 本番環境用ビルド
- `yarn deploy` - ビルドしてFirebaseにデプロイ
- `yarn deploy:hosting` - Hostingのみデプロイ
- `yarn deploy:functions` - Functionsのみデプロイ
- `yarn deploy:firestore` - Firestoreルールとインデックスのみデプロイ

## Firebase設定

### 初回セットアップ

1. Firebase CLIのインストール
```bash
npm install -g firebase-tools
firebase login
```

2. Firebaseプロジェクトの初期化
```bash
firebase init
```

3. `.firebaserc`ファイルの設定
`.firebaserc.example`をコピーして`.firebaserc`を作成し、プロジェクトIDを設定してください。

### Firestoreセキュリティルール

`firestore.rules`にセキュリティルールが定義されています。デプロイ前に確認してください。

### Firestoreインデックス

`firestore.indexes.json`にインデックス定義が含まれています。必要に応じてFirebase Consoleでインデックスを作成してください。

## 実装済み機能

### Cloud Functions API
- `createRoom` - ルーム作成
- `joinRoom` - ルーム参加
- `startGame` - ゲーム開始

### Composables
- `useFirestore` - Firestoreドキュメントのリアルタイム監視
- `useRoom` - ルーム状態のリアルタイム監視
- `usePlayers` - プレイヤーリストのリアルタイム監視

### ユーティリティ
- `errorHandler` - エラーハンドリング
- `roomUtils` - ルーム関連のユーティリティ関数

## 参考資料

詳細は以下のドキュメントを参照してください：
- `C:\Users\oneie\Documents\AI\react-101-deploy\docs\design-document.md` - 設計書
- `C:\Users\oneie\Documents\AI\react-101-deploy\docs\api-specification.md` - API仕様書
- `C:\Users\oneie\Documents\AI\react-101-deploy\docs\deployment-guide.md` - デプロイメントガイド
