# Hướng dẫn Tích hợp Backend cho Zalo Mini App - Trustay

## Tổng quan

Để tuân thủ yêu cầu của Zalo, ứng dụng Trustay đã được cập nhật để sử dụng **Zalo Access Token** thay vì số điện thoại để xác thực người dùng. Backend cần triển khai 2 endpoint mới để hỗ trợ flow này.

## Yêu cầu từ Zalo

Theo hướng dẫn tại: https://miniapp.zaloplatforms.com/intro/authen-user/

> Việc đăng nhập phải sử dụng **access token** chứ không phải số điện thoại. Access token này sẽ được verify với Zalo API để lấy thông tin người dùng.

## Thay đổi trong Frontend

### 1. Auth Service đã cập nhật

Frontend đã thêm các function mới:

- `getZaloAccessToken()` - Lấy access token từ Zalo SDK
- `loginWithZaloToken(accessToken)` - Đăng nhập với access token
- `registerWithZaloToken(accessToken, additionalData)` - Đăng ký với access token

### 2. Flow đăng nhập mới

**Đăng nhập:**
1. User nhấn "Tiếp tục" (trong tab Đăng nhập Zalo)
2. Frontend gọi `authorize()` để lấy Zalo access token
3. Frontend gửi access token lên endpoint `POST /api/auth/zalo-login`
4. Backend verify token với Zalo API và trả về JWT token

**Đăng ký:**
1. User chọn role và gender, nhấn "Đăng ký với Zalo"
2. Frontend gọi `authorize()` để lấy Zalo access token
3. Frontend gửi access token + role + gender lên `POST /api/auth/zalo-register`
4. Backend verify token, tạo user mới và trả về JWT token

## Backend Implementation

### Endpoint 1: POST /api/auth/zalo-login

**Mô tả:** Đăng nhập hoặc tự động tạo tài khoản nếu chưa tồn tại

**Request Body:**
```json
{
  "accessToken": "string" // Zalo access token from authorize()
}
```

**Response Success (200):**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "gender": "male" | "female" | "other",
    "role": "tenant" | "landlord",
    "avatarUrl": "string",
    // ... other user fields
  }
}
```

**Response Error (404):**
```json
{
  "message": "User not found"
}
```

**Logic triển khai:**

```typescript
async function zaloLogin(accessToken: string) {
  // 1. Verify token với Zalo API
  const zaloUserInfo = await verifyZaloAccessToken(accessToken);

  // 2. Tìm user trong database theo zaloId
  let user = await findUserByZaloId(zaloUserInfo.id);

  if (!user) {
    // 3. Nếu không tìm thấy, throw error để frontend navigate sang register
    throw new Error('User not found');
  }

  // 4. Tạo JWT tokens
  const tokens = generateTokens(user);

  return {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    user: user
  };
}
```

### Endpoint 2: POST /api/auth/zalo-register

**Mô tả:** Đăng ký tài khoản mới với Zalo access token

**Request Body:**
```json
{
  "accessToken": "string",
  "role": "tenant" | "landlord",
  "gender": "male" | "female" | "other"
}
```

**Response Success (201):**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "gender": "male" | "female" | "other",
    "role": "tenant" | "landlord",
    "zaloId": "string",
    "avatarUrl": "string",
    // ... other user fields
  }
}
```

**Response Error (409):**
```json
{
  "message": "User already exists"
}
```

**Logic triển khai:**

```typescript
async function zaloRegister(accessToken: string, role: string, gender: string) {
  // 1. Verify token với Zalo API
  const zaloUserInfo = await verifyZaloAccessToken(accessToken);

  // 2. Kiểm tra user đã tồn tại chưa
  const existingUser = await findUserByZaloId(zaloUserInfo.id);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // 3. Parse tên từ Zalo
  const nameParts = zaloUserInfo.name.split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || zaloUserInfo.name;
  const lastName = nameParts[nameParts.length - 1] || '';

  // 4. Tạo user mới
  const newUser = await createUser({
    zaloId: zaloUserInfo.id,
    firstName: firstName,
    lastName: lastName,
    email: `${zaloUserInfo.id}@zalo.trustay.app`, // Email tạm từ zaloId
    phone: zaloUserInfo.phone || '', // Phone có thể rỗng
    avatarUrl: zaloUserInfo.avatar,
    role: role,
    gender: gender,
    isVerifiedPhone: !!zaloUserInfo.phone,
  });

  // 5. Tạo JWT tokens
  const tokens = generateTokens(newUser);

  return {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    user: newUser
  };
}
```

