// Hook for AI Assistant in Zalo Mini App
// Adapter từ trustay-web/src/stores/aiAssistant.store.ts

import { useState, useCallback, useEffect } from 'react';
import { clearAIHistory, getAIHistory, postAIChat } from '@/services/ai-service';
import type {
	AIHistoryMessage,
	ChatEnvelope,
	ContentPayload,
	ControlPayload,
	DataPayload,
} from '@/interfaces/ai';

type AssistantEnrichments = {
	contentStats?: ReadonlyArray<{ label: string; value: number; unit?: string }>;
	dataList?: { items: ReadonlyArray<import('@/interfaces/ai').ListItem>; total: number };
	dataTable?: {
		columns: ReadonlyArray<import('@/interfaces/ai').TableColumn>;
		rows: ReadonlyArray<Record<string, import('@/interfaces/ai').TableCell>>;
		previewLimit?: number;
	};
	chart?: { url?: string; width: number; height: number; alt?: string };
	controlQuestions?: ReadonlyArray<string>;
	errorCode?: string;
	errorDetails?: string;
	sql?: string;
	results?: Array<Record<string, unknown>>;
	count?: number;
};

export type EnrichedMessage = AIHistoryMessage & Partial<AssistantEnrichments>;

export interface UseAIReturn {
	messages: EnrichedMessage[];
	isLoading: boolean;
	isThinking: boolean;
	error: string | null;
	sessionId?: string;
	contextImages: string[] | null;
	loadHistory: () => Promise<void>;
	sendPrompt: (content: string, images?: string[]) => Promise<void>;
	clearHistory: () => Promise<void>;
	setError: (message: string | null) => void;
	setContextImages: (images: string[] | null) => void;
}

/**
 * Hook để quản lý AI Assistant
 *
 * @example
 * ```tsx
 * const { messages, isLoading, sendPrompt, clearHistory, setContextImages } = useAI();
 *
 * // Gửi câu hỏi
 * await sendPrompt('Tìm phòng trọ ở Gò Vấp');
 *
 * // Gửi câu hỏi kèm ảnh
 * await sendPrompt('Phòng này giá bao nhiêu?', ['/uploads/room1.jpg']);
 *
 * // Xóa lịch sử
 * await clearHistory();
 * ```
 */
