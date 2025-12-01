// Auth actions wrapper for Zalo Mini App
// Sử dụng API từ backend giống trustay-web

import { apiClient, TokenManager, extractErrorMessage } from '@/lib/api-client';
import { authorize, getUserInfo, getPhoneNumber } from 'zmp-sdk/apis';
//import { ZaloUserInfo } from './auth';

// ========================
// Types
// ========================
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  role: 'tenant' | 'landlord';
  bio?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  idCardNumber?: string;
  bankAccount?: string;
  bankName?: string;
  totalBuildings?: number;
  totalRoomInstances?: number;
  isVerifiedPhone?: boolean;
  isVerifiedEmail?: boolean;
  isVerifiedIdentity?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  role: 'tenant' | 'landlord';
}

export interface VerificationResponse {
  verificationId?: string;
  verificationToken?: string;
  message: string;
}

// OTP mặc định cho phone verification
const DEFAULT_OTP = '123456';

// ========================
// Authentication Actions
// ========================

/**
 * Gửi OTP verification cho số điện thoại
 * Response sẽ trả về verificationToken để dùng cho bước tiếp theo
 */
export const sendPhoneVerification = async (phone: string): Promise<VerificationResponse> => {
  try {
    const response = await apiClient.post<VerificationResponse>('/api/verification/send', {
      type: 'phone',
      identifier: phone,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending phone verification:', error);
    throw new Error(extractErrorMessage(error, 'Không thể gửi mã xác thực'));
  }
};

/**
 * Verify OTP code cho số điện thoại
 * Mặc định OTP là 123456
 */
export const verifyPhoneCode = async (
  phone: string,
  code: string = DEFAULT_OTP,
): Promise<VerificationResponse> => {
  try {
    const response = await apiClient.post<VerificationResponse>('/api/verification/verify', {
      type: 'phone',
      phone,
      code,
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying phone code:', error);
    throw new Error(extractErrorMessage(error, 'Mã xác thực không đúng'));
  }
};

/**
 * Đăng ký user mới với verification token
 *
 * Flow:
 * 1. Gọi sendPhoneVerification() -> nhận verificationToken
 * 2. Gọi verifyPhoneCode() -> verify OTP (123456)
 * 3. Gọi registerWithVerification() với verificationToken
 */
export const registerWithVerification = async (
  userData: RegisterRequest,
  verificationToken: string,
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/register',
      userData,
      {
        headers: {
          'X-Verification-Token': verificationToken,
        },
      }
    );

    const { access_token, refresh_token, user } = response.data;

    // Lưu tokens vào storage
    TokenManager.setAccessToken(access_token);
    TokenManager.setRefreshToken(refresh_token);

    return response.data;
  } catch (error) {
    console.error('Error registering with verification:', error);
    throw new Error(extractErrorMessage(error, 'Đăng ký thất bại'));
  }
};

/**
 * Đăng ký với Zalo Access Token
 * Gửi access token và thông tin bổ sung lên backend để tạo tài khoản mới
 *
 * @param zaloAccessToken - Access token nhận được từ Zalo authorize()
 * @param additionalData - Thông tin bổ sung (role, gender, etc.)
 * @returns AuthResponse với access_token, refresh_token, user
 */
export const registerWithZaloToken = async (
  zaloAccessToken: string,
  additionalData?: {
    role?: 'tenant' | 'landlord';
    gender?: 'male' | 'female' | 'other';
  }
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/api/auth/zalo-register', {
      accessToken: zaloAccessToken,
      ...additionalData,
    });

    const { access_token, refresh_token, user } = response.data;

    TokenManager.setAccessToken(access_token);
    TokenManager.setRefreshToken(refresh_token);

    return response.data;
  } catch (error) {
    console.error('Error registering with Zalo token:', error);
    throw new Error(extractErrorMessage(error, 'Đăng ký thất bại'));
  }
};

/**
 * Convert phone token từ Zalo thành số điện thoại thực
 *
 * @param token - Token nhận được từ getPhoneNumber()
 * @returns Số điện thoại thực
 */
export const convertPhoneToken = async (token: string): Promise<string> => {
  try {
    const response = await apiClient.post<{ phone: string }>('/api/zalo/convert-phone-token', {
      token,
    });

    return response.data.phone;
  } catch (error) {
    console.error('Error converting phone token:', error);
    throw new Error(extractErrorMessage(error, 'Không thể lấy số điện thoại'));
  }
};

