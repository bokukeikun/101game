# Volta環境構築の確認と解決方法

## 問題
PowerShellで`yarn`コマンドが認識されない

## 原因
Voltaをインストールした後、現在のPowerShellセッションで環境変数が更新されていない可能性があります。

## 解決方法

### 方法1: 新しいPowerShellセッションを開く（推奨）
1. 現在のPowerShellウィンドウを閉じる
2. 新しいPowerShellウィンドウを開く
3. プロジェクトディレクトリに移動
```powershell
cd C:\Users\oneie\Documents\AI\vue-101
```
4. yarnコマンドを実行
```powershell
yarn --version
```

### 方法2: 環境変数を手動でリフレッシュ
現在のセッションで以下を実行：
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
yarn --version
```

### 方法3: Voltaのパスを直接使用
```powershell
& "C:\Program Files\Volta\yarn.cmd" --version
```

### 方法4: PowerShellプロファイルにVoltaを追加（永続的な解決）
PowerShellプロファイルを編集して、Voltaの初期化を追加：

1. プロファイルのパスを確認
```powershell
$PROFILE
```

2. プロファイルを編集（存在しない場合は作成）
```powershell
notepad $PROFILE
```

3. 以下を追加
```powershell
# Volta setup
$env:VOLTA_HOME = "$env:LOCALAPPDATA\Volta"
$env:PATH = "$env:VOLTA_HOME\bin;$env:PATH"
```

4. プロファイルを再読み込み
```powershell
. $PROFILE
```

## 確認コマンド

環境が正しく設定されているか確認：
```powershell
# Voltaのバージョン
volta --version

# Node.jsのバージョン（Volta管理）
node --version

# Yarnのバージョン（Volta管理）
yarn --version

# プロジェクトで使用中のバージョン
volta list
```

## 期待される結果

- `volta --version`: 2.0.2
- `node --version`: v20.11.0
- `yarn --version`: 3.6.4
- `volta list`: node@20.11.0, npm@10.2.4, yarn@3.6.4 が表示される
