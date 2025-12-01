import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RoommateSeekingPost } from "@/interfaces/roommate-interface";
import { getRoommateSeekingPostById } from "@/services/roommate-seeking-posts-service";
import { getRoommateSeekingListings } from "@/services/listing";

// Query keys
export const roommateKeys = {
  all: ["roommate"] as const,
  lists: () => [...roommateKeys.all, "list"] as const,
  list: (page: number, limit: number) => [...roommateKeys.lists(), { page, limit }] as const,
  details: () => [...roommateKeys.all, "detail"] as const,
  detail: (id: string) => [...roommateKeys.details(), id] as const,
  recentlyViewed: () => [...roommateKeys.all, "recently-viewed"] as const,
};

// Hook to get roommate post detail
export const useRoommateDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: roommateKeys.detail(id || ""),
    queryFn: () => getRoommateSeekingPostById(id!),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to track recently viewed roommate posts
export const useTrackRoommateView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: RoommateSeekingPost) => {
      const STORAGE_KEY = "recently_viewed_roommate_posts";
      const MAX_ITEMS = 10;

      // Get current recently viewed posts
      const stored = localStorage.getItem(STORAGE_KEY);
      const recentlyViewed: RoommateSeekingPost[] = stored ? JSON.parse(stored) : [];

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
      queryClient.setQueryData(roommateKeys.recentlyViewed(), data);
    },
  });
};

// Hook to search/list roommate posts with pagination
export const useRoommatePostsList = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: roommateKeys.list(page, limit),
    queryFn: () => getRoommateSeekingListings({ page, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    
  });
};

// Hook to get recently viewed roommate posts
export const useRecentlyViewedRoommatePosts = () => {
  return useQuery({
    queryKey: roommateKeys.recentlyViewed(),
    queryFn: () => {
      const stored = localStorage.getItem("recently_viewed_roommate_posts");
      return stored ? JSON.parse(stored) : [];
    },
    staleTime: Infinity, // Never goes stale automatically
  });
};
