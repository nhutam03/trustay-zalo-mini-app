import React, { useEffect, useRef, useState } from "react";
import { Page, Box, Avatar, Input, Button, Icon } from "zmp-ui";
import { useParams, useNavigate } from "react-router-dom";
import { useChatStore } from "@/hooks/useChatStore";
import { MESSAGE_TYPES } from "@/constants/basic";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";

// Message type content mapping
const MESSAGE_CONTENT_MAP = {
  [MESSAGE_TYPES.REQUEST_ACCEPTED]: "Đã chấp nhận yêu cầu thuê",
  [MESSAGE_TYPES.REQUEST_REJECTED]: "Đã từ chối yêu cầu thuê",
  [MESSAGE_TYPES.REQUEST_CANCELLED]: "Đã hủy yêu cầu thuê",
  [MESSAGE_TYPES.INVITATION_ACCEPTED]: "Đã chấp nhận lời mời",
  [MESSAGE_TYPES.INVITATION_REJECTED]: "Đã từ chối lời mời",
  [MESSAGE_TYPES.INVITATION_CANCELLED]: "Đã hủy lời mời",
  [MESSAGE_TYPES.ROOMMATE_APPLICATION_APPROVED]: "Đã chấp nhận đơn xin làm bạn cùng phòng",
  [MESSAGE_TYPES.ROOMMATE_APPLICATION_REJECTED]: "Đã từ chối đơn xin làm bạn cùng phòng",
  [MESSAGE_TYPES.ROOMMATE_APPLICATION_CANCELLED]: "Đã hủy đơn xin làm bạn cùng phòng",
};

const SYSTEM_MESSAGE_TYPES = [
  MESSAGE_TYPES.REQUEST_ACCEPTED,
  MESSAGE_TYPES.REQUEST_REJECTED,
  MESSAGE_TYPES.REQUEST_CANCELLED,
  MESSAGE_TYPES.INVITATION_ACCEPTED,
  MESSAGE_TYPES.INVITATION_REJECTED,
  MESSAGE_TYPES.INVITATION_CANCELLED,
  MESSAGE_TYPES.ROOMMATE_APPLICATION_APPROVED,
  MESSAGE_TYPES.ROOMMATE_APPLICATION_REJECTED,
  MESSAGE_TYPES.ROOMMATE_APPLICATION_CANCELLED,
];