### Function: Verify Zalo Access Token

**Mô tả:** Gọi Zalo API để verify access token và lấy thông tin user

**API Zalo:** https://graph.zalo.me/v2.0/me

**Headers:**
```
access_token: {zalo_access_token}
```

**Query params:**
```
fields=id,name,picture
```

**Implementation:**

```typescript
async function verifyZaloAccessToken(accessToken: string) {
  try {
    const response = await axios.get('https://graph.zalo.me/v2.0/me', {
      headers: {
        'access_token': accessToken
      },
      params: {
        fields: 'id,name,picture'
      }
    });

    if (!response.data || !response.data.id) {
      throw new Error('Invalid Zalo access token');
    }

    return {
      id: response.data.id,           // Zalo user ID
      name: response.data.name,       // Full name
      avatar: response.data.picture?.data?.url || '', // Avatar URL
      phone: response.data.phone || '' // Phone (nếu có)
    };
  } catch (error) {
    throw new Error('Failed to verify Zalo access token');
  }
}
```

## Database Schema Updates

Cần thêm field `zaloId` vào User model:

```sql
ALTER TABLE users ADD COLUMN zalo_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_users_zalo_id ON users(zalo_id);
```

hoặc trong TypeORM/Prisma:

```typescript
// User entity
@Entity()
class User {
  // ... existing fields

  @Column({ unique: true, nullable: true })
  zaloId?: string;
}
```

## Migration từ số điện thoại sang Zalo ID

### Cho user hiện tại:

Nếu có user đã đăng ký bằng số điện thoại, khi họ đăng nhập lần đầu với Zalo:

1. Verify Zalo access token → lấy được phone
2. Tìm user theo phone trong DB
3. Nếu tìm thấy: cập nhật `zaloId` cho user đó
4. Return user với JWT tokens

```typescript
async function zaloLogin(accessToken: string) {
  const zaloUserInfo = await verifyZaloAccessToken(accessToken);

  // Tìm theo zaloId trước
  let user = await findUserByZaloId(zaloUserInfo.id);

  // Nếu không có, tìm theo phone (migration case)
  if (!user && zaloUserInfo.phone) {
    user = await findUserByPhone(zaloUserInfo.phone);

    if (user) {
      // Link Zalo account
      await updateUser(user.id, { zaloId: zaloUserInfo.id });
    }
  }

  if (!user) {
    throw new Error('User not found');
  }

  const tokens = generateTokens(user);
  return { access_token: tokens.accessToken, refresh_token: tokens.refreshToken, user };
}
```

## Environment Variables

Cần thêm vào `.env`:

```env
# Zalo API Configuration
ZALO_APP_ID=your_zalo_app_id
ZALO_APP_SECRET=your_zalo_app_secret
```

## Testing

### Test đăng nhập thành công:
```bash
curl -X POST http://localhost:3000/api/auth/zalo-login \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "valid_zalo_token"}'
```

### Test đăng ký thành công:
```bash
curl -X POST http://localhost:3000/api/auth/zalo-register \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "valid_zalo_token",
    "role": "tenant",
    "gender": "male"
  }'
```

## Security Notes

1. **Luôn verify access token** với Zalo API trước khi tin tưởng thông tin
2. **Rate limiting**: Giới hạn số request để tránh abuse
3. **Token expiration**: Zalo access token có thời hạn, cần handle error khi token hết hạn
4. **HTTPS only**: Chỉ accept request qua HTTPS trong production

## Error Handling

| Error Code | Message | Giải thích |
|------------|---------|-----------|
| 400 | Invalid access token | Token không hợp lệ hoặc đã hết hạn |
| 404 | User not found | User chưa đăng ký (chỉ cho /zalo-login) |
| 409 | User already exists | User đã tồn tại (chỉ cho /zalo-register) |
| 500 | Internal server error | Lỗi server |

## Rollback Plan

Nếu cần rollback về flow cũ (dùng số điện thoại):

1. Giữ nguyên endpoint cũ `/api/auth/login` với phone + password
2. Frontend vẫn có option "Đăng nhập thủ công" để dùng endpoint này
3. Chỉ cần disable Zalo login button trong frontend

## Liên hệ

Nếu có thắc mắc về implementation, vui lòng liên hệ team frontend hoặc tham khảo:
- Zalo Mini App Docs: https://miniapp.zaloplatforms.com/
- Zalo Graph API: https://developers.zalo.me/docs/api/open-api/tai-lieu/thong-tin-nguoi-dung-post-28
