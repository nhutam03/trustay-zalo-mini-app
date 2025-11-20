export interface UserProfile {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName?: string; // Computed field: firstName + lastName
	phone: string;
	gender: 'male' | 'female' | 'other';
	role: 'tenant' | 'landlord';
	bio?: string;
	dateOfBirth?: string;
	avatarUrl?: string; // Fix: API returns avatarUrl, not avatar
	idCardNumber?: string;
	bankAccount?: string;
	bankName?: string;
	totalBuildings?: number;
	totalRoomInstances?: number;
	isVerifiedPhone?: boolean;
	isVerifiedEmail?: boolean;
	isVerifiedIdentity?: boolean;
	createdAt: string;
	updatedAt: string;
}