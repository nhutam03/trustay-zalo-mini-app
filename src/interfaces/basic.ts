import { ReactNode } from "react";

export type HeaderType = {
  route?: string;
  hasLeftIcon?: boolean;
  title?: string;
  customTitle?: ReactNode;
  type?: "primary" | "secondary";
  rightIcon?: ReactNode;
  customBackIcon?: () => void;
};

export interface MenuItemProps {
  id: string;
  title: string;
  icon: any; // Accept any icon type to avoid TS errors
  iconColor?: string;
  route?: string;
  action?: () => void;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface RoomCardProps {
  id: string;
  title: string;
  price: number;
  area?: number;
  location: string;
  image: string;
  verified?: boolean;
}


export interface NavItem {
  id: string;
  label: string;
  icon: string;
  iconActive: string;
  route: string;
}

export interface RoomSeekingCardProps {
  id: string;
  title: string;
  budget: number;
  authorName: string;
  authorAvatar?: string;
  location: string;
  moveInDate: string;
  occupancy?: number;
  preferredRoomType?: string;
  viewCount?: number;
  contactCount?: number;
  amenities?: string[];
}

export interface RoommateCardProps {
  id: string;
  title: string;
  budget: number;
  authorName: string;
  authorAvatar?: string;
  authorGender: "male" | "female";
  authorAge?: number;
  preferredGender?: "male" | "female" | "mixed";
  location: string;
  moveInDate: string;
  duration?: number;
  image?: string;
  description?: string;
  viewCount?: number;
  contactCount?: number;
  status?: string;
}

export interface RoomSeekingPost {
	id: string;
	title: string;
	description: string;
	slug: string;
	requesterId: string;
	preferredDistrictId?: number;
	preferredWardId?: number;
	preferredProvinceId: number;
	minBudget?: number;
	maxBudget: number;
	currency: string;
	preferredRoomType?: 'boarding_house' | 'apartment' | 'whole_house' | 'dormitory' | 'sleepbox';
	occupancy?: number;
	moveInDate?: string;
	isPublic: boolean;
	expiresAt?: string;
	contactCount: number;
	viewCount: number;
	status: 'active' | 'paused' | 'closed' | 'expired';
	createdAt: string;
	updatedAt: string;
	// Location info from API response
	preferredProvince?: { id: number; name: string; nameEn?: string | null };
	preferredDistrict?: { id: number; name: string; nameEn?: string | null };
	preferredWard?: { id: number; name: string; nameEn?: string | null };
	// Requester info
	requester?: {
		id: string;
		firstName?: string;
		lastName?: string;
		name?: string;
		email?: string;
		avatarUrl?: string | null;
		isVerifiedPhone?: boolean;
		isVerifiedEmail?: boolean;
		isVerifiedIdentity?: boolean;
		isOnline?: boolean;
		lastActiveAt?: string;
	};
	// Amenities
	amenities?: Array<{
		id: string;
		name: string;
		nameEn: string;
		category: string;
		description?: string;
	}>;
}

export interface CreateRoomSeekingPostRequest {
	title: string;
	description: string;
	preferredDistrictId: number;
	preferredWardId: number;
	preferredProvinceId: number;
	minBudget: number;
	maxBudget: number;
	currency: 'VND' | 'USD';
	preferredRoomType: 'boarding_house' | 'apartment' | 'whole_house' | 'dormitory' | 'sleepbox';
	occupancy: number;
	moveInDate: string;
	isPublic: boolean;
	expiresAt: string;
	amenityIds: string[];
}

export interface UpdateRoomSeekingPostRequest {
	title?: string;
	description?: string;
	preferredDistrictId?: number;
	preferredWardId?: number;
	preferredProvinceId?: number;
	minBudget?: number;
	maxBudget?: number;
	currency?: 'VND' | 'USD';
	preferredRoomType?: 'boarding_house' | 'apartment' | 'whole_house' | 'dormitory' | 'sleepbox';
	occupancy?: number;
	moveInDate?: string;
	isPublic?: boolean;
	expiresAt?: string;
	amenityIds?: string[];
}

export interface RoomSeekingPostListResponse {
	data: RoomSeekingPost[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	};
	seo?: {
		title: string;
		description: string;
		keywords: string;
	};
	breadcrumb?: {
		items: Array<{
			title: string;
			path: string;
		}>;
	};
}

// Search and filter types
export interface RoomSeekingSearchParams {
	page?: number;
	limit?: number;
	status?: string;
	userId?: string;
	search?: string;
	sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'maxBudget' | 'viewCount' | 'contactCount';
	sortOrder?: 'asc' | 'desc';
	preferredProvinceId?: number;
	preferredDistrictId?: number;
	preferredWardId?: number;
	minBudget?: number;
	maxBudget?: number;
	preferredRoomType?: string;
	occupancy?: number;
}

// Form validation types
export interface RoomSeekingFormData {
	title: string;
	description: string;
	preferredDistrictId: number | null;
	preferredWardId: number | null;
	preferredProvinceId: number | null;
	minBudget: number;
	maxBudget: number;
	currency: 'VND' | 'USD';
	preferredRoomType: 'boarding_house' | 'apartment' | 'whole_house' | 'dormitory' | 'sleepbox';
	occupancy: number;
	moveInDate: string;
	isPublic: boolean;
	expiresAt: string;
	amenityIds: string[];
}

// Constants
export const ROOM_TYPES = {
	BOARDING_HOUSE: 'boarding_house',
	APARTMENT: 'apartment',
	WHOLE_HOUSE: 'whole_house',
	DORMITORY: 'dormitory',
	SLEEPBOX: 'sleepbox',
} as const;

export const CURRENCIES = {
	VND: 'VND',
	USD: 'USD',
} as const;

export const POST_STATUSES = {
	ACTIVE: 'active',
	PAUSED: 'paused',
	CLOSED: 'closed',
	EXPIRED: 'expired',
} as const;

// Room type labels for display
export const ROOM_TYPE_LABELS = {
	[ROOM_TYPES.BOARDING_HOUSE]: 'Nhà trọ',
	[ROOM_TYPES.APARTMENT]: 'Căn hộ',
	[ROOM_TYPES.WHOLE_HOUSE]: 'Nhà nguyên căn',
	[ROOM_TYPES.DORMITORY]: 'Ký túc xá',
	[ROOM_TYPES.SLEEPBOX]: 'Sleep box',
} as const;

// Currency labels for display
export const CURRENCY_LABELS = {
	[CURRENCIES.VND]: 'VNĐ',
	[CURRENCIES.USD]: 'USD',
} as const;

// Status labels for display
export const STATUS_LABELS = {
	[POST_STATUSES.ACTIVE]: 'Đang hoạt động',
	[POST_STATUSES.PAUSED]: 'Tạm dừng',
	[POST_STATUSES.CLOSED]: 'Đã đóng',
	[POST_STATUSES.EXPIRED]: 'Hết hạn',
} as const;

export interface RoommatePost {
	id: string;
	roomId?: string; // Link đến phòng cụ thể (nếu có)
	blockId?: string; // Hoặc link đến nhà trọ
	title: string;
	description: string; // Rich text content
	slug?: string;
	authorId?: string;
	authorName?: string;
	authorAvatar?: string;
	authorGender?: 'male' | 'female';
	authorAge?: number;
	budget?: number;
	maxBudget?: number; // From API response
	currency?: string;
	occupancy?: number;
	preferredGender?: 'male' | 'female' | 'mixed';
	preferredAgeRange?: {
		min: number;
		max: number;
	};
	moveInDate: string;
	duration?: number; // Số tháng muốn ở
	location?: string;
	address?: Address;
	requirements?: string[]; // VD: ["Không hút thuốc", "Sạch sẽ", "Sinh viên"]
	lifestyle?: string[]; // VD: ["Thích yên tĩnh", "Hay về muộn", "Nấu ăn thường xuyên"]
	contactInfo?: ContactInfo;
	images?: PropertyImage[];
	status: 'active' | 'inactive' | 'expired' | 'found' | 'closed' | 'paused';
	isHot?: boolean;
	views?: number;
	viewCount?: number; // From API response
	responses?: number;
	contactCount?: number; // From API response
	expiresAt?: string;
	requester?: {
		id: string;
		avatarUrl?: string | null;
		name: string;
		email: string;
	};
	createdAt: string;
	updatedAt?: string;
}

export interface Address {
	street: string;
	ward: string;
	district: string;
	city: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
}

export interface ContactInfo {
	phone: string;
	email?: string;
	facebook?: string;
	zalo?: string;
}

export interface PropertyImage {
	id: string;
	url: string;
	alt?: string;
	isPrimary?: boolean;
	order: number;
}