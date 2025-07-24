class OllamaChat {
  constructor() {
    this.chatContainer = document.getElementById('chatContainer');
    // messageInput（popup.html用）とmessageText（index.html用）の両方をチェック
    this.messageInput = document.getElementById('messageInput') || document.getElementById('messageText');
    this.sendButton = document.getElementById('sendButton');
    
    // LLM APIクライアントを初期化
    this.llmApi = new LLMApi();
    this.llmApi.loadSettings();
    
    this.initializeEventListeners();
    this.loadChatHistory();
    this.llmApi.setupCORSRules();
    
    // 言語設定を初期化
    this.initializeLocale();
    
    // 初期フォーカスをメッセージ入力欄に設定
    setTimeout(() => {
      this.messageInput.focus();
    }, 100);
  }
  
  async initializeLocale() {
    if (typeof locale !== 'undefined') {
      await locale.loadLanguagePreference();
      locale.translatePage();
      
      // 言語変更リスナーを追加
      window.addEventListener('languageChanged', () => {
        this.updateInitialMessage();
        this.updateLoadingText();
      });
    }
  }
  
  initializeEventListeners() {
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // textareaの高さを自動調整（index.htmlのmessageTextの場合）
    if (this.messageInput && this.messageInput.tagName === 'TEXTAREA') {
      this.messageInput.addEventListener('input', () => {
        this.autoResizeTextarea();
      });
    }
    
    // 設定パネルのイベントリスナー（要素が存在する場合のみ）
    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
      settingsButton.addEventListener('click', () => this.toggleSettings());
    }
    
    const saveSettings = document.getElementById('saveSettings');
    if (saveSettings) {
      saveSettings.addEventListener('click', () => this.saveSettings());
    }
    
    const closeSettings = document.getElementById('closeSettings');
    if (closeSettings) {
      closeSettings.addEventListener('click', () => this.closeSettings());
    }
    
    const refreshModels = document.getElementById('refreshModels');
    if (refreshModels) {
      refreshModels.addEventListener('click', () => this.refreshModels());
    }
    
    const clearButton = document.getElementById('clearButton');
    if (clearButton) {
      clearButton.addEventListener('click', () => this.clearChat());
    }
    
    const openWindowButton = document.getElementById('openWindowButton');
    if (openWindowButton) {
      openWindowButton.addEventListener('click', () => this.openInWindow());
    }
    
    // 言語選択のイベントリスナー
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
    }
    
    // オーバーレイをクリックしたときに設定パネルを閉じる
    const settingsOverlay = document.getElementById('settingsOverlay');
    if (settingsOverlay) {
      settingsOverlay.addEventListener('click', () => this.closeSettings());
    }
    
    this.loadSettingsToUI();
  }
  
  autoResizeTextarea() {
    if (this.messageInput && this.messageInput.tagName === 'TEXTAREA') {
      this.messageInput.style.height = 'auto';
      this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
  }
  
  toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsOverlay');
    
    if (panel) {
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      
      if (overlay) {
        overlay.style.display = isVisible ? 'none' : 'block';
      }
    }
  }
  
  closeSettings() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsOverlay');
    
    if (panel) {
      panel.style.display = 'none';
    }
    
    if (overlay) {
      overlay.style.display = 'none';
    }
    
    // 設定パネルを閉じた後、メッセージ入力欄にフォーカスを戻す
    this.messageInput.focus();
  }
  
  async loadSettingsToUI() {
    const hostInput = document.getElementById('hostInput');
    if (hostInput) {
      hostInput.value = this.llmApi.ollamaUrl;
    }
    
    const systemPromptInput = document.getElementById('systemPromptInput');
    if (systemPromptInput) {
      systemPromptInput.value = this.llmApi.systemPrompt;
    }
    
    // 言語設定を読み込み
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect && typeof locale !== 'undefined') {
      languageSelect.value = locale.getCurrentLanguage();
    }
    
    this.refreshModels();
  }
  
  async changeLanguage(lang) {
    if (typeof locale !== 'undefined') {
      await locale.switchLanguage(lang);
    }
  }
  
  updateInitialMessage() {
    const initialMessages = this.chatContainer.querySelectorAll('.bot-message[data-locale="initial_message"]');
    initialMessages.forEach(msg => {
      if (typeof locale !== 'undefined') {
        msg.textContent = locale.t('initial_message');
      }
    });
  }
  
  updateLoadingText() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator && typeof locale !== 'undefined') {
      loadingIndicator.textContent = locale.t('thinking');
    }
  }
  
  async refreshModels() {
    const modelSelect = document.getElementById('modelSelect');
    if (!modelSelect) {
      return; // modelSelect要素が存在しない場合は何もしない
    }
    
    try {
      const models = await this.llmApi.fetchModels();
      
      modelSelect.innerHTML = '';
      
      models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        if (model.name === this.llmApi.model) {
          option.selected = true;
        }
        modelSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  }
  
  saveSettings() {
    const hostInput = document.getElementById('hostInput');
    const modelSelect = document.getElementById('modelSelect');
    const systemPromptInput = document.getElementById('systemPromptInput');
    
    if (!hostInput || !modelSelect || !systemPromptInput) {
      console.error('Settings elements not found');
      return;
    }
    
    const ollamaUrl = hostInput.value;
    const model = modelSelect.value;
    const systemPrompt = systemPromptInput.value;
    
    this.llmApi.saveSettings(ollamaUrl, model, systemPrompt);
    this.closeSettings();
  }
  
  clearChat() {
    // チャット履歴をクリアするかどうか確認
    const confirmMessage = typeof locale !== 'undefined' ? locale.t('clear_chat_confirm') : 'チャット履歴をクリアしますか？';
    if (confirm(confirmMessage)) {
      // チャットコンテナをクリア
      this.chatContainer.innerHTML = '';
      
      // 初期メッセージを追加
      const initialMessage = document.createElement('div');
      initialMessage.className = 'message bot-message';
      initialMessage.setAttribute('data-locale', 'initial_message');
      const messageText = typeof locale !== 'undefined' ? locale.t('initial_message') : 'こんにちは！何でもお聞きください。';
      initialMessage.textContent = messageText;
      this.chatContainer.appendChild(initialMessage);
      
      // ローカルストレージからチャット履歴を削除
      chrome.storage.local.remove(['chatHistory']);
      
      console.log('Chat history cleared');
      
      // チャットクリア後、メッセージ入力欄にフォーカスを戻す
      this.messageInput.focus();
    }
  }
  
  openInWindow() {
    // 新しいタブでindex.htmlを開く
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    });
  }
  
  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;
    
    // 既存の処理を中止
    this.llmApi.abort();
    
    // ユーザーメッセージを表示
    this.addMessage(message, 'user');
    this.messageInput.value = '';
    
    // textareaの高さをリセット
    this.autoResizeTextarea();
    
    this.setLoading(true);
    
    // ボットメッセージ用のコンテナを作成
    const botMessageDiv = this.createBotMessage();
    
    try {
      // Ollama APIをストリーミングで呼び出し
      await this.llmApi.callOllamaAPIStream(
        message,
        (fullResponse) => {
          // チャンクを受信したときの処理
          const htmlContent = this.llmApi.formatTextWithLineBreaks(fullResponse);
          botMessageDiv.innerHTML = htmlContent;
          this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        },
        (fullResponse) => {
          // 完了時の処理
          this.saveChatHistory();
        },
        (error) => {
          // エラー時の処理
          console.error('Error calling Ollama API:', error);
          if (error.name !== 'AbortError') {
            this.addMessage(`エラー: ${error.message}`, 'error');
          }
        }
      );
    } finally {
      this.setLoading(false);
      
      // 応答完了後にメッセージ入力欄にフォーカスを戻す
      this.messageInput.focus();
    }
  }
  
  createBotMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.textContent = '';
    
    this.chatContainer.appendChild(messageDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    
    return messageDiv;
  }
  
  addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type === 'user' ? 'user-message' : type === 'error' ? 'error' : 'bot-message'}`;
    
    // エラーメッセージ以外は改行を<br>タグに変換
    if (type === 'error') {
      messageDiv.textContent = content;
    } else {
      const htmlContent = this.llmApi.formatTextWithLineBreaks(content);
      messageDiv.innerHTML = htmlContent;
    }
    
    this.chatContainer.appendChild(messageDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    
    // チャット履歴を保存
    this.saveChatHistory();
  }
  
  setLoading(isLoading) {
    this.sendButton.disabled = isLoading;
    // 利便性のためOllama APIの呼び出し中も入力できるようにする
    // this.messageInput.disabled = isLoading;
    
    if (isLoading) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'loading';
      const loadingText = typeof locale !== 'undefined' ? locale.t('thinking') : '考え中...';
      loadingDiv.textContent = loadingText;
      loadingDiv.id = 'loading-indicator';
      this.chatContainer.appendChild(loadingDiv);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    } else {
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
    }
  }
  
  saveChatHistory() {
    const messages = Array.from(this.chatContainer.children).map(msg => ({
      content: msg.textContent,
      type: msg.className.includes('user-message') ? 'user' : 
            msg.className.includes('error') ? 'error' : 'bot'
    }));
    
    chrome.storage.local.set({ chatHistory: messages });
  }
  
  async loadChatHistory() {
    try {
      const result = await chrome.storage.local.get(['chatHistory']);
      if (result.chatHistory && result.chatHistory.length > 0) {
        // 既存のメッセージをクリア（初期メッセージ以外）
        const initialMessage = this.chatContainer.querySelector('.bot-message');
        this.chatContainer.innerHTML = '';
        this.chatContainer.appendChild(initialMessage);
        
        // 履歴を復元
        result.chatHistory.forEach(msg => {
          const initialMessageText = typeof locale !== 'undefined' ? locale.t('initial_message') : 'こんにちは！何でもお聞きください。';
          if (msg.content !== initialMessageText && msg.content !== 'こんにちは！何でもお聞きください。' && msg.content !== 'Hello! Feel free to ask me anything.') {
            this.addMessageWithoutSaving(msg.content, msg.type);
          }
        });
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }
  
  addMessageWithoutSaving(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type === 'user' ? 'user-message' : type === 'error' ? 'error' : 'bot-message'}`;
    
    // エラーメッセージ以外は改行を<br>タグに変換
    if (type === 'error') {
      messageDiv.textContent = content;
    } else {
      const htmlContent = this.llmApi.formatTextWithLineBreaks(content);
      messageDiv.innerHTML = htmlContent;
    }
    
    this.chatContainer.appendChild(messageDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }
}

// ポップアップが開かれたときにチャットを初期化
document.addEventListener('DOMContentLoaded', () => {
  new OllamaChat();
});
