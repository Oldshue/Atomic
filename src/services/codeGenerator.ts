import type { GeneratedCode } from '../types';

const API_KEY_STORAGE_KEY = 'atomic_api_key';

export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function clearStoredApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

const DEFAULT_CODE: GeneratedCode = {
  html: `<div class="container">
  <div class="nucleus"></div>
  <div class="orbit orbit-1"><div class="electron"></div></div>
  <div class="orbit orbit-2"><div class="electron"></div></div>
  <div class="orbit orbit-3"><div class="electron"></div></div>

  <div class="content">
    <h1>ATOMIC</h1>
    <p class="tagline">vibecode your next app</p>
    <div class="prompt-hint">
      <span class="cursor"></span>
      <span>describe what you want to build...</span>
    </div>
  </div>
</div>`,
  css: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', sans-serif;
  background: #050508;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nucleus {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #00ff9d;
  border-radius: 50%;
  box-shadow: 0 0 40px #00ff9d, 0 0 80px rgba(0, 255, 157, 0.5);
  z-index: 10;
}

.orbit {
  position: absolute;
  border: 1px solid rgba(0, 255, 157, 0.15);
  border-radius: 50%;
  animation: spin 20s linear infinite;
}

.orbit-1 { width: 120px; height: 120px; animation-duration: 8s; }
.orbit-2 { width: 200px; height: 200px; animation-duration: 12s; animation-direction: reverse; }
.orbit-3 { width: 300px; height: 300px; animation-duration: 20s; }

.electron {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #00ff9d;
  border-radius: 50%;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 10px #00ff9d;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.content {
  position: relative;
  z-index: 20;
  text-align: center;
  margin-top: 200px;
}

h1 {
  font-size: 4rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  color: #e8e8ed;
  text-shadow: 0 0 60px rgba(0, 255, 157, 0.3);
}

.tagline {
  font-size: 1rem;
  color: #6b6b7a;
  text-transform: uppercase;
  letter-spacing: 0.4em;
  margin-top: 0.5rem;
}

.prompt-hint {
  margin-top: 3rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: #3a3a4a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #00ff9d;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}`,
  js: `// Atomic - vibecoding platform
console.log('%c⚛ ATOMIC', 'color: #00ff9d; font-size: 20px; font-weight: bold;');
console.log('%cDescribe what you want to build...', 'color: #6b6b7a;');`
};

export async function generateCode(
  prompt: string,
  currentCode: GeneratedCode,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<GeneratedCode> {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    throw new Error('API key not configured. Please set your Anthropic API key.');
  }

  const systemPrompt = `You are an expert web developer. Generate complete, working HTML, CSS, and JavaScript code based on the user's request.

IMPORTANT: You must respond with ONLY a JSON object in this exact format, no other text:
{
  "html": "<!-- HTML code here -->",
  "css": "/* CSS code here */",
  "js": "// JavaScript code here"
}

Guidelines:
- Create beautiful, modern, responsive designs
- Use inline styles in CSS, not external imports (except Google Fonts)
- Make the JavaScript functional and interactive
- Include all necessary code for a complete working app
- The code will run in an iframe sandbox

Current code state:
HTML: ${currentCode.html}
CSS: ${currentCode.css}
JS: ${currentCode.js}`;

  const messages = [
    ...conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    { role: 'user' as const, content: prompt }
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: messages
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '';

  try {
    // Try to parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        html: parsed.html || currentCode.html,
        css: parsed.css || currentCode.css,
        js: parsed.js || currentCode.js
      };
    }
  } catch (e) {
    console.error('Failed to parse response:', e);
  }

  return currentCode;
}

export function getDefaultCode(): GeneratedCode {
  return DEFAULT_CODE;
}

export function buildPreviewHtml(code: GeneratedCode): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>${code.css}</style>
</head>
<body>
  ${code.html}
  <script>${code.js}</script>
</body>
</html>`;
}