export const useAI = (): UseAIReturn => {
	const [messages, setMessages] = useState<EnrichedMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isThinking, setIsThinking] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sessionId, setSessionId] = useState<string | undefined>(undefined);
	const [contextImages, setContextImages] = useState<string[] | null>(null);

	// Load lịch sử chat khi component mount
	const loadHistory = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const history = await getAIHistory();
			const historyMessages = Array.isArray(history.messages) ? history.messages : [];

			// Enrich messages với payload
			const enriched = historyMessages.map((msg): EnrichedMessage => {
				if (!msg.kind || !msg.payload) return msg;

				const result: EnrichedMessage = { ...msg };
				const p = msg.payload as ContentPayload | DataPayload | ControlPayload;

				if ('mode' in p) {
					if (p.mode === 'CONTENT') {
						result.contentStats = (p as ContentPayload).stats;
					} else if (p.mode === 'LIST' || p.mode === 'TABLE' || p.mode === 'CHART') {
						const dp = p as DataPayload;
						// Fix path mismatch: backend returns /rooms/:id but frontend expects /room/:id
						if (dp.list) {
							result.dataList = {
								items: dp.list.items.map(item => ({
									...item,
									path: item.path?.replace(/^\/rooms\//, '/room/') || item.path
								})),
								total: dp.list.total
							};
						}
						if (dp.table) result.dataTable = dp.table;
						if (dp.chart)
							result.chart = {
								url: dp.chart.url,
								width: dp.chart.width,
								height: dp.chart.height,
								alt: dp.chart.alt,
							};
					} else if (p.mode === 'CLARIFY' || p.mode === 'ERROR') {
						const cp = p as ControlPayload;
						if (p.mode === 'CLARIFY') {
							result.controlQuestions = cp.questions;
						} else {
							result.errorCode = cp.code;
							result.errorDetails = cp.details;
						}
					}
				}
				return result;
			});

			setMessages(enriched);
			setSessionId(history.sessionId);
		} catch (e) {
			console.error('[AI] loadHistory failed', e);
			setError((e as Error).message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Gửi câu hỏi tới AI
	const sendPrompt = useCallback(async (content: string, images?: string[]) => {
		// Thêm user message tạm thời
		const userMsg: EnrichedMessage = {
			id: `local_${Date.now()}`,
			role: 'user',
			content,
			timestamp: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, userMsg]);

		try {
			// Thêm typing indicator
			setIsThinking(true);
			setMessages((prev) => [
				...prev,
				{
					id: 'typing',
					role: 'assistant',
					content: '...',
					timestamp: new Date().toISOString(),
				},
			]);

			const currentPage = typeof window !== 'undefined' ? window.location.pathname : undefined;
			// Use provided images or fall back to context images
			const imagesToSend = images ?? contextImages ?? undefined;
			const res = await postAIChat(content, currentPage, imagesToSend);
			
			// Clear context images after use if they were used from context
			if (imagesToSend && !images) {
				setContextImages(null);
			}

			// Support both old AIChatResponse and new ChatEnvelope
			const maybeEnvelope = res as unknown as Partial<ChatEnvelope>;
			const base: EnrichedMessage = {
				id: `assistant_${Date.now()}`,
				role: 'assistant',
				content:
					(maybeEnvelope.message as string) ||
					(res as unknown as { message?: string }).message ||
					'',
				timestamp:
					(maybeEnvelope.timestamp as string) ||
					(res as unknown as { timestamp?: string }).timestamp ||
					new Date().toISOString(),
			};

			let enrichments: Partial<AssistantEnrichments> = {};

			if (maybeEnvelope.kind && maybeEnvelope.message) {
				// Enrich from payload
				const payload = maybeEnvelope.payload as
					| ContentPayload
					| DataPayload
					| ControlPayload
					| undefined;
				if (payload && 'mode' in payload) {
					if (payload.mode === 'CONTENT') {
						enrichments.contentStats = (payload as ContentPayload).stats;
					} else if (
						payload.mode === 'LIST' ||
						payload.mode === 'TABLE' ||
						payload.mode === 'CHART'
					) {
						const dataPayload = payload as DataPayload;
						// Fix path mismatch: backend returns /rooms/:id but frontend expects /room/:id
						if (dataPayload.list) {
							enrichments.dataList = {
								items: dataPayload.list.items.map(item => ({
									...item,
									path: item.path?.replace(/^\/rooms\//, '/room/') || item.path
								})),
								total: dataPayload.list.total
							};
						}
						enrichments.dataTable = dataPayload.table;
						enrichments.chart = dataPayload.chart
							? {
									url: dataPayload.chart.url,
									width: dataPayload.chart.width,
									height: dataPayload.chart.height,
									alt: dataPayload.chart.alt,
								}
							: undefined;
					} else if (payload.mode === 'CLARIFY' || payload.mode === 'ERROR') {
						const controlPayload = payload as ControlPayload;
						if (payload.mode === 'CLARIFY') {
							enrichments.controlQuestions = controlPayload.questions;
						} else if (payload.mode === 'ERROR') {
							enrichments.errorCode = controlPayload.code;
							enrichments.errorDetails = controlPayload.details;
						}
					}
				}
			} else {
				// Backward compatibility (SQL etc.)
				enrichments.sql = (res as unknown as { sql?: string }).sql;
				enrichments.results = (res as unknown as { results?: Array<Record<string, unknown>> })
					.results;
				enrichments.count = (res as unknown as { count?: number }).count;
			}

			const assistantMsg: EnrichedMessage = {
				...base,
				...enrichments,
			};

			setMessages((prev) => [...prev.filter((m) => m.id !== 'typing'), assistantMsg]);
			setSessionId(
				(maybeEnvelope.sessionId as string) ||
					(res as unknown as { sessionId?: string }).sessionId,
			);
		} catch (e) {
			console.error('[AI] sendPrompt failed', e);
			setError((e as Error).message);
			setMessages((prev) => prev.filter((m) => m.id !== 'typing'));
		} finally {
			setIsThinking(false);
		}
	}, [contextImages]);

	// Xóa lịch sử chat
	const clearHistoryCallback = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			await clearAIHistory();
			setMessages([]);
		} catch (e) {
			console.error('[AI] clearHistory failed', e);
			setError((e as Error).message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return {
		messages,
		isLoading,
		isThinking,
		error,
		sessionId,
		contextImages,
		loadHistory,
		sendPrompt,
		clearHistory: clearHistoryCallback,
		setError,
		setContextImages,
	};
};
