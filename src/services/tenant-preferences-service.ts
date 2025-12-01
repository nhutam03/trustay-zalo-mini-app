import { apiClient, extractErrorMessage } from '@/lib/api-client';

// ========================
// Types for Tenant Preferences
// ========================

export interface RoomPreferences {
	id: string;
	userId: string;
	// Location preferences
	provinceIds?: number[];
	districtIds?: number[];
	// Price range
	minMonthlyRent?: number;
	maxMonthlyRent?: number;
	maxDepositAmount?: number;
	// Room specifications
	minAreaSqm?: number;
	maxAreaSqm?: number;
	roomTypes?: string[];
	maxOccupancy?: number;
	// Amenities
	requiredAmenities?: string[];
	preferredAmenities?: string[];
	// Other preferences
	utilityIncluded?: boolean;
	allowPets?: boolean;
	allowSmoking?: boolean;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface RoommatePreferences {
	id: string;
	userId: string;
	// Demographics
	preferredGender?: 'male' | 'female' | 'other' | 'any';
	minAge?: number;
	maxAge?: number;
	// Lifestyle
	occupation?: string[];
	preferredOccupations?: string[];
	smokingPreference?: 'no' | 'yes' | 'any';
	petsPreference?: 'no' | 'yes' | 'any';
	cleanlinessLevel?: 'very_clean' | 'clean' | 'moderate' | 'relaxed';
	noiseLevel?: 'very_quiet' | 'quiet' | 'moderate' | 'lively';
	// Schedule
	scheduleType?: 'early_bird' | 'night_owl' | 'flexible';
	guestsFrequency?: 'never' | 'rarely' | 'sometimes' | 'often';
	// Other
	languages?: string[];
	hobbies?: string[];
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AllPreferencesResponse {
	roomPreferences?: RoomPreferences;
	roommatePreferences?: RoommatePreferences;
}

export interface CreateRoomPreferencesRequest {
	provinceIds?: number[];
	districtIds?: number[];
	minMonthlyRent?: number;
	maxMonthlyRent?: number;
	maxDepositAmount?: number;
	minAreaSqm?: number;
	maxAreaSqm?: number;
	roomTypes?: string[];
	maxOccupancy?: number;
	requiredAmenities?: string[];
	preferredAmenities?: string[];
	utilityIncluded?: boolean;
	allowPets?: boolean;
	allowSmoking?: boolean;
	notes?: string;
}

export interface UpdateRoomPreferencesRequest {
	provinceIds?: number[];
	districtIds?: number[];
	minMonthlyRent?: number;
	maxMonthlyRent?: number;
	maxDepositAmount?: number;
	minAreaSqm?: number;
	maxAreaSqm?: number;
	roomTypes?: string[];
	maxOccupancy?: number;
	requiredAmenities?: string[];
	preferredAmenities?: string[];
	utilityIncluded?: boolean;
	allowPets?: boolean;
	allowSmoking?: boolean;
	notes?: string;
}

export interface CreateRoommatePreferencesRequest {
	preferredGender?: 'male' | 'female' | 'other' | 'any';
	minAge?: number;
	maxAge?: number;
	occupation?: string[];
	preferredOccupations?: string[];
	smokingPreference?: 'no' | 'yes' | 'any';
	petsPreference?: 'no' | 'yes' | 'any';
	cleanlinessLevel?: 'very_clean' | 'clean' | 'moderate' | 'relaxed';
	noiseLevel?: 'very_quiet' | 'quiet' | 'moderate' | 'lively';
	scheduleType?: 'early_bird' | 'night_owl' | 'flexible';
	guestsFrequency?: 'never' | 'rarely' | 'sometimes' | 'often';
	languages?: string[];
	hobbies?: string[];
	notes?: string;
}

export interface UpdateRoommatePreferencesRequest {
	preferredGender?: 'male' | 'female' | 'other' | 'any';
	minAge?: number;
	maxAge?: number;
	occupation?: string[];
	preferredOccupations?: string[];
	smokingPreference?: 'no' | 'yes' | 'any';
	petsPreference?: 'no' | 'yes' | 'any';
	cleanlinessLevel?: 'very_clean' | 'clean' | 'moderate' | 'relaxed';
	noiseLevel?: 'very_quiet' | 'quiet' | 'moderate' | 'lively';
	scheduleType?: 'early_bird' | 'night_owl' | 'flexible';
	guestsFrequency?: 'never' | 'rarely' | 'sometimes' | 'often';
	languages?: string[];
	hobbies?: string[];
	notes?: string;
}

// ========================
// Room Preferences Service Functions
// ========================

/**
 * Create or update room preferences
 */
export const createOrUpdateRoomPreferences = async (
	data: CreateRoomPreferencesRequest,
): Promise<RoomPreferences> => {
	try {
		const response = await apiClient.post<RoomPreferences>(
			'/api/tenant-preferences/room',
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error creating/updating room preferences:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo hoặc cập nhật sở thích về phòng'));
	}
};

/**
 * Get room preferences
 */
export const getRoomPreferences = async (): Promise<RoomPreferences> => {
	try {
		const response = await apiClient.get<RoomPreferences>('/api/tenant-preferences/room');
		return response.data;
	} catch (error) {
		console.error('Error getting room preferences:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải sở thích về phòng'));
	}
};

/**
 * Update room preferences
 */
export const updateRoomPreferences = async (
	data: UpdateRoomPreferencesRequest,
): Promise<RoomPreferences> => {
	try {
		const response = await apiClient.put<RoomPreferences>(
			'/api/tenant-preferences/room',
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error updating room preferences:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật sở thích về phòng'));
	}
};

/**
 * Delete room preferences
 */
export const deleteRoomPreferences = async (): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(
			'/api/tenant-preferences/room',
		);
		return response.data;
	} catch (error) {
		console.error('Error deleting room preferences:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa sở thích về phòng'));
	}
};