/**
 * Lấy Zalo Access Token để xác thực với backend
 *
 * @returns Zalo access token
 */
export const getZaloAccessToken = async (): Promise<string> => {
  try {
    const response = await authorize({
      scopes: ['scope.userInfo', 'scope.userPhonenumber']
    });

    const accessToken = (response as any).accessToken;

    if (!accessToken) {
      throw new Error('Không nhận được access token từ Zalo');
    }

    return accessToken;
  } catch (error) {
    console.error('Error getting Zalo access token:', error);
    throw new Error(extractErrorMessage(error, 'Không thể lấy quyền truy cập từ Zalo'));
  }
};

/**
 * Lấy thông tin user từ Zalo (chỉ dùng cho UI hiển thị)
 *
 * @returns Object chứa thông tin user (id, name, avatar)
 */
export const getZaloUserInfo = async (): Promise<any> => {
  try {
    // Lấy thông tin cơ bản của user
    const { userInfo } = await getUserInfo({});

    const result: any = {
      id: userInfo.id,
      name: userInfo.name,
      avatar: userInfo.avatar,
    };

    return result;
  } catch (error) {
    console.error('Error getting Zalo user info:', error);
    throw new Error(extractErrorMessage(error, 'Không thể lấy thông tin người dùng'));
  }
};

/**
 * Đăng nhập với email và password
 */
export const login = async (identifier: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', {
      identifier,
      password,
    });

    const { access_token, refresh_token, user } = response.data;

    // Lưu tokens vào storage
    TokenManager.setAccessToken(access_token);
    TokenManager.setRefreshToken(refresh_token);

    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw new Error(extractErrorMessage(error, 'Đăng nhập thất bại'));
  }
};

/**
 * Đăng nhập với Zalo Access Token
 * Gửi access token lên backend để xác thực và tạo/đăng nhập tài khoản
 *
 * @param zaloAccessToken - Access token nhận được từ Zalo authorize()
 * @returns AuthResponse với access_token, refresh_token, user
 */
export const loginWithZaloToken = async (zaloAccessToken: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/api/auth/zalo-login', {
      accessToken: zaloAccessToken,
    });

    const { access_token, refresh_token, user } = response.data;

    TokenManager.setAccessToken(access_token);
    TokenManager.setRefreshToken(refresh_token);

    return response.data;
  } catch (error) {
    console.error('Error logging in with Zalo token:', error);
    throw error;
  }
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 */
export const isAuthenticated = (): boolean => {
  const token = TokenManager.getAccessToken();
  return !!token;
};

/**
 * Lấy thông tin user hiện tại từ backend
 */
export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get<UserProfile>('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw new Error(extractErrorMessage(error, 'Không thể lấy thông tin người dùng'));
  }
};

/**
 * Đăng xuất
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch (error) {
    console.error('Error calling logout API:', error);
  } finally {
    TokenManager.clearAllTokens();
  }
};

/**
 * Refresh token
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const refreshTokenValue = TokenManager.getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
      refreshToken: refreshTokenValue,
    });

    const { access_token, refresh_token, user } = response.data;

    TokenManager.setAccessToken(access_token);
    TokenManager.setRefreshToken(refresh_token);

    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    TokenManager.clearAllTokens();
    throw new Error(extractErrorMessage(error, 'Không thể làm mới token'));
  }
};

/**
 * Kiểm tra auth status
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    if (!isAuthenticated()) {
      return false;
    }

    await getCurrentUser();
    return true;
  } catch (error) {
    TokenManager.clearAllTokens();
    return false;
  }
};

/**
 * Liên kết tài khoản Zalo với tài khoản hiện tại
 * Dùng để liên kết số điện thoại Zalo với tài khoản đã đăng nhập
 *
 * @param zaloAccessToken - Access token nhận được từ Zalo authorize()
 * @returns UserProfile đã được cập nhật
 */
export const linkZaloAccount = async (zaloAccessToken: string): Promise<UserProfile> => {
  try {
    const response = await apiClient.post<{ user: UserProfile }>('/api/auth/link-zalo', {
      accessToken: zaloAccessToken,
    });

    return response.data.user;
  } catch (error) {
    console.error('Error linking Zalo account:', error);
    throw new Error(extractErrorMessage(error, 'Liên kết tài khoản Zalo thất bại'));
  }
};
