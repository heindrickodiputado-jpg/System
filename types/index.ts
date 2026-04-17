export type Mode = 'sovereign' | 'unrestricted';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Session {
  id: string;
  title: string;
  mode: Mode;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface Memory {
  id: number;
  text: string;
  type: 'pinned' | 'auto';
  created_at: string;
}

export interface MemoryStore {
  pinned: Memory[];
  auto: Memory[];
}

export type SSEEventType = 'token' | 'done' | 'error';

export interface SSEEvent {
  type: SSEEventType;
  content?: string;
  full_content?: string;
  message?: string;
}

export interface ChatRequest {
  message: string;
  session_id: string;
  mode: Mode;
}

export interface AuthState {
  checked: boolean;
  authenticated: boolean;
}

export type AppState =
  | 'loading'
  | 'auth'
  | 'booting'
  | 'ready';
