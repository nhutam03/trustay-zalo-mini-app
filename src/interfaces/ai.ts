// AI assistant types aligned with session-based backend contract

export type AIRole = 'user' | 'assistant';

export interface AIHistoryMessage {
	id: string;
	role: AIRole;
	content: string;
	timestamp: string; // ISO string
	kind?: ChatEnvelopeKind;
	payload?: ContentPayload | DataPayload | ControlPayload;
}

export interface AIChatResponse {
	sessionId: string;
	message: string;
	sql?: string;
	results?: Array<Record<string, unknown>>;
	count?: number;
	timestamp: string;
	validation?: {
		isValid: boolean;
		needsClarification?: boolean;
		needsIntroduction?: boolean;
	};
}

export interface AIHistoryResponse {
	sessionId: string;
	messages: AIHistoryMessage[];
}

// Envelope-based response (Markdown-first)
export type ChatEnvelopeKind = 'CONTENT' | 'DATA' | 'CONTROL';

export interface ContentPayload {
	mode: 'CONTENT';
	stats?: ReadonlyArray<{ label: string; value: number; unit?: string }>;
}

export type EntityType = 'room' | 'post' | 'room_seeking_post';
export type TableCell = string | number | boolean | null;

export interface TableColumn {
	key: string;
	label: string;
	type: 'string' | 'number' | 'date' | 'boolean' | 'url' | 'image';
}

export interface ListItem {
	id: string;
	title: string;
	description?: string;
	thumbnailUrl?: string;
	entity?: EntityType;
	path?: string;
	externalUrl?: string;
	extra?: Record<string, string | number | boolean>;
}

export interface DataPayload {
	mode: 'LIST' | 'TABLE' | 'CHART';
	list?: { items: ReadonlyArray<ListItem>; total: number };
	table?: {
		columns: ReadonlyArray<TableColumn>;
		rows: ReadonlyArray<Record<string, TableCell>>;
		previewLimit?: number;
	};
	chart?: {
		mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
		base64?: string;
		url?: string;
		width: number;
		height: number;
		alt?: string;
	};
}

export interface ControlPayload {
	mode: 'CLARIFY' | 'ERROR';
	questions?: ReadonlyArray<string>;
	code?: string;
	details?: string;
}

export interface ChatEnvelope {
	kind: ChatEnvelopeKind;
	message: string; // Primary Markdown field (friendly for end users)
	timestamp: string;
	sessionId: string;
	meta?: Record<string, string | number | boolean>;
	// Backward-compat fields (legacy)
	sql?: string;
	results?: unknown;
	count?: number;
	validation?: {
		isValid: boolean;
		reason?: string;
		needsClarification?: boolean;
		needsIntroduction?: boolean;
		clarificationQuestion?: string;
	};
	error?: string;
	payload?: ContentPayload | DataPayload | ControlPayload;
}

export interface AIStateSnapshot {
	isSidebarOpen: boolean;
	isLoading: boolean;
	isThinking?: boolean;
	error?: string | null;
	sessionId?: string;
	// Unified local view: history plus enriched assistant entries that may include SQL/results
	messages: Array<
		| AIHistoryMessage
		| (AIHistoryMessage & {
				// Envelope enrichments
				contentStats?: ReadonlyArray<{ label: string; value: number; unit?: string }>;
				dataList?: { items: ReadonlyArray<ListItem>; total: number };
				dataTable?: {
					columns: ReadonlyArray<TableColumn>;
					rows: ReadonlyArray<Record<string, TableCell>>;
					previewLimit?: number;
				};
				chart?: { url?: string; width: number; height: number; alt?: string };
				controlQuestions?: ReadonlyArray<string>;
				errorCode?: string;
				errorDetails?: string;
				sql?: string;
				results?: Array<Record<string, unknown>>;
				count?: number;
		  })
	>;
}

// Room Publishing with AI - Dedicated types for room publishing flow
export interface RoomPublishRequest {
	message?: string; // Optional - can be empty to trigger creation
	buildingId?: string;
	images?: string[];
}

export enum RoomPublishingStatus {
	NEED_MORE_INFO = 'NEED_MORE_INFO',
	READY_TO_CREATE = 'READY_TO_CREATE',
	CREATED = 'CREATED',
	CREATION_FAILED = 'CREATION_FAILED',
}

// Building payload structure
export interface BuildingPayload {
	name: string;
	addressLine1: string;
	districtId: number;
	provinceId: number;
	wardId: number;
	country: string;
	addressLine2?: string;
}

// Room payload structure
export interface RoomPayload {
	name: string;
	description?: string;
	roomType?: string;
	totalRooms?: number;
	maxOccupancy?: number;
	areaSqm?: number;
	floorNumber?: number;
	roomNumberPrefix?: string;
	roomNumberStart?: number;
	pricing?: {
		basePriceMonthly?: number;
		depositAmount?: number;
		depositMonths?: number;
		utilityIncluded?: boolean;
		minimumStayMonths?: number;
		priceNegotiable?: boolean;
	};
	amenities?: Array<{ systemAmenityId: string }>;
	costs?: unknown[];
	rules?: unknown[];
	images?: {
		images: Array<{
			path: string;
			alt?: string;
			isPrimary?: boolean;
			sortOrder?: number;
		}>;
	};
}

// Room publishing plan structure
export interface RoomPublishPlan {
	shouldCreateBuilding: boolean;
	buildingId?: string;
	buildingPayload?: BuildingPayload;
	roomPayload: RoomPayload;
	description?: string;
}

export interface RoomPublishResponse {
	success: boolean;
	data?: {
		kind: 'CONTENT' | 'CONTROL';
		sessionId: string;
		timestamp?: string;
		message: string;
		payload?: {
			mode: 'ROOM_PUBLISH';
			status: RoomPublishingStatus;
			// For NEED_MORE_INFO
			missingField?: string;
			hasPendingActions?: boolean;
			// For READY_TO_CREATE
			plan?: RoomPublishPlan;
			// For CREATED
			roomId?: string;
			roomSlug?: string;
			roomPath?: string; // "/rooms/{slug}" - dùng để redirect
			// For CREATION_FAILED
			error?: string;
		};
		meta?: {
			stage: string;
			planReady?: boolean;
			shouldCreateBuilding?: boolean;
			pendingActions?: number;
			actionTypes?: string;
		};
	};
	error?: string;
	message?: string;
}
