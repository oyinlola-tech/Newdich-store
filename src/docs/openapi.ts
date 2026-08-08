export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Telente Store API',
    description: 'REST API for the Telente Store by Oluwayemi Oyinlola.',
    version: '1.0.0'
  },
  servers: [{ url: 'http://localhost:3000' }],
  tags: [
    { name: 'auth', description: 'Authentication and sessions' },
    { name: 'users', description: 'User profiles and administration' },
    { name: 'products', description: 'Product catalog' },
    { name: 'categories', description: 'Product categories' },
    { name: 'inventory', description: 'Stock management' },
    { name: 'media', description: 'File uploads and media' },
    { name: 'settings', description: 'Store settings' },
    { name: 'health', description: 'Health checks' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};
