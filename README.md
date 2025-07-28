# Ollama Client for Chrome Extension

A Chrome extension that allows you to chat with Ollama API directly from your browser.

## Features

- Direct communication with Ollama API
- **Streaming responses**: Real-time text display
- **Settings panel**: Configure host, model, and system prompt
- **Template management**: Create, save, and reuse system prompt templates
- **Automatic CORS handling**: Resolves connection issues using Chrome extension permissions
- Simple chat interface
- Chat history preservation
- When you launch the extension with text selected on a web page, the selected text will be inserted into the chat input.
- **Multilingual support**: Japanese and English UI

## Install

You can install from the Chrome Web Store:

- [Chrome Web Store - Ollama Client for Chrome Extension](https://chromewebstore.google.com/detail/ollama-client-for-chrome/ljcbjbmcombnkhbehohhhjoogkgcnffc?hl=ja)


## Local Setup

### 1. Install and Start Ollama

First, install and start Ollama:

```bash
# Install Ollama (macOS)
curl -fsSL https://ollama.ai/install.sh | sh

# Download a model
ollama pull gemma3:4b

# Start Ollama server with CORS support
OLLAMA_ORIGINS=chrome-extension://* ollama serve
```

**Important**: CORS configuration is required for Chrome extension access. Start the server with `OLLAMA_ORIGINS=chrome-extension://*` as shown above.

### 2. Install Chrome Extension

1. Open `chrome://extensions/` in Chrome browser
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select this project folder

## Usage

1. Click the Chrome extension icon
2. First time: Click ⚙️ button to check/modify settings
3. Type a message and send
4. View real-time streaming responses

### Settings

- **Ollama Host**: Address of the Ollama server
- **Model**: Model to use (automatically retrieved)
- **System Prompt**: Configure AI personality or role
- **Template Selection**: Choose from saved prompt templates
- **Language**: Choose between Japanese and English

### Template Management

The extension includes a comprehensive template management system:

- **Create Templates**: Save frequently used system prompts as templates
- **Template Library**: Access saved templates from both popup and full window views
- **Quick Application**: Apply templates directly to system prompt with one click
- **Template Manager**: Dedicated interface (`📋 Templates` button) for managing templates
  - Add new templates with title, content, and labels
  - Edit existing templates
  - Delete unwanted templates
  - Copy template content to clipboard

To access template management:
1. Click the `📋 Templates` button in the header
2. Or use the template dropdown in settings to quickly apply saved templates

## Multilingual Support

The extension supports both Japanese and English interfaces:

- **Auto-detection**: Automatically detects browser language
- **Manual switching**: Use the Language dropdown in settings
- **Persistent settings**: Language preference is saved

For more details, see [LOCALE_USAGE.md](LOCALE_USAGE.md).

## Files Structure

```
├── manifest.json          # Extension configuration
├── popup.html             # Popup interface
├── popup.js               # Popup functionality
├── index.html             # Full window interface
├── template.html          # Template management interface
├── template.js            # Template management functionality
├── background.js          # Background service worker
├── llm_api.js             # Ollama API client
├── locale.js              # Internationalization
├── icons/                 # Extension icons
├── README.md              # This file (English)
├── README-ja.md           # Japanese README
└── LOCALE_USAGE.md        # Multilingual feature documentation
```

## Troubleshooting

### HTTP 403 Error

If access from the Chrome extension is denied:

**Method 1: Ollama Configuration (Recommended)**

1. Stop the current Ollama server (Ctrl+C)
2. Set environment variables and restart with CORS support:

   ```bash
   OLLAMA_ORIGINS="*" ollama serve
   ```

**Method 2: Complete Chrome Extension Reload**

1. Open `chrome://extensions/`
2. "Remove" the extension
3. Re-install using "Load unpacked"
4. Re-grant permissions

**Method 3: Debug Mode Verification**

1. Right-click extension popup → "Inspect"
2. Check Console tab for detailed error information
3. Check Network tab for HTTP request status

### Cannot Connect to Ollama

1. Verify Ollama server is running
2. Check if accessible at `http://localhost:11434`
3. Check firewall settings

### Model Not Found

Verify the desired model is downloaded:

```bash
ollama list
```

If model is missing, download it:

```bash
ollama pull gemma3:4b
```

### Extension Reload

After making configuration changes, reload the Chrome extension:

1. Open `chrome://extensions/`
2. Click the refresh button for "Ollama Chat Extension"
3. Or remove and reinstall the extension

### Debugging

1. Right-click extension popup → Select "Inspect"
2. Check Console tab in Developer Tools
3. Review detailed error messages

## Development

### Adding New Languages

1. Add translations to `locale.js`:
```javascript
'fr': {
  'send': 'Envoyer',
  'message_placeholder': 'Tapez votre message...',
  // ... other translations
}
```

2. Add language option to HTML:
```html
<select id="languageSelect">
  <option value="ja">日本語</option>
  <option value="en">English</option>
  <option value="fr">Français</option>
</select>
```

### API Integration

The extension uses the Ollama API's streaming endpoint:
- POST `/api/generate` for text generation
- GET `/api/tags` for model listing

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the Japanese README: [README-ja.md](README-ja.md)
- Review troubleshooting section above

