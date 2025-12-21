# Tài Liệu Authentication & Authorization Flow

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Cơ Chế Token](#cơ-chế-token)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Flow Diagrams](#flow-diagrams)
6. [FAQ](#faq)

---

## Tổng Quan

### Kiến Trúc Authentication
Hệ thống sử dụng **JWT-based authentication** với **refresh token rotation** để bảo mật:

- **Access Token**: JWT token có thời hạn ngắn (thời gian được set trong config) dùng để authenticate các request
- **Refresh Token**: UUID token được hash và lưu trong database, có thời hạn dài hơn, dùng để lấy access token mới
- **Token Rotation**: Mỗi lần refresh, cả access token và refresh token đều được tạo mới, token cũ bị revoke
- **Reuse Detection**: Hệ thống phát hiện việc reuse refresh token (dấu hiệu của token theft) và revoke toàn bộ token của user

### Authentication Methods
Backend support 2 cách gửi access token:

1. **Authorization Header** (khuyên dùng cho mobile):
   ```
   Authorization: Bearer <access_token>
   ```

2. **Cookie** (dành cho web browser):
   ```
   Cookie: access_token=<access_token>
   ```

**QUAN TRỌNG**: Frontend mobile phải dùng Authorization header!

---

## Cơ Chế Token

### Access Token Structure
Access token là JWT với payload:
```json
{
  "user_id": 123,
  "exp": 1702345678,  // Expiration timestamp
  "iat": 1702342078   // Issued at timestamp
}
```

### Token Lifecycle
```
1. User đăng nhập → nhận access_token + refresh_token
2. Dùng access_token cho các API request
3. Access_token hết hạn → gọi /auth/refresh với refresh_token
4. Nhận cặp token mới → refresh_token cũ bị revoke tự động
5. Lặp lại bước 2-4
```

### Token Storage - QUAN TRỌNG!
**Frontend PHẢI làm đúng như sau:**

| Token Type | Nơi Lưu | Lý Do |
|------------|---------|-------|
| Access Token | Memory (state/store) hoặc SecureStorage | Token này được dùng liên tục, cần access nhanh |
| Refresh Token | SecureStorage (React Native) / HttpOnly Cookie (Web) | Token này sensitive hơn, cần bảo mật cao |

**KHÔNG BAO GIỜ:**
- ❌ Lưu token trong localStorage (dễ bị XSS)
- ❌ Lưu token trong AsyncStorage không encrypt (dễ bị đọc)
- ❌ Log token ra console trong production
- ❌ Gửi token trong URL parameters

**NÊN:**
- ✅ Dùng React Native SecureStore/Keychain cho mobile
- ✅ Clear tokens khi user logout
- ✅ Implement auto-refresh trước khi token expire

---

## API Endpoints

### 1. Đăng Ký (Register)

#### Request
```http
POST /auth/register
Content-Type: multipart/form-data

FormData:
  username: string (required) - Tên đăng nhập, phải unique
  password: string (required) - Mật khẩu (backend sẽ hash)
  display_name: string (optional) - Tên hiển thị
  avatar: File (optional) - Ảnh đại diện (jpeg, png, gif, webp, max 5MB)
```

**LƯU Ý FRONTEND:**
- Content-Type PHẢI là `multipart/form-data` (vì có upload file)
- Nếu không upload avatar, backend tự động dùng default avatar
- Username phải được trim() trước khi gửi
- File size PHẢI validate ở client trước: max 5MB
- File type PHẢI validate: chỉ jpeg, png, gif, webp

#### Response Success (201 Created)
```json
{
  "id": 1,
  "username": "nguyenvana",
  "display_name": "Nguyễn Van A",
  "avatar_url": "https://cdn.example.com/avatars/abc123.jpg",
  "bio": null,
  "is_new_user": true,
  "follower_count": 0,
  "following_count": 0,
  "post_count": 0,
  "created_at": "2024-12-07T10:30:00Z",
  "updated_at": "2024-12-07T10:30:00Z"
}
```

**Frontend cần làm sau khi nhận response:**
1. Lưu thông tin user vào state/store
2. Navigate đến màn hình login (hoặc tự động login - xem phần login)
3. Show thông báo "Đăng ký thành công"

#### Response Error

**Username đã tồn tại (409 Conflict):**
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Username already exists"
  }
}
```

**File quá lớn (400 Bad Request):**
```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Avatar exceeds 5MB limit"
  }
}
```

**File type không hợp lệ (400 Bad Request):**
```json
{
  "error": {
    "code": "INVALID_IMAGE_TYPE",
    "message": "Unsupported image type. Allowed: jpeg, png, gif, webp"
  }
}
```

**Request không hợp lệ (400 Bad Request):**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Username is required" // hoặc message khác
  }
}
```

**Frontend cần handle:**
- Show error message từ `error.message` cho user
- Nếu code là `CONFLICT`: focus vào username field, suggest thử username khác
- Nếu code là `FILE_TOO_LARGE`: show thông báo compress/chọn ảnh khác
- Nếu code là `INVALID_IMAGE_TYPE`: show list file types được phép

---

### 2. Đăng Nhập (Login)

#### Request
```http
POST /auth/login
Content-Type: application/json

{
  "username": "nguyenvana",
  "password": "securepassword123"
}
```

**LƯU Ý FRONTEND:**
- Username và password KHÔNG được empty
- Backend sẽ tự extract `User-Agent` header và IP address để track device
- Không cần gửi device info, backend tự lấy

#### Response Success (200 OK)
```json
{
  "user": {
    "id": 1,
    "username": "nguyenvana",
    "display_name": "Nguyễn Van A",
    "avatar_url": "https://cdn.example.com/avatars/abc123.jpg",
    "bio": "Hello world",
    "is_new_user": false,
    "follower_count": 150,
    "following_count": 200,
    "post_count": 45,
    "created_at": "2024-12-07T10:30:00Z",
    "updated_at": "2024-12-07T10:30:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "a3d5e8f1-9b2c-4a6e-8d7f-1c3b5e7a9f2d",
  "expires_in": 3600
}
```

**Frontend PHẢI làm ngay sau khi nhận response:**
1. **Lưu tokens ngay lập tức:**
   ```javascript
   // Pseudo-code
   await SecureStorage.setItem('refresh_token', response.refresh_token)
   authStore.setAccessToken(response.access_token) // Lưu vào memory/state
   ```

