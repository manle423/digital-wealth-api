# Auth Module - Complete Guide

## Tổng quan

Auth Module là hệ thống xác thực và phân quyền hoàn chỉnh cho ứng dụng Digital Wealth Management, bao gồm:

- **User Authentication** (Đăng nhập/Đăng ký)
- **Device Management** (Quản lý thiết bị đăng nhập)
- **Session Management** (Quản lý phiên đăng nhập)
- **Trusted Device System** (Hệ thống thiết bị tin cậy)
- **Password Recovery** (Khôi phục mật khẩu)
- **Security Middleware** (Middleware bảo mật)

---

## 1. Authentication System

### 1.1 User Registration

**Endpoint:** `POST /auth/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### 1.2 User Login

**Endpoint:** `POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "deviceInfo": {
    "deviceId": "device_12345_unique_id",
    "deviceType": "mobile",
    "deviceName": "iPhone 15 Pro",
    "deviceModel": "iPhone15,2",
    "osVersion": "iOS 17.1.1",
    "appVersion": "1.0.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessTokenExpiresAt": 1703123456789,
      "refreshTokenExpiresAt": 1703209856789
    },
    "sessionInfo": {
      "sessionId": "session_uuid",
      "deviceId": "device_12345_unique_id",
      "isNewDevice": true,
      "isTrusted": false
    }
  }
}
```

### 1.3 Token Refresh

**Endpoint:** `POST /auth/refresh`

Sử dụng refresh token để lấy access token mới.

### 1.4 Logout

**Endpoint:** `POST /auth/logout`

Đăng xuất khỏi session hiện tại.

---

## 2. Device Management System

### 2.1 Device Information

Mỗi thiết bị đăng nhập được theo dõi với các thông tin:

- **deviceId**: Unique identifier cho thiết bị
- **deviceType**: `mobile`, `tablet`, `desktop`, `web`
- **deviceName**: Tên hiển thị của thiết bị
- **deviceModel**: Model cụ thể
- **osVersion**: Phiên bản hệ điều hành
- **appVersion**: Phiên bản ứng dụng
- **ipAddress**: Địa chỉ IP đăng nhập
- **location**: Vị trí địa lý
- **lastAccessAt**: Thời gian truy cập cuối
- **isActive**: Trạng thái hoạt động
- **isTrusted**: Thiết bị tin cậy hay không

### 2.2 Device Management Endpoints

#### GET /auth/devices
Lấy danh sách tất cả devices của user

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "deviceId": "device_123",
        "deviceType": "mobile",
        "deviceName": "iPhone 15 Pro",
        "deviceModel": "iPhone15,2",
        "osVersion": "iOS 17.1.1",
        "appVersion": "1.0.0",
        "ipAddress": "192.168.1.100",
        "location": "Ho Chi Minh City",
        "lastAccessAt": "2024-01-15T10:30:00Z",
        "isTrusted": true,
        "trustedAt": "2024-01-15T09:00:00Z",
        "isCurrentDevice": true
      }
    ],
    "currentDeviceCanLogoutOthers": true
  }
}
```

#### POST /auth/devices/logout-all
Logout tất cả devices

```json
{
  "includeCurrentDevice": false  // optional, default false
}
```

**Behavior:**
- **Mặc định** (`includeCurrentDevice: false`): Logout tất cả device khác, giữ lại device hiện tại
- **Nếu** `includeCurrentDevice: true`: Logout tất cả device bao gồm cả device hiện tại

#### DELETE /auth/devices/:deviceId
Logout một device cụ thể

#### POST /auth/devices/:deviceId/trust
Trust một device

#### DELETE /auth/devices/:deviceId/trust
Untrust một device

---

## 3. Trusted Device Security System

### 3.1 Quy tắc bảo mật

- **User luôn có thể logout device hiện tại của mình** (không cần trusted)
- **Chỉ device trusted mới có thể logout device khác**
- **Device untrusted không thể logout device khác** (kể cả device untrusted khác)

### 3.2 Trust Device Process

1. User login từ device mới → Device được tạo với `isTrusted = false`
2. User cần trust device thông qua endpoint `POST /auth/devices/:deviceId/trust`
3. Sau khi trust, device có thể logout các device khác

### 3.3 Security Scenarios

#### Scenario 1: User login từ device mới
1. User login → Device được tạo với `isTrusted = false`
2. User chỉ có thể logout device hiện tại
3. User không thể logout device khác cho đến khi trust device hiện tại

