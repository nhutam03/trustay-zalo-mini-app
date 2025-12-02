// Room Instance Search interfaces based on backend documentation

// Room status enum
export type RoomStatus = 
	| 'available'    // Phòng trống
	| 'occupied'     // Đang có người thuê
	| 'maintenance'  // Đang bảo trì
	| 'reserved'     // Đã đặt trước
	| 'unavailable'; // Không khả dụng
export const ROOM_INSTANCE_STATUS_LABELS: Record<RoomStatus, string> = {
	available: 'Trống',
	occupied: 'Đang thuê',
	maintenance: 'Đang bảo trì',
	reserved: 'Đã đặt trước',
	unavailable: 'Không khả dụng',
};

// Query DTOs
export interface RoomInstanceSearchParams {
	buildingId?: string;   // UUID - optional, restrict search to a specific building
	search?: string;       // optional - single text input for flexible search
	status?: RoomStatus;   // optional - filter by room status
}

// Response DTO for room instance search
export interface RoomInstanceSearchResult {
	id: string;            // Room instance ID
	roomNumber: string;    // Room number
	roomId: string;        // Room ID
	roomName: string;      // Room name
	buildingId: string;    // Building ID
	buildingName: string;  // Building name
	ownerId: string;       // Owner ID
	ownerName: string;     // Owner name
}

export interface RoomInstanceSearchResponse {
	success: boolean;
	message: string;
	data: RoomInstanceSearchResult[];
	timestamp: string;
}

// Billing DTOs
export interface MeterReading {
	roomCostId: string;    // ID of the room cost (electric, water, etc.)
	currentReading: number;
	lastReading: number;
}

export interface CreateBillForRoomDto {
	roomInstanceId: string;       // UUID
	billingPeriod: string;         // Format: "YYYY-MM"
	billingMonth: number;          // 1-12
	billingYear: number;           // Year
	periodStart: string;           // ISO 8601 date string
	periodEnd: string;             // ISO 8601 date string
	occupancyCount: number;        // Number of tenants
	meterReadings: MeterReading[];
	notes?: string;                // Optional notes
}
