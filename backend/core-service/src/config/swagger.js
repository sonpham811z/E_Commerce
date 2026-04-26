const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Core Service API',
      version: '1.0.0',
      description: 'Core ecommerce microservice — products, orders, payments, categories',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3003}`, description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number' },
            original_price: { type: 'number' },
            sale_price: { type: 'number' },
            stock: { type: 'integer' },
            rating: { type: 'number' },
            image: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            is_active: { type: 'boolean' },
            is_featured: { type: 'boolean' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            customer_name: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'object' },
            status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
            total: { type: 'number' },
            payment_method: { type: 'string' },
            payment_status: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded'] },
            order_date: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = { specs };
