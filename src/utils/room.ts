import { RoomListing, RoomListingsResponse } from '../services/room';
import { RoomCardProps } from '../interfaces/basic';
import { API_CONFIG } from '../lib/api-client';

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
	
	// Build image URL
	let image: string;
	if (imageUrl) {
		// If URL starts with http/https, use it directly (already full URL)
		if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
			image = imageUrl;
			console.log('→ Full URL detected, using as-is');
		} else {
			// Remove 'images/' prefix if exists, then prepend base path
			const filename = imageUrl.startsWith('images/') 
				? imageUrl.substring(7) // Remove 'images/' (7 characters)
				: imageUrl;
			console.log('→ Relative path detected. Filename after processing:', filename);
			image = `${API_CONFIG.IMAGE_BASE_PATH}/${filename}`;
		}
	} else {
		image = 'https://via.placeholder.com/300x200/0cb963/ffffff?text=No+Image';
		console.log('→ No image available, using placeholder');
	}
	
	console.log('Final image URL:', image);

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
