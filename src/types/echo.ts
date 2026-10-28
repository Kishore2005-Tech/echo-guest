export type MoodType = 'Happy' | 'Inspired' | 'Grateful' | 'Curious' | 'Peaceful';

export interface EchoMessage {
  id: string;
  name: string;
  message: string;
  mood: MoodType;
  created_at: string;
}

export interface NewEchoInput {
  name: string;
  message: string;
  mood: MoodType;
}

export type ConnectionStatus = 'checking' | 'connected' | 'not_configured' | 'error';

export interface ConnectionInfo {
  status: ConnectionStatus;
  url: string;
  isCustom: boolean;
  errorMessage?: string;
  messageCount?: number;
}
