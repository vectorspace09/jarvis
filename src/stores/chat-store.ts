import { create } from 'zustand';

interface ChatState {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (message: string) => {
    set({ isLoading: true, error: null });

    try {
      // Add user message to state
      set(state => ({
        messages: [...state.messages, { role: 'user', content: message }]
      }));

      // Send message to API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add assistant response to state
      set(state => ({
        messages: [...state.messages, { role: 'assistant', content: data.response }],
        isLoading: false
      }));

    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false
      });
    }
  }
})); 