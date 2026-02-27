import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 4000;

// Minimal Swagger config compatible with the installed swagger-jsdoc version.
// We expose the OpenAPI doc via `swaggerDefinition`, which this version expects.
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'PASC CCA 2025 API Documentation',
    version: '1.0.0',
    description: 'API documentation for PASC CCA 2025 Backend',
  },
  servers: [
    {
      url: `http://localhost:${PORT}/`,
      description: 'Development server',
    },
  ],
};

const options = {
  // For swagger-jsdoc v1.x
  swaggerDefinition,
  apis: ['./src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options as any);
