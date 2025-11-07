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
 * Flow đăng ký đầy đủ cho Zalo Mini App
 *
 * @param userData - Thông tin đăng ký từ Zalo
 * @returns AuthResponse với access_token, refresh_token, user
 */
export const performZaloRegistration = async (
): Promise<AuthResponse> => {
  // Lấy thông tin user từ Zalo
  const zaloUser = await getZaloUserInfo(true);
  try {
    // Bước 1: Gửi OTP verification
    console.log('Step 1: Sending phone verification for:', zaloUser.phone);
    const verificationResponse = await sendPhoneVerification(zaloUser.phone);

    if (!verificationResponse.verificationToken) {
      throw new Error('Không nhận được verification token');
    }

    // Bước 2: Verify OTP (mặc định 123456)
    console.log('Step 2: Verifying OTP with default code: 123456');
    await verifyPhoneCode(zaloUser.phone, DEFAULT_OTP);

    // Bước 3: Đăng ký với verification token
    console.log('Step 3: Registering user with verification token');
    const authResponse = await registerWithVerification(
      zaloUser,
      verificationResponse.verificationToken
    );

    return authResponse;
  } catch (error) {
    console.error('Error in Zalo registration flow:', error);
    throw error;
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
 * Lấy thông tin user từ Zalo
 *
 * @param includePhone - Có lấy số điện thoại hay không (cần phê duyệt từ Zalo)
 * @returns Object chứa thông tin user (id, name, avatar, phone)
 *
 * Note: Số điện thoại được lấy thông qua token và convert ở backend
 * Token có hiệu lực 2 phút và chỉ dùng được 1 lần
 */
export const getZaloUserInfo = async (includePhone: boolean = false): Promise<any> => {
  try {
    // Lấy thông tin cơ bản của user
    const { userInfo } = await getUserInfo({});

    const result: any = {
      id: userInfo.id,
      name: userInfo.name,
      avatar: userInfo.avatar,
    };

    // Request số điện thoại nếu cần (cần được phê duyệt bởi Zalo)
    if (includePhone) {
      try {
        // Lấy phone token từ Zalo
        const { token } = await getPhoneNumber({});

        if (token) {
          console.log('Phone token obtained, converting to phone number...');

          // Convert token thành số điện thoại thực qua backend
          const phone = await convertPhoneToken(token);
          result.phone = phone;

          console.log('Phone number obtained successfully');
        }
      } catch (phoneError) {
        console.warn('Could not get phone number (may not be approved):', phoneError);
        // Không throw error, vì phone number có thể chưa được phê duyệt
        // App vẫn hoạt động được mà không có số điện thoại
      }
    }

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
 * Đăng nhập tự động với số điện thoại Zalo
 * Thử đăng nhập bằng số điện thoại, nếu chưa có tài khoản sẽ throw error
 */
export const loginWithZaloPhone = async (phone: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', {
      identifier: phone,
      password: phone, // Dùng phone làm password tạm cho Zalo login
    });

    const { access_token, refresh_token, user } = response.data;

    TokenManager.setAccessToken(access_token);
    TokenManager.setRefreshToken(refresh_token);

    return response.data;
  } catch (error) {
    console.error('Error logging in with Zalo phone:', error);
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
