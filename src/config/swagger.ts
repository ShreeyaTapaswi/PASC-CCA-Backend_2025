import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PASC CCA 2025 API Documentation',
      version: '1.0.0',
      description: 'API documentation for PASC CCA 2025 Backend',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            department: {
              type: 'string',
              enum: ['CE', 'IT', 'ENTC', 'ECE', 'AIDS'],
            },
            year: { type: 'integer' },
            passoutYear: { type: 'integer' },
            roll: { type: 'integer' },
            hours: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Admin: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                admin: { $ref: '#/components/schemas/Admin' },
                token: { type: 'string' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            credits: { type: 'number' },
            numDays: { type: 'integer' },
            capacity: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['UPCOMING', 'ONGOING', 'COMPLETED'],
            },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        EventResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { $ref: '#/components/schemas/Event' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            pages: { type: 'integer' },
          },
        },
        PaginatedEventData: {
          type: 'object',
          properties: {
            events: {
              type: 'array',
              items: { $ref: '#/components/schemas/Event' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        PaginatedEventResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: '#/components/schemas/PaginatedEventData' },
          },
        },
        Rsvp: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            eventId: { type: 'integer' },
            userId: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['ATTENDING', 'NOT_ATTENDING'],
            },
          },
        },
        RsvpResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            eventId: { type: 'integer' },
            userId: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['ATTENDING', 'NOT_ATTENDING'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RsvpWithEvents: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            eventId: { type: 'integer' },
            userId: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['ATTENDING', 'NOT_ATTENDING'],
            },
            event: { $ref: '#/components/schemas/Event' },
          },
        },
        RsvpWithUser: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            eventId: { type: 'integer' },
            userId: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['ATTENDING', 'NOT_ATTENDING'],
            },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        RsvpAndEventResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: '#/components/schemas/RsvpWithEvents' },
          },
        },
        RsvpAndUserResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: '#/components/schemas/RsvpWithUser' },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts'], // Adjust as needed
};

export const swaggerSpec = swaggerJsdoc(options);
