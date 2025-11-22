export interface RoommateSeekingPost {
	id: string;
	title: string;
	description: string;
	slug: string;

    images?: { url: string }[];

	// Người đăng (tenant)
	tenantId: string;

	// Phòng trong platform (tùy chọn)
	roomInstanceId?: string;
	rentalId?: string;

	// Phòng ngoài platform (tùy chọn)
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;

	// Chi phí
	monthlyRent: number;
	currency: string;
	depositAmount: number;
	utilityCostPerPerson?: number;

	// Số lượng người
	seekingCount: number;
	approvedCount: number;
	remainingSlots: number;
	maxOccupancy: number;
	currentOccupancy: number;

	// Yêu cầu
	preferredGender: 'other' | 'male' | 'female';
	additionalRequirements?: string;

	// Thời gian
	availableFromDate: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;

	// Trạng thái
	status: 'draft' | 'active' | 'paused' | 'closed' | 'expired';
	requiresLandlordApproval: boolean;
	isApprovedByLandlord?: boolean;
	landlordNotes?: string;

	// Visibility
	isActive: boolean;
	expiresAt?: string;

	// Statistics
	viewCount: number;
	contactCount: number;

	// Timestamps
	createdAt: string;
	updatedAt: string;

	// Relations (optional, populated by backend)
	tenant?: {
		id: string;
		firstName?: string;
		lastName?: string;
		avatarUrl?: string;
		phoneNumber?: string;
	};
	roomInstance?: {
		id: string;
		roomNumber: string;
		room?: {
			id: string;
			name: string;
			building?: {
				id: string;
				name: string;
				address: string;
			};
		};
	};
	externalProvince?: { id: number; name: string };
	externalDistrict?: { id: number; name: string };
	externalWard?: { id: number; name: string };
	canApply?: boolean; // Whether the current user can apply to this post
	isOwner?: boolean; // Whether the current user is the owner of the post
	canEdit?: boolean; // Whether the current user can edit the post
}

export interface CreateRoommateSeekingPostRequest {
	// Thông tin cơ bản
	title: string;
	description: string;

	// Phòng trong platform (tùy chọn - chọn 1 trong 2: phòng trong hệ thống hoặc ngoài)
	roomInstanceId?: string;
	rentalId?: string;

	// Phòng ngoài platform (tùy chọn)
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;

	// Chi phí
	monthlyRent: number;
	currency?: string; // Default: "VND"
	depositAmount: number;
	utilityCostPerPerson?: number;

	// Số lượng người
	seekingCount: number; // Số người cần tìm
	maxOccupancy: number; // Tối đa số người ở
	currentOccupancy: number; // Số người hiện tại (thường là 1)

	// Yêu cầu về roommate
	preferredGender: 'other' | 'male' | 'female';
	additionalRequirements?: string;

	// Thời gian
	availableFromDate: string; // ISO date string
	minimumStayMonths?: number;
	maximumStayMonths?: number;

	// Khác
	requiresLandlordApproval?: boolean; // Default: false
	expiresAt?: string; // ISO date string
}

export interface UpdateRoommateSeekingPostRequest {
	// Thông tin cơ bản
	title?: string;
	description?: string;

	// Phòng trong platform
	roomInstanceId?: string;
	rentalId?: string;

	// Phòng ngoài platform
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;

	// Chi phí
	monthlyRent?: number;
	currency?: string;
	depositAmount?: number;
	utilityCostPerPerson?: number;

	// Số lượng
	seekingCount?: number;
	maxOccupancy?: number;
	currentOccupancy?: number;

	// Yêu cầu
	preferredGender?: 'other' | 'male' | 'female';
	additionalRequirements?: string;

	// Thời gian
	availableFromDate?: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;

	// Khác
	requiresLandlordApproval?: boolean;
	expiresAt?: string;
}

export interface RoommateSeekingPostListResponse {
	data: RoommateSeekingPost[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

// Listing response (from /api/listings/roommate-seeking-posts)
export interface RoommateSeekingListingItem {
	id: string;
	title: string;
	description: string;
	slug: string;
	maxBudget: number;
	currency: string;
	occupancy: number;
	moveInDate: string;
	status: 'active' | 'paused' | 'closed' | 'expired';
	viewCount: number;
	contactCount: number;
	createdAt: string;
	requester: {
		id: string;
		avatarUrl: string | null;
		name: string;
		email: string;
	};
}

export interface RoommateSeekingListingResponse {
	data: RoommateSeekingListingItem[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	};
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
}

export interface SearchRoommateSeekingPostsParams {
	page?: number;
	limit?: number;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	minPrice?: number;
	maxPrice?: number;
	preferredGender?: 'other' | 'male' | 'female';
	status?: 'active' | 'paused' | 'closed' | 'expired';
	sortBy?: 'createdAt' | 'monthlyRent' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
}
