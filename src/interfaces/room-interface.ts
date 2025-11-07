
// Listings (public rooms) types
export interface RoomListing {
	id: string;
	slug: string;
	name: string;
	roomType: string;
	maxOccupancy: number;
	isVerified: boolean;
	buildingName: string;
	buildingVerified: boolean;
	address: string;
	owner: {
		name: string;
		avatarUrl: string | null;
		gender: string;
		verifiedPhone: boolean;
		verifiedEmail: boolean;
		verifiedIdentity: boolean;
	};
	location: {
		provinceId: number;
		provinceName: string;
		districtId: number;
		districtName: string;
		wardId: number;
		wardName: string;
	};
	images: Array<{
		url: string;
		alt: string;
		isPrimary: boolean;
		sortOrder: number;
	}>;
	amenities: Array<{
		id: string;
		name: string;
		category: string;
	}>;
	costs: Array<{
		id: string;
		name: string;
		value: string;
	}>;
	pricing: {
		basePriceMonthly: string;
		depositAmount: string;
		utilityIncluded: boolean;
	};
	rules: Array<{
		id: string;
		name: string;
		type: string;
	}>;
}
export interface RoomDetail {
	id: string;
	slug: string;
	name: string;
	description: string;
	roomType: string;
	areaSqm: string;
	maxOccupancy: number;
	isVerified: boolean;
	buildingId: string;
	buildingName: string;
	buildingVerified: boolean;
	buildingDescription: string;
	address: string;
	addressLine2: string;
	availableRooms: number;
	totalRooms: number;
	isActive: boolean;
	floorNumber: number;
	viewCount: number;
	lastUpdated: string;
	location: {
		provinceId: number;
		provinceName: string;
		districtId: number;
		districtName: string;
		wardId: number;
		wardName: string;
	};
	owner: {
		id: string;
		name: string;
		gender: string;
		email: string;
		phone: string;
		avatarUrl: string | null;
		verifiedPhone: boolean;
		verifiedEmail: boolean;
		verifiedIdentity: boolean;
		totalBuildings: number;
		totalRoomInstances: number;
	};
	images: Array<{
		url: string;
		alt: string;
		isPrimary: boolean;
		sortOrder: number;
	}>;
	amenities: Array<{
		id: string;
		name: string;
		category: string;
		customValue: string | null;
		notes: string | null;
	}>;
	costs: Array<{
		id: string;
		name: string;
		value: string;
		category: string;
		notes: string | null;
	}>;
	pricing: {
		basePriceMonthly: string;
		depositAmount?: string;
		utilityIncluded: boolean;
	};
	rules: Array<{
		id: string;
		name: string;
		type: string;
		customValue: string | null;
		notes: string | null;
		isEnforced: boolean;
	}>;
	seo: {
		title: string;
		description: string;
		keywords: string;
	};
	breadcrumb: {
		items: Array<{
			title: string;
			path: string;
		}>;
	};
	similarRooms: RoomListing[];
}

export interface RoomSearchParams {
	search: string; // required by API, use '.' for match-all
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	roomType?: string;
	minPrice?: number;
	maxPrice?: number;
	minArea?: number;
	maxArea?: number;
	amenities?: string; // comma-separated amenity IDs
	maxOccupancy?: number;
	isVerified?: boolean;
	latitude?: number;
	longitude?: number;
	sortBy?: 'price' | 'area' | 'createdAt';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

export interface RoomSeekingPublicSearchParams {
	page?: number;
	limit?: number;
	search?: string;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	minBudget?: number;
	maxBudget?: number;
	roomType?: string;
	occupancy?: number;
	status?: 'active' | 'paused' | 'closed' | 'expired';
	isPublic?: boolean;
	sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'maxBudget' | 'viewCount' | 'contactCount';
	sortOrder?: 'asc' | 'desc';
}

export interface RoomListingsResponse {
	data: RoomListing[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	};
}