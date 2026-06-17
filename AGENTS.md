# AGENTS.md

このリポジトリで AI コーディングエージェントが作業するときのガイドです。  
Cursor / Codex / Claude Code など複数ツール向けの共通ルールとして使います。

## プロジェクト概要

- **101** — Vue 3 + Vite + TypeScript のオンラインカードゲーム
- Firebase（Firestore）でルーム・ゲーム状態を同期
- デプロイ先: Firebase Hosting

## デザイン方針（Mobile First）

**モバイルファースト** — スマートフォンでの使いやすさを最優先に設計する。

- デフォルトのスタイルはモバイル向けに書き、`@include respond-to(md)` 以降でタブレット・PC向けに拡張する
- タップしやすい UI（ボタン・入力欄は十分なサイズ、余白を確保）
- 縦画面・狭い幅でのレイアウト崩れを最初に確認する
- 背景画像はモバイル用（例: `Landing-Page-mobileG.gif`）をベースに、大画面用をメディアクエリで切り替える

**Web でも使えること** — モバイル優先と両立させる。

- PC・タブレットでは画面を活かしたレイアウトに拡張する（max-width、中央寄せなど）
- ホバー効果は `@media (hover: hover)` で付与し、タッチ端末では不要な挙動にしない
- モバイルとデスクトップの両方で動作確認する

## 技術スタック

| 項目 | バージョン / ツール |
|------|---------------------|
| Node.js | 20.11.0（Volta 管理） |
| パッケージマネージャ | Yarn 3.6.4 |
| フレームワーク | Vue 3.4+（Composition API + `<script setup>`） |
| ビルド | Vite 5 |
| 状態管理 | Pinia |
| ルーティング | Vue Router 4 |
| スタイル | SCSS（`src/assets/styles/`） |
| バックエンド | Firebase v10+（Firestore） |

## ディレクトリ構成

```
src/
  components/
    atoms/       # 最小単位（Spinner など）
    molecules/   # 小さな UI 部品（Warning, Modal など）
    organisms/   # 画面ブロック（FormHost, PlayerList など）
  views/         # ページコンポーネント
  stores/        # Pinia ストア（room, game, user）
  composables/   # 再利用ロジック
  services/      # Firebase 連携
  utils/         # 純粋関数
  assets/styles/ # グローバル SCSS（variables, mixins, game.scss）
```

## 開発コマンド

```bash
yarn install              # 依存関係インストール
yarn dev                  # Vite のみ（開発用 Firebase プロジェクトに接続・推奨）
yarn dev:emulator         # Emulator + Vite（開発用プロジェクト未作成時の代替）
yarn emulators            # Firestore Emulator のみ
yarn deploy:firestore:dev # 開発用プロジェクトにルールをデプロイ
yarn build:prod           # 本番ビルド
yarn deploy               # 本番 Firebase へデプロイ
```

### ローカル開発と本番の分離（方針）

| 方法 | コマンド | 本番への影響 | おすすめ度 |
|------|----------|-------------|-----------|
| **開発用 Firebase プロジェクト** | `yarn dev` | なし（別 DB） | ★ 推奨 |
| Firestore Emulator | `yarn dev:emulator` | なし（ローカル DB） | 代替・オフライン向け |
| 本番プロジェクト直結 | （非推奨） | **あり** | ✗ |

**結論:** Emulator だけをデフォルトにするのは Java 21・firebase-tools など依存が重く、このプロジェクトには過剰です。**開発用 Firebase プロジェクトを分ける方式がベスト**です。

#### 推奨: 開発用 Firebase プロジェクト

1. [Firebase Console](https://console.firebase.google.com/) で `vue-101-game-dev` を新規作成
2. Firestore を有効化
3. Web アプリを追加し、設定値を `.env.development.local` に記入（`env.development.example` 参照）
4. 開発用ルールをデプロイ: `yarn deploy:firestore:dev`
5. `yarn dev` で開発開始

#### 代替: Emulator（開発用プロジェクト未作成時）

```bash
yarn dev:emulator
```

- `.env.emulator.local` を使用（`env.emulator.example` 参照）
- Java 21 以上（`brew install openjdk@21`）
- Firebase CLI（`npm install -g firebase-tools`）
- Emulator UI: http://localhost:4000

## 環境変数

| ファイル | 用途 |
|---------|------|
| `.env.development.local` | `yarn dev`（開発用 Firebase） |
| `.env.emulator.local` | `yarn dev:emulator` |
| `.env.production.local` | `yarn build:prod` / `yarn deploy`（本番） |

テンプレート: `env.development.example` / `env.emulator.example` / `env.production.example`

## コーディング規約

### Vue / TypeScript

- Composition API + `<script setup lang="ts">` を使う
- コンポーネントは Atomic Design 風に `atoms` / `molecules` / `organisms` に配置
- 型定義は `src/types/` に置く
- 新規コンポーネントは既存の命名・import スタイルに合わせる

### スタイル

- **Mobile First** — 基本スタイルはモバイル向け。`respond-to(md)` 以上でデスクトップ拡張
- SCSS を使用。`variables.scss` / `mixins.scss` は Vite 経由で自動 import
- レスポンシブは `@include respond-to(md)` 等の mixin を使う（`min-width` ベース）
- タップ領域・フォントサイズはモバイルで読みやすく・押しやすく
- ゲームボタンは `.game-button`（`game.scss`）を使う。色バリエーション: `.orange`, `.red`, `.green`
- トップページのボタンは `disabled` 時も `opacity` を下げない（`Homepage.vue` で上書き済み）

### Firebase

- DB 接続は `@/services/firebase/config` の `getFirestoreDB()` 経由
- ルームコードは 5 文字のランダム文字列
- ホストは名前の先頭に `H`、参加者は `C` を付与

### 国際化（i18n）

- `vue-i18n` を使用。翻訳ファイル: `src/i18n/locales/ja.ts`（デフォルト）, `en.ts`
- デフォルト言語は **日本語**。`localStorage` の `locale` キーで永続化
- 言語切替 UI: 右上ギアアイコン（`LanguageSettings.vue`）
- 新しい UI 文言はハードコードせず locale ファイルに追加する

### 変更時の注意

- **スコープを最小限に** — 依頼と無関係なリファクタはしない
- **README / ドキュメントは依頼がない限り追加しない**
- **git commit / push はユーザーが明示したときだけ**
- UI 文言は `vue-i18n` で管理（デフォルト: 日本語、`AGENTS.md` 参照）

### CSS 変更時の必須確認

**CSS / スタイル（SCSS、コンポーネントの `<style>`）を変更した場合は、作業完了前に必ず以下を行うこと。**

1. `yarn dev` で localhost を起動する
2. **モバイル幅（375px 前後）** でブラウザの DevTools を使い、変更した画面を確認する
3. 要素の重なり・はみ出し・タップしづらさがないことを確認する
4. 問題があれば修正し、再度モバイルで確認してから終了する

> CSS 変更後にモバイル確認をせずに作業を終了しない。

## 検証

変更後は可能なら以下を確認:

1. `yarn dev` で起動できること
2. トップページで名前入力 → CREATE GAME / JOIN GAME
3. 名前 7 文字以上で Warning が表示されること
4. TypeScript エラーがないこと
5. **モバイル幅（〜600px）でレイアウト・操作性に問題がないこと**
6. デスクトップ幅でも表示が崩れないこと

## 参考ドキュメント

- `README.md` — 概要・セットアップ
- `SETUP.md` — クイックスタート
- `FIREBASE_SETUP.md` — Firebase 設定手順
- `VOLTA_SETUP.md` — Volta による Node/Yarn 管理
