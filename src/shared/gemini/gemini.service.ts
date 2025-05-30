import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('[GeminiService] GEMINI_API_KEY not configured');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.info('[GeminiService] Initialized successfully');
    }
  }

  async generateFinancialAdvice(prompt: string): Promise<string> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini API not configured');
      }

      this.logger.info('[generateFinancialAdvice] Generating advice with Gemini');

      // Use gemini-2.0-flash-lite for free tier - most cost effective
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-lite",
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 1000, // Keep within reasonable limits
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.logger.info('[generateFinancialAdvice] Successfully generated advice');
      return text;

    } catch (error) {
      this.logger.error('[generateFinancialAdvice] Error generating advice', error);
      
      // Fallback to local advice if API fails
      return this.generateLocalFallbackAdvice();
    }
  }

  private generateLocalFallbackAdvice(): string {
    return `
🎯 **PHÂN TÍCH TÀI CHÍNH TỔNG QUAN**

Dựa trên thông tin tài chính của bạn, đây là một số gợi ý cơ bản:

💰 **ĐÁNH GIÁ TÌNH HÌNH**
• Hãy đảm bảo có quỹ khẩn cấp ít nhất 6 tháng chi tiêu
• Cân bằng tỷ lệ nợ so với tài sản dưới 30%
• Đa dạng hóa danh mục đầu tư theo độ tuổi và khẩu vị rủi ro

📈 **GỢI Ý CHUNG**
• Trẻ (20-35): 70% cổ phiếu, 20% trái phiếu, 10% tiền mặt
• Trung niên (35-55): 60% cổ phiếu, 30% trái phiếu, 10% tiền mặt  
• Cao tuổi (55+): 40% cổ phiếu, 50% trái phiếu, 10% tiền mặt

🔔 **LƯU Ý**: Đây là gợi ý tổng quát. Hãy tham khảo chuyên gia tài chính để có lời khuyên phù hợp với tình hình cụ thể.

✨ **THEO DÕI**: Đánh giá lại danh mục mỗi 6 tháng và điều chỉnh khi cần thiết.
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.genAI) {
        return false;
      }

      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      const result = await model.generateContent("Test connection");
      const response = await result.response;
      
      return !!response.text();
    } catch (error) {
      this.logger.error('[testConnection] Gemini connection test failed', error);
      return false;
    }
  }
} 