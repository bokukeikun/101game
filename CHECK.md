# 動作確認チェックリスト

## 前提条件の確認

### 1. Node.jsの確認
新しいPowerShellまたはコマンドプロンプトを開いて実行：

```powershell
node --version
```

**期待結果**: v20.11.0以上が表示される

### 2. Yarnの確認
```powershell
yarn --version
```

**期待結果**: 3.6.4以上が表示される（またはCorepackが有効化される）

## セットアップ手順

### 1. プロジェクトディレクトリに移動
```powershell
cd C:\Users\oneie\Documents\AI\vue-101
```

### 2. Yarn 3のセットアップ（初回のみ）
```powershell
corepack enable
corepack prepare yarn@3.6.4 --activate
```

### 3. 依存関係のインストール
```powershell
yarn install
```

**期待結果**: 
- `node_modules`フォルダが作成される
- エラーなくインストールが完了する

### 4. 開発サーバーの起動
```powershell
yarn dev
```

**期待結果**:
- サーバーが起動する
- `http://localhost:5173` が表示される
- エラーが表示されない

## 動作確認項目

### ホームページ (`/`)
- [ ] ページが表示される
- [ ] ロゴ（プレースホルダー）が表示される
- [ ] 名前入力フォームが表示される
- [ ] "Create Room"ボタンが表示される
- [ ] 名前を入力してボタンをクリックできる

### ルーム参加 (`/?roomCode=XXXXX`)
- [ ] URLに`roomCode`パラメータがある場合、参加フォームが表示される
- [ ] "Join Room"ボタンが表示される
- [ ] 名前を入力して参加できる

### ゲーム画面 (`/play?roomCode=XXXXX&currentUser=HXXXXX`)
- [ ] ローディング画面が表示される（Firebase設定がない場合）
- [ ] または、待機画面が表示される

## トラブルシューティング

### エラー: `Cannot find module`
**解決方法**:
```powershell
# node_modulesを削除して再インストール
Remove-Item -Recurse -Force node_modules
yarn install
```

### エラー: `Port 5173 is already in use`
**解決方法**:
別のポートを使用するか、使用中のプロセスを終了

### エラー: Firebase関連のエラー
**解決方法**:
`.env.local`ファイルを作成してFirebase設定を追加（開発環境では必須ではありません）

### エラー: TypeScriptエラー
**解決方法**:
```powershell
# TypeScriptの型チェックをスキップして起動（開発時のみ）
# vite.config.tsで型チェックを無効化するか、エラーを修正
```

## 正常に動作している場合の確認

1. **ホームページが表示される**
   - フォームが表示される
   - スタイルが適用されている

2. **コンソールにエラーが表示されない**
   - ブラウザの開発者ツール（F12）で確認
   - Consoleタブにエラーがない

3. **ViteのHMR（Hot Module Replacement）が動作**
   - ファイルを編集すると自動的にブラウザが更新される

## 次のステップ

動作確認が完了したら：
1. Firebase設定を追加（`.env.local`）
2. Playビューの実装
3. Rankingビューの実装
4. 画像アセットの追加
