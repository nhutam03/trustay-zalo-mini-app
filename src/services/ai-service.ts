// AI service for Zalo Mini App
// Adapter từ trustay-web/src/actions/ai.action.ts

import { apiClient, extractErrorMessage, TokenManager } from '@/lib/api-client';
import type { AIChatResponse, AIHistoryResponse } from '@/interfaces/ai';

const AI_ENDPOINTS = {
	chat: '/api/ai/chat',
	history: '/api/ai/chat/history',
	text2sql: '/api/ai/text2sql',
};

/**
 * Gửi câu hỏi tới AI Assistant
 * @param query - Câu hỏi của người dùng
 * @param currentPage - Đường dẫn trang hiện tại (để AI hiểu context)
 * @returns AIChatResponse với message, sql, results, etc.
 */
export const postAIChat = async (
	query: string,
	currentPage?: string,
): Promise<AIChatResponse> => {
	try {
		const response = await apiClient.post<{ success: boolean; data: AIChatResponse }>(
			AI_ENDPOINTS.chat,
			{ query, currentPage },
			{ 
				timeout: 0, // Không timeout cho AI requests
				headers: { 'X-Skip-Auth': 'true' } // Flag để bỏ qua yêu cầu token
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
				timeout: 0,
				headers: { 'X-Skip-Auth': 'true' } // Flag để bỏ qua yêu cầu token
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
			timeout: 0,
			headers: { 'X-Skip-Auth': 'true' } // Flag để bỏ qua yêu cầu token
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
