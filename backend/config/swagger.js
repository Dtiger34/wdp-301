// swagger.js

const swaggerJsdoc = require('swagger-jsdoc'); 
const swaggerUi = require('swagger-ui-express'); 

const options = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'API docs for the library management system', 
    },
    servers: [
      {
        url: 'http://localhost:3000', // Địa chỉ server API (sửa lại nếu deploy lên production)
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

const specs = swaggerJsdoc(options);

// Export ra hai thành phần:
// - swaggerUi: middleware để dùng trong express
// - specs: tài liệu Swagger đã được generate
module.exports = {
  swaggerUi,
  specs,
};
