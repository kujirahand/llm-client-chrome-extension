// バックグラウンドスクリプト - CORS対応の強化

chrome.runtime.onInstalled.addListener(async () => {
  console.log('Ollama Chat Extension installed');
  // 初期のCORSルールを設定
  await setupInitialCORSRules();
});

// 拡張がアクティブになったときの処理
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked');
});

// CORSルールの初期設定
async function setupInitialCORSRules() {
  try {
    const rules = [
      {
        id: 1,
        condition: {
          requestDomains: ["localhost", "127.0.0.1"]
        },
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'origin',
              operation: 'set',
              value: 'http://localhost:11434',
            },
            {
              header: 'access-control-allow-origin',
              operation: 'set',
              value: '*',
            }
          ],
        },
      }
    ];

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: rules,
    });
    
    console.log('CORS rules initialized');
  } catch (error) {
    console.error('Failed to setup CORS rules:', error);
  }
}

// popup.jsからのメッセージを受信してCORSルールを更新
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'updateCORSRules') {
    try {
      await updateCORSRules(message.host);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Failed to update CORS rules:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
});

async function updateCORSRules(hostUrl) {
  try {
    const url = new URL(hostUrl);
    const domain = url.hostname;
    const port = url.port || (url.protocol === 'https:' ? '443' : '80');
    
    const rules = [
      {
        id: 1,
        condition: {
          requestDomains: [domain, `${domain}:${port}`]
        },
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'origin',
              operation: 'set',
              value: hostUrl,
            },
            {
              header: 'access-control-allow-origin',
              operation: 'set',
              value: '*',
            }
          ],
        },
      }
    ];

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: rules,
    });
    
    console.log('CORS rules updated for:', hostUrl);
  } catch (error) {
    console.error('Error updating CORS rules:', error);
    throw error;
  }
}
