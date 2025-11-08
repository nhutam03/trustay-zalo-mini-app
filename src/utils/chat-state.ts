import { atom, selector } from "recoil";
import { ConversationData, MessageData } from "@/services/chat-service";

export interface ChatState {
  conversations: Record<string, ConversationData>;
  messages: Record<string, MessageData[]>;
  currentConversationId: string | null;
  currentUserId: string | null;
}

export const chatConversationsState = atom<Record<string, ConversationData>>({
  key: "chatConversations",
  default: {},
});

export const chatMessagesState = atom<Record<string, MessageData[]>>({
  key: "chatMessages",
  default: {},
});

export const currentConversationIdState = atom<string | null>({
  key: "currentConversationId",
  default: null,
});

export const currentUserIdState = atom<string | null>({
  key: "currentUserId",
  default: null,
});

export const currentConversationSelector = selector<ConversationData | null>({
  key: "currentConversation",
  get: ({ get }) => {
    const conversationId = get(currentConversationIdState);
    const conversations = get(chatConversationsState);
    return conversationId ? conversations[conversationId] || null : null;
  },
});

export const currentMessagesSelector = selector<MessageData[]>({
  key: "currentMessages",
  get: ({ get }) => {
    const conversationId = get(currentConversationIdState);
    const messages = get(chatMessagesState);
    return conversationId ? messages[conversationId] || [] : [];
  },
});
