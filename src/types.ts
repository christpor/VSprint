export interface AIResponse {
  explanation?: string;
  html?: string;
  css?: string;
  javascript?: string;
  logicBreakdown?: string;
  technicalWeakPoint?: string;
  drill?: string;
  chatMessage?: string;
  nextSteps?: string[];
}

export interface InteractionType {
  id: string;
  user_id: string;
  conversation_id: string;
  prompt: string;
  response: AIResponse | null;
  loading: boolean;
  statusMessage: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}
