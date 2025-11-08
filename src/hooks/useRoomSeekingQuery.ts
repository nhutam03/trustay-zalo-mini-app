import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoomSeekingPostById, RoomSeekingPost } from "@/services/room-seeking-service";

// Query keys
export const roomSeekingKeys = {
  all: ["room-seeking"] as const,
  lists: () => [...roomSeekingKeys.all, "list"] as const,
  list: (filters: string) => [...roomSeekingKeys.lists(), { filters }] as const,
  details: () => [...roomSeekingKeys.all, "detail"] as const,
  detail: (id: string) => [...roomSeekingKeys.details(), id] as const,
  recentlyViewed: () => [...roomSeekingKeys.all, "recently-viewed"] as const,
};

// Hook to get room seeking post detail
export const useRoomSeekingDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: roomSeekingKeys.detail(id || ""),
    queryFn: () => getRoomSeekingPostById(id!),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to track recently viewed room seeking posts
export const useTrackRoomSeekingView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: RoomSeekingPost) => {
      const STORAGE_KEY = "recently_viewed_room_seeking_posts";
      const MAX_ITEMS = 10;

      // Get current recently viewed posts
      const stored = localStorage.getItem(STORAGE_KEY);
      const recentlyViewed: RoomSeekingPost[] = stored ? JSON.parse(stored) : [];

      // Remove duplicate if exists
      const filtered = recentlyViewed.filter((p) => p.id !== post.id);

      // Add new post to the beginning
      const updated = [post, ...filtered].slice(0, MAX_ITEMS);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(roomSeekingKeys.recentlyViewed(), data);
    },
  });
};

// Hook to get recently viewed room seeking posts
export const useRecentlyViewedRoomSeekingPosts = () => {
  return useQuery({
    queryKey: roomSeekingKeys.recentlyViewed(),
    queryFn: () => {
      const stored = localStorage.getItem("recently_viewed_room_seeking_posts");
      return stored ? JSON.parse(stored) : [];
    },
    staleTime: Infinity, // Never goes stale automatically
  });
};
