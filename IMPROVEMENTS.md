# 101 ゲーム — 改善提案（優先順位付き）

最終更新: 2026-06-18

コードベース全体（Vue 3 / Pinia / Firestore / SCSS）を調査し、バグ・セキュリティ・アーキテクチャ・UX/UI・テスト・運用の観点で改善点を整理したドキュメントです。

UX/UI に特化した旧版は [`UX-UI-IMPROVEMENTS.md`](./UX-UI-IMPROVEMENTS.md) を参照。本ドキュメントは **2026-06-18 時点の実装状況** を反映しています。

---

## 優先度の定義

| 優先度 | 意味 | 目安 |
|--------|------|------|
| **P0** | 今すぐ対応すべき | データ破壊・不正操作・ゲーム進行不能 |
| **P1** | 早期対応推奨 | 体験の核心・品質基盤・運用リスク |
| **P2** | 中期で対応 | 使いやすさ向上・保守性・コスト最適化 |
| **P3** | 余裕があれば | 仕上げ・演出・将来拡張 |

効果: ★★★（大） / ★★（中） / ★（小）  
工数: 小（〜半日） / 中（1〜2日） / 大（3日〜）

---

## 既に実装済み（調査時点）

以前の提案から、以下は **完了または部分実装済み** です。

| 項目 | 状態 | 主なファイル |
|------|------|-------------|
| ターン計算の集約 | ✅ | `src/utils/turn.ts` |
| 終了・退出ロジックの共通化 | ✅ | `src/composables/useGameActions.ts` |
| `isMyTurn` の実装 | ✅ | `src/stores/game.ts` |
| 遊び方ガイド | ✅ | `GameGuide.vue`、設定・待機画面から起動 |
| Toast（`alert` 置換） | ✅ | `Toast.vue` |
| 手番タイムアウト | ✅ | ホスト設定 0/5〜60秒、カウントダウン表示 |
| オンライン状態（presence） | ✅ | `usePresence.ts`、緑/灰ドット |
| 山札残数・Dbl バッジ | ✅ | `MiddleInfo.vue`、`Play.vue` |
| ランキング演出（紙吹雪・ハイライト） | 部分 | `Confetti.vue`、`RankingList.vue` |
| 設定からのゲーム操作 | 部分 | `LanguageSettings.vue`（後述の挙動ギャップあり） |
| 待機画面の並べ替え・ランダム順 | ✅ | `WaitingList.vue` |

---

## P0 — クリティカル（最優先）

### 1. ホストのリロードでゲーム状態がリセットされる

**効果** ★★★ / **工数** 小

`Game.vue` の `onMounted` で、ホストがマウントするたび `initGameState` を初期値で `setDoc` しています。プレイ中にホストがページをリロードすると、**進行中のゲームが全消去**されます。

```109:131:src/views/Game.vue
  // ホストの場合のみinitGameStateを初期化
  if (roomStore.isHost) {
    const playedCardsPile = ['N00']
    setDoc(doc(getFirestoreDB(), 'initGameState', roomCodeParam), {
      startFlag: false,
      // ... 全フィールドを初期値で上書き
    })
```

**対応案**: ドキュメントが既に存在する場合は初期化をスキップ。新規ルーム作成時のみ初期化（`FormHost` 側に移す等）。

---

### 2. Firestore セキュリティルールが実質オープン

**効果** ★★★ / **工数** 大

5文字のルームコードを知るだけで、`users` / `initGameState` / `presence` を **任意に読み書き**できます。手番・合計・手札・参加者の改ざんが可能です。

```12:24:firestore.rules
    match /users/{roomCode} {
      allow read, write: if isValidRoomCode(roomCode);
  }
    match /initGameState/{roomCode} {
      allow read, write: if isValidRoomCode(roomCode);
    }
```

**対応案（段階的）**:

1. **短期**: Cloud Functions でカードプレイ・フォールドを検証し、クライアント直書きを廃止
2. **中期**: Firebase Anonymous Auth + カスタムクレームで「このルームのこのプレイヤー」のみ書き込み許可
3. **最低限**: フィールド単位のバリデーション（`totalNumber` の範囲、`turn` が参加者に含まれる等）

