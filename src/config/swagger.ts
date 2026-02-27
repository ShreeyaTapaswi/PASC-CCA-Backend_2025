import swaggerJsdoc from 'swagger-jsdoc';
const PORT = process.env.PORT || 4000;
const options: swaggerJsdoc.Options = {
  swaggerDefinition: {    // <--- CHANGE IT TO THIS
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
            data: {
              $ref:
                jwx - aaoq - wpb