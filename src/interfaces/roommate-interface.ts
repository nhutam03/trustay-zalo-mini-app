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