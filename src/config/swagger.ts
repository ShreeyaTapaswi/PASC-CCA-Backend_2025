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
        // url: 'https://pasc-cca-backend-2025.onrender.com',
        url:'http://localhost:4000/',
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
            location: { type: 'string' },
            credits: { type: 'integer' },
          },
        },
        AttendanceSessionWithEvent: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            eventId: { type: 'integer' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time', nullable: true },
            isActive: { type: 'boolean' },
            sessionName: { type: 'string' },
            code: { type: 'string' },
            location: { type: 'string' },
            credits: { type: 'integer' },
            event: { $ref: '#/components/schemas/Event' },
          },
        },
        UserPersonalBest: {
          type: 'object',
          properties: {
            sessionId: { type: 'integer' },
            userId: { type: 'integer' },
            credits: { type: 'integer' },
          },
        },
        UserAttendanceStats: {
          type: 'object',
          properties: {
            sessionsAttended: { type: 'integer' },
            sessions: {
              type: 'array',
              items: { $ref: '#/components/schemas/AttendanceSession' },
            },
            totalCredits: { type: 'number' },
            completionRate: { type: 'number' },
            userPersonalBest: { $ref: '#/components/schemas/UserPersonalBest' },
          },
        },
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
            credits: { type: 'integer' },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            sessionId: { type: 'integer' },
            attendedAt: { type: 'string', format: 'date-time' },
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
        AttendanceSessionResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: '#/components/schemas/AttendanceSession' },
          },
        },
        AttendanceSessionWithEventResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: '#/components/schemas/AttendanceSessionWithEvent' },
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
            prerequisite: { type: 'string', nullable: true },
          },
        },
        EventAndRsvp: {
          type: 'object',
          properties: {
            event: { $ref: '#/components/schemas/Event' },
            rsvp: { type: 'boolean', description: 'True if user has RSVP for this event' }
          }
        },
        EventUserResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/EventAndRsvp' }
            }
          }
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts'], // adjust this to match your controllers location
};

export const swaggerSpec = swaggerJsdoc(options);
