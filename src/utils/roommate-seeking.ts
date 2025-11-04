import { RoommatePost, RoommateCardProps } from '@/interfaces/basic';
import { API_CONFIG } from '../lib/api-client';

/**
 * Convert RoommatePost from API to RoommateCardProps format
 */
export const roommatePostToCard = (post: RoommatePost): RoommateCardProps => {
  // Get the first image or use placeholder
  const firstImage = post.images?.[0];
  const imageUrl = firstImage?.url;

  // Build image URL
  let image: string | undefined;
  if (imageUrl) {
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      image = imageUrl;
    } else {
      const filename = imageUrl.startsWith('images/')
        ? imageUrl.substring(7)
        : imageUrl;
      image = `${API_CONFIG.IMAGE_BASE_PATH}/${filename}`;
    }
  }

  // Build location string from address
  let location = '';
  if (post.address) {
    const parts: string[] = [];
    if (post.address.ward) parts.push(post.address.ward);
    if (post.address.district) parts.push(post.address.district);
    if (post.address.city) parts.push(post.address.city);
    location = parts.join(', ');
  } else if (post.location) {
    location = post.location;
  }

  // Fallback for missing data from new API format
  const authorName = post.authorName || post.requester?.name || 'Không có tên';
  const authorAvatar = post.authorAvatar || post.requester?.avatarUrl || undefined;
  const authorGender = post.authorGender || 'male'; // Default to male if not provided
  const budget = post.budget || post.maxBudget || 0;

  return {
    id: post.id,
    title: post.title,
    budget,
    authorName,
    authorAvatar,
    authorGender,
    authorAge: post.authorAge,
    preferredGender: post.preferredGender,
    location: location || 'Chưa cập nhật địa chỉ',
    moveInDate: post.moveInDate,
    duration: post.duration,
    image,
    description: post.description,
    viewCount: post.viewCount || post.views,
    contactCount: post.contactCount || post.responses,
    status: post.status,
  };
};

/**
 * Convert array of RoommatePosts to RoommateCardProps array
 */
export const roommatePostsToCards = (posts: RoommatePost[]): RoommateCardProps[] => {
  return posts.map(roommatePostToCard);
};
