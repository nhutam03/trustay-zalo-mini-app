import React, { useEffect, useMemo } from "react";
import { Page, Box, Avatar, Input } from "zmp-ui";
import BottomNav from "../components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useChatStore } from "@/hooks/useChatStore";
import { useNavigate } from "react-router-dom";
import { MESSAGE_TYPES } from "@/constants/basic";

// Message type content mapping
const MESSAGE_CONTENT_MAP = {
  [MESSAGE_TYPES.INVITATION]: "Lời mời thuê",
  [MESSAGE_TYPES.REQUEST]: "Yêu cầu thuê",
  [MESSAGE_TYPES.REQUEST_ACCEPTED]: "Đã chấp nhận yêu cầu thuê",
  [MESSAGE_TYPES.REQUEST_REJECTED]: "Đã từ chối yêu cầu thuê",
  [MESSAGE_TYPES.REQUEST_CANCELLED]: "Đã hủy yêu cầu thuê",
  [MESSAGE_TYPES.INVITATION_ACCEPTED]: "Đã chấp nhận lời mời",
  [MESSAGE_TYPES.INVITATION_REJECTED]: "Đã từ chối lời mời",
  [MESSAGE_TYPES.INVITATION_CANCELLED]: "Đã hủy lời mời",
  [MESSAGE_TYPES.ROOMMATE_APPLICATION]: "Đơn xin làm bạn cùng phòng",
  [MESSAGE_TYPES.ROOMMATE_APPLICATION_APPROVED]: "Đã chấp nhận đơn xin làm bạn cùng phòng",
  [MESSAGE_TYPES.ROOMMATE_APPLICATION_REJECTED]: "Đã từ chối đơn xin làm bạn cùng phòng",
  [MESSAGE_TYPES.ROOMMATE_APPLICATION_CANCELLED]: "Đã hủy đơn xin làm bạn cùng phòng",
};

// Helper to get preview text for last message
function getMessagePreview(lastMessage: { content: string; type: string } | undefined): string {
  if (!lastMessage) return "";

  // Handle special message types
  if (lastMessage.type in MESSAGE_CONTENT_MAP) {
    return MESSAGE_CONTENT_MAP[lastMessage.type as keyof typeof MESSAGE_CONTENT_MAP];
  }

  // For text messages, show content
  if (lastMessage.content) {
    return lastMessage.content;
  }

  // If no content, might be attachments only
  return "Đã gửi file đính kèm";
}

// Format time helper
function formatTime(sentAt: string | undefined): string {
  if (!sentAt) return "";
  const date = new Date(sentAt);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

const MessagesPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { conversations, loadConversations, markAllRead } = useChatStore();

  const conversationList = useMemo(() => Object.values(conversations), [conversations]);

  useEffect(() => {
    setHeader({
      title: "Tin nhắn",
      hasLeftIcon: false,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleConversationClick = (conversationId: string) => {
    console.log("[MessagePage] Navigating to conversation:", conversationId);
    markAllRead(conversationId);
    navigate(`/conversation/${conversationId}`);
  };

  return (
    <Page className="bg-white has-bottom-nav">
      {/* Search */}
      <Box className="p-4 border-b border-gray-200">
        <Input.Search
          placeholder="Tìm kiếm hoặc bắt đầu cuộc trò chuyện mới"
          className="w-full"
        />
      </Box>

      {/* Conversations List */}
      {conversationList.length > 0 ? (
        <Box className="divide-y divide-gray-100">
          {conversationList.map((convo) => {
            const lastMessage = convo.lastMessage;
            const counterpart = convo.counterpart;
            const displayName = `${counterpart.firstName} ${counterpart.lastName}`;
            const messagePreview = getMessagePreview(lastMessage);
            const hasUnread = convo.unreadCount && convo.unreadCount > 0;

            return (
              <div
                key={convo.conversationId}
                className="flex items-center p-4 active:bg-gray-50 cursor-pointer"
                onClick={() => handleConversationClick(convo.conversationId)}
              >
                <Avatar
                  size={56}
                  src={counterpart.avatarUrl || undefined}
                  online
                >
                  {counterpart.firstName.charAt(0).toUpperCase()}
                </Avatar>
                <div className="ml-3 flex-1 min-w-0">
                  <p className={`font-medium truncate ${hasUnread ? "font-bold" : ""}`}>
                    {displayName}
                  </p>
                  <p className={`text-sm text-gray-500 truncate ${hasUnread ? "font-semibold text-gray-900" : ""}`}>
                    {messagePreview}
                  </p>
                </div>
                <div className="flex flex-col items-end text-xs text-gray-400 ml-2">
                  <p className="mb-1">{formatTime(lastMessage?.sentAt)}</p>
                  {hasUnread && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white rounded-full text-xs">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </Box>
      ) : (
        /* Empty State */
        <Box className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-center">Chưa có cuộc trò chuyện nào</p>
          <p className="text-gray-400 text-sm text-center mt-2">Tin nhắn của bạn sẽ hiển thị ở đây</p>
        </Box>
      )}

      <BottomNav />
    </Page>
  );
};

export default MessagesPage;
