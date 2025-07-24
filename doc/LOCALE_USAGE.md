# 多言語化機能の使用方法

## 概要
Ollama Chat Extensionは英語と日本語の多言語表示に対応しています。

## 機能

### 自動言語検出
- ブラウザの言語設定を自動検出し、適切な言語でUIを表示します
- 日本語環境では日本語、その他の環境では英語が初期設定されます

### 手動言語切り替え
1. 設定ボタン（⚙️）をクリック
2. 「Language」項目で言語を選択
3. 設定を保存すると即座にUIが切り替わります

### 対応言語
- **日本語 (ja)**: デフォルトの日本語UI
- **English (en)**: 英語UI

## 実装の詳細

### locale.js
多言語化を担当するメインファイル：
- 言語データの管理
- ブラウザ言語の自動検出
- 設定の保存・読み込み
- DOM要素への翻訳適用

### HTML属性
UIテキストを多言語化するために以下の属性を使用：
```html
<!-- テキストコンテンツの翻訳 -->
<button data-locale="send">送信</button>

<!-- プレースホルダーの翻訳 -->
<input data-locale="message_placeholder" data-locale-attr="placeholder" placeholder="メッセージを入力してください..." />

<!-- タイトル属性の翻訳 -->
<button data-locale="tooltip_settings" data-locale-attr="title" title="設定">⚙️</button>

<!-- aria-label属性の翻訳 -->
<div data-locale="aria_chat_container" data-locale-attr="aria-label" aria-label="Chat messages list">
```

### JavaScript API
```javascript
// 翻訳テキストの取得
const text = locale.t('message_placeholder');

// 言語切り替え
await locale.switchLanguage('en');

// 現在の言語取得
const currentLang = locale.getCurrentLanguage();

// ページ全体の翻訳適用
locale.translatePage();
```

## 新しい言語の追加方法

1. `locale.js`の`translations`オブジェクトに新しい言語を追加：
```javascript
'fr': {
  'send': 'Envoyer',
  'message_placeholder': 'Tapez votre message...',
  // ... その他の翻訳
}
```

2. HTMLの言語選択ドロップダウンに選択肢を追加：
```html
<select id="languageSelect">
  <option value="ja">日本語</option>
  <option value="en">English</option>
  <option value="fr">Français</option>
</select>
```

## 設定の保存場所
- Chrome Extension環境: `chrome.storage.local`
- その他の環境: `localStorage`

## イベント
言語変更時に`languageChanged`イベントが発火され、UIが自動更新されます：
```javascript
window.addEventListener('languageChanged', (event) => {
  console.log('Language changed to:', event.detail.language);
});
```