2. **Lưu thông tin user:**
   ```javascript
   userStore.setUser(response.user)
   ```

3. **Setup auto-refresh timer:**
   ```javascript
   // expires_in là số giây, set timer refresh trước 30s-1 phút
   const refreshTime = (response.expires_in - 60) * 1000
   setTimeout(() => {
     refreshAccessToken()
   }, refreshTime)
   ```

4. **Navigate đến home screen**

5. **Check `is_new_user`:**
   ```javascript
   if (response.user.is_new_user) {
     // Navigate đến onboarding flow
   } else {
     // Navigate đến home feed
   }
   ```

#### Response Error

**Sai username/password (401 Unauthorized):**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid username or password"
  }
}
```

**Request không hợp lệ (400 Bad Request):**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Username is required" // hoặc "Password is required"
  }
}
```

**Frontend cần handle:**
- Show error message từ `error.message`
- Nếu 401: focus vào password field, có thể show "Quên mật khẩu?"
- Nếu nhiều lần 401: có thể suggest "Bạn có muốn reset password không?"

---

### 3. Refresh Token

#### Request
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "a3d5e8f1-9b2c-4a6e-8d7f-1c3b5e7a9f2d"
}
```

**KHI NÀO GỌI API NÀY:**
- Trước khi access token expire (setup timer như đã nói ở phần login)
- Khi nhận response 401 với code `TOKEN_EXPIRED` từ bất kỳ API nào
- Khi app khởi động (nếu có refresh token) để check xem còn valid không

**LƯU Ý FRONTEND:**
- Backend tự lấy `User-Agent` và IP address từ request headers
- Phải lấy refresh_token từ SecureStorage
- Phải implement retry logic (xem bên dưới)

#### Response Success (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "b4e6f9g2-0c3d-5b7f-9e8g-2d4c6f8b0g3e",
  "expires_in": 3600
}
```

**Frontend PHẢI làm ngay:**
1. **Update cả 2 tokens:**
   ```javascript
   await SecureStorage.setItem('refresh_token', response.refresh_token)
   authStore.setAccessToken(response.access_token)
   ```

2. **Setup lại timer:**
   ```javascript
   const refreshTime = (response.expires_in - 60) * 1000
   setTimeout(() => {
     refreshAccessToken()
   }, refreshTime)
   ```

3. **Retry request bị fail (nếu có):**
   ```javascript
   // Nếu đang retry sau khi nhận 401
   return retryOriginalRequest(originalConfig)
   ```

#### Response Error

**Refresh token không tồn tại/không hợp lệ (401 Unauthorized):**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid refresh token"
  }
}
```

**Refresh token đã expire (401 Unauthorized):**
```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Refresh token has expired"
  }
}
```

**PHÁT HIỆN REUSE - QUAN TRỌNG! (401 Unauthorized):**
```json
{
  "error": {
    "code": "TOKEN_REUSED",
    "message": "Refresh token reuse detected. Please login again."
  }
}
```

**Frontend PHẢI handle từng case:**

```javascript
if (error.response?.status === 401) {
  const errorCode = error.response.data?.error?.code
  
  switch(errorCode) {
    case 'UNAUTHORIZED':
    case 'TOKEN_EXPIRED':
      // Refresh token đã hết hạn hoặc không hợp lệ
      // Logout user và navigate về login screen
      await logout(false) // false = không gọi logout API
      navigateToLogin()
      showMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
      break
      
    case 'TOKEN_REUSED':
      // Có thể bị đánh cắp token! Log user ra khỏi tất cả devices
      await logout(false)
      navigateToLogin()
      showAlert({
        title: "Cảnh báo bảo mật",
        message: "Phát hiện hoạt động bất thường. Vui lòng đăng nhập lại và đổi mật khẩu.",
        critical: true
      })
      break
  }
}
```

---

### 4. Đăng Xuất (Logout)

#### Request
```http
POST /auth/logout
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "refresh_token": "a3d5e8f1-9b2c-4a6e-8d7f-1c3b5e7a9f2d"
}
```

**LƯU Ý FRONTEND:**
- Cần gửi cả access token (header) và refresh token (body)
- Refresh token sẽ bị revoke ở backend
- Access token vẫn valid cho đến khi expire (nhưng frontend nên xóa ngay)

#### Response Success (200 OK)
```json
{
  "message": "Logged out successfully"
}
```

**Frontend PHẢI làm sau khi nhận response:**
```javascript
async function logout() {
  try {
    // 1. Lấy refresh token
    const refreshToken = await SecureStorage.getItem('refresh_token')
    
    // 2. Gọi API logout (có thể skip nếu offline)
    if (isOnline && refreshToken) {
      await api.post('/auth/logout', { refresh_token: refreshToken })
    }
  } catch (error) {
    // Ignore error, vẫn logout ở client
  } finally {
    // 3. Clear tất cả auth data
    await SecureStorage.removeItem('refresh_token')
    authStore.clearAccessToken()
    userStore.clearUser()
    
    // 4. Cancel auto-refresh timer
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }
    
    // 5. Navigate về login
    navigateToLogin()
  }
}
```

#### Response Error

**Request không hợp lệ (400 Bad Request):**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Refresh token is required"
  }
}
```

**Refresh token không tồn tại (200 OK - vẫn success!):**
```json
{
  "message": "Logged out successfully"
}
```

**LƯU Ý:**
- Backend trả về success ngay cả khi refresh token không tồn tại
- Frontend PHẢI clear tokens dù API call có lỗi hay không

---

## Error Handling

### Error Response Format
**TẤT CẢ** error responses đều có format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Ý Nghĩa | Frontend Action |
|-------------|-----------|---------|-----------------|
| 400 | `BAD_REQUEST` | Request không hợp lệ (thiếu field, sai format) | Show message, highlight field lỗi |
| 400 | `FILE_TOO_LARGE` | File upload quá 5MB | Show message, suggest compress/chọn file khác |
| 400 | `INVALID_IMAGE_TYPE` | File type không phải image hợp lệ | Show message, list file types được phép |
| 401 | `UNAUTHORIZED` | Không có token hoặc token không hợp lệ | Logout và navigate về login |
| 401 | `TOKEN_EXPIRED` | Access token đã hết hạn | Tự động refresh token |
| 401 | `TOKEN_INVALID` | Token malformed hoặc signature sai | Logout và navigate về login |
| 401 | `TOKEN_REUSED` | Phát hiện reuse refresh token | Logout, show security warning |
| 404 | `NOT_FOUND` | Resource không tồn tại | Show message |
| 409 | `CONFLICT` | Dữ liệu bị conflict (username đã tồn tại) | Show message, suggest alternative |
| 500 | `INTERNAL_ERROR` | Server error | Show generic error, có retry button |

