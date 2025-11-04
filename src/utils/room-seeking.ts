import { RoomSeekingPost, RoomSeekingCardProps } from '@/interfaces/basic';
/**
 * Convert RoomSeekingPost from API to RoomSeekingCardProps format
 */
export const roomSeekingPostToCard = (post: RoomSeekingPost): RoomSeekingCardProps => {
  // Build location string from address
  let location = '';
  const parts: string[] = [];
  if (post.preferredWard?.name) parts.push(post.preferredWard.name);
  if (post.preferredDistrict?.name) parts.push(post.preferredDistrict.name);
  if (post.preferredProvince?.name) parts.push(post.preferredProvince.name);
  location = parts.join(', ');

  // Get requester name
  const authorName = post.requester?.name || 'Người dùng';

  return {
    id: post.id,
    title: post.title,
    budget: post.maxBudget,
    authorName,
    authorAvatar: post.requester?.avatarUrl || undefined,
    location,
    moveInDate: post.moveInDate || '',
    occupancy: post.occupancy,
    preferredRoomType: post.preferredRoomType,
    viewCount: post.viewCount,
    contactCount: post.contactCount,
    amenities: post.amenities?.map(a => a.name) || [],
  };
};

/**
 * Convert array of RoomSeekingPosts to RoomSeekingCardProps array
 */
export const roomSeekingPostsToCards = (posts: RoomSeekingPost[]): RoomSeekingCardProps[] => {
  return posts.map(roomSeekingPostToCard);
};
