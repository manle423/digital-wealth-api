import { ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';

/**
 * Xử lý các lỗi Database phổ biến và chuyển đổi thành Exception có ngữ cảnh phù hợp
 * @param error Lỗi từ database
 * @param entityName Tên entity đang thao tác (ví dụ: 'Hồ sơ rủi ro', 'Người dùng')
 * @returns không trả về giá trị, luôn throw exception
 */
export function handleDatabaseError(error: any, entityName: string): never {
  // Xử lý lỗi trùng dữ liệu
  if (error.code === 'ER_DUP_ENTRY') {
    // Trích xuất giá trị bị trùng lặp từ thông báo lỗi
    const match = error.sqlMessage.match(/Duplicate entry '(.+)' for key/);
    const duplicateValue = match ? match[1] : 'unknown';
    
    throw new ConflictException(
      `${entityName} với giá trị "${duplicateValue}" đã tồn tại.`
    );
  }
  
  // Lỗi không đủ tham số/tham số sai kiểu
  if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_PARSE_ERROR') {
    throw new BadRequestException(
      `Lỗi trong dữ liệu đầu vào khi thao tác với ${entityName.toLowerCase()}. Chi tiết: ${error.message}`
    );
  }

  // Các lỗi khóa ngoại
  if (error.code === 'ER_NO_REFERENCED_ROW' || error.code === 'ER_NO_REFERENCED_ROW_2') {
    throw new BadRequestException(
      `${entityName} tham chiếu đến dữ liệu không tồn tại. Chi tiết: ${error.message}`
    );
  }
  
  // Các lỗi ràng buộc
  if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
    throw new BadRequestException(
      `Giá trị không hợp lệ khi thao tác với ${entityName.toLowerCase()}. Chi tiết: ${error.message}`
    );
  }
  
  // Lỗi thiếu giá trị cho trường bắt buộc
  if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
    const match = error.sqlMessage.match(/Field '(.+)' doesn't have a default value/);
    const fieldName = match ? match[1] : 'unknown';
    
    throw new BadRequestException(
      `Thiếu giá trị cho trường "${fieldName}" khi thao tác với ${entityName.toLowerCase()}. Chi tiết: ${error.message}`
    );
  }
  
  // Log lỗi không được xử lý
  console.error('Database error:', error);
  
  // Mặc định trả về lỗi 500
  throw new InternalServerErrorException(
    `Đã xảy ra lỗi khi thao tác với ${entityName.toLowerCase()}. Chi tiết: ${error.message}`
  );
} 