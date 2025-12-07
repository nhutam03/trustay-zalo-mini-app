import React, { useEffect, useRef, useState } from 'react';
import { Page, Box, Header, Button, Modal, Text } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { useAI, type EnrichedMessage } from '@/hooks/useAI';
import { AIInput } from '@/components/ai/AIInput';
import { AITypingIndicator } from '@/components/ai/AITypingIndicator';
import { AIMessageMarkdown } from '@/components/ai/AIMessageMarkdown';
import { AIListPreview } from '@/components/ai/AIListPreview';
import { AITablePreview } from '@/components/ai/AITablePreview';
import { AIControlBlock } from '@/components/ai/AIControlBlock';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';

const AIAssistantPage: React.FC = () => {
	const setHeader = useSetHeader();
	useEffect(() => {
		setHeader({
			title: 'Trợ lý AI',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);
	const navigate = useNavigate();
	const { messages, isLoading, isThinking, error, loadHistory, sendPrompt, clearHistory } =
		useAI();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogContent, setDialogContent] = useState<React.ReactNode>(null);

	// Quick suggestions
	const quickSuggestions: ReadonlyArray<string> = [
		'Tìm phòng trọ có gác lửng và ban công ở Gò Vấp dưới 5 triệu.',
		'Có studio full nội thất nào ở Quận 1 không?',
		'Phòng nào có máy lạnh ở Bình Thạnh?',
		'Tìm phòng trọ gần IUH',
		'Hóa đơn điện nước tháng này của tôi bao nhiêu?',
	];

	// Load history on mount
	useEffect(() => {
		void loadHistory();
	}, [loadHistory]);

	// Auto scroll to bottom
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	// Type guards
	const hasContentStats = (
		m: EnrichedMessage,
	): m is EnrichedMessage & {
		contentStats: ReadonlyArray<{ label: string; value: number; unit?: string }>;
	} => {
		return 'contentStats' in m && Array.isArray(m.contentStats);
	};

	const hasDataList = (
		m: EnrichedMessage,
	): m is EnrichedMessage & {
		dataList: { items: ReadonlyArray<import('@/interfaces/ai').ListItem>; total: number };
	} => {
		return 'dataList' in m && m.dataList !== undefined && Array.isArray(m.dataList.items);
	};

	const hasDataTable = (
		m: EnrichedMessage,
	): m is EnrichedMessage & {
		dataTable: {
			columns: ReadonlyArray<import('@/interfaces/ai').TableColumn>;
			rows: ReadonlyArray<Record<string, import('@/interfaces/ai').TableCell>>;
			previewLimit?: number;
		};
	} => {
		return (
			'dataTable' in m &&
			m.dataTable !== undefined &&
			Array.isArray(m.dataTable.columns) &&
			Array.isArray(m.dataTable.rows)
		);
	};

	const hasChart = (
		m: EnrichedMessage,
	): m is EnrichedMessage & {
		chart: { url?: string; width: number; height: number; alt?: string };
	} => {
		return (
			'chart' in m &&
			m.chart !== undefined &&
			typeof m.chart.width === 'number' &&
			typeof m.chart.height === 'number'
		);
	};

	const hasControlQuestions = (
		m: EnrichedMessage,
	): m is EnrichedMessage & { controlQuestions: ReadonlyArray<string> } => {
		return 'controlQuestions' in m && Array.isArray(m.controlQuestions);
	};

	const hasErrorInfo = (
		m: EnrichedMessage,
	): m is EnrichedMessage & { errorCode?: string; errorDetails?: string } => {
		return (
			('errorCode' in m && typeof m.errorCode === 'string') ||
			('errorDetails' in m && typeof m.errorDetails === 'string')
		);
	};

	const hasAssistantResult = (
		m: EnrichedMessage,
	): m is EnrichedMessage & {
		sql?: string;
		results?: Array<Record<string, unknown>>;
		count?: number;
	} => {
		return 'sql' in m || 'results' in m || 'count' in m;
	};

	const onSend = async (content: string) => {
		await sendPrompt(content);
	};

	const onOpenDialog = (content: React.ReactNode) => {
		setDialogContent(content);
		setDialogOpen(true);
	};

	return (
		<Page className="flex flex-col h-screen">

			<Box className="flex-1 overflow-y-auto p-4 pb-24 space-y-3 bg-gray-50">
				{isLoading && messages.length === 0 && (
					<div className="flex items-center gap-2 text-sm text-gray-500">
						<span className="animate-spin">⏳</span> Đang tải...
					</div>
				)}
				{error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

				{messages.length === 0 && !isLoading && (
					<div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
						<div className="text-6xl mb-6">🤖</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							AI Assistant
						</h2>
						<p className="text-gray-600 text-center mb-6">
							Tôi có thể giúp bạn tìm phòng trọ, kiểm tra hóa đơn và nhiều thứ khác
						</p>

						<div className="w-full max-w-md space-y-2">
							<p className="text-sm font-medium text-gray-700 mb-3">Gợi ý câu hỏi:</p>
							{quickSuggestions.slice(0, 5).map((q, idx) => (
								<button
									key={idx}
									type="button"
									onClick={() => sendPrompt(q)}
									className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 text-sm border border-gray-200 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 text-left transition-all shadow-sm"
									aria-label={q}
								>
									{q}
								</button>
							))}
						</div>
					</div>
				)}

				{messages.map((m) => (
					<div
						key={m.id}
						className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
					>
						<div
							className={`max-w-[85%] rounded-2xl px-4 py-3 break-words text-sm shadow-sm ${
								m.role === 'user'
									? 'bg-blue-500 text-white rounded-br-md'
									: 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
							}`}
						>
							{m.id === 'typing' ? (
								<AITypingIndicator />
							) : m.role === 'assistant' ? (
								<div className="prose prose-sm max-w-none">
									{m.content && (
										<AIMessageMarkdown
											content={m.content}
											onOpenTable={onOpenDialog}
										/>
									)}
								</div>
							) : (
								<span className="whitespace-pre-wrap text-sm">{m.content}</span>
							)}

							{/* Content Stats */}
							{hasContentStats(m) && (
								<div className="mt-2 flex flex-wrap gap-2">
									{m.contentStats.map((s, idx) => (
										<span
											key={idx}
											className="text-xs bg-white/80 border rounded-full px-2 py-1"
										>
											{s.label}: {s.value}
											{s.unit ? s.unit : ''}
										</span>
									))}
								</div>
							)}

							{/* Data List */}
							{hasDataList(m) && (
								<AIListPreview items={m.dataList.items} onOpenFull={onOpenDialog} />
							)}

							{/* Data Table */}
							{hasDataTable(m) && (
								<AITablePreview
									columns={m.dataTable.columns}
									rows={m.dataTable.rows}
									previewLimit={m.dataTable.previewLimit}
									onOpenFull={onOpenDialog}
								/>
							)}

							{/* Chart */}
							{hasChart(m) && m.chart.url && (
								<div className="mt-3">
									<img
										src={m.chart.url}
										alt={m.chart.alt || 'Chart'}
										width={m.chart.width}
										height={m.chart.height}
										className="max-w-full h-auto rounded border"
									/>
								</div>
							)}

							{/* Control Questions / Errors */}
							{(hasControlQuestions(m) || hasErrorInfo(m)) && (
								<AIControlBlock
									questions={hasControlQuestions(m) ? m.controlQuestions : undefined}
									errorCode={hasErrorInfo(m) ? m.errorCode : undefined}
									errorDetails={hasErrorInfo(m) ? m.errorDetails : undefined}
									onAsk={(q) => sendPrompt(q)}
								/>
							)}

							{/* SQL Results (legacy) */}
							{hasAssistantResult(m) && m.sql && (
								<details className="mt-2 text-xs">
									<summary className="cursor-pointer inline-flex items-center gap-1">
										<span>▼</span> Chi tiết kết quả
									</summary>
									<div className="mt-2">
										<div className="text-gray-600 mb-1 text-xs">SQL:</div>
										<pre className="bg-white border rounded p-2 overflow-auto max-h-40 whitespace-pre-wrap text-gray-700 text-xs">
											{m.sql}
										</pre>
										{m.results && Array.isArray(m.results) && (
											<div className="mt-2">
												<div className="text-gray-600 mb-1 text-xs">
													Kết quả {m.count ?? m.results.length}:
												</div>
												<pre className="bg-white border rounded p-2 overflow-auto max-h-48 whitespace-pre-wrap text-gray-700 text-xs">
													{JSON.stringify(m.results, null, 2)}
												</pre>
											</div>
										)}
									</div>
								</details>
							)}
						</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</Box>

			<AIInput onSend={onSend} disabled={isThinking} />

			{/* Dialog for full table/list view */}
			<Modal
				visible={dialogOpen}
				onClose={() => setDialogOpen(false)}
				title="Xem chi tiết"
				className="max-h-[80vh] overflow-auto"
			>
				{dialogContent}
			</Modal>
		</Page>
	);
};

export default AIAssistantPage;
