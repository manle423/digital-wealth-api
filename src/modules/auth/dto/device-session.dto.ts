export class DeviceSessionDto {
  id: string;
  sessionId: string;
  deviceId: string;
  deviceType?: string;
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  ipAddress?: string;
  location?: string;
  lastAccessAt: Date;
  isActive: boolean;
  isTrusted: boolean;
  trustedAt?: Date;
  createdAt: Date;
}
