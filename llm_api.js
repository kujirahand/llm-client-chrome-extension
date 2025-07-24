class LLMApi {
  constructor() {
    this.ollamaUrl = '';
    this.model = '';
    this.systemPrompt = '';
    this.abortController = null;
    
    // ローカライズ用のインスタンスを取得
    this.locale = (typeof locale !== 'undefined') ? locale : null;
  }
  
  // ローカライズされたテキストを取得
  t(key, defaultText = null) {
    return this.locale ? this.locale.t(key, defaultText) : (defaultText || key);
  }
  
  // 設定を読み込み
  loadSettings() {
    this.ollamaUrl = localStorage.getItem("host-address") || 'http://localhost:11434';
    this.model = localStorage.getItem("selected-model") || 'gemma3:4b';
    this.systemPrompt = localStorage.getItem("system-prompt") || '';
  }
  
  // CORSルールのセットアップ
  async setupCORSRules() {
    // CORSセットアップは必須ではないため、エラーが発生しても続行
    try {
      // chrome.runtime.sendMessageが利用可能かチェック
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        console.log(this.t('log_attempting_cors_setup', 'Attempting to setup CORS rules...'));
        
        // シンプルな同期的アプローチを試行
        chrome.runtime.sendMessage({
          action: 'updateCORSRules',
          host: this.ollamaUrl
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn(this.t('log_cors_setup_warning', 'CORS setup warning (non-fatal)') + ':', chrome.runtime.lastError.message);
          } else if (response && response.success) {
            console.log(this.t('log_cors_setup_success', 'CORS rules setup successfully'));
          } else {
            console.warn(this.t('log_cors_setup_unknown', 'CORS setup completed with unknown status'));
          }
        });
      } else {
        console.log(this.t('log_chrome_runtime_not_available', 'Chrome runtime not available, skipping CORS setup'));
      }
    } catch (error) {
      // CORSセットアップの失敗は致命的ではない
      console.warn(this.t('log_cors_setup_failed', 'CORS rules setup failed (non-fatal)') + ':', error.message);
    }
  }
  
  // モデル一覧を取得
  async fetchModels() {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to load models:', error);
      throw error;
    }
  }
  
  // 設定を保存
  saveSettings(ollamaUrl, model, systemPrompt) {
    this.ollamaUrl = ollamaUrl;
    this.model = model;
    this.systemPrompt = systemPrompt;
    
    localStorage.setItem('host-address', this.ollamaUrl);
    localStorage.setItem('selected-model', this.model);
    localStorage.setItem('system-prompt', this.systemPrompt);
    
    this.setupCORSRules();
  }
  
  // 処理を中止
  abort() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
  
  // ストリーミングでOllama APIを呼び出し
  async callOllamaAPIStream(prompt, onChunk, onComplete, onError) {
    // 既存の処理を中止
    this.abort();
    this.abortController = new AbortController();
    
    const requestData = {
      model: this.model,
      prompt: this.systemPrompt ? `${this.systemPrompt}\n\n${prompt}` : prompt,
      stream: true
    };
    
    console.log(this.t('log_sending_request', 'Sending request to') + ':', `${this.ollamaUrl}/api/generate`);
    console.log(this.t('log_request_data', 'Request data') + ':', requestData);
    
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: this.abortController.signal
      });
      
      console.log(this.t('log_response_status', 'Response status') + ':', response.status);
      console.log(this.t('log_response_headers', 'Response headers') + ':', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(this.t('log_error_response', 'Error response') + ':', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
      }
      
      await this.streamResponse(response, onChunk, onComplete);
      
    } catch (error) {
      console.error(this.t('log_fetch_error', 'Fetch error') + ':', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const errorMessage = this.t('error_ollama_connection', 'Ollamaサーバーに接続できません。サーバーが起動していることとCORS設定を確認してください。');
        onError(new Error(errorMessage));
      } else {
        onError(error);
      }
    } finally {
      this.abortController = null;
    }
  }
  
  // レスポンスをストリーミング処理
  async streamResponse(response, onChunk, onComplete) {
    const reader = response.body.getReader();
    let partialLine = '';
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // デコードして行ごとに分割
      const textChunk = new TextDecoder().decode(value);
      const lines = (partialLine + textChunk).split('\n');
      partialLine = lines.pop(); // 最後の行は不完全な可能性があります
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        try {
          const parsedResponse = JSON.parse(line);
          if (parsedResponse.response) {
            fullResponse += parsedResponse.response;
            onChunk(fullResponse);
          }
          
          // 完了チェック
          if (parsedResponse.done) {
            onComplete(fullResponse);
            return;
          }
        } catch (e) {
          console.error(this.t('log_json_parse_error', 'JSON parse error') + ':', e, 'Line:', line);
        }
      }
    }
    
    // 残りの行を処理
    if (partialLine.trim() !== '') {
      try {
        const parsedResponse = JSON.parse(partialLine);
        if (parsedResponse.response) {
          fullResponse += parsedResponse.response;
          onChunk(fullResponse);
        }
      } catch (e) {
        console.error(this.t('log_json_parse_error_partial', 'JSON parse error for partial line') + ':', e);
      }
    }
    
    onComplete(fullResponse);
  }
  
  // テキストをHTMLエスケープして改行を<br>タグに変換、**テキスト**を強調表示に変換
  formatTextWithLineBreaks(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **テキスト**を<strong>テキスト</strong>に変換
      .replace(/\n/g, '<br>');
  }
}
