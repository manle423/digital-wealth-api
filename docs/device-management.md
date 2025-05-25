# Device Management System

Hệ thống quản lý thiết bị đăng nhập cho phép theo dõi và quản lý các phiên đăng nhập từ các thiết bị khác nhau.

## Tính năng

- Theo dõi thông tin thiết bị đăng nhập
- Quản lý phiên đăng nhập (sessions)
- Đăng xuất từ thiết bị cụ thể
- Đăng xuất từ tất cả thiết bị
- Đánh dấu thiết bị tin cậy
- Theo dõi IP và vị trí đăng nhập
- Cập nhật thời gian truy cập cuối

## API Endpoints

### 1. Đăng nhập với thông tin thiết bị

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "deviceInfo": {
    "deviceId": "unique-device-id",
    "deviceType": "mobile",
    "deviceName": "iPhone 12",
    "deviceModel": "iPhone13,2",
    "osVersion": "iOS 15.0",
    "appVersion": "1.0.0"
  }
}
```

### 2. Xem danh sách thiết bị đang đăng nhập

```http
GET /auth/devices
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "uuid",
    "sessionId": "session-uuid",
    "deviceId": "unique-device-id",
    "deviceType": "mobile",
    "deviceName": "iPhone 12",
    "deviceModel": "iPhone13,2",
    "osVersion": "iOS 15.0",
    "appVersion": "1.0.0",
    "ipAddress": "192.168.1.1",
    "location": "Vietnam",
    "lastAccessAt": "2023-12-01T10:00:00Z",
    "isActive": true,
    "isTrusted": false,
    "createdAt": "2023-12-01T09:00:00Z"
  }
]
```

### 3. Đăng xuất từ tất cả thiết bị

```http
POST /auth/devices/logout-all
Authorization: Bearer <token>
Content-Type: application/json

{
  "exceptCurrentDevice": true  // optional, mặc định false
}
```

### 4. Đăng xuất từ thiết bị cụ thể

```http
DELETE /auth/devices/{deviceId}
Authorization: Bearer <token>
```

### 5. Đánh dấu thiết bị tin cậy

```http
POST /auth/devices/{deviceId}/trust
Authorization: Bearer <token>
```

### 6. Bỏ đánh dấu thiết bị tin cậy

```http
DELETE /auth/devices/{deviceId}/trust
Authorization: Bearer <token>
```

## Cách sử dụng

### 1. Client Implementation

Khi đăng nhập, client cần gửi thông tin thiết bị:

```javascript
// React Native example
import DeviceInfo from 'react-native-device-info';

const deviceInfo = {
  deviceId: await DeviceInfo.getUniqueId(),
  deviceType: DeviceInfo.getDeviceType(),
  deviceName: await DeviceInfo.getDeviceName(),
  deviceModel: DeviceInfo.getModel(),
  osVersion: DeviceInfo.getSystemVersion(),
  appVersion: DeviceInfo.getVersion(),
};

const loginData = {
  email: 'user@example.com',
  password: 'password123',
  deviceInfo,
};
```

### 2. Web Browser Example

```javascript
// Web browser example
const deviceInfo = {
  deviceId: localStorage.getItem('deviceId') || generateUniqueId(),
  deviceType: 'web',
  deviceName: navigator.userAgent,
  deviceModel: 'Browser',
  osVersion: navigator.platform,
  appVersion: '1.0.0',
};

// Lưu deviceId để sử dụng lại
localStorage.setItem('deviceId', deviceInfo.deviceId);
```

### 3. Security Features

- **Session Tracking**: Mỗi phiên đăng nhập được theo dõi với sessionId duy nhất
- **IP Monitoring**: Theo dõi địa chỉ IP của mỗi phiên đăng nhập
- **Device Trust**: Cho phép đánh dấu thiết bị tin cậy
- **Auto Logout**: Tự động đăng xuất khi phát hiện hoạt động đáng ngờ
- **Last Access**: Cập nhật thời gian truy cập cuối để theo dõi hoạt động

### 4. Database Schema

Entity `user_auths` bao gồm các trường:

- `id`: UUID primary key
- `user_id`: Foreign key đến bảng users
- `session_id`: Unique session identifier
- `device_id`: Unique device identifier
- `device_type`: Loại thiết bị (mobile, web, desktop)
- `device_name`: Tên thiết bị
- `device_model`: Model thiết bị
- `os_version`: Phiên bản hệ điều hành
- `app_version`: Phiên bản ứng dụng
- `ip_address`: Địa chỉ IP
- `location`: Vị trí địa lý
- `last_access_at`: Thời gian truy cập cuối
- `is_active`: Trạng thái hoạt động
- `is_trusted`: Thiết bị tin cậy
- `trusted_at`: Thời gian đánh dấu tin cậy
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

## Best Practices

1. **Device ID Generation**: Sử dụng UUID hoặc device fingerprint duy nhất
2. **Security**: Không lưu thông tin nhạy cảm trong deviceInfo
3. **Performance**: Cập nhật last_access_at không đồng bộ để không ảnh hưởng performance
4. **Privacy**: Tuân thủ quy định về bảo vệ dữ liệu cá nhân khi lưu thông tin thiết bị
5. **Cleanup**: Định kỳ xóa các session cũ không hoạt động 