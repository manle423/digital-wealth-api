export interface IWelcomeEmailData {
  to: string;
  name: string;
  subject: string;
  template: string;
  data: {
    name: string;
    email: string;
  };
}

export interface IOtpEmailData {
  to: string;
  subject: string;
  template: string;
  data: {
    otp: string;
    expiryMinutes: number;
    email: string;
  };
}

// Các interface notification khác có thể được thêm ở đây trong tương lai
export interface EmailBasePayload {
  to: string;
  subject: string;
  template: string;
} 