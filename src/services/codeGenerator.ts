import type { GeneratedCode } from '../types';

/*
 * FUTURE ENHANCEMENTS - Multi-step Generation Pipeline
 * =====================================================
 * Currently implemented:
 * - [x] Planning phase: AI thinks through design before coding
 *
 * Future additions:
 * - [ ] Self-review phase: After generation, AI reviews and identifies issues
 * - [ ] Fix phase: AI fixes any issues found in review
 * - [ ] Iterative refinement: Multiple passes to improve quality
 * - [ ] Component extraction: Break into reusable components
 * - [ ] Accessibility audit: Check for a11y issues
 * - [ ] Performance review: Identify performance improvements
 * - [ ] Image generation: Generate placeholder images via AI
 */

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

// Extract a JSON string value using regex - handles escaped quotes
function extractJsonValue(content: string, key: string): string | null {
  // Match "key": followed by the string value
  const pattern = new RegExp(`"${key}"\\s*:\\s*"`, 'i');
  const match = content.match(pattern);
  if (!match || match.index === undefined) return null;

  const startIdx = match.index + match[0].length;
  let result = '';
  let i = startIdx;

  while (i < content.length) {
    const char = content[i];

    if (char === '\\' && i + 1 < content.length) {
      const nextChar = content[i + 1];
      if (nextChar === 'n') {
        result += '\n';
        i += 2;
      } else if (nextChar === 't') {
        result += '\t';
        i += 2;
      } else if (nextChar === '"') {
        result += '"';
        i += 2;
      } else if (nextChar === '\\') {
        result += '\\';
        i += 2;
      } else {
        result += char;
        i++;
      }
    } else if (char === '"') {
      // End of string
      return result;
    } else {
      result += char;
      i++;
    }
  }

  // String not terminated yet (streaming) - return partial
  return result;
}

// Planning phase - thinks through design before generating code
export async function generatePlan(
  prompt: string,
  onPlanUpdate: (plan: string) => void
): Promise<string> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('API key not configured.');
  }

  const planningPrompt = `You are a senior web designer planning a website. Given the user's request, think through the design approach.

OUTPUT FORMAT (plain text, no JSON):
**Design Direction**
Brief description of the visual style and feel

**Color Palette**
- Primary: [color]
- Secondary: [color]
- Accent: [color]

**Typography**
- Headings: [font choice]
- Body: [font choice]

**Key Sections**
1. [Section name] - [brief description]
2. [Section name] - [brief description]
...

**Special Features**
- [Feature 1]
- [Feature 2]

Keep it concise but thoughtful. 150 words max.`;

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
      max_tokens: 1024,
      stream: true,
      system: planningPrompt,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Planning failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullPlan = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullPlan += parsed.delta.text;
            onPlanUpdate(fullPlan);
          }
        } catch {
          // Skip invalid SSE data
        }
      }
    }
  }

  return fullPlan;
}

