import { RoomListing, RoomListingsResponse } from '../services/room';
import { RoomCardProps } from '../interfaces/basic';
import { API_CONFIG } from '../lib/api-client';
import { processImageUrl } from './image-proxy';

/**
 * Convert RoomListing from API to RoomCardProps format
 */
export const roomToRoomCard = (room: RoomListing): RoomCardProps => {
	console.log('Converting room:', room);
	
	// Get the primary image or first image or use placeholder
	const primaryImage = room.images?.find(img => img.isPrimary);
	const firstImage = room.images?.[0];
	const imageUrl = primaryImage?.url || firstImage?.url;
	
	console.log('Raw image URL from API:', imageUrl);
	
	// Use the image proxy utility for better Zalo Mini App compatibility
	const image = processImageUrl(imageUrl);
	
	console.log('Final image URL (after proxy processing):', image);

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

	console.log('Converted:', { id: room.id, title: room.name, price, location, image });

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
	return rooms.data.map(roomToRoomCard);
};