#### Scenario 2: User trust device
1. User gọi `POST /auth/devices/:deviceId/trust`
2. Device được đánh dấu `isTrusted = true`
3. Device này có thể logout các device khác

#### Scenario 3: User login từ device mới (đã có device trusted khác)
1. User login từ device mới → Device mới có `isTrusted = false`
2. Device mới chỉ có thể logout chính nó
3. Muốn logout device khác → Phải trust device mới hoặc dùng device trusted cũ

#### Scenario 4: Device bị compromise
1. Admin/User có thể untrust device: `DELETE /auth/devices/:deviceId/trust`
2. Device đó sẽ mất quyền logout device khác
3. Chỉ có thể logout chính nó

---

## 4. Password Recovery System

### 4.1 Forgot Password

**Endpoint:** `POST /auth/forgot-password`

```json
{
  "email": "user@example.com"
}
```

Hệ thống sẽ:
1. Tạo OTP 6 chữ số
2. Gửi email chứa OTP
3. OTP có thời hạn 15 phút
4. Giới hạn 3 lần thử sai, sau đó phải chờ 15 phút

### 4.2 Reset Password

**Endpoint:** `POST /auth/reset-password`

```json
{
  "email": "user@example.com",
  "token": "123456",
  "newPassword": "newPassword123"
}
```

### 4.3 OTP Security Features

- **6-digit random OTP**
- **15-minute expiry**
- **Retry limits** (3 attempts với 15-minute cooldown)
- **Redis caching** cho retry tracking
- **RabbitMQ integration** cho email sending
- **IP tracking** và user agent logging

---

## 5. Session Management & Security

### 5.1 Session Validation Middleware

Middleware tự động validate session cho mọi request:

- **Check JWT token** có sessionId không
- **Validate session** có active trong database không
- **Auto clear cookies** khi session expired
- **Throw SESSION_EXPIRED** nếu session invalid

### 5.2 Excluded Routes

Các routes không cần session validation:
- `auth/login`
- `auth/register`
- `auth/refresh`
- `auth/forgot-password`
- `auth/reset-password`

### 5.3 Security Flow

1. **Request có JWT** → Extract sessionId
2. **Check database** → Session có `isActive = true`?
3. **Nếu inactive** → Clear cookies + 401 Unauthorized
4. **Nếu active** → Set `req.user` và cho phép request

---

## 6. Frontend Implementation Guide

### 6.1 Device ID Generation

#### Mobile App (React Native):
```javascript
import DeviceInfo from 'react-native-device-info';

const getDeviceInfo = async () => {
  return {
    deviceId: await DeviceInfo.getUniqueId(),
    deviceType: await DeviceInfo.getDeviceType(),
    deviceName: await DeviceInfo.getDeviceName(),
    deviceModel: await DeviceInfo.getModel(),
    osVersion: await DeviceInfo.getSystemVersion(),
    appVersion: await DeviceInfo.getVersion()
  };
};
```

#### Web Browser:
```javascript
const generateDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint).substring(0, 32);
};

const getWebDeviceInfo = () => {
  return {
    deviceId: generateDeviceFingerprint(),
    deviceType: 'web',
    deviceName: `${navigator.platform} - ${navigator.userAgent.split(' ')[0]}`,
    deviceModel: navigator.userAgent,
    osVersion: navigator.platform,
    appVersion: '1.0.0'
  };
};
```

### 6.2 Login Implementation

```javascript
const login = async (email, password) => {
  const deviceInfo = await getDeviceInfo();
  
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      deviceInfo
    }),
    credentials: 'include' // Important for cookies
  });
  
  return response.json();
};
```

### 6.3 Error Handling

```javascript
// Handle session expired
if (error.message === 'SESSION_EXPIRED') {
  // Clear local storage
  localStorage.clear();
  // Redirect to login
  window.location.href = '/login';
}
```

---

## 7. Database Schema

### 7.1 UserAuth Table

```sql
CREATE TABLE user_auths (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID UNIQUE NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  device_type VARCHAR(50),
  device_name VARCHAR(255),
  device_model VARCHAR(255),
  os_version VARCHAR(100),
  app_version VARCHAR(50),
  ip_address VARCHAR(45),
  location VARCHAR(255),
  last_access_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  is_trusted BOOLEAN DEFAULT false,
  trusted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_auth_user_device ON user_auths(user_id, device_id);
CREATE INDEX idx_user_auth_session ON user_auths(session_id);
CREATE INDEX idx_user_auth_active ON user_auths(user_id, is_active);
```

### 7.2 UserOtp Table