> 現状は「カジュアルな友人同士のゲーム」前提。公開運用・不特定多数向けなら **P0 として最優先**。

---

### 3. なりすまし可能な認証モデル

**効果** ★★★ / **工数** 大（#2 とセット）

`currentUser` は URL クエリ（`H名前` / `C名前`）のみ。Firebase Auth 未使用のため、URL を書き換えるだけで他プレイヤーになりすませます。

**対応案**: #2 の Auth 導入と合わせ、参加時にサーバー側でプレイヤー ID を発行し URL に埋め込む。

---

### 4. カードプレイのレースコンディション

**効果** ★★★ / **工数** 中〜大

`Play.vue` のカード処理は `updateDoc` のみ。同時に2人が操作すると手札・ターン・合計が不整合になる可能性があります。

**対応案**: Firestore トランザクション、または Cloud Functions 経由の単一書き込みパス。`Play.vue` 内の約270行の `switch` ロジックは `utils/cardPlay.ts` 等へ抽出してテスト可能にする。

---

## P1 — 高優先（早期対応推奨）

### UX — ゲーム体験の核心

| # | 項目 | 効果 | 工数 | 現状・ギャップ |
|---|------|------|------|----------------|
| 5 | **101 メーターの常時表示** | ★★★ | 中 | `MiddleInfo.vue` は「合計を確認」ボタンで **2秒だけ** 表示。ゲームの最重要情報が常時見えない |
| 6 | **相手の残り手札枚数** | ★★ | 小 | `play.cardsUnit`（「枚」）は i18n にあるが UI 未使用。`PlayerListItem` にバッジ追加 |
| 7 | **進行方向（`isReturn`）の UI 表示** | ★★ | 小 | 並び順計算にのみ使用。矢印・「逆回り」バッジが無い |
| 8 | **カード画像の白枠除去** | ★★★ | 中 | PNG アセットに白枠が焼き込み。`drop-shadow` のみでは根本解決にならない（[`UX-UI-IMPROVEMENTS.md` §1](./UX-UI-IMPROVEMENTS.md) 参照） |
| 9 | **設定の「ゲームを終了」の挙動整理** | ★★ | 小 | ホスト確認後は `returnToWaitingAsHost`（待機へリセット）。`closeRoomAsHost`（全員終了）は import されるが **設定から未使用**。UX 仕様と実装の乖離 |

---

### 品質基盤

| # | 項目 | 効果 | 工数 | 詳細 |
|---|------|------|------|------|
| 10 | **ユニットテストの導入** | ★★★ | 中 | テストファイル **0 件**。最優先: `turn.ts`、`foldPlayer.ts`、カード合計計算ロジック |
| 11 | **`yarn typecheck` / CI** | ★★ | 小 | `package.json` に typecheck・test スクリプトなし。GitHub Actions も未設定 |
| 12 | **`Play.vue` ロジックの抽出** | ★★ | 中 | カード処理・ターン更新が1ファイルに集中。保守・テストが困難 |
| 13 | **デッドコードの削除** | ★★ | 中 | 未使用: `useRoom.ts`、`useGame.ts`、`usePlayers.ts`、`useFirestore.ts`、`stores/user.ts`、`utils/errorHandler.ts`（未接続）、`services/firebase/functions.ts`、旧 `rooms`/`games` 向け Cloud Functions |

---

### エラーハンドリング・エッジケース

| # | 項目 | 効果 | 工数 | 詳細 |
|---|------|------|------|------|
| 14 | **エラー時のユーザー通知** | ★★ | 中 | 30箇所以上が `console.error` のみ。Toast / Warning でフィードバック |
| 15 | **手番タイムアウトのホスト依存** | ★★ | 中 | タイムアウト処理はホストクライアントのみ実行。ホスト切断・AFK だとタイマーが止まる |
| 16 | **ルーム作成時の衝突チェック** | ★★ | 小 | `FormHost.vue` が既存 `users` ドキュメントを `setDoc` で上書き可能 |
| 17 | **放棄ルームの TTL** | ★★ | 中 | 退出後も Firestore にデータが永続。Cloud Functions の `cleanupRooms` は未使用の旧コレクション向け |

