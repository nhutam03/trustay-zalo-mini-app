import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  chatConversationsState,
  chatMessagesState,
  currentConversationIdState,
  currentUserIdState,
  currentConversationSelector,
  currentMessagesSelector,
} from "@/utils/chat-state";
import {
  getConversations,
  getMessages,
  sendMessage as sendMessageApi,
  markAllMessagesAsRead,
  type SendMessageData,
  type ConversationData,
  type MessageData,
} from "@/services/chat-service";
import { MESSAGE_TYPES } from "@/constants/basic";
import { useCallback } from "react";

export const useChatStore = () => {
  const [conversations, setConversations] = useRecoilState(chatConversationsState);
  const [messages, setMessages] = useRecoilState(chatMessagesState);
  const [currentConversationId, setCurrentConversationId] = useRecoilState(currentConversationIdState);
  const [currentUserId, setCurrentUserId] = useRecoilState(currentUserIdState);

  const currentConversation = useRecoilValue(currentConversationSelector);
  const currentMessages = useRecoilValue(currentMessagesSelector);

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      const conversationsMap: Record<string, ConversationData> = {};
      data.forEach((conv) => {
        conversationsMap[conv.conversationId] = conv;
      });
      setConversations(conversationsMap);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, [setConversations]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      try {
        const data = await getMessages(conversationId);
        setMessages((prev) => ({
          ...prev,
          [conversationId]: data,
        }));
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    },
    [setMessages]
  );

  const sendMessage = useCallback(
    async (data: {
      content: string;
      recipientId?: string;
      conversationId?: string;
      attachmentFiles?: File[];
      type?: string;
    }) => {
      try {
        // TODO: Handle file uploads if attachmentFiles exist
        const payload: SendMessageData = {
          content: data.content,
          recipientId: data.recipientId,
          conversationId: data.conversationId,
          type: data.type || MESSAGE_TYPES.TEXT,
        };

        const newMessage = await sendMessageApi(payload);
        console.log("[useChatStore] sendMessage response:", newMessage);

        // Response is MessageData directly (not wrapped)
        const conversationId = newMessage.conversationId;
        console.log("[useChatStore] Adding message to conversation:", conversationId);
        console.log("[useChatStore] Message data:", newMessage);

        setMessages((prev) => {
          const updated = {
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), newMessage],
          };
          console.log("[useChatStore] Updated messages:", updated[conversationId].length);
          return updated;
        });

        // Update conversation's last message
        setConversations((prev) => {
          if (prev[conversationId]) {
            return {
              ...prev,
              [conversationId]: {
                ...prev[conversationId],
                lastMessage: {
                  id: newMessage.id,
                  content: newMessage.content,
                  type: newMessage.type,
                  sentAt: newMessage.sentAt,
                },
              },
            };
          }
          return prev;
        });

        return { data: newMessage };
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    },
    [setMessages, setConversations]
  );

  const markAllRead = useCallback(
    async (conversationId: string) => {
      try {
        await markAllMessagesAsRead(conversationId);

        // Update local state to mark messages as read
        setMessages((prev) => {
          const conversationMessages = prev[conversationId] || [];
          const updatedMessages = conversationMessages.map((msg) => ({
            ...msg,
            readAt: msg.readAt || new Date().toISOString(),
          }));
          return {
            ...prev,
            [conversationId]: updatedMessages,
          };
        });

        // Update conversation unread count
        setConversations((prev) => {
          if (prev[conversationId]) {
            return {
              ...prev,
              [conversationId]: {
                ...prev[conversationId],
                unreadCount: 0,
              },
            };
          }
          return prev;
        });
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
    },
    [setMessages, setConversations]
  );

  const getConversation = useCallback(
    (conversationId: string) => {
      return conversations[conversationId] || null;
    },
    [conversations]
  );

  const addMessage = useCallback(
    (message: MessageData) => {
      const conversationId = message.conversationId;
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), message],
      }));

      // Update conversation's last message and unread count
      setConversations((prev) => {
        if (prev[conversationId]) {
          const isCurrentUserSender = message.senderId === currentUserId;
          return {
            ...prev,
            [conversationId]: {
              ...prev[conversationId],
              lastMessage: {
                id: message.id,
                content: message.content,
                type: message.type,
                sentAt: message.sentAt,
              },
              unreadCount: isCurrentUserSender
                ? prev[conversationId].unreadCount
                : (prev[conversationId].unreadCount || 0) + 1,
            },
          };
        }
        return prev;
      });
    },
    [setMessages, setConversations, currentUserId]
  );

  return {
    // State
    conversations,
    messages,
    currentConversationId,
    currentUserId,
    currentConversation,
    currentMessages,
    byConversation: messages,

    // Actions
    setCurrentConversationId,
    setCurrentUserId,
    loadConversations,
    loadMessages,
    sendMessage,
    markAllRead,
    getConversation,
    addMessage,
  };
};
