// api-client.ts
import axios from "axios";
import { nativeStorage } from "zmp-sdk/apis";

// ========================
// API config
// ========================
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "https://api.trustay.life",
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "wss://api.trustay.life",
  IMAGE_BASE_PATH:
    import.meta.env.VITE_IMAGE_BASE_PATH || "https://api.trustay.life/images",
  TIMEOUT: 30000,
  HEADERS: {
    "Content-Type": "application/json",
    "User-Agent": "Trustay-Zalo-Mini-App/1.0",
  },
};

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const TokenManager = {
  getAccessToken(): string | null {
    try {
      return nativeStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (e) {
      console.error("getAccessToken error", e);
      return null;
    }
  },

  setAccessToken(token: string): void {
    try {
      nativeStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (e) {
      console.error("setAccessToken error", e);
    }
  },

  clearAccessToken(): void {
    try {
      nativeStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch (e) {
      console.error("clearAccessToken error", e);
    }
  },

  getRefreshToken(): string | null {
    try {
      return nativeStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.error("getRefreshToken error", e);
      return null;
    }
  },

  setRefreshToken(token: string): void {
    try {
      nativeStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (e) {
      console.error("setRefreshToken error", e);
    }
  },

  clearRefreshToken(): void {
    try {
      nativeStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.error("clearRefreshToken error", e);
    }
  },

  clearAllTokens(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
  },
};

// ========================
// Axios instance
// ========================

// Dùng env của Vite: VITE_API_BASE_URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://trustay.life:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "Trustay-ZaloMiniApp",
  },
});

// ========================
// Request interceptor: gắn Authorization
// ========================

apiClient.interceptors.request.use(
  async (config: any) => {
    const token = await TokenManager.getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ========================
// Response interceptor: tự refresh token khi 401
// ========================

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = await TokenManager.getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Đổi endpoint này cho đúng backend của bạn
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    // Nếu muốn strict type thì tạo interface, ở đây cast any cho đỡ lỗi
    const data: any = res.data || {};
    const accessToken = data.accessToken as string | undefined;
    const newRefreshToken = data.refreshToken as string | undefined;

    if (accessToken) {
      await TokenManager.setAccessToken(accessToken);
    }
    if (newRefreshToken) {
      await TokenManager.setRefreshToken(newRefreshToken);
    }
    return accessToken ?? null;
  } catch (e) {
    console.error("refreshAccessToken error", e);
    await TokenManager.clearAllTokens();
    return null;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest: any = error.config;

    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      // Tránh gọi refresh nhiều lần song song
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = (async () => {
          const t = await refreshAccessToken();
          isRefreshing = false; // tự reset, không dùng .finally cho đỡ lỗi target ES
          return t;
        })();
      }

      const newToken = await refreshPromise!;
      if (!newToken) {
        // TODO: tuỳ bạn xử lý: điều hướng sang màn login, v.v.
        return Promise.reject(error);
      }

      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${newToken}`,
      };

      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  },
);

interface AxiosErrorLike {
  isAxiosError?: boolean;
  message?: string;
  response?: {
    data?: unknown;
  };
}

export const extractErrorMessage = (
  error: unknown,
  defaultMessage = "An error occurred",
): string => {
  // Ưu tiên xử lý lỗi axios
  const maybeAxiosError = error as AxiosErrorLike;

  // Nếu axios version của bạn có isAxiosError, thì tận dụng:
  const isAxiosErr =
    typeof (axios as any).isAxiosError === "function"
      ? (axios as any).isAxiosError(error)
      : !!maybeAxiosError?.isAxiosError;

  if (isAxiosErr) {
    const axiosError = maybeAxiosError;

    if (!axiosError.response || axiosError.response.data == null) {
      return axiosError.message || defaultMessage;
    }

    const data = axiosError.response.data;

    if (typeof data === "string") {
      return data;
    }

    if (typeof data === "object") {
      const errorData = data as Record<string, unknown>;
      const message =
        errorData.message || errorData.error || errorData.msg || null;
      return typeof message === "string" ? message : defaultMessage;
    }
  }

  // Các lỗi JS bình thường
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  return defaultMessage;
};
export const getImageUrl = (imagePath?: string | null): string | undefined => {
	if (!imagePath) return undefined;
	if (imagePath.startsWith('http')) return imagePath;
	return `${API_CONFIG.IMAGE_BASE_PATH}/${imagePath}`;
};