### Axios Interceptor Example

Frontend NÊN implement interceptor để handle auth errors globally:

```javascript
import axios from 'axios'
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearAuth } from './auth'

// Flag để tránh multiple refresh calls
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor: Thêm access token vào header
axios.interceptors.request.use(
  config => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor: Handle token expiration
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Nếu không phải 401 hoặc đã retry rồi, reject luôn
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const errorCode = error.response?.data?.error?.code

    // Handle các loại 401 khác nhau
    if (errorCode === 'TOKEN_EXPIRED') {
      // Access token hết hạn, cần refresh

      if (isRefreshing) {
        // Đang refresh rồi, queue request này lại
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axios(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = await getRefreshToken()
        
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Gọi refresh API
        const response = await axios.post('/auth/refresh', {
          refresh_token: refreshToken
        })

        const { access_token, refresh_token: newRefreshToken } = response.data

        // Save tokens mới
        await setAccessToken(access_token)
        await setRefreshToken(newRefreshToken)

        // Update header cho request hiện tại
        originalRequest.headers.Authorization = `Bearer ${access_token}`

        // Process queue
        processQueue(null, access_token)

        // Retry request gốc
        return axios(originalRequest)

      } catch (refreshError) {
        // Refresh thất bại
        processQueue(refreshError, null)
        await clearAuth()
        // Navigate to login screen
        // navigation.navigate('Login') - tùy theo routing library
        return Promise.reject(refreshError)
        
      } finally {
        isRefreshing = false
      }

    } else if (errorCode === 'TOKEN_REUSED') {
      // Phát hiện token bị reuse - NGHIÊM TRỌNG!
      await clearAuth()
      // Show security alert
      Alert.alert(
        'Cảnh báo bảo mật',
        'Phát hiện hoạt động bất thường. Vui lòng đăng nhập lại và đổi mật khẩu.',
        [{ text: 'OK', onPress: () => {
          // Navigate to login
        }}]
      )
      return Promise.reject(error)

    } else {
      // Các lỗi 401 khác (UNAUTHORIZED, TOKEN_INVALID)
      await clearAuth()
      // Navigate to login
      return Promise.reject(error)
    }
  }
)

export default axios
```

---

## Flow Diagrams

### 1. Login Flow
```
User nhập credentials
        ↓
Frontend validate input
        ↓
POST /auth/login
        ↓
Backend verify credentials
        ↓
Backend generate access token (JWT)
        ↓
Backend create & hash refresh token
        ↓
Backend save refresh token to database
        ↓
Backend return: user + access_token + refresh_token
        ↓
Frontend save refresh_token to SecureStorage
        ↓
Frontend save access_token to memory
        ↓
Frontend save user info to store
        ↓
Frontend setup auto-refresh timer
        ↓
Navigate to home screen
```

### 2. API Request với Authentication
```
User action (e.g., get feed)
        ↓
Frontend get access_token from memory
        ↓
Frontend add "Authorization: Bearer <token>" header
        ↓
Send API request
        ↓
Backend middleware extract token
        ↓
Backend verify JWT signature
        ↓
Backend check expiration
        ↓
Backend extract user_id from token
        ↓
Backend add user_id to request context
        ↓
Handler process request
        ↓
Return response
```

### 3. Token Refresh Flow
```
Timer trigger hoặc nhận 401 TOKEN_EXPIRED
        ↓
Frontend get refresh_token from SecureStorage
        ↓
POST /auth/refresh với refresh_token
        ↓
Backend hash refresh_token
        ↓
Backend tìm token trong database
        ↓
Backend check: revoked? expired? reused?
        ↓
Backend generate new token pair
        ↓
Backend revoke old refresh token
        ↓
Backend save new refresh token
        ↓
Return new access_token + refresh_token
        ↓
Frontend save tokens
        ↓
Frontend setup new auto-refresh timer
        ↓
Frontend retry failed request (nếu có)
```

### 4. Token Reuse Detection Flow
```
Attacker dùng refresh token đã bị revoke
        ↓
POST /auth/refresh
        ↓
Backend tìm thấy token trong database
        ↓
Backend check: token.revoked_at != null
        ↓
Backend detect REUSE
        ↓
Backend revoke TẤT CẢ tokens của user
        ↓
Return 401 TOKEN_REUSED
        ↓
Frontend logout user
        ↓
Frontend show security warning
        ↓
Navigate to login screen
```

### 5. Logout Flow
```
User click logout
        ↓
Frontend get refresh_token from SecureStorage
        ↓
POST /auth/logout với refresh_token
        ↓
Backend revoke refresh token in database
        ↓
Return success
        ↓
Frontend clear refresh_token from SecureStorage
        ↓
Frontend clear access_token from memory
        ↓
Frontend clear user info from store
        ↓
Frontend cancel auto-refresh timer
        ↓
Navigate to login screen
```

---

## FAQ



### Q: Tại sao phải dùng cả access token và refresh token?
**A:** 
- **Access token** có thời hạn ngắn (vd: 1 giờ), gửi với mọi request → nếu bị đánh cắp, chỉ sử dụng được trong thời gian ngắn
- **Refresh token** có thời hạn dài (vd: 30 ngày), chỉ gửi khi refresh → ít bị expose hơn
- Kết hợp cả 2 = security cao + UX tốt (không phải login liên tục)

### Q: Tại sao phải revoke refresh token cũ khi refresh?
**A:** **Token rotation** - mỗi refresh token chỉ dùng được 1 lần. Nếu token bị reuse → phát hiện được token theft và revoke toàn bộ sessions của user.

### Q: Khi nào nên refresh token?
**A:** 
1. **Proactive**: Setup timer refresh trước 30-60s khi token expire
2. **Reactive**: Khi nhận 401 TOKEN_EXPIRED từ API
3. **On app startup**: Check refresh token còn valid không