function formatTime(sentAt: string): string {
  const date = new Date(sentAt);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDate(sentAt: string): string {
  const date = new Date(sentAt);
  const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  const day = days[date.getDay()];
  const dateStr = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}, ${dateStr} tháng ${month}, ${year}`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

const ConversationPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const conversationId = params.id as string;
  const setHeader = useSetHeader();

  const {
    getConversation,
    byConversation,
    loadMessages,
    sendMessage,
    setCurrentConversationId,
    setCurrentUserId,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState("");
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const conversation = conversationId ? getConversation(conversationId) : null;
  const messages = conversationId ? byConversation[conversationId] || [] : [];

  // Dummy user ID - in real app, get from auth context
  const currentUserId = "current-user-id"; // TODO: Replace with actual user ID from auth

  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
      loadMessages(conversationId);
    }

    return () => {
      setCurrentConversationId(null);
    };
  }, [conversationId, setCurrentConversationId, loadMessages]);

  useEffect(() => {
    setCurrentUserId(currentUserId);
  }, [currentUserId, setCurrentUserId]);

  useEffect(() => {
    if (conversation) {
      const title = `${conversation.counterpart.firstName} ${conversation.counterpart.lastName}`;
      setHeader({
        title,
        hasLeftIcon: true,
        type: "primary",
      });
      changeStatusBarColor("primary");
    }
  }, [conversation, setHeader]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isNearBottom);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversation) {
      return;
    }

    try {
      await sendMessage({
        content: messageInput,
        recipientId: conversation.counterpart.id,
        conversationId: conversation.conversationId,
        type: MESSAGE_TYPES.TEXT,
      });

      setMessageInput("");
      setShouldAutoScroll(true);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const isSystemMessage = (messageType: string) => {
    return SYSTEM_MESSAGE_TYPES.includes(messageType);
  };

  const getSystemMessageContent = (messageType: string, originalContent: string) => {
    if (messageType in MESSAGE_CONTENT_MAP) {
      return MESSAGE_CONTENT_MAP[messageType as keyof typeof MESSAGE_CONTENT_MAP];
    }
    return originalContent;
  };

  if (!conversation) {
    return (
      <Page className="bg-white flex items-center justify-center min-h-screen">
        <Box className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy cuộc trò chuyện</p>
          <Button onClick={() => navigate("/message")}>Quay lại</Button>
        </Box>
      </Page>
    );
  }

  return (
    <Page className="bg-gray-50 flex flex-col h-screen">
      {/* Messages Container */}
      <Box
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {messages.map((msg, index) => {
          const showDateSeparator =
            index === 0 || !isSameDay(new Date(messages[index - 1].sentAt), new Date(msg.sentAt));
          const isOwnMessage = msg.senderId === currentUserId;
          const isInvitationOrRequest =
            msg.type === MESSAGE_TYPES.INVITATION || msg.type === MESSAGE_TYPES.REQUEST;

          return (
            <div key={msg.id || `message-${index}`}>
              {showDateSeparator && (
                <div className="text-center text-sm text-gray-500 my-4">
                  {formatDate(msg.sentAt)}
                </div>
              )}

              {isSystemMessage(msg.type) ? (
                // System message
                <div className="flex justify-center my-3">
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm max-w-sm text-center">
                    <p>{getSystemMessageContent(msg.type, msg.content)}</p>
                    <div className="text-xs text-blue-600 mt-1">{formatTime(msg.sentAt)}</div>
                  </div>
                </div>
              ) : isInvitationOrRequest ? (
                // TODO: Render invitation/request card
                <div className={`flex my-2 ${isOwnMessage ? "justify-end" : ""}`}>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-xs">
                    <p className="text-sm font-semibold">
                      {msg.type === MESSAGE_TYPES.INVITATION ? "Lời mời thuê" : "Yêu cầu thuê"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatTime(msg.sentAt)}</p>
                  </div>
                </div>
              ) : (
                // Normal text message
                <div className={`flex my-2 gap-2 ${isOwnMessage ? "justify-end" : ""}`}>
                  {!isOwnMessage && (
                    <Avatar size={32} src={conversation.counterpart.avatarUrl || undefined}>
                      {conversation.counterpart.firstName.charAt(0).toUpperCase()}
                    </Avatar>
                  )}

                  <div
                    className={`flex flex-col gap-1 ${isOwnMessage ? "items-end" : "items-start"} max-w-[75%]`}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="w-full">
                        {msg.attachments.map((attachment, i) => (
                          <img
                            key={i}
                            src={attachment.url}
                            alt={attachment.name || "attachment"}
                            className="rounded-lg max-w-full"
                          />
                        ))}
                      </div>
                    )}

                    {msg.content && (
                      <div
                        className={`p-3 rounded-2xl break-words ${
                          isOwnMessage
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : "bg-white text-gray-900 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    )}

                    <div
                      className={`text-xs text-gray-400 flex items-center gap-1 px-1 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                    >
                      {formatTime(msg.sentAt)}
                      {isOwnMessage && (
                        <span>
                          {msg.readAt ? (
                            <Icon icon="zi-check-double" className="text-blue-500" />
                          ) : (
                            <Icon icon="zi-check" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box className="bg-white border-t border-gray-200 p-3">
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            variant="primary"
            size="small"
          >
            <Icon icon="zi-send" />
          </Button>
        </div>
      </Box>
    </Page>
  );
};

export default ConversationPage;