---

## P2 — 中優先

### パフォーマンス・運用

| # | 項目 | 効果 | 工数 | 詳細 |
|---|------|------|------|------|
| 18 | **presence の書き込み最適化** | ★★ | 小 | 8秒ごとに `setDoc`。6人 × 複数タブで書き込み増。退出時のクリーンアップも未実装 |
| 19 | **Firestore リスナーの整理** | ★★ | 中 | ゲーム中: `users` + `initGameState` + `presence` = クライアントあたり3本 |
| 20 | **カード画像のプリロード** | ★ | 小 | 21枚 PNG を動的 import。初回表示のちらつき・遅延の可能性 |
| 21 | **冗長な `getDoc`** | ★ | 小 | 削除時に snapshot 済みデータを再取得（`PlayerList.vue`、`WaitingList.vue`） |

---

### アクセシビリティ（a11y）

| # | 項目 | 効果 | 工数 | 詳細 |
|---|------|------|------|------|
| 22 | **`maximum-scale=1.0` の撤廃** | ★★ | 小 | `index.html` でピンチズーム不可。WCAG 違反リスク |
| 23 | **Modal のフォーカストラップ** | ★★ | 小 | `aria-modal`、Esc キー、フォーカス復帰なし（`Modal.vue`） |
| 24 | **削除ボタンのタップ領域** | ★★ | 小 | 22〜28px。44px 推奨未達（`PlayerListItem.vue`、`WaitingListItem.vue`） |
| 25 | **カード `alt` の改善** | ★ | 小 | `card-N07` 等の技術名のみ。効果名・i18n 対応が望ましい |
| 26 | **オンライン状態の色以外表現** | ★ | 小 | 緑/灰ドットのみ。スクリーンリーダー向けテキストラベル追加 |

---

### i18n・文言

| # | 項目 | 効果 | 工数 | 詳細 |
|---|------|------|------|------|
| 27 | **ハードコード文言の i18n 化** | ★★ | 小 | `WaitingListItem` の "Player N"、aria-label の英語固定、`errorHandler.ts` の日本語固定 |
| 28 | **en.ts の品質** | ★ | 小 | `errorPage.message` の文法エラー（"can not found"）、`play.cardsUnit` が空文字 |
| 29 | **未使用 i18n キーの整理** | ★ | 小 | `ranking.yourRank` 等、定義のみで UI 未使用 |

---

### モバイル・レスポンシブ

| # | 項目 | 効果 | 工数 | 詳細 |
|---|------|------|------|------|
| 30 | **ゲームコードとギアアイコンの重なり** | ★★ | 小 | 狭い画面で `TopInfo` のコード表示が圧迫される可能性 |
| 31 | **手札の横スクロール発見性** | ★ | 小 | 6枚超で `overflow-x: auto`。スクロール可能であることが分かりにくい |
| 32 | **Loading / Ranking の inline style** | ★ | 小 | `margin: 50% 0` 等、モバイルで位置が不安定 |

---

## P3 — 低優先（仕上げ・拡張）

| # | 項目 | 効果 | 工数 | 詳細 |
|---|------|------|------|------|
| 33 | 効果音・触覚フィードバック | ★★ | 中 | 手番開始時の vibrate / SE、ミュート設定 |
| 34 | Web Share API | ★ | 小 | 招待リンクのネイティブ共有 |
| 35 | PWA 強化 | ★ | 小 | `manifest.json` のみ。オフライン案内・ホーム追加プロンプト |
| 36 | カード長押しツールチップ | ★ | 小 | ガイドモーダル以外のインライン説明 |
| 37 | `getCardImage` の共通化 | ★ | 小 | `Play.vue` / `MiddleInfo.vue` / `GameGuide.vue` に重複 |
| 38 | Google Fonts の self-host | ★ | 小 | 外部読み込み。オフライン・パフォーマンス影響 |
| 39 | 型の整理 | ★ | 小 | `as any` の除去、`InitGameState` 型と実態の乖離、`validateRoomCode` と生成器の大文字/小文字不一致 |

