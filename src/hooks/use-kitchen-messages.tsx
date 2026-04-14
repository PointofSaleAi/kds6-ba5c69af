import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { KitchenMessage, KitchenReply } from '@/types/kitchen-message';
import { mockKitchenMessages } from '@/data/mock-kitchen-messages';

interface KitchenMessagesContextValue {
  messages: KitchenMessage[];
  replies: KitchenReply[];
  pendingCount: number;
  acknowledgeMessage: (messageId: string) => void;
  sendReply: (messageId: string, text: string) => void;
  getMessagesForOrder: (orderId: string) => KitchenMessage[];
  getRepliesForMessage: (messageId: string) => KitchenReply[];
  simulateNewMessage: () => void;
}

const KitchenMessagesContext = createContext<KitchenMessagesContextValue | null>(null);

export function KitchenMessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<KitchenMessage[]>(mockKitchenMessages);
  const [replies, setReplies] = useState<KitchenReply[]>([]);

  const pendingCount = useMemo(
    () => messages.filter(m => m.status === 'pending').length,
    [messages]
  );

  const acknowledgeMessage = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.message_id === messageId
          ? { ...m, status: 'acknowledged' as const, acknowledged_at: new Date() }
          : m
      )
    );
  }, []);

  const sendReply = useCallback((messageId: string, text: string) => {
    const reply: KitchenReply = {
      reply_id: `kr-${Date.now()}`,
      message_id: messageId,
      reply_text: text,
      timestamp: new Date(),
      source: 'kds',
    };
    setReplies(prev => [...prev, reply]);
  }, []);

  const simulateNewMessage = useCallback(() => {
    const samples = [
      { text: 'Table 5 is asking about their entrees', terminal: 'POS-1', employee: 'Sarah' },
      { text: '86 the salmon, switching to halibut', terminal: 'POS-2', employee: 'Mike' },
      { text: 'VIP guest arriving in 10 mins, priority prep', terminal: 'POS-1', employee: 'Manager' },
      { text: 'Customer wants extra sauce on the side', terminal: 'POS-3', employee: 'Alex' },
    ];
    const sample = samples[Math.floor(Math.random() * samples.length)];
    const newMsg: KitchenMessage = {
      message_id: `km-sim-${Date.now()}`,
      message_text: sample.text,
      employee_name: sample.employee,
      terminal_name: sample.terminal,
      timestamp: new Date(),
      status: 'pending',
    };
    setMessages(prev => [...prev, newMsg]);
  }, []);

  const getMessagesForOrder = useCallback(
    (orderId: string) => messages.filter(m => m.linked_order_id === orderId),
    [messages]
  );

  const getRepliesForMessage = useCallback(
    (messageId: string) => replies.filter(r => r.message_id === messageId),
    [replies]
  );

  const value = useMemo<KitchenMessagesContextValue>(
    () => ({
      messages,
      replies,
      pendingCount,
      acknowledgeMessage,
      sendReply,
      getMessagesForOrder,
      getRepliesForMessage,
      simulateNewMessage,
    }),
    [messages, replies, pendingCount, acknowledgeMessage, sendReply, getMessagesForOrder, getRepliesForMessage, simulateNewMessage]
  );

  return (
    <KitchenMessagesContext.Provider value={value}>
      {children}
    </KitchenMessagesContext.Provider>
  );
}

export function useKitchenMessages() {
  const ctx = useContext(KitchenMessagesContext);
  if (!ctx) throw new Error('useKitchenMessages must be used within KitchenMessagesProvider');
  return ctx;
}
