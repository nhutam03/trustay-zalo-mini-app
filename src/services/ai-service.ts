// AI service for Zalo Mini App
// Adapter từ trustay-web/src/actions/ai.action.ts

import { apiClient, extractErrorMessage, TokenManager } from '@/lib/api-client';
import type { AIChatResponse, AIHistoryResponse, RoomPublishRequest, RoomPublishResponse } from '@/interfaces/ai';

const AI_ENDPOINTS = {
	chat: '/api/ai/chat',
	history: '/api/ai/chat/history',
	text2sql: '/api/ai/text2sql',
	roomPublish: '/api/ai/room-publish',
};

export interface ChatRequest {
	query: string;
	currentPage?: string;
	images?: string[];
}

/**
 * Gửi câu hỏi tới AI Assistant
 * @param query - Câu hỏi của người dùng
 * @param currentPage - Đường dẫn trang hiện tại (để AI hiểu context)
 * @param images - Danh sách đường dẫn ảnh (optional)
 * @returns AIChatResponse với message, sql, results, etc.
 */
export const postAIChat = async (
	query: string,
	currentPage?: string,
	images?: string[],
): Promise<AIChatResponse> => {
	try {
		const requestBody: ChatRequest = {
			query,
			...(currentPage && { currentPage }),
			...(images && images.length > 0 && { images }),
		};
		const response = await apiClient.post<{ success: boolean; data: AIChatResponse }>(
			AI_ENDPOINTS.chat,
			requestBody,
			{ 
				timeout: 0 // Không timeout cho AI requests
			},
		);
		// API trả về { success: true, data: {...} }, cần unwrap data
		return response.data.data;
	} catch (error) {
		console.error('Error posting AI chat:', error);
		throw new Error(extractErrorMessage(error, 'Không thể gửi tin nhắn tới AI'));
	}
};

/**
 * Lấy lịch sử chat với AI
 * @returns AIHistoryResponse với sessionId và messages
 */
export const getAIHistory = async (): Promise<AIHistoryResponse> => {
	try {
		const response = await apiClient.get<{ success: boolean; data: AIHistoryResponse }>(
			AI_ENDPOINTS.history,
			{
				timeout: 0
			},
		);
		// API trả về { success: true, data: {...} }, cần unwrap data
		return response.data.data;
	} catch (error) {
		console.error('Error getting AI history:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải lịch sử chat'));
	}
};

/**
 * Xóa lịch sử chat với AI
 */
export const clearAIHistory = async (): Promise<void> => {
	try {
		await apiClient.delete(AI_ENDPOINTS.history, { 
			timeout: 0
		});
	} catch (error) {
		console.error('Error clearing AI history:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa lịch sử chat'));
	}
};

/**
 * Chuyển đổi văn bản thành SQL query và thực thi
 * @param query - Câu hỏi bằng tiếng Việt
 * @returns SQL query và kết quả thực thi
 */
export const textToSQL = async (
	query: string,
): Promise<{ sql: string; results?: Array<Record<string, unknown>> }> => {
	try {
		const response = await apiClient.post<{
			sql: string;
			results?: Array<Record<string, unknown>>;
		}>(
			AI_ENDPOINTS.text2sql,
			{ query },
			{ timeout: 0 },
		);
		return response.data;
	} catch (error) {
		console.error('Error converting text to SQL:', error);
		throw new Error(extractErrorMessage(error, 'Không thể chuyển đổi câu hỏi'));
	}
};

/**
 * Room Publishing with AI - Dedicated endpoint for room publishing flow
 * @param message - Mô tả phòng trọ hoặc câu trả lời cho AI (có thể để trống để trigger creation)
 * @param images - Danh sách đường dẫn ảnh (optional)
 * @param buildingId - ID của dãy trọ (optional)
 * @returns RoomPublishResponse với status và payload
 */
export const postAIRoomPublish = async (
	message: string,
	images?: string[],
	buildingId?: string,
): Promise<RoomPublishResponse> => {
	try {
		const requestBody: RoomPublishRequest = {
			message,
			...(images && images.length > 0 && { images }),
			...(buildingId && { buildingId }),
		};
		const response = await apiClient.post<RoomPublishResponse>(
			AI_ENDPOINTS.roomPublish,
			requestBody,
			{ 
				timeout: 0,
				// Không skip auth - cần token để đăng phòng
			},
		);
		
		// Kiểm tra success field vì API có thể trả về 201 nhưng success: false
		if (!response.data.success) {
			const errorMessage = response.data.error || response.data.message || 'Không thể tạo phòng với AI';
			throw new Error(errorMessage);
		}
		
		return response.data;
	} catch (error) {
		console.error('Error posting AI room publish:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo phòng với AI'));
	}
};
