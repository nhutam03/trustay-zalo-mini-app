import { RoomListing, RoomListingsResponse } from '../services/room';
import { RoomCardProps } from '../interfaces/basic';
import { processImageUrl } from './image-proxy';

/**
 * Convert RoomListing from API to RoomCardProps format
 */
export const roomToRoomCard = (room: RoomListing): RoomCardProps => {
	// Get the primary image or first image or use placeholder
	const primaryImage = room.images?.find(img => img.isPrimary);
	const firstImage = room.images?.[0];
	const imageUrl = primaryImage?.url || firstImage?.url;

	// Use the image proxy utility for better Zalo Mini App compatibility
	const image = processImageUrl(imageUrl);

	// Build location string from location object
	let location = '';
	if (room.location) {
		const { wardName, districtName, provinceName } = room.location;
		location = `${wardName}, ${districtName}, ${provinceName}`;
	} else if (room.address) {
		location = room.address;
	}

	// Get base price from pricing
	const price = room.pricing?.basePriceMonthly
		? parseFloat(room.pricing.basePriceMonthly)
		: 0;

	return {
		id: room.id, // Use ID for routing
		title: room.name,
		price,
		area: undefined, // Area not in listing, will need to check costs
		location,
		image,
		verified: room.isVerified,
	};
};

/**
 * Convert array of RoomListings to RoomCardProps array
 */
export const roomsToRoomCards = (rooms: RoomListingsResponse): RoomCardProps[] => {
	if (!rooms || !rooms.data || !Array.isArray(rooms.data)) {
		console.error('Invalid rooms data structure:', rooms);
		return [];
	}

	return rooms.data.map(roomToRoomCard);
};
