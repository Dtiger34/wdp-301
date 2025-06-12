// swagger.js

const swaggerJsdoc = require('swagger-jsdoc'); // Thư viện để tạo tài liệu Swagger từ mô tả trong code (JSDoc style)
const swaggerUi = require('swagger-ui-express'); // Middleware để phục vụ giao diện Swagger UI

// Tùy chọn cấu hình cho Swagger
const options = {
  definition: {
    openapi: '3.0.0', // Phiên bản OpenAPI đang dùng (swagger 3.0)
    info: {
      title: 'Library API', // Tiêu đề tài liệu API
      version: '1.0.0', // Phiên bản API
      description: 'API docs for the library management system', // Mô tả tổng quan
    },
    servers: [
      {
        url: 'http://localhost:3000', // Địa chỉ server API (sửa lại nếu deploy lên production)
      },
    ],
  },
  apis: ['./routes/*.js'], 
  // Đường dẫn đến file chứa mô tả API theo cú pháp Swagger (sử dụng JSDoc comments)
  // Có thể mở rộng thêm: ['./routes/*.js', './controller/*.js'] nếu bạn viết mô tả trong controller
};

// Tạo spec Swagger từ cấu hình trên
const specs = swaggerJsdoc(options);

// Export ra hai thành phần:
// - swaggerUi: middleware để dùng trong express
// - specs: tài liệu Swagger đã được generate
module.exports = {
  swaggerUi,
  specs,
};
