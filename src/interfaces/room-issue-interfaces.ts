// Room Issue interfaces based on backend documentation

// Enums
export type RoomIssueCategory = 
	| 'facility'   // Sự cố về cơ sở vật chất (tường, cửa, sàn...)
	| 'utility'    // Sự cố về tiện ích (điện, nước, wifi...)
	| 'neighbor'   // Vấn đề với hàng xóm
	| 'noise'      // Tiếng ồn
	| 'security'   // Vấn đề an ninh
	| 'other';     // Khác

export type RoomIssueStatus = 
	| 'new'         // Mới tạo, chưa xử lý
	| 'in_progress' // Đang xử lý
	| 'resolved';   // Đã giải quyết

// DTOs for creating room issue
export interface CreateRoomIssueDto {
	roomInstanceId: string;     // UUID - Phải thuộc rental active của tenant
	title: string;              // Tiêu đề ngắn (max 120 chars)
	category: RoomIssueCategory;
	imageUrls?: string[];       // Tối đa 10 link, có thể rỗng
}

// Query DTOs
export interface RoomIssueQueryDto {
	page?: number;              // >= 1, default: 1
	limit?: number;             // 1-50, default: 20
	roomInstanceId?: string;    // UUID - Lọc theo phòng
	category?: RoomIssueCategory;
	status?: RoomIssueStatus;   // Nếu không truyền: chỉ lấy 'new' + 'in_progress'
}

export interface LandlordRoomIssueQueryDto extends RoomIssueQueryDto {
	reporterId?: string;        // UUID - Lọc theo người báo cáo cụ thể
}

// Response DTOs
export interface RoomIssueReporterDto {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	phone: string | null;
}

export interface RoomIssueRoomDto {
	id: string;
	name: string;
	slug: string;
	buildingId: string;
	buildingName: string;
	ownerId: string;
}

export interface RoomIssueRoomInstanceDto {
	id: string;
	roomNumber: string;
	room: RoomIssueRoomDto;
}

export interface RoomIssueResponseDto {
	id: string;
	title: string;
	category: RoomIssueCategory;
	status: RoomIssueStatus;
	imageUrls: string[];
	createdAt: string;          // ISO 8601 DateTime
	updatedAt: string;          // ISO 8601 DateTime
	reporter: RoomIssueReporterDto;
	roomInstance: RoomIssueRoomInstanceDto;
}

// Paginated response
export interface PaginatedRoomIssueResponse {
	items: RoomIssueResponseDto[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
