import { apiClient, extractErrorMessage } from "@/lib/api-client";

// Types
export interface BookingRequest {
  id: string;
  tenantId: string;
  roomId: string;
  moveInDate: string;
  moveOutDate?: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  messageToOwner?: string;
  ownerNotes?: string;
  monthlyRent?: string;
  depositAmount?: string;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  room?: {
    id: string;
    name: string;
    roomType: string;
    areaSqm: string;
    building?: {
      id: string;
      name: string;
      address: string;
    };
  };
}

export interface CreateBookingRequestRequest {
  roomInstanceId?: string;
  moveInDate: string;
  moveOutDate?: string;
  messageToOwner?: string;
}

export interface UpdateBookingRequestRequest {
  status?: "accepted" | "rejected";
  ownerNotes?: string;
}

export interface CancelBookingRequestRequest {
  reason?: string;
}

export interface ConfirmBookingRequestRequest {
  depositAmount: number;
  monthlyRent: number;
  startDate: string;
  endDate?: string;
}

export interface BookingRequestListResponse {
  data: BookingRequest[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
    itemCount: number;
  };
}

// Create booking request
export const createBookingRequest = async (
  data: CreateBookingRequestRequest
): Promise<{ data: BookingRequest }> => {
  try {
    const roomId = data.roomInstanceId;

    if (!roomId) {
      throw new Error("ID phòng không hợp lệ");
    }

    const apiPayload = {
      roomId,
      moveInDate: data.moveInDate,
      ...(data.moveOutDate ? { moveOutDate: data.moveOutDate } : {}),
      ...(data.messageToOwner ? { messageToOwner: data.messageToOwner } : {}),
    };

    const response = await apiClient.post<{ data: BookingRequest }>(
      "/api/room-bookings",
      apiPayload
    );
    return response.data;
  } catch (error) {
    console.error("Error creating booking request:", error);
    throw new Error(
      extractErrorMessage(error, "Không thể tạo yêu cầu đặt phòng")
    );
  }
};

// Get received booking requests
export const getReceivedBookingRequests = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  buildingId?: string;
  roomId?: string;
}): Promise<BookingRequestListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.status) queryParams.append("status", params.status);
    if (params?.buildingId) queryParams.append("buildingId", params.buildingId);
    if (params?.roomId) queryParams.append("roomId", params.roomId);

    const endpoint = `/api/room-bookings/received${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get<BookingRequestListResponse>(endpoint);

    return response.data;
  } catch (error) {
    console.error("Error getting received booking requests:", error);
    throw new Error(
      extractErrorMessage(error, "Không thể tải yêu cầu đặt phòng đã nhận")
    );
  }
};

// Get my booking requests
export const getMyBookingRequests = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<BookingRequestListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.status) queryParams.append("status", params.status);

    const endpoint = `/api/room-bookings/my-requests${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get<{
      data: BookingRequest[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);

    // Transform pagination to meta format
    return {
      data: response.data.data,
      meta: {
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
        hasPrev: response.data.pagination.page > 1,
        hasNext:
          response.data.pagination.page < response.data.pagination.totalPages,
        itemCount: response.data.data.length,
      },
    };
  } catch (error) {
    console.error("Error getting my booking requests:", error);
    throw new Error(
      extractErrorMessage(error, "Không thể tải yêu cầu đặt phòng của tôi")
    );
  }
};

// Get booking request by ID
export const getBookingRequestById = async (
  id: string
): Promise<{ data: BookingRequest }> => {
  try {
    const response = await apiClient.get<{ data: BookingRequest }>(
      `/api/room-bookings/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting booking request by ID:", error);
    throw new Error(
      extractErrorMessage(error, "Không thể tải yêu cầu đặt phòng")
    );
  }
};

// Update booking request as owner
export const updateBookingRequestAsOwner = async (
  id: string,
  data: UpdateBookingRequestRequest
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.patch<{ message: string }>(
      `/api/room-bookings/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating booking request:", error);
    throw new Error(
      extractErrorMessage(error, "Không thể cập nhật yêu cầu đặt phòng")
    );
  }
};

// Cancel my booking request
export const cancelMyBookingRequest = async (
  id: string,
  data: CancelBookingRequestRequest
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.patch<{ message: string }>(
      `/api/room-bookings/${id}/cancel`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelling booking request:", error);
    throw new Error(
      extractErrorMessage(error, "Không thể hủy yêu cầu đặt phòng")
    );
  }
};

// Confirm booking request
export const confirmBookingRequest = async (
  id: string,
  data: ConfirmBookingRequestRequest
): Promise<{ data: BookingRequest; rental?: { id: string } }> => {
  try {
    const response = await apiClient.post<{
      data: BookingRequest;
      rental?: { id: string };
    }>(`/api/room-bookings/${id}/confirm`, data);
    return response.data;
  } catch (error) {
    console.error("Error confirming booking request:", error);
    throw new Error(
      extractErrorMessage(error, "Không thể xác nhận yêu cầu đặt phòng")
    );
  }
};