### Q: Làm sao để test token reuse detection?
**A:**
1. Login → lưu lại refresh_token_1
2. Gọi /auth/refresh với refresh_token_1 → nhận refresh_token_2
3. Gọi /auth/refresh lại với refresh_token_1 (token cũ đã bị revoke)
4. Backend sẽ trả về 401 TOKEN_REUSED

### Q: Có nên lưu access token vào SecureStorage không?
**A:** Không nhất thiết. Access token được dùng liên tục nên lưu trong memory (state/store) là đủ. Chỉ refresh token mới cần SecureStorage vì nó sensitive và tồn tại lâu.

### Q: Điều gì xảy ra nếu user có nhiều devices?
**A:** Mỗi device có 1 refresh token riêng. Khi logout all devices, tất cả refresh tokens đều bị revoke. User phải login lại trên tất cả devices.

### Q: Backend có rate limiting không?
**A:** Tài liệu này không đề cập, nhưng frontend nên implement:
- Debounce login button
- Limit số lần retry
- Exponential backoff cho failed requests

### Q: Nếu app bị kill khi đang refresh token thì sao?
**A:** 
- Refresh token vẫn an toàn trong SecureStorage
- Lần khởi động sau, app sẽ refresh lại
- Nếu cả 2 tokens đều expire → user phải login lại

---

## Liên Hệ

Nếu có thắc mắc hoặc phát hiện bug, liên hệ:
- Backend Team Lead: [Your Name]
- Email: [your.email@example.com]
- Slack: #backend-support

**LƯU Ý:** Đọc kỹ tài liệu này trước khi hỏi! Hầu hết câu hỏi đã có trong FAQ và examples.

---

**Document Version:** 1.0  
**Last Updated:** December 7, 2024  
**Author:** Backend Team

