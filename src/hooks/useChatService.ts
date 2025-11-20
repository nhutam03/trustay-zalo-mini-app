import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
	sendMessage,
	getMessages,
	markAllMessagesAsRead,
	getConversations,
	getOrCreateConversation,
	type SendMessageData,
	type GetMessagesParams,
} from '@/services/chat-service';

// Query keys
export const chatKeys = {
	all: ['chat'] as const,
	conversations: () => [...chatKeys.all, 'conversations'] as const,
	messages: (conversationId: string) =>
		[...chatKeys.all, 'messages', conversationId] as const,
	conversation: (participantId: string) =>
		[...chatKeys.all, 'conversation', participantId] as const,
};

// Get conversations
export const useConversations = () => {
	return useQuery({
		queryKey: chatKeys.conversations(),
		queryFn: () => getConversations(),
		staleTime: 30 * 1000, // 30 seconds
		refetchInterval: 60 * 1000, // Auto-refetch every minute
	});
};

// Get messages for a conversation
export const useMessages = (conversationId: string | undefined, params?: GetMessagesParams) => {
	return useQuery({
		queryKey: [...chatKeys.messages(conversationId || ''), params],
		queryFn: () => getMessages(conversationId!, params),
		enabled: !!conversationId,
		staleTime: 10 * 1000, // 10 seconds
		refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds for real-time updates
	});
};

// Get messages with infinite scroll support
export const useInfiniteMessages = (conversationId: string | undefined, limit: number = 20) => {
	return useInfiniteQuery({
		queryKey: chatKeys.messages(conversationId || ''),
		queryFn: ({ pageParam }) =>
			getMessages(conversationId!, { cursor: pageParam, limit }),
		enabled: !!conversationId,
		getNextPageParam: (lastPage) => {
			// Assuming the API returns a nextCursor in the response
			return (lastPage as any).nextCursor;
		},
		staleTime: 10 * 1000,
		refetchInterval: 5 * 1000,
	});
};

// Get or create conversation with a participant
export const useGetOrCreateConversation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (participantId: string) => getOrCreateConversation(participantId),
		onSuccess: () => {
			// Invalidate conversations list
			queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
		},
	});
};

// Send message
export const useSendMessage = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: SendMessageData) => sendMessage(data),
		onSuccess: (response) => {
			// Invalidate messages for this conversation
			queryClient.invalidateQueries({
				queryKey: chatKeys.messages(response.data.conversationId),
			});
			// Invalidate conversations list to update last message
			queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
		},
	});
};

// Mark all messages as read
export const useMarkAllMessagesAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (conversationId: string) => markAllMessagesAsRead(conversationId),
		onSuccess: (_, conversationId) => {
			// Invalidate messages for this conversation
			queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
			// Invalidate conversations list to update unread count
			queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
		},
	});
};