---

## 優先順位サマリー（推奨着手順）

```
P0  ① ホスト setDoc リセット修正
    ② カードプレイのトランザクション化（または Functions 化）
    ③ Firestore ルール + 認証強化（公開運用するなら必須）

P1  ④ 101 メーター常時表示
    ⑤ turn.ts / foldPlayer / カードロジックのユニットテスト
    ⑥ 相手の手札枚数バッジ
    ⑦ 設定の終了挙動を仕様と整合
    ⑧ カード白枠アセット処理
    ⑨ デッドコード削除 + Play.vue 抽出

P2  ⑩ エラーの Toast 化
    ⑪ presence クリーンアップ・書き込み最適化
    ⑫ a11y（ズーム許可・Modal・タップ領域）
    ⑬ i18n 残件・放棄ルーム TTL

P3  ⑭ 音・Share API・PWA
    ⑮ 細かなリファクタ・演出
```

---

## 技術的負債マップ

```
src/
├── views/
│   ├── Game.vue      … P0: ホスト初期化バグ / snapshot ロジックの重複
│   └── Play.vue      … P0/P1: 巨大 switch・レースコンディション
├── composables/
│   ├── useGameActions.ts  ✅ 終了処理は集約済み
│   ├── useRoom.ts         ❌ 未使用（削除候補）
│   ├── useGame.ts         ❌ 未使用
│   ├── usePlayers.ts      ❌ 未使用
│   └── usePresence.ts     … P2: クリーンアップ・書き込み頻度
├── utils/
│   ├── turn.ts            ✅ 集約済み → テスト追加
│   ├── foldPlayer.ts      … テスト追加
│   ├── errorHandler.ts    ❌ 未接続・i18n 外
│   └── roomUtils.ts       … 未使用バリデーションあり
├── stores/
│   └── user.ts            ❌ 未使用
├── functions/             ❌ 旧設計・クライアント未使用
└── firestore.rules        … P0: 全読み書き許可
```

---

## テスト戦略（現状ゼロ → 導入案）

### 最優先ユニットテスト

| 対象 | テストすべき境界 |
|------|------------------|
| `getNextTurn` / `getPrevTurn` / `getTurnAfter` | 1人・脱落後・`isReturn` 時 |
| `foldPlayer` | 勝者判定・`gameOver`・`ranking` 更新 |
| カード合計計算（抽出後） | 101超過・`Dbl` 倍化・`Hnd`→101・`Pas`/`Trn` |

### 統合・E2E（中期）

- ルーム作成 → 参加 → スタート → 1手プレイ → フォールド → ランキング
- ホストの `returnToWaitingAsHost` / `closeRoomAsHost`
- 手番タイムアウト（ホスト切断時の挙動）
- 参加者退出・`Rejoin` フロー

### 推奨ツール

- **Vitest** + `@vue/test-utils`（ユニット）
- **Playwright** または **Cypress**（E2E）
- `@firebase/rules-unit-testing`（Firestore ルール）

---

## 関連ドキュメント

| ファイル | 内容 |
|----------|------|
| [`UX-UI-IMPROVEMENTS.md`](./UX-UI-IMPROVEMENTS.md) | UX/UI 特化の旧提案（一部実装済み） |
| [`AGENTS.md`](./AGENTS.md) | 開発ルール・Mobile First 方針 |
| [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) | Firebase 設定手順 |

---

## 進め方の提案

1. **P0-1（ホストリロード）** … 即日修正可能。影響範囲が小さく効果が大きい。
2. **P1-5（101メーター）+ P1-6（手札枚数）** … UX 改善で体感が最も変わる。
3. **P1-10（テスト）+ P1-12（Play.vue 抽出）** … 以降の変更を安全に進める土台。
4. **P0-2〜4（セキュリティ）** … 友人同士のカジュアル利用なら後回しも可。公開・不特定多数向けなら前倒し。

実装に進める項目が決まれば、該当ファイルへの具体的な変更まで対応できます。
