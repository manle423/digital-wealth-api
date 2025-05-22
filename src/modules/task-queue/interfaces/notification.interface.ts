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

// Các interface notification khác có thể được thêm ở đây trong tương lai
export interface EmailBasePayload {
  to: string;
  subject: string;
  template: string;
} 