// テンプレート管理用JavaScript

class TemplateManager {
    constructor() {
        this.storageKey = 'prompt_templates';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTemplates();
    }

    bindEvents() {
        // フォーム送信イベント
        document.getElementById('templateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTemplate();
        });

        // フォームクリアボタン
        document.getElementById('clearForm').addEventListener('click', () => {
            this.clearForm();
        });
    }

    // テンプレートを保存
    saveTemplate() {
        const title = document.getElementById('title').value.trim();
        const body = document.getElementById('body').value.trim();
        const labelsInput = document.getElementById('labels').value.trim();

        if (!title || !body) {
            this.showMessage('タイトルと内容は必須項目です。', 'error');
            return;
        }

        // ラベルをカンマ区切りで分割し、空文字を除去
        const labels = labelsInput 
            ? labelsInput.split(',').map(label => label.trim()).filter(label => label)
            : [];

        const template = {
            id: Date.now(), // 簡易的なID生成
            title,
            body,
            labels,
            createdAt: new Date().toISOString()
        };

        // 既存のテンプレートを取得
        const templates = this.getTemplates();
        
        // 同じタイトルのテンプレートが既に存在するかチェック
        const existingTemplate = templates.find(t => t.title === title);
        if (existingTemplate) {
            if (!confirm('同じタイトルのテンプレートが既に存在します。上書きしますか？')) {
                return;
            }
            // 既存のテンプレートを削除
            this.deleteTemplate(existingTemplate.id);
        }

        // 新しいテンプレートを追加
        templates.push(template);
        this.saveTemplates(templates);

        this.showMessage('テンプレートが正常に保存されました。', 'success');
        this.clearForm();
        this.loadTemplates();
    }

    // フォームをクリア
    clearForm() {
        document.getElementById('templateForm').reset();
    }

    // localStorageからテンプレートを取得
    getTemplates() {
        try {
            const templates = localStorage.getItem(this.storageKey);
            return templates ? JSON.parse(templates) : [];
        } catch (error) {
            console.error('テンプレートの読み込みエラー:', error);
            return [];
        }
    }

    // localStorageにテンプレートを保存
    saveTemplates(templates) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(templates));
        } catch (error) {
            console.error('テンプレートの保存エラー:', error);
            this.showMessage('テンプレートの保存に失敗しました。', 'error');
        }
    }

    // テンプレート一覧を表示
    loadTemplates() {
        const templates = this.getTemplates();
        const container = document.getElementById('templatesList');

        if (templates.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">保存されたテンプレートはありません。</p>';
            return;
        }

        // 作成日時で降順ソート（新しいものが上）
        templates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const html = templates.map(template => this.createTemplateHTML(template)).join('');
        container.innerHTML = html;

        // イベントリスナーを追加
        this.bindTemplateEvents();
    }

    // テンプレートのHTMLを生成
    createTemplateHTML(template) {
        const labelsHTML = template.labels.map(label => 
            `<span class="label-tag">${this.escapeHtml(label)}</span>`
        ).join('');

        const createdDate = new Date(template.createdAt).toLocaleDateString('ja-JP');

        return `
            <div class="template-item" data-id="${template.id}">
                <div class="template-header">
                    <div class="template-title">${this.escapeHtml(template.title)}</div>
                    <div>
                        <button class="btn-edit" data-id="${template.id}">編集</button>
                        <button class="btn-danger btn-delete" data-id="${template.id}">削除</button>
                    </div>
                </div>
                <div class="template-labels">${labelsHTML}</div>
                <div class="template-body">${this.escapeHtml(template.body)}</div>
                <div class="template-actions">
                    <small style="color: #666;">作成日: ${createdDate}</small>
                    <button class="btn-copy" data-id="${template.id}">コピー</button>
                </div>
            </div>
        `;
    }

    // テンプレート関連のイベントを設定
    bindTemplateEvents() {
        // 削除ボタン
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('このテンプレートを削除しますか？')) {
                    this.deleteTemplate(id);
                }
            });
        });

        // 編集ボタン
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.editTemplate(id);
            });
        });

        // コピーボタン
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.copyTemplate(id);
            });
        });
    }

    // テンプレートを削除
    deleteTemplate(id) {
        const templates = this.getTemplates();
        const filteredTemplates = templates.filter(t => t.id !== id);
        this.saveTemplates(filteredTemplates);
        this.loadTemplates();
        this.showMessage('テンプレートが削除されました。', 'success');
    }

    // テンプレートを編集（フォームに読み込み）
    editTemplate(id) {
        const templates = this.getTemplates();
        const template = templates.find(t => t.id === id);
        
        if (template) {
            document.getElementById('title').value = template.title;
            document.getElementById('body').value = template.body;
            document.getElementById('labels').value = template.labels.join(', ');
            
            // フォームまでスクロール
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
            
            // 編集モードであることを示すために一時的にIDを保存
            document.getElementById('templateForm').dataset.editId = id;
        }
    }

    // テンプレートをクリップボードにコピー
    async copyTemplate(id) {
        const templates = this.getTemplates();
        const template = templates.find(t => t.id === id);
        
        if (template) {
            try {
                await navigator.clipboard.writeText(template.body);
                this.showMessage('テンプレート内容がクリップボードにコピーされました。', 'success');
            } catch (error) {
                console.error('コピーエラー:', error);
                this.showMessage('コピーに失敗しました。', 'error');
            }
        }
    }

    // メッセージを表示
    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';

        // 3秒後に非表示
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }

    // HTMLエスケープ
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // テンプレートをエクスポート（JSON形式）
    exportTemplates() {
        const templates = this.getTemplates();
        const dataStr = JSON.stringify(templates, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'prompt_templates.json';
        link.click();
    }

    // テンプレートをインポート
    importTemplates(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTemplates = JSON.parse(e.target.result);
                if (Array.isArray(importedTemplates)) {
                    const existingTemplates = this.getTemplates();
                    const mergedTemplates = [...existingTemplates, ...importedTemplates];
                    this.saveTemplates(mergedTemplates);
                    this.loadTemplates();
                    this.showMessage('テンプレートが正常にインポートされました。', 'success');
                } else {
                    throw new Error('Invalid format');
                }
            } catch (error) {
                console.error('インポートエラー:', error);
                this.showMessage('ファイル形式が正しくありません。', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// ページ読み込み完了後にテンプレートマネージャーを初期化
document.addEventListener('DOMContentLoaded', () => {
    new TemplateManager();
});
