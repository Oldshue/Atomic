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
  html: `<div class="welcome">
  <h1>Welcome to Atomic</h1>
  <p>Start vibecoding by typing a command below!</p>
  <div class="examples">
    <p>Try something like:</p>
    <ul>
      <li>"Create a landing page for a coffee shop"</li>
      <li>"Build a todo list app"</li>
      <li>"Make a weather dashboard"</li>
    </ul>
  </div>
</div>`,
  css: `body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 20px;
}

.welcome {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  text-align: center;
  max-width: 500px;
}

h1 {
  color: #1a1a2e;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

p {
  color: #4a4a6a;
  font-size: 1.1rem;
}

.examples {
  margin-top: 2rem;
  text-align: left;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
}

.examples p {
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

ul {
  color: #6366f1;
  padding-left: 1.5rem;
}

li {
  margin: 0.5rem 0;
}`,
  js: `// Your app logic will appear here
console.log('Welcome to Atomic!');`
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
