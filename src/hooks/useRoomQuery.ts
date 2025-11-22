import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoomById, RoomDetail } from "@/services/room";
import { searchRoomListings } from "@/services/listing";
import { RoomSearchParams } from "@/interfaces/room-interface";

// Query keys
export const roomKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomKeys.all, "list"] as const,
  list: (params: RoomSearchParams) => [...roomKeys.lists(), params] as const,
  details: () => [...roomKeys.all, "detail"] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
  recentlyViewed: () => [...roomKeys.all, "recently-viewed"] as const,
};

// Hook to get room detail
export const useRoomDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: roomKeys.detail(id || ""),
    queryFn: () => getRoomById(id!),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to track recently viewed rooms
export const useTrackRoomView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (room: RoomDetail) => {
      const STORAGE_KEY = "recently_viewed_rooms";
      const MAX_ITEMS = 10;

      // Get current recently viewed rooms
      const stored = localStorage.getItem(STORAGE_KEY);
      const recentlyViewed: RoomDetail[] = stored ? JSON.parse(stored) : [];

      // Remove duplicate if exists
      const filtered = recentlyViewed.filter((r) => r.id !== room.id);

      // Add new room to the beginning
      const updated = [room, ...filtered].slice(0, MAX_ITEMS);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(roomKeys.recentlyViewed(), data);
    },
  });
};

// Hook to get recently viewed rooms
export const useRecentlyViewedRooms = () => {
  return useQuery({
    queryKey: roomKeys.recentlyViewed(),
    queryFn: () => {
      const stored = localStorage.getItem("recently_viewed_rooms");
      return stored ? JSON.parse(stored) : [];
    },
    staleTime: Infinity, // Never goes stale automatically
  });
};

// Hook to search/list rooms with pagination
export const useRoomsList = (params: RoomSearchParams) => {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => searchRoomListings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
  });
};