// ========================
// Roommate Preferences Service Functions
// ========================

/**
 * Create or update roommate preferences
 */
export const createOrUpdateRoommatePreferences = async (
	data: CreateRoommatePreferencesRequest,
): Promise<RoommatePreferences> => {
	try {
		const response = await apiClient.post<RoommatePreferences>(
			'/api/tenant-preferences/roommate',
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error creating/updating roommate preferences:', error);
		throw new Error(
			extractErrorMessage(error, 'Không thể tạo hoặc cập nhật sở thích về bạn cùng phòng'),
		);
	}
};

/**
 * Get roommate preferences
 */
export const getRoommatePreferences = async (): Promise<RoommatePreferences> => {
	try {
		const response = await apiClient.get<RoommatePreferences>(
			'/api/tenant-preferences/roommate',
		);
		return response.data;
	} catch (error) {
		console.error('Error getting roommate preferences:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải sở thích về bạn cùng phòng'));
	}
};

/**
 * Update roommate preferences
 */
export const updateRoommatePreferences = async (
	data: UpdateRoommatePreferencesRequest,
): Promise<RoommatePreferences> => {
	try {
		const response = await apiClient.put<RoommatePreferences>(
			'/api/tenant-preferences/roommate',
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error updating roommate preferences:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật sở thích về bạn cùng phòng'));
	}
};

/**
 * Delete roommate preferences
 */
export const deleteRoommatePreferences = async (): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(
			'/api/tenant-preferences/roommate',
		);
		return response.data;
	} catch (error) {
		console.error('Error deleting roommate preferences:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa sở thích về bạn cùng phòng'));
	}
};

// ========================
// All Preferences Service Functions
// ========================

/**
 * Get all preferences (both room and roommate)
 */
export const getAllPreferences = async (): Promise<AllPreferencesResponse> => {
	try {
		const response = await apiClient.get<AllPreferencesResponse>(
			'/api/tenant-preferences/all',
		);
		return response.data;
	} catch (error) {
		console.error('Error getting all preferences:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải tất cả sở thích'));
	}
};
