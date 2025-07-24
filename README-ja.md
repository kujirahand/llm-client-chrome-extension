# Ollama Client for Chrome Extension

Google ChromeでOllama APIを使ってチャットができる拡張機能です。

## 機能

- Ollama APIとの直接通信
- **ストリーミング応答**: リアルタイムでの文字表示
- **設定画面**: ホスト、モデル、システムプロンプトの変更
- **自動CORS対応**: Chrome拡張の権限を使った接続問題の解決
- シンプルなチャットインターフェース
- チャット履歴の保存
- **多言語対応**: 日本語と英語のUI

## セットアップ

### 1. Ollamaのインストールと起動

まず、Ollamaをインストールして起動してください：

```bash
# Ollamaのインストール（macOS）
curl -fsSL https://ollama.ai/install.sh | sh

# モデルのダウンロード
ollama pull gemma3:4b

# CORS対応でOllamaサーバーの起動
OLLAMA_ORIGINS=chrome-extension://* ollama serve
```

**重要**: Chrome拡張からアクセスするため、CORS設定が必要です。上記のように `OLLAMA_ORIGINS=chrome-extension://*` を設定してサーバーを起動してください。

### 2. Chrome拡張のインストール

1. Chromeブラウザで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このプロジェクトのフォルダを選択

## 使い方

1. Chrome拡張のアイコンをクリック
2. 初回は⚙️ボタンで設定を確認・変更
3. メッセージを入力して送信
4. ストリーミングでリアルタイム応答を確認

### 設定項目

- **Ollama Host**: Ollamaサーバーのアドレス
- **Model**: 使用するモデル（自動取得）
- **System Prompt**: AIの性格や役割を設定
- **Language**: 日本語と英語を選択可能

## 多言語対応

拡張機能は日本語と英語のインターフェースに対応しています：

- **自動検出**: ブラウザの言語設定を自動検出
- **手動切り替え**: 設定の言語ドロップダウンから選択
- **設定保存**: 言語設定は保存されます

詳細については [LOCALE_USAGE.md](LOCALE_USAGE.md) をご覧ください。


## トラブルシューティング

### HTTP 403エラーが発生する場合

Chrome拡張からのアクセスが拒否される場合の対処法：

**方法1: Ollamaの設定変更（推奨）**

1. 現在のOllamaサーバーを停止（Ctrl+C）
2. 環境変数を設定してCORS対応で再起動：

   ```bash
   OLLAMA_ORIGINS="*" ollama serve
   ```

**方法2: Chrome拡張の完全再読み込み**

1. `chrome://extensions/` を開く
2. 拡張を一度「削除」
3. 「パッケージ化されていない拡張機能を読み込む」で再インストール
4. 権限を再度許可

**方法3: デバッグモードで確認**

1. 拡張のポップアップで右クリック → 「検証」
2. Consoleタブで詳細なエラー情報を確認
3. NetworkタブでHTTPリクエストの状況を確認

### Ollamaに接続できない場合

1. Ollamaサーバーが起動していることを確認
2. `http://localhost:11434` でアクセス可能か確認
3. ファイアウォール設定を確認

### モデルが見つからない場合

使用したいモデルがダウンロードされていることを確認：

```bash
ollama list
```

モデルがない場合はダウンロード：

```bash
ollama pull gemma3:4b
```

### 拡張機能の再読み込み

設定を変更した後は、Chrome拡張を再読み込みしてください：

1. `chrome://extensions/` を開く
2. 「Ollama Chat Extension」の更新ボタンをクリック
3. または拡張を一度削除して再インストール

### デバッグ方法

1. 拡張のポップアップで右クリック → 「検証」を選択
2. デベロッパーツールでConsoleタブを確認
3. エラーメッセージの詳細を確認

