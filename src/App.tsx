import { useState, useCallback } from 'react';
import { Preview } from './components/Preview';
import { CommandPanel } from './components/CommandPanel';
import { SettingsModal } from './components/SettingsModal';
import { generateCode, getDefaultCode, getStoredApiKey } from './services/codeGenerator';
import type { Message, GeneratedCode } from './types';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCode, setCurrentCode] = useState<GeneratedCode>(getDefaultCode());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const newCode = await generateCode(content, currentCode, conversationHistory);
      setCurrentCode(newCode);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Updated the preview with your changes!',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
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
        <p className="tagline">Vibecode your web app</p>
      </header>

      <main className="app-main">
        <div className="preview-section">
          <Preview code={currentCode} />
        </div>
        <div className="command-section">
          <CommandPanel
            messages={messages}
            isGenerating={isGenerating}
            onSendMessage={handleSendMessage}
            onOpenSettings={() => setShowSettings(true)}
          />
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