export async function generateCodeStreaming(
  prompt: string,
  currentCode: GeneratedCode,
  conversationHistory: Array<{ role: string; content: string }>,
  onUpdate: (code: GeneratedCode) => void
): Promise<GeneratedCode> {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    throw new Error('API key not configured. Please set your Anthropic API key.');
  }

  const systemPrompt = `You create professional websites. Output JSON only: {"html":"...","css":"...","js":"..."}
Use \\n for newlines, \\" for quotes.

A complete CSS framework is already loaded with perfect contrast. USE THESE CLASSES:

STRUCTURE:
- <nav> with <span class="logo"> and links - fixed dark nav, white text
- <section class="hero"> - dark gradient, WHITE text guaranteed
- <section class="section-light"> or <section class="section-gray"> - light bg, dark text
- <section class="section-dark"> - dark bg, white text
- <footer> - dark with white text
- <div class="container"> - centers content, max-width 1200px

BUTTONS:
- <button class="btn btn-primary"> - blue with hover effect
- <button class="btn btn-secondary"> - white with dark border

COMPONENTS:
- <div class="card"> - white card with shadow and hover
- class="grid grid-cols-2" or "grid-cols-3" - responsive grid
- class="flex items-center justify-between gap-4"

IMAGES: https://picsum.photos/800/600?random=1 (change number for variety)

YOUR CSS just adds custom colors or tweaks. The base handles contrast.
Single-page only - use JS for navigation.`;

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
      stream: true,
      system: systemPrompt,
      messages: messages
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let fullContent = '';
  let lastParsedCode = currentCode;
  let hasUpdated = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullContent += parsed.delta.text;

            // Strip markdown code blocks if present
            let cleanContent = fullContent;
            cleanContent = cleanContent.replace(/^```json\s*/i, '');
            cleanContent = cleanContent.replace(/^```\s*/i, '');
            cleanContent = cleanContent.replace(/\s*```$/i, '');

            // Extract values using custom parser (handles incomplete JSON)
            const html = extractJsonValue(cleanContent, 'html');
            const css = extractJsonValue(cleanContent, 'css');
            const js = extractJsonValue(cleanContent, 'js');

            if (html || css || js) {
              const newCode = {
                html: html || lastParsedCode.html,
                css: css || lastParsedCode.css,
                js: js || lastParsedCode.js
              };
              lastParsedCode = newCode;
              hasUpdated = true;
              onUpdate(newCode);
            }
          }
        } catch {
          // Skip invalid SSE data
        }
      }
    }
  }

  // Log what was generated for debugging
  console.log('Generated CSS length:', lastParsedCode.css?.length || 0);
  console.log('Generated HTML length:', lastParsedCode.html?.length || 0);

  if (!hasUpdated && fullContent.length > 0) {
    console.error('Failed to parse response:', fullContent.substring(0, 1000));
    throw new Error('Failed to parse AI response. The model may have returned an unexpected format.');
  }

  return lastParsedCode;
}

export function getDefaultCode(): GeneratedCode {
  return DEFAULT_CODE;
}

// Base CSS that ALWAYS gets injected - guarantees good styling
const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --dark: #0f172a;
  --dark-light: #1e293b;
  --light: #f8fafc;
  --gray: #64748b;
  --white: #ffffff;
}

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html { scroll-behavior: smooth; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: var(--dark);
  background: var(--white);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
}

h1 { font-size: clamp(2.5rem, 5vw, 4rem); }
h2 { font-size: clamp(2rem, 4vw, 3rem); margin-bottom: 1rem; }
h3 { font-size: clamp(1.25rem, 3vw, 1.75rem); }

p { font-size: 1.125rem; color: var(--gray); }

a { color: inherit; text-decoration: none; transition: all 0.3s ease; }
a:hover { color: var(--primary); }

ul, ol { list-style: none; }

img, video { max-width: 100%; height: auto; display: block; border-radius: 8px; }

button, .btn {
  font-family: inherit;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}
.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: var(--white);
  color: var(--dark);
  border: 2px solid var(--dark);
}
.btn-secondary:hover {
  background: var(--dark);
  color: var(--white);
}

/* HERO - Dark background with WHITE text - always readable */
.hero {
  background: linear-gradient(135deg, var(--dark) 0%, var(--dark-light) 100%);
  color: var(--white);
  padding: 120px 24px;
  min-height: 80vh;
  display: flex;
  align-items: center;
}
.hero h1, .hero h2, .hero h3, .hero p { color: var(--white); }
.hero p { color: rgba(255,255,255,0.8); }

/* NAV */
nav, .nav, .navbar {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
}
nav a, .nav a, .navbar a { color: var(--white); font-weight: 500; }
nav a:hover, .nav a:hover { color: var(--primary); }
.logo { font-size: 1.5rem; font-weight: 800; color: var(--white); }

/* SECTIONS */
section { padding: 100px 24px; }

.section-light { background: var(--white); color: var(--dark); }
.section-light h1, .section-light h2, .section-light h3 { color: var(--dark); }

.section-dark { background: var(--dark); color: var(--white); }
.section-dark h1, .section-dark h2, .section-dark h3, .section-dark p { color: var(--white); }
.section-dark p { color: rgba(255,255,255,0.8); }

.section-gray { background: var(--light); color: var(--dark); }

/* CONTAINER */
.container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* CARDS */
.card {
  background: var(--white);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
}

/* FOOTER */
footer {
  background: var(--dark);
  color: var(--white);
  padding: 60px 24px 30px;
}
footer p, footer a { color: rgba(255,255,255,0.7); }
footer a:hover { color: var(--white); }

/* UTILITIES */
.text-center { text-align: center; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }

@media (max-width: 768px) {
  section { padding: 60px 16px; }
  .hero { padding: 100px 16px; min-height: 70vh; }
  .grid-cols-2, .grid-cols-3, .grid-cols-4 { grid-template-columns: 1fr; }
  nav { padding: 16px; }
}
`;

export function buildPreviewHtml(code: GeneratedCode): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>${BASE_CSS}

/* Custom styles */
${code.css}</style>
</head>
<body>
  ${code.html}
  <script>${code.js}</script>
</body>
</html>`;
}
