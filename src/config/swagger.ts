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
        AttendanceSession: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            eventId: { type: 'integer' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time', nullable: true },
            isActive: { type: 'boolean' },
            sessionName: { type: 'string' },
            code: { type: 'string' },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            sessionId: { type: 'integer' },
            attendedAt: { type: 'string', format: 'date-time' },
            user: { $ref: '#/components/schemas/User' },
            session: { $ref: '#/components/schemas/AttendanceSession' },
          },
        },
        AttendanceResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: '#/components/schemas/Attendance' },
          },
        },
        // 👇 Your new custom schema for the stats
        UserEventSessionStats: {
          type: 'object',
          properties: {
            sessionId: { type: 'integer' },
            sessionName: { type: 'string' },
            eventId: { type: 'integer' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time', nullable: true },
            code: { type: 'string' },
            location: { type: 'string' },
            present: { type: 'boolean' },
          },
        },
        AttendanceUserEventSessionStatsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/UserEventSessionStats' },
            },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts'], // adjust as needed
};

export const swaggerSpec = swaggerJsdoc(options);
