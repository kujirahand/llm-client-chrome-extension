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
        'clear_all_logs_confirm': 'すべてのチャットログを削除しますか？この操作は元に戻せません。',
        'delete_selected_log_confirm': 'このチャットログを削除しますか？この操作は元に戻せません。',
        
        // エラーメッセージ
        'error_send_message': 'メッセージの送信に失敗しました',
        'error_load_models': 'モデルの読み込みに失敗しました',
        'error_connection': '接続エラーが発生しました',
        'error_invalid_response': '無効なレスポンスです',
        'error_ollama_connection': 'Ollamaサーバーに接続できません。サーバーが起動していることとCORS設定を確認してください。',
        'settings_saved': '設定が保存されました',
        'settings_load_error': '設定の読み込みに失敗しました',
        
        // ログメッセージ
        'log_attempting_cors_setup': 'CORSルールのセットアップを試行中...',
        'log_cors_setup_success': 'CORSルールが正常にセットアップされました',
        'log_cors_setup_unknown': 'CORSセットアップが不明な状態で完了しました',
        'log_chrome_runtime_not_available': 'Chrome runtimeが利用できません。CORSセットアップをスキップします',
        'log_cors_setup_warning': 'CORSセットアップの警告（致命的ではありません）',
        'log_cors_setup_failed': 'CORSルールのセットアップに失敗しました（致命的ではありません）',
        'log_sending_request': 'リクエストを送信中',
        'log_request_data': 'リクエストデータ',
        'log_response_status': 'レスポンスステータス',
        'log_response_headers': 'レスポンスヘッダー',
        'log_error_response': 'エラーレスポンス',
        'log_fetch_error': 'フェッチエラー',
        'log_json_parse_error': 'JSON解析エラー',
        'log_json_parse_error_partial': 'JSON解析エラー（部分行）',
        
                // Tooltips
        'tooltip_clear': 'チャット履歴をクリア',
        'tooltip_window': '新しいウィンドウで開く',
        'tooltip_settings': '設定',
        'tooltip_templates': 'テンプレート管理',
        'tooltip_logs': 'チャットログ',
        'tooltip_refresh_models': 'モデル一覧を更新',
        
        // テンプレート
                // Templates
        'templates': 'テンプレート',
        'template_select': 'テンプレート選択:',
        'template_select_placeholder': '-- テンプレートを選択 --',
        
        // Chat Logs
        'logs': 'ログ',
        'chat_logs': 'チャットログ',
        'chat_history_list': 'チャット履歴一覧',
        'back_to_chat': 'チャットに戻る',
        'clear_all_logs': '全削除',
        'delete_selected_log': '削除',
        'continue_chat': '会話を続ける',
        'no_chat_logs': 'チャットログがありません',
        'select_chat_to_view': 'チャットを選択してください',
        'select_chat_from_left': '左側からチャットを選択してください',
        
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
                // Confirmation messages
        'clear_chat_confirm': 'Clear chat history?',
        'clear_all_logs_confirm': 'Delete all chat logs? This action cannot be undone.',
        'delete_selected_log_confirm': 'Delete this chat log? This action cannot be undone.',
        
        // Error messages
        'error_send_message': 'Failed to send message',
        'error_load_models': 'Failed to load models',
        'error_connection': 'Connection error occurred',
        'error_invalid_response': 'Invalid response',
        'error_ollama_connection': 'Unable to connect to Ollama server. Please check if the server is running and CORS settings are configured.',
        'settings_saved': 'Settings saved',
        'settings_load_error': 'Failed to load settings',
        
        // Log messages
        'log_attempting_cors_setup': 'Attempting to setup CORS rules...',
        'log_cors_setup_success': 'CORS rules setup successfully',
        'log_cors_setup_unknown': 'CORS setup completed with unknown status',
        'log_chrome_runtime_not_available': 'Chrome runtime not available, skipping CORS setup',
        'log_cors_setup_warning': 'CORS setup warning (non-fatal)',
        'log_cors_setup_failed': 'CORS rules setup failed (non-fatal)',
        'log_sending_request': 'Sending request to',
        'log_request_data': 'Request data',
        'log_response_status': 'Response status',
        'log_response_headers': 'Response headers',
        'log_error_response': 'Error response',
        'log_fetch_error': 'Fetch error',
        'log_json_parse_error': 'JSON parse error',
        'log_json_parse_error_partial': 'JSON parse error for partial line',
        
        // Tooltips
        'tooltip_clear': 'Clear chat history',
        'tooltip_window': 'Open in new window',
        'tooltip_settings': 'Settings',
        'tooltip_templates': 'Template Manager',
        'tooltip_logs': 'Chat Logs',
        'tooltip_refresh_models': 'Refresh model list',
        
        // Templates
        'templates': 'Templates',
        'template_select': 'Template Selection:',
        'template_select_placeholder': '-- Select Template --',
        
        // Chat Logs
        'logs': 'Logs',
        'chat_logs': 'Chat Logs',
        'chat_history_list': 'Chat History List',
        'back_to_chat': 'Back to Chat',
        'clear_all_logs': 'Clear All',
        'delete_selected_log': 'Delete',
        'continue_chat': 'Continue Chat',
        'no_chat_logs': 'No chat logs available',
        'select_chat_to_view': 'Select a chat to view',
        'select_chat_from_left': 'Please select a chat from the left',
        
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