```sql
CREATE TABLE user_otps (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(10) NOT NULL,
  type ENUM('RESET_PASSWORD') NOT NULL,
  status ENUM('PENDING', 'VERIFIED', 'EXPIRED', 'USED') DEFAULT 'PENDING',
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  verified_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. Error Messages

### 8.1 Authentication Errors

- `INVALID_CREDENTIALS` - Email hoặc password không đúng
- `TOKEN_NOT_FOUND` - Không tìm thấy token
- `INVALID_TOKEN` - Token không hợp lệ
- `SESSION_EXPIRED` - Session đã hết hạn
- `USER_NOT_FOUND` - Không tìm thấy user

### 8.2 Device Management Errors

- `"Only trusted devices can logout other devices"` - Khi untrusted device cố logout device khác
- `"Device not found or already inactive"` - Khi device không tồn tại
- `"Cannot logout device: insufficient permissions"` - Khi không có quyền

### 8.3 OTP Errors

- `INVALID_OTP` - OTP không đúng
- `OTP_EXPIRED` - OTP đã hết hạn
- `TOO_MANY_ATTEMPTS` - Quá nhiều lần thử sai

---

## 9. Best Practices

### 9.1 Cho Frontend Developer

1. **Hiển thị trạng thái trusted** trong danh sách devices
2. **Disable nút logout other devices** nếu `currentDeviceCanLogoutOthers = false`
3. **Hiển thị warning** khi user cố gắng logout từ untrusted device
4. **Suggest user trust device** nếu muốn quản lý devices khác
5. **Handle session expired** gracefully với redirect to login
6. **Store deviceId** persistently để tránh tạo device mới mỗi lần

### 9.2 Cho User

1. **Trust device cá nhân** (điện thoại, laptop chính)
2. **Không trust device công cộng** (internet cafe, shared computer)
3. **Định kỳ review danh sách trusted devices**
4. **Untrust device cũ/mất** ngay lập tức
5. **Logout khỏi device không tin cậy** sau khi sử dụng

### 9.3 Security Best Practices

1. **Device ID Generation**: Sử dụng UUID hoặc device fingerprint duy nhất
2. **Security**: Không lưu thông tin nhạy cảm trong deviceInfo
3. **Performance**: Cập nhật last_access_at không đồng bộ
4. **Privacy**: Tuân thủ quy định về bảo vệ dữ liệu cá nhân
5. **Cleanup**: Định kỳ xóa các session cũ không hoạt động
6. **Monitoring**: Log các events quan trọng cho security audit

---

## 10. Monitoring & Logging

Hệ thống sẽ log các events quan trọng:

- **Device login/logout**
- **Trust/untrust actions**
- **Failed logout attempts** từ untrusted devices
- **Suspicious activities** (multiple failed attempts)
- **Session validation failures**
- **OTP generation and verification**

---

## 11. Future Enhancements

1. **Auto-trust based on behavior** (same IP, same location pattern)
2. **Time-based trust** (trust expires after X days)
3. **Risk-based authentication** (require 2FA for untrusted devices)
4. **Device fingerprinting** (more sophisticated device identification)
5. **Geolocation-based security** (block login from unusual locations)
6. **Biometric authentication** integration
7. **Push notification** for new device login
8. **Advanced session analytics** and reporting

---

## 12. API Reference Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | User registration | No |
| POST | `/auth/login` | User login with device info | No |
| POST | `/auth/refresh` | Refresh access token | Refresh Token |
| POST | `/auth/logout` | Logout current session | Yes |
| POST | `/auth/forgot-password` | Request password reset OTP | No |
| POST | `/auth/reset-password` | Reset password with OTP | No |
| GET | `/auth/devices` | Get user's devices | Yes |
| POST | `/auth/devices/logout-all` | Logout all devices | Yes (Trusted) |
| DELETE | `/auth/devices/:deviceId` | Logout specific device | Yes |
| POST | `/auth/devices/:deviceId/trust` | Trust a device | Yes |
| DELETE | `/auth/devices/:deviceId/trust` | Untrust a device | Yes |

---

## Kết luận

Auth Module cung cấp một hệ thống xác thực và bảo mật hoàn chỉnh với:

✅ **Multi-device support** với device management  
✅ **Trusted device security** system  
✅ **Session-based authentication** với real-time validation  
✅ **Password recovery** với OTP security  
✅ **Comprehensive logging** và monitoring  
✅ **Frontend-friendly APIs** với clear error handling  

Hệ thống được thiết kế để đảm bảo bảo mật cao while vẫn maintain user experience tốt và developer-friendly APIs. 