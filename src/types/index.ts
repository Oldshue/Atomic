export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
}

export interface AppState {
  messages: Message[];
  currentCode: GeneratedCode;
  isGenerating: boolean;
}