# Tài Liệu User Profile & Discovery API

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [API Endpoints](#api-endpoints)
3. [TypeScript Types](#typescript-types)
4. [Frontend Implementation Guide](#frontend-implementation-guide)
5. [FAQ](#faq)

---

## Tổng Quan

### Kiến Trúc
System này cung cấp 2 chức năng chính:

- **View User Profile**: Xem thông tin chi tiết của bất kỳ user nào (public profiles)
- **Search Users**: Tìm kiếm users theo username với prefix matching
- **Optional Auth**: Hỗ trợ cả authenticated và anonymous access
- **Follow Status**: Tự động check follow relationship nếu có token

**LƯU Ý QUAN TRỌNG**: 
- **`GET /me`**: Dùng để verify token và get basic current user info (không có `is_following`)
- **`GET /users/:id`**: Dùng để view PROFILE của bất kỳ user nào (kể cả chính mình)
  - Khi view own profile: `GET /users/{myId}` → `is_following` = false (không thể follow chính mình)
  - Khi view others: `GET /users/{otherId}` → `is_following` = true/false
  
**Use case pattern:**
- App startup / Token verification → `GET /me`
- Profile screen (own or others) → `GET /users/:id`
- Posts tab in profile → `GET /users/:id/posts` (future implementation)

---

## API Endpoints

### 1. Get User Profile

**Chức năng**: Xem thông tin chi tiết của một user (public profile)

#### Request
```http
GET /users/:id
Authorization: Bearer <access_token> (OPTIONAL)
```

**Path Parameters:**
- `id` (integer, required): ID của user cần xem

**Authentication:**
- **Optional**: Có thể gọi mà không cần token
- **Có token**: Trả về `is_following` status chính xác
- **Không token**: `is_following` luôn = `false`

#### Response Success (200 OK)
```json
{
  "id": 123,
  "username": "johndoe",
  "display_name": "John Doe",
  "bio": "Software Engineer | Coffee lover",
  "avatar_url": "https://r2.example.com/avatars/123.jpg",
  "is_new_user": false,
  "follower_count": 1250,
  "following_count": 340,
  "post_count": 89,
  "is_following": true,
  "created_at": "2024-11-15T08:30:00Z",
  "updated_at": "2024-12-01T14:22:00Z"
}
```

**Field Guarantees:**
- `display_name`: **Always present** (required during registration, NOT NULL in DB)
- `avatar_url`: **Always present** (either uploaded or default avatar from config, NOT NULL in DB)
- `bio`: **Can be null** → Ẩn bio section if null

**Field `is_following`:**
- `true`: Current user đang follow user này
- `false`: Chưa follow HOẶC không có token
- `null`: Không bao giờ xảy ra (luôn có giá trị boolean)

**LƯU Ý:**
- Nếu view chính mình: `is_following` = `false` (không thể follow chính mình)
- Counter (`follower_count`, `following_count`, `post_count`) luôn >= 0

#### Frontend Implementation

**Workflow sau khi nhận response:**

1. **Render profile UI** với đầy đủ thông tin:
   - Avatar (always present - direct render từ `avatar_url`)
   - Display name (always present - direct render từ `display_name`)
   - Username (hiển thị dạng @username)
   - Bio (ẩn section nếu null)
   - Stats: Posts, Followers, Following counts (có thể tap để navigate)

2. **Check xem có phải profile của mình không**:
   - So sánh `profile.id` với `currentUserId`
   - Nếu là profile của mình: Show "Edit Profile" button, ẩn "Follow" button
   - Nếu không phải: Show "Follow/Following" button

3. **Handle `is_new_user` flag**:
   - Nếu xem chính mình VÀ `is_new_user === true`: Navigate to onboarding flow
   - User cần complete profile, find friends, etc.

4. **Handle null fields gracefully**:
   - `bio` null → ẩn bio section hoàn toàn
   - `display_name` và `avatar_url` luôn có giá trị (guaranteed by backend)

5. **Format timestamps** cho user-friendly:
   - `created_at` → "Joined November 2025"
   - `updated_at` → "Active 2 days ago" (optional)

#### Error Responses

**404 Not Found**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

**Frontend cần handle:**
- Show error screen: "User not found" / "This user doesn't exist"
- Action button: "Go Back"

**400 Bad Request**
```json
{
  "error": {
    "code": "INVALID_USER_ID",
    "message": "Invalid user ID"
  }
}
```

**Frontend cần handle:**
- Show error screen: "Invalid user"
- Action button: "Go Back"

**500+ Server Error**

**Frontend cần handle:**
- Show error screen: "Something went wrong" / "Unable to load profile"
- Action button: "Retry"

---

### 2. Search Users

**Chức năng**: Tìm kiếm users theo username (prefix matching, case-insensitive)

#### Request
```http
GET /users/search?q={query}&limit={limit}
Authorization: Bearer <access_token> (OPTIONAL)
```

**Query Parameters:**
- `q` (string, required): Search query (username prefix)
  - Min length: 2 characters
  - Case-insensitive
  - Prefix matching (search "joh" → finds "johndoe", "john_smith")
- `limit` (integer, optional): Số lượng results tối đa
  - Default: 20
  - Min: 1, Max: 100

**Authentication:**
- **Optional**: Có thể gọi không cần token
- **Có token**: `is_following` chính xác cho mỗi user
- **Không token**: `is_following` luôn = `false`

#### Response Success (200 OK)
```json
{
  "users": [
    {
      "id": 123,
      "username": "johndoe",
      "display_name": "John Doe",
      "avatar_url": "https://r2.example.com/avatars/123.jpg",
      "is_following": false
    },
    {
      "id": 456,
      "username": "john_smith",
      "display_name": "John Smith",
      "avatar_url": "https://r2.example.com/default-avatar.jpg",
      "is_following": true
    }
  ]
}
```

**Note**: All users have `display_name` and `avatar_url` (backend guarantees NOT NULL)

**Results Behavior:**
- **Sort order**: Theo `follower_count DESC` (popular users first)
- **Empty query**: Trả về popular users (top users by follower count)
- **No results**: `users` = empty array `[]`

#### Frontend Implementation

**Workflow:**

**Option 1: Search as You Type (Debounced)**
- Setup search input với debounce 300ms để tránh gọi API quá nhiều
- Chỉ search khi query có ít nhất 2 ký tự
- Clear results khi query < 2 ký tự
- Show loading spinner trong khi search
- Show empty state nếu không có results

**Option 2: Search with Button**
- User gõ query → nhấn Search button → gọi API
- Validate query >= 2 ký tự trước khi gọi API
- Disable button trong khi loading
- Không cần debounce vì user control khi nào search

**Option 3: Search with Cache**
- Cache search results trong 30 giây - 5 phút
- Reuse cached results nếu search lại cùng query
- Invalidate cache khi follow/unfollow (vì `is_following` thay đổi)
- Sử dụng query library (React Query, SWR, RTK Query, etc.)

#### Input Validation

**Frontend cần handle:**

- **Validate query trước khi gọi API**:
  - Query không được empty hoặc chỉ có spaces
  - Query phải có ít nhất 2 ký tự
  - Show error message: "Please enter at least 2 characters"

- **Validate limit**:
  - Nếu limit < 1 hoặc > 100: dùng default 20
  - Console.warn để debug

- **Encode query**:
  - Sử dụng URL encoding cho query parameter
  - Handle special characters (@, #, spaces, etc.)

#### Error Responses

**400 Bad Request**
```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Query must be at least 2 characters"
  }
}
```

**Frontend cần handle:**
- Show inline error message dưới search input
- Không navigate away, user có thể fix query

**500+ Server Error**

**Frontend cần handle:**
- Show error toast: "Search failed. Please try again."
- Retry button hoặc auto-retry sau 3 giây

---

## TypeScript Types

```typescript
/**
 * User profile với đầy đủ thông tin
 * Dùng cho: GET /users/:id, GET /me responses
 */
interface User {
  id: number;
  username: string;
  display_name: string;              // Always present (NOT NULL in DB)
  bio: string | null;                // Ẩn section nếu null
  avatar_url: string;                // Always present (NOT NULL in DB)
  is_new_user: boolean;              // true = cần onboarding
  follower_count: number;            // >= 0
  following_count: number;           // >= 0
  post_count: number;                // >= 0
  is_following: boolean;             // false nếu không có token hoặc xem chính mình
  created_at: string;                // ISO 8601 timestamp
  updated_at: string;                // ISO 8601 timestamp
}

/**
 * User summary (compact version)
 * Dùng cho: Search results, followers/following lists
 */
interface UserSummary {
  id: number;
  username: string;
  display_name: string;              // Always present (NOT NULL in DB)
  avatar_url: string;                // Always present (NOT NULL in DB)
  is_following: boolean;
}

/**
 * Profile response (alias của User)
 */
type ProfileResponse = User;

/**
 * Search response
 */
interface SearchResponse {
  users: UserSummary[];              // Empty array nếu không có results
}
```

**Type Usage Examples:**

```typescript
// Profile screen
const profile: User = await api.getProfile(userId);

// Search results
const searchResults: SearchResponse = await api.searchUsers(query);

// User card component props
interface UserCardProps {
  user: UserSummary;
  onPress: (userId: number) => void;
}
```

---

## Frontend Implementation Guide

### Pattern 1: Profile Screen

**Layout Structure:**
- Header: Avatar, Display Name, Username, Bio
- Stats Row: Posts count (tappable), Followers count (tappable), Following count (tappable)
- Action Button: "Edit Profile" (own profile) hoặc "Follow/Following" (other profiles)
- Content Tabs: Posts grid (future: `GET /users/:id/posts`), Followers list, Following list

**Data Fetching:**
- Profile data: `GET /users/:id` (works for own profile và others)
- Posts: `GET /users/:id/posts` (future implementation, same user ID)
- Followers: `GET /users/:id/followers`
- Following: `GET /users/:id/following`
- **Không** cần special case cho own profile - tất cả dùng cùng user ID

**Navigation:**
- Tap Followers count → Navigate to Followers list screen
- Tap Following count → Navigate to Following list screen
- Tap user trong list → Navigate to that user's profile

**State Management:**
- Check `isOwnProfile` để show/hide đúng buttons
- Handle loading, error states
- Refetch profile sau khi follow/unfollow

### Pattern 2: Search with Recent Searches

**Features cần implement:**
- Search input với debounce
- Recent searches list (lưu local, max 10 items)
- Show recent searches khi query < 2 ký tự
- Clear recent searches button
- Tap user → add to recent + navigate to profile

**Storage:**
- Lưu recent searches vào local storage/AsyncStorage
- Format: array of UserSummary objects
- Update list khi user tap vào result

### Pattern 3: Reusable User Card Component

**Props:**
- `user`: UserSummary hoặc ProfileResponse
- `currentUserId`: để check own profile
- `showFollowButton`: boolean flag
- `onPress`: callback khi tap vào card

**Display Logic:**
- Show avatar (always present, direct render)
- Show display name (always present, direct render)
- Show @username
- Show bio (nếu có trong user object và không null)
- Show stats (nếu có follower_count/following_count)
- Show follow button (nếu không phải own profile)

### Pattern 4: Profile with Tabs

**Tab Structure:**
- Tab 1: Posts grid (TODO: chưa có posts)
- Tab 2: Followers list với infinite scroll
- Tab 3: Following list với infinite scroll

**State Management:**
- Track active tab state
- Lazy load tab content (chỉ load khi tab active)
- Refetch data khi switch tabs


## Summary

**Key Points:**
- `GET /users/:id`: View any user's profile (optional auth)
- `GET /users/search`: Search users by username prefix (optional auth)
- `GET /me`: Get current user info (REQUIRED auth) - xem AUTHENTICATION_FLOW.md
- Null handling: display_name, bio, avatar_url có thể null
- Search: Case-insensitive, prefix matching, sort by popularity
- `is_following`: Requires token, false nếu xem chính mình hoặc không có token

# Tài Liệu Follow System API

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [API Endpoints](#api-endpoints)
3. [Pagination Guide](#pagination-guide)
4. [TypeScript Types](#typescript-types)
5. [Frontend Implementation Guide](#frontend-implementation-guide)
6. [FAQ](#faq)

---

## Tổng Quan

### Kiến Trúc Follow System
Hệ thống follow sử dụng kiến trúc đơn giản nhưng hiệu quả:

- **Database**: Bảng `follows` với composite primary key `(follower_id, followee_id)`
- **Counters**: `follower_count` và `following_count` được update trong transaction
- **Pagination**: Cursor-based pagination sử dụng `created_at` timestamp
- **Batch Queries**: Sử dụng PostgreSQL `ANY($1)` để check follow status cho nhiều users cùng lúc (tránh N+1 queries)

### Follow Relationship
```
User A follows User B
  ↓
- A.following_count + 1
- B.follower_count + 1
- Record: (follower_id=A, followee_id=B) in follows table
```

### Optional Authentication
Các endpoints liên quan đến follow system hỗ trợ **optional authentication**:
- **Có token**: Trả về `is_following` status chính xác
- **Không có token**: Vẫn trả về data nhưng `is_following` luôn = `false`

**LƯU Ý FRONTEND:**
- Nếu muốn hiển thị button "Follow/Following" → **PHẢI** gửi token
- Nếu chỉ xem danh sách → Có thể không gửi token

---

## API Endpoints

### 1. Follow User

**Chức năng**: Bắt đầu follow một user

#### Request
```http
POST /users/:id/follow
Authorization: Bearer <access_token> (REQUIRED)
```

**Path Parameters:**
- `id` (integer, required): ID của user cần follow

**LƯU Ý FRONTEND:**
- Endpoint này **BẮT BUỘC** phải có authentication
- Không thể follow chính mình (server sẽ trả lỗi)
- Phải check `id !== currentUserId` ở client trước khi gọi API

#### Response Success (200 OK)
```json
{
  "message": "Successfully followed user"
}
```

#### Frontend Implementation

**Workflow sau khi gọi API:**

1. **Cập nhật UI ngay lập tức (Optimistic Update)**:
   - Đổi button state từ "Follow" → "Following" (hoặc ngược lại)
   - Increment/decrement follower count trên profile (nếu đang xem profile của user đó)
   - Disable button để prevent double-click
   - Add loading spinner (optional)

2. **Handle errors và rollback**:
   - Nếu request fail → revert button state về trạng thái ban đầu
   - Show error toast với message rõ ràng
   - Re-enable button

3. **Update cache/state management**:
   - Invalidate user profile cache
   - Invalidate follower/following lists cache
   - Update `is_following` field trong tất cả places hiển thị user đó

4. **Background sync**:
   - Nếu app offline → queue action để sync sau
   - Khi reconnect → retry failed actions

#### Error Responses

**409 Conflict - Already Following**
```json
{
  "error": {
    "code": "ALREADY_FOLLOWING",
    "message": "Already following this user"
  }
}
```

**Frontend cần handle:**
- **KHÔNG** show error message (vì UI đã show "Following")
- Chỉ cần ensure button state đúng
- Có thể log warning để debug

**404 Not Found - User Not Exists**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

**Frontend cần handle:**
- Show error toast: "User not found"
- Có thể navigate back hoặc refresh profile

**400 Bad Request - Cannot Follow Self**
```json
{
  "error": {
    "code": "INVALID_ACTION",
    "message": "Cannot follow yourself"
  }
}
```

**Frontend cần handle:**
- Đây là bug ở client (không nên xảy ra)
- Hide follow button khi xem own profile

**401 Unauthorized**
```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token has expired"
  }
}
```

**Frontend cần handle:**
- Clear token và navigate to login
- Show message: "Please log in again"

**500+ Server Error**

**Frontend cần handle:**
- Show retry button
- Rollback optimistic update
- Keep previous button state

---

### 2. Unfollow User

**Chức năng**: Ngừng follow một user

#### Request
```http
DELETE /users/:id/follow
Authorization: Bearer <access_token> (REQUIRED)
```

**Path Parameters:**
- `id` (integer, required): ID của user cần unfollow

#### Response Success (200 OK)
```json
{
  "message": "Successfully unfollowed user"
}
```

#### Frontend Implementation

**Workflow sau khi gọi API:**

1. **Update UI ngay lập tức (Optimistic Update)**:
   - Đổi button state từ "Following" → "Follow"
   - Decrement follower count
   - Disable button để prevent double-click

2. **Handle errors và rollback**:
   - Nếu fail → revert button về "Following"
   - Show error toast
   - Re-enable button

3. **Không cần confirmation dialog** (theo Instagram pattern):
   - User có thể re-follow ngay nếu unfollow nhầm
   - UX mượt hơn

4. **Update cache**:
   - Invalidate profile cache
   - Invalidate follower list (user sẽ biến mất khỏi follower list của người kia)

#### Error Responses

**404 Not Found - Not Following**
```json
{
  "error": {
    "code": "RELATIONSHIP_NOT_FOUND",
    "message": "Not following this user"
  }
}
```

**Frontend cần handle:**
- **KHÔNG** show error
- Chỉ ensure button state = "Follow"

**404 Not Found - User Not Exists**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

**Frontend cần handle:**
- Show error: "User not found"
- Navigate back

**401 Unauthorized**

**Frontend cần handle:**
- Navigate to login

**500+ Server Error**

**Frontend cần handle:**
- Show retry button
- Rollback optimistic update

---

### 3. Get Followers List

**Chức năng**: Lấy danh sách những người đang follow một user

#### Request
```http
GET /users/:id/followers?cursor={cursor}&limit={limit}
Authorization: Bearer <access_token> (OPTIONAL)
```

**Path Parameters:**
- `id` (integer, required): ID của user

**Query Parameters:**
- `cursor` (string, optional): Pagination cursor (RFC3339 timestamp)
  - Không truyền hoặc `null` → lấy page đầu tiên
  - Pass cursor từ response trước để load more
- `limit` (integer, optional): Số lượng items per page
  - Default: 20
  - Min: 1, Max: 100

**Authentication:**
- **Optional**: Có thể gọi không cần token
- **Có token**: `is_following` chính xác cho mỗi follower
- **Không token**: `is_following` luôn = `false`

#### Response Success (200 OK)
```json
{
  "users": [
    {
      "id": 123,
      "username": "alice",
      "display_name": "Alice Johnson",
      "avatar_url": "https://r2.example.com/avatars/123.jpg",
      "is_following": true
    },
    {
      "id": 456,
      "username": "bob_smith",
      "display_name": "Bob Smith",
      "avatar_url": "https://r2.example.com/default-avatar.jpg",
      "is_following": false
    }
  ],
  "cursor": "2024-12-01T10:30:00Z",
  "has_more": true
}
```

**Note**: All fields are always present (`display_name` and `avatar_url` are NOT NULL in DB)

**Response Fields:**
- `users`: Array of UserSummary objects (có thể empty)
- `cursor`: Next cursor để load more (null nếu hết data)
- `has_more`: `true` nếu còn data, `false` nếu hết

#### Frontend Implementation

**Workflow khi render list:**

1. **Render danh sách followers**:
   - Loop qua `users` array
   - Hiển thị avatar (always present), display_name (always present), @username
   - Show follow button với `is_following` state

2. **Implement infinite scroll**:
   - Detect khi user scroll đến cuối list (bottom threshold ~100px)
   - Load more nếu còn data (`has_more === true`)
   - Pass `cursor` từ response trước vào request tiếp theo
   - Append new users vào existing list (không replace!)
   - Show loading spinner ở cuối list

3. **Handle `has_more`**:
   - `has_more === true`: Còn data → continue loading
   - `has_more === false`: Hết data → hide loading spinner, có thể show "No more users" text

4. **Update sau khi follow/unfollow**:
   - Optimistic update: Đổi `is_following` ngay trong list
   - Không cần refetch cả list

5. **Empty state**:
   - `users.length === 0` VÀ `has_more === false`: Show "No followers yet"

#### Error Responses

**404 Not Found**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

**Frontend cần handle:**
- Show error screen: "User not found"
- Button: "Go Back"

**Empty List**

**Frontend cần handle:**
- Show empty state: "No followers yet"
- Có thể suggest: "Be the first to follow!"

**Network Error**

**Frontend cần handle:**
- Show error screen với retry button
- Keep previous data nếu có (graceful degradation)

---

### 4. Get Following List

**Chức năng**: Lấy danh sách những người mà user đang follow

#### Request
```http
GET /users/:id/following?cursor={cursor}&limit={limit}
Authorization: Bearer <access_token> (OPTIONAL)
```

**Path Parameters:**
- `id` (integer, required): ID của user

**Query Parameters:**
- `cursor` (string, optional): Pagination cursor (RFC3339 timestamp)
- `limit` (integer, optional): Số lượng items per page (default: 20, max: 100)

**Authentication:** Same as Followers list

#### Response Success (200 OK)
```json
{
  "users": [
    {
      "id": 789,
      "username": "charlie",
      "display_name": "Charlie Brown",
      "avatar_url": "https://r2.example.com/avatars/789.jpg",
      "is_following": true
    }
  ],
  "cursor": "2024-12-01T09:15:00Z",
  "has_more": false
}
```

**LƯU Ý:** 
- Trong following list, `is_following` của current user sẽ luôn = `true` cho tất cả users (vì đó là list những người mình đang follow)
- Nhưng nếu có viewer khác xem list này, `is_following` sẽ khác nhau

#### Frontend Implementation

**Workflow khi render list:**

1. **Render danh sách following**:
   - Loop qua `users` array
   - Show avatar (always present), display_name (always present), @username
   - Show "Following" button (vì `is_following` luôn là `true` trong list này)

2. **Implement infinite scroll**: Giống hệt như Followers list
   - Detect scroll to bottom
   - Load more với cursor
   - Append to existing list

3. **Handle unfollow action**:
   - Khi user unfollow someone TRONG list này
   - Optimistic update: Remove user khỏi list ngay lập tức
   - Nếu API fail → add user lại vào list

4. **Empty state**:
   - Show: "Not following anyone yet"
   - Suggest: "Find people to follow"

#### Error Responses

Same as Followers list endpoint.

---

## Pagination Guide

### Cursor-Based Pagination

**Concept:**
- Dùng `created_at` timestamp làm cursor
- Stable: Data mới không ảnh hưởng previous pages
- Fast: Database dùng index trên `created_at`

**Workflow:**

1. **Initial Load** (First Page):
   - Gọi API không có cursor: `GET /users/:id/followers?limit=20`
   - Nhận response: `{ users: [...], cursor: "2024-12-01T10:00:00Z", has_more: true }`
   - Render 20 items đầu tiên

2. **Load More** (Subsequent Pages):
   - User scroll đến cuối list
   - Check `has_more === true`
   - Gọi API với cursor: `GET /users/:id/followers?cursor=2024-12-01T10:00:00Z&limit=20`
   - Append new users vào existing list

3. **End of List**:
   - Khi `has_more === false`: Đã hết data
   - Hide loading spinner
   - Show "End of list" message (optional)

**Important Notes:**

- **Không sử dụng offset pagination** (`?page=2&limit=20`) vì có vấn đề với data consistency
- **Cursor là timestamp**: RFC3339 format, ví dụ: `2024-12-01T10:30:00Z`
- **Cursor có thể null**: Khi hết data, backend trả `cursor: null`
- **Limit mặc định**: 20 items (balance giữa performance và UX)

### Implementation Checklist

**Frontend phải implement:**
- [ ] Initial load không có cursor
- [ ] Detect scroll to bottom (threshold ~100px)
- [ ] Check `has_more` trước khi load more
- [ ] Prevent duplicate requests (flag `isLoadingMore`)
- [ ] Append data (không replace)
- [ ] Handle loading states (initial, loading more)
- [ ] Handle empty state (`users.length === 0`)
- [ ] Handle error state (show retry button)
- [ ] Cache data (optional, 30-60 seconds)

### Edge Cases

**Case 1: New follower appears**
- User A đang scroll followers list
- User B follow trong lúc đó
- User A load next page → Không thấy User B (vì cursor filtering)
- Solution: Pull-to-refresh để get latest data

**Case 2: Someone unfollows**
- User đang scroll
- Ai đó unfollow → item biến mất
- Cursor vẫn work, không bị lỗi

**Case 3: Network timeout**
- Request timeout → Show retry button
- Keep previous data
- Không clear list

---

## TypeScript Types

```typescript
/**
 * User summary (compact version)
 * Dùng cho: Followers/Following lists, Search results
 */
interface UserSummary {
  id: number;
  username: string;
  display_name: string;              // Always present (NOT NULL in DB)
  avatar_url: string;                // Always present (NOT NULL in DB)
  is_following: boolean;             // false nếu không có token
}

/**
 * Follow action response
 * Dùng cho: POST /users/:id/follow, DELETE /users/:id/follow
 */
interface FollowActionResponse {
  message: string;                   // "Successfully followed user" hoặc "Successfully unfollowed user"
}

/**
 * Follow list response (Followers hoặc Following)
 * Dùng cho: GET /users/:id/followers, GET /users/:id/following
 */
interface FollowListResponse {
  users: UserSummary[];              // Array of users (có thể empty)
  cursor: string | null;             // Next cursor (null nếu hết data)
  has_more: boolean;                 // true = còn data, false = hết
}

/**
 * API Methods
 */
interface FollowAPI {
  // Follow a user
  follow(userId: number): Promise<FollowActionResponse>;
  
  // Unfollow a user
  unfollow(userId: number): Promise<FollowActionResponse>;
  
  // Get followers list with pagination
  getFollowers(
    userId: number,
    cursor?: string | null,
    limit?: number
  ): Promise<FollowListResponse>;
  
  // Get following list with pagination
  getFollowing(
    userId: number,
    cursor?: string | null,
    limit?: number
  ): Promise<FollowListResponse>;
}
```

**Type Usage Examples:**

```typescript
// Follow/Unfollow actions
const result: FollowActionResponse = await api.follow(userId);

// Get followers with pagination
const page1: FollowListResponse = await api.getFollowers(userId, null, 20);
const page2: FollowListResponse = await api.getFollowers(userId, page1.cursor, 20);

// User card component
interface UserCardProps {
  user: UserSummary;
  onFollowToggle: (userId: number, isFollowing: boolean) => void;
}
```

---

## Frontend Implementation Guide

### Pattern 1: Follow Button Component

**Component cần:**
- **Props**: `userId`, `initialFollowing` state
- **State**: `isFollowing`, `isLoading`
- **Logic**: 
  - Toggle follow/unfollow on click
  - Optimistic update
  - Error handling + rollback
  - Disable button khi loading

**Button states:**
- `isFollowing === false`: Show "Follow" button (primary color)
- `isFollowing === true`: Show "Following" button (secondary color)
- `isLoading === true`: Show spinner, disable button

**Integration:**
- Dùng trong profile screen, user cards, search results, followers/following lists
- Must be reusable component

### Pattern 2: Followers/Following Lists with Infinite Scroll

**List component cần:**
- **Props**: `userId`, `type` ('followers' | 'following')
- **State**: `users` array, `cursor`, `hasMore`, `isLoading`, `isLoadingMore`
- **Features**:
  - Initial load: Fetch first page (limit 20)
  - Infinite scroll: Detect bottom threshold → load more
  - Loading states: Initial spinner, bottom spinner
  - Empty state: "No followers/following yet"
  - Error state: Retry button

**Scroll detection:**
- Detect khi user scroll đến ~100px từ bottom
- Check `hasMore === true` before loading
- Prevent duplicate requests (check `isLoadingMore`)

**Data management:**
- Append new users to existing array (không replace)
- Update cursor sau mỗi load
- Set `hasMore` từ API response

### Pattern 3: User Card in Lists

**Card component cần:**
- **Display**: Avatar (always present), display_name (always present), @username
- **Action**: Follow/Following button (hide nếu own profile)
- **Interaction**: Tap card → navigate to profile
- **Props**: `user` object, `currentUserId`, `onUserPress` callback

**Follow button integration:**
- Pass `user.id` và `user.is_following` to FollowButton
- Update `is_following` optimistically when toggled
- Không cần refetch entire list

### Pattern 4: Profile Tabs with Counters

**Tab structure:**
- Tab 1: Posts (count: `post_count`)
- Tab 2: Followers (count: `follower_count`, tappable)
- Tab 3: Following (count: `following_count`, tappable)

**Counter updates:**
- Khi follow/unfollow → increment/decrement local counter ngay
- Không cần refetch profile
- Eventual consistency: Profile sẽ được refetch khi navigate back

**Navigation:**
- Tap counter → navigate to respective list screen
- Highlight active tab
- Lazy load tab content

## Summary

**Key Points:**
- `POST /users/:id/follow`: Follow user (requires auth, optimistic updates recommended)
- `DELETE /users/:id/follow`: Unfollow user (requires auth, no confirmation needed)
- `GET /users/:id/followers`: List followers with cursor pagination (optional auth)
- `GET /users/:id/following`: List following with cursor pagination (optional auth)
- Cursor pagination: Stable, fast, consistent
- Optimistic updates: Better UX, must implement rollback
- Error handling: Different UI cho different error types
- Cache strategy: 30-60 seconds for lists, invalidate on follow/unfollow
