/**
 * 多言語対応のためのロケールデータ
 * Locale data for internationalization
 */

class Locale {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.translations = {
      'ja': {
        // ヘッダー
        'app_title': 'Ollama Client',
        'full_window_title': 'Ollama Client - Full Window',
        
        // ボタン
        'clear_chat': '📝',
        'open_window': '🗗',
        'settings': '⚙️',
        'send': '送信',
        'save': '保存',
        'close': '閉じる',
        'refresh': '↻',
        
        // 設定項目
        'ollama_host': 'Ollama Host:',
        'model': 'Model:',
        'system_prompt': 'System Prompt:',
        'host_placeholder': 'http://localhost:11434',
        'system_prompt_placeholder': 'あなたは親切なAIアシスタントです。',
        
        // メッセージ
        'message_placeholder': 'メッセージを入力してください...',
        'initial_message': 'こんにちは！何でもお聞きください。',
        'loading': '読み込み中...',
        'thinking': '考え中...',
        
        // 確認メッセージ
        'clear_chat_confirm': 'チャット履歴をクリアしますか？',
        
        // エラーメッセージ
        'error_send_message': 'メッセージの送信に失敗しました',
        'error_load_models': 'モデルの読み込みに失敗しました',
        'error_connection': '接続エラーが発生しました',
        'error_invalid_response': '無効なレスポンスです',
        'settings_saved': '設定が保存されました',
        'settings_load_error': '設定の読み込みに失敗しました',
        
        // ツールチップ
        'tooltip_clear': 'チャット履歴をクリア',
        'tooltip_window': '新しいウィンドウで開く',
        'tooltip_settings': '設定',
        'tooltip_templates': 'テンプレート管理',
        'tooltip_refresh_models': 'モデル一覧を更新',
        
        // テンプレート
        'templates': 'テンプレート',
        'template_select': 'テンプレート選択:',
        'template_select_placeholder': '-- テンプレートを選択 --',
        
        // アクセシビリティ
        'aria_chat_container': 'チャットメッセージ一覧',
        'aria_message_input': 'メッセージ入力欄',
        'aria_send_button': 'メッセージ送信ボタン',
        'aria_settings_panel': '設定パネル'
      },
      
      'en': {
        // Header
        'app_title': 'Ollama Client',
        'full_window_title': 'Ollama Client - Full Window',
        
        // Buttons
        'clear_chat': '📝',
        'open_window': '🗗',
        'settings': '⚙️',
        'send': 'Send',
        'save': 'Save',
        'close': 'Close',
        'refresh': '↻',
        
        // Settings
        'ollama_host': 'Ollama Host:',
        'model': 'Model:',
        'system_prompt': 'System Prompt:',
        'host_placeholder': 'http://localhost:11434',
        'system_prompt_placeholder': 'You are a helpful AI assistant.',
        
        // Messages
        'message_placeholder': 'Type your message...',
        'initial_message': 'Hello! Feel free to ask me anything.',
        'loading': 'Loading...',
        'thinking': 'Thinking...',
        
        // Confirmation messages
        'clear_chat_confirm': 'Are you sure you want to clear the chat history?',
        
        // Error messages
        'error_send_message': 'Failed to send message',
        'error_load_models': 'Failed to load models',
        'error_connection': 'Connection error occurred',
        'error_invalid_response': 'Invalid response',
        'settings_saved': 'Settings saved',
        'settings_load_error': 'Failed to load settings',
        
        // Tooltips
        'tooltip_clear': 'Clear chat history',
        'tooltip_window': 'Open in new window',
        'tooltip_settings': 'Settings',
        'tooltip_templates': 'Template Manager',
        'tooltip_refresh_models': 'Refresh model list',
        
        // Templates
        'templates': 'Templates',
        'template_select': 'Template Selection:',
        'template_select_placeholder': '-- Select Template --',
        
        // Accessibility
        'aria_chat_container': 'Chat messages list',
        'aria_message_input': 'Message input field',
        'aria_send_button': 'Send message button',
        'aria_settings_panel': 'Settings panel'
      }
    };
  }
  
  /**
   * ブラウザの言語設定を検出する
   * Detect browser language settings
   */
  detectLanguage() {
    // ブラウザの言語設定を取得
    const browserLang = navigator.language || navigator.userLanguage;
    
    // 日本語の場合は'ja'を返す
    if (browserLang.startsWith('ja')) {
      return 'ja';
    }
    
    // デフォルトは英語
    return 'en';
  }
  
  /**
   * 保存された言語設定を読み込む
   * Load saved language preference
   */
  async loadLanguagePreference() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['language']);
        if (result.language && this.translations[result.language]) {
          this.currentLang = result.language;
        }
      } else {
        // フォールバック：localStorageを使用
        const savedLang = localStorage.getItem('ollama_chat_language');
        if (savedLang && this.translations[savedLang]) {
          this.currentLang = savedLang;
        }
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error);
    }
  }
  
  /**
   * 言語設定を保存する
   * Save language preference
   */
  async saveLanguagePreference(lang) {
    if (!this.translations[lang]) {
      console.warn('Unsupported language:', lang);
      return;
    }
    
    this.currentLang = lang;
    
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ language: lang });
      } else {
        // フォールバック：localStorageを使用
        localStorage.setItem('ollama_chat_language', lang);
      }
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }
  
  /**
   * 翻訳テキストを取得する
   * Get translated text
   */
  t(key, defaultText = null) {
    const translation = this.translations[this.currentLang]?.[key];
    
    if (translation) {
      return translation;
    }
    
    // フォールバック：英語を試す
    if (this.currentLang !== 'en') {
      const englishTranslation = this.translations['en']?.[key];
      if (englishTranslation) {
        return englishTranslation;
      }
    }
    
    // フォールバック：デフォルトテキストまたはキー名を返す
    return defaultText || key;
  }
  
  /**
   * 現在の言語を取得する
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLang;
  }
  
  /**
   * 利用可能な言語一覧を取得する
   * Get available languages
   */
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }
  
  /**
   * 言語を切り替える
   * Switch language
   */
  async switchLanguage(lang) {
    await this.saveLanguagePreference(lang);
    
    // UIを更新するためのイベントを発火
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lang } 
      }));
    }
  }
  
  /**
   * DOM要素にテキストを適用する
   * Apply text to DOM elements
   */
  applyToElement(element, key, attribute = 'textContent') {
    if (!element) return;
    
    const text = this.t(key);
    if (attribute === 'textContent') {
      element.textContent = text;
    } else if (attribute === 'placeholder') {
      element.placeholder = text;
    } else if (attribute === 'title') {
      element.title = text;
    } else if (attribute === 'aria-label') {
      element.setAttribute('aria-label', text);
    } else {
      element.setAttribute(attribute, text);
    }
  }
  
  /**
   * data-locale属性を持つ要素を自動的に翻訳する
   * Automatically translate elements with data-locale attribute
   */
  translatePage() {
    const elements = document.querySelectorAll('[data-locale]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-locale');
      const attribute = element.getAttribute('data-locale-attr') || 'textContent';
      this.applyToElement(element, key, attribute);
    });
  }
}

// グローバルインスタンスを作成
const locale = new Locale();

// ページ読み込み時に言語設定を適用
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    await locale.loadLanguagePreference();
    locale.translatePage();
  });
  
  // 言語変更イベントリスナー
  window.addEventListener('languageChanged', () => {
    locale.translatePage();
  });
}

// モジュールとしてもエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Locale;
}
