import { useState, useCallback } from 'react';
import { Preview } from './components/Preview';
import { CommandPanel } from './components/CommandPanel';
import { SettingsModal } from './components/SettingsModal';
import { generateCodeStreaming, generatePlan, getDefaultCode, getStoredApiKey, buildPreviewHtml } from './services/codeGenerator';
import type { Message, GeneratedCode } from './types';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCode, setCurrentCode] = useState<GeneratedCode>(getDefaultCode());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleExport = useCallback(() => {
    const html = buildPreviewHtml(currentCode);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-site.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentCode]);

  const handleSendMessage = useCallback(async (content: string) => {
    // Check for API key
    if (!getStoredApiKey()) {
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    const planMessageId = (Date.now() + 1).toString();

    try {
      // Phase 1: Planning
      const planMessage: Message = {
        id: planMessageId,
        role: 'assistant',
        content: '**Planning...**\n',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, planMessage]);

      const plan = await generatePlan(content, (partialPlan) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === planMessageId
              ? { ...m, content: partialPlan }
              : m
          )
        );
      });

      // Phase 2: Building
      const buildMessageId = (Date.now() + 2).toString();
      const buildMessage: Message = {
        id: buildMessageId,
        role: 'assistant',
        content: '⚡ **Building...**',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, buildMessage]);

      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const newCode = await generateCodeStreaming(
        content,
        currentCode,
        conversationHistory,
        (updatedCode) => setCurrentCode(updatedCode),
        plan
      );
      setCurrentCode(newCode);

      // Update build message to done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === buildMessageId
            ? { ...m, content: '✓ **Done!** Your site is ready. Click Export to download.' }
            : m
        )
      );
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content: `**Error:** ${error instanceof Error ? error.message : 'Something went wrong'}`,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  }, [messages, currentCode]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
          </svg>
          <span>Atomic</span>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={handleExport}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
          <p className="tagline">Vibecode your web app</p>
        </div>
      </header>

      <main className="app-main">
        <div className="command-section">
          <CommandPanel
            messages={messages}
            isGenerating={isGenerating}
            onSendMessage={handleSendMessage}
            onOpenSettings={() => setShowSettings(true)}
          />
        </div>
        <div className="preview-section">
          <Preview code={currentCode} />
        </div>
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;
