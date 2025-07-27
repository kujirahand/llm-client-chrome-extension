class OllamaChat {
  constructor() {
    // コンテキスト判定を最初に行う
    this.context = this.detectContext();
    
    this.chatContainer = document.getElementById('chatContainer');
    // messageInput（popup.html用）とmessageText（index.html用）の両方をチェック
    this.messageInput = document.getElementById('messageInput') || document.getElementById('messageText');
    this.sendButton = document.getElementById('sendButton');
    
    // LLM APIクライアントを初期化
    this.llmApi = new LLMApi();
    this.llmApi.loadSettings();
    
    // ログ関連の定数
    this.MAX_LOGS = 100; // 最大ログ数
    
    // 既存の初期メッセージに data-original-content 属性を追加
    this.initializeExistingMessages();
    
    this.initializeEventListeners();
    this.loadChatHistory();
    
    // CORSルールセットアップを非ブロッキングで実行
    this.llmApi.setupCORSRules().catch(error => {
      console.warn('CORS setup warning (continuing anyway):', error);
    });
    
    // 言語設定を初期化
    this.initializeLocale();
    
    // 初期フォーカスをメッセージ入力欄に設定
    setTimeout(() => {
      this.messageInput.focus();
    }, 100);
    
    // `popup.html`から読み込まれた時だけ、insertSelectedTextを実行
    // 選択されたテキストを取得してメッセージ入力欄に挿入
    console.log(`Context detected: ${this.context}`);
    if (this.context === 'popup') {
      this.insertSelectedText();
    }
  }
  
  // コンテキスト判定メソッド
  detectContext() {
    // 方法1: 特定のDOM要素の存在確認
    if (document.getElementById('thisIsPopupHTML')) {
      return 'popup'; // popup.htmlにのみ存在
    }
 
    return 'index'; // デフォルトはindex
  }
  
  // コンテキスト判定のヘルパーメソッド
  isPopupContext() {
    return this.context === 'popup';
  }
  
  isIndexContext() {
    return this.context === 'index';
  }
  
  initializeExistingMessages() {
    // HTML内の既存メッセージに data-original-content 属性を追加
    const existingMessages = this.chatContainer.querySelectorAll('.message');
    existingMessages.forEach(msg => {
      if (!msg.getAttribute('data-original-content')) {
        msg.setAttribute('data-original-content', msg.textContent);
      }
    });
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

    const templateButton = document.getElementById('templateButton');
    if (templateButton) {
      templateButton.addEventListener('click', () => this.openTemplateManager());
    }

    const logsButton = document.getElementById('logsButton');
    if (logsButton) {
      logsButton.addEventListener('click', () => this.openLogsManager());
    }
    
    // 言語選択のイベントリスナー
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
    }

    // テンプレート選択のイベントリスナー
    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect) {
      templateSelect.addEventListener('change', (e) => this.applyTemplate(e.target.value));
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
  
  async toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsOverlay');
    
    if (panel) {
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      
      if (overlay) {
        overlay.style.display = isVisible ? 'none' : 'block';
      }
      
      // 設定パネルを開く際に設定を読み込み
      if (!isVisible) {
        await this.loadSettingsToUI();
        this.loadTemplateOptions();
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
    
    // テンプレート一覧を読み込み
    this.loadTemplateOptions();
    
    this.refreshModels();
  }
  
  async changeLanguage(lang) {
    if (typeof locale !== 'undefined') {
      await locale.switchLanguage(lang);
      // 言語変更後に即座にUIを更新
      this.updateInitialMessage();
      this.updateLoadingText();
    }
  }
  
  updateInitialMessage() {
    const initialMessages = this.chatContainer.querySelectorAll('.bot-message[data-locale="initial_message"]');
    initialMessages.forEach(msg => {
      if (typeof locale !== 'undefined') {
        const messageText = locale.t('initial_message');
        msg.textContent = messageText;
        // 元のプレーンテキストを data 属性として保存（改行情報を保持するため）
        msg.setAttribute('data-original-content', messageText);
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
  
  async saveSettings() {
    const hostInput = document.getElementById('hostInput');
    const modelSelect = document.getElementById('modelSelect');
    const systemPromptInput = document.getElementById('systemPromptInput');
    const languageSelect = document.getElementById('languageSelect');
    
    if (!hostInput || !modelSelect || !systemPromptInput) {
      console.error('Settings elements not found');
      return;
    }
    
    // Ollama Hostが空の場合はデフォルト値を設定
    let ollamaUrl = hostInput.value.trim();
    if (!ollamaUrl) {
      ollamaUrl = 'http://localhost:11434';
      hostInput.value = ollamaUrl; // UIも更新
    }
    
    const model = modelSelect.value;
    const systemPrompt = systemPromptInput.value;
    
    // 言語設定を保存
    if (languageSelect && typeof locale !== 'undefined') {
      await locale.saveLanguagePreference(languageSelect.value);
    }
    
    this.llmApi.saveSettings(ollamaUrl, model, systemPrompt);
    this.closeSettings();
  }
  
  async insertSelectedText() {
    try {
      // アクティブなタブから選択されたテキストを取得
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' }, (response) => {
          if (chrome.runtime.lastError) {
            // Content scriptが読み込まれていない場合やエラーが発生した場合
            console.log('Could not get selected text:', chrome.runtime.lastError.message);
            return;
          }
          
          if (response && response.selectedText && response.selectedText.trim()) {
            // 選択されたテキストがある場合、メッセージ入力欄に挿入
            const selectedText = response.selectedText.trim();
            if (this.messageInput) {
              // 既存のテキストがある場合は改行を追加
              const currentText = this.messageInput.value.trim();
              if (currentText) {
                this.messageInput.value = currentText + '\n\n' + selectedText;
              } else {
                this.messageInput.value = selectedText;
              }
              
              // textareaの場合は高さを自動調整
              if (this.messageInput.tagName === 'TEXTAREA') {
                this.autoResizeTextarea();
              }
              
              // カーソルを末尾に移動
              this.messageInput.setSelectionRange(this.messageInput.value.length, this.messageInput.value.length);
              this.messageInput.focus();
            }
          }
        });
      }
    } catch (error) {
      console.error('Error getting selected text:', error);
    }
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
      // 元のプレーンテキストを data 属性として保存（改行情報を保持するため）
      initialMessage.setAttribute('data-original-content', messageText);
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
          // 元のプレーンテキストを data 属性として保存（改行情報を保持するため）
          botMessageDiv.setAttribute('data-original-content', fullResponse);
          this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        },
        (fullResponse) => {
          // 完了時の処理
          this.saveChatHistory();
          // チャットログを保存（複数のメッセージがある場合のみ）
          this.saveChatLog();
        },
        (error) => {
          // エラー時の処理
          console.error('Error calling Ollama API:', error);
          if (error.name !== 'AbortError') {
            this.addMessage(`ERROR: ${error.message}`, 'error');
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
    
    // 元のプレーンテキストを data 属性として保存（改行情報を保持するため）
    messageDiv.setAttribute('data-original-content', content);
    
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
      content: msg.getAttribute('data-original-content') || msg.textContent,
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
    
    // 元のプレーンテキストを data 属性として保存（改行情報を保持するため）
    messageDiv.setAttribute('data-original-content', content);
    
    this.chatContainer.appendChild(messageDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  openTemplateManager() {
    // 新しいタブでtemplate.htmlを開く
    chrome.tabs.create({
      url: chrome.runtime.getURL('template.html')
    });
  }

  openLogsManager() {
    // 新しいタブでlogs.htmlを開く
    chrome.tabs.create({
      url: chrome.runtime.getURL('logs.html')
    });
  }

  // チャットログを保存する機能
  async saveChatLog() {
    try {
      // 現在のチャット履歴を取得
      const messages = Array.from(this.chatContainer.children)
        .filter(msg => !msg.classList.contains('loading')) // ローディング要素を除外
        .map(msg => ({
          content: msg.getAttribute('data-original-content') || msg.textContent,
          type: msg.className.includes('user-message') ? 'user' : 
                msg.className.includes('error') ? 'error' : 'bot'
        }))
        .filter(msg => {
          // 初期メッセージを除外
          const initialMessages = [
            'こんにちは！何でもお聞きください。',
            'Hello! Feel free to ask me anything.'
          ];
          return !initialMessages.includes(msg.content);
        });

      // ユーザーメッセージが2つ以上ある場合のみログを保存
      const userMessages = messages.filter(msg => msg.type === 'user');
      if (userMessages.length >= 1 && messages.length >= 2) {
        await this.saveNewChatLog(messages);
      }
    } catch (error) {
      console.error('Error saving chat log:', error);
    }
  }

  // 新しいチャットログを保存
  async saveNewChatLog(messages) {
    try {
      // 最初のユーザーメッセージをタイトルとして使用（50文字まで）
      const firstUserMessage = messages.find(msg => msg.type === 'user');
      if (!firstUserMessage) return; // ユーザーメッセージがない場合は保存しない
      
      const title = firstUserMessage.content.length > 50 ? 
        firstUserMessage.content.substring(0, 50) + '...' : 
        firstUserMessage.content;
      
      const logId = Date.now().toString();
      const newLog = {
        id: logId,
        title: title,
        messages: messages,
        createdAt: new Date().toISOString()
      };
      
      // 既存のログを取得
      const result = await chrome.storage.local.get(['chatLogs']);
      let logs = result.chatLogs || [];
      
      // 新しいログを先頭に追加
      logs.unshift(newLog);
      
      // 最大ログ数を超えた場合、古いものを削除
      if (logs.length > this.MAX_LOGS) {
        logs = logs.slice(0, this.MAX_LOGS);
      }
      
      // ストレージに保存
      await chrome.storage.local.set({ chatLogs: logs });
      
      console.log('New chat log saved:', logId);
    } catch (error) {
      console.error('Error saving chat log:', error);
    }
  }

  // テンプレート一覧を選択ボックスに読み込み
  loadTemplateOptions() {
    const templateSelect = document.getElementById('templateSelect');
    if (!templateSelect) return;

    try {
      const templates = JSON.parse(localStorage.getItem('prompt_templates') || '[]');
      
      // 既存のオプションをクリア（最初のデフォルトオプション以外）
      const placeholderText = typeof locale !== 'undefined' ? locale.t('template_select_placeholder') : '-- テンプレートを選択 --';
      templateSelect.innerHTML = `<option value="">${placeholderText}</option>`;
      
      // テンプレートをオプションとして追加
      templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.title;
        templateSelect.appendChild(option);
      });
      
      // 「テンプレートを編集」オプションを追加
      const editOption = document.createElement('option');
      editOption.value = 'edit_templates';
      editOption.textContent = typeof locale !== 'undefined' ? locale.t('template_edit') : 'テンプレートを編集';
      templateSelect.appendChild(editOption);
    } catch (error) {
      console.error('Faild to read template:', error);
    }
  }

  // 選択されたテンプレートを適用
  applyTemplate(templateId) {
    if (!templateId) return;

    // 「テンプレートを編集」が選択された場合
    if (templateId === 'edit_templates') {
      this.openTemplateManager();
      // 選択をリセット
      const templateSelect = document.getElementById('templateSelect');
      if (templateSelect) {
        templateSelect.value = '';
      }
      return;
    }

    try {
      const templates = JSON.parse(localStorage.getItem('prompt_templates') || '[]');
      const template = templates.find(t => t.id == templateId);
      
      if (template) {
        const systemPromptInput = document.getElementById('systemPromptInput');
        if (systemPromptInput) {
          systemPromptInput.value = template.body;
          // システムプロンプトを自動保存
          this.llmApi.systemPrompt = template.body;
          this.llmApi.saveSettings();
        }
      }
    } catch (error) {
      console.error('Failed to set template:', error);
    }
  }
}

// ポップアップが開かれたときにチャットを初期化
document.addEventListener('DOMContentLoaded', () => {
  new OllamaChat();
});
