"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const rsvp_routes_1 = __importDefault(require("./routes/rsvp.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const resource_routes_1 = __importDefault(require("./routes/resource.routes"));
const gallery_routes_1 = __importDefault(require("./routes/gallery.routes"));
const leaderboard_routes_1 = __importDefault(require("./routes/leaderboard.routes"));
const announcement_routes_1 = __importDefault(require("./routes/announcement.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const calendar_routes_1 = __importDefault(require("./routes/calendar.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("./lib/prisma");
const auth_controller_1 = require("./controllers/auth.controller");
const auth_middleware_1 = require("./middlewares/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.post('/api/auth/user/register', auth_controller_1.registerUser);
app.post('/api/auth/user/login', auth_controller_1.loginUserController);
app.post('/api/auth/user/logout', auth_middleware_1.authenticateToken, auth_middleware_1.requireUser, auth_controller_1.logoutUserController);
app.get('/api/auth/user/me', auth_middleware_1.authenticateToken, auth_middleware_1.requireUser, auth_controller_1.getCurrentUser);
app.post('/api/auth/admin/register', auth_controller_1.registerAdmin);
app.post('/api/auth/admin/login', auth_controller_1.loginAdminController);
app.post('/api/auth/admin/logout', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, auth_controller_1.logoutAdminController);
app.get('/api/auth/admin/me', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, auth_controller_1.getCurrentAdmin);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api/rsvps', rsvp_routes_1.default);
app.use('/api/attendance', attendance_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use('/api/resources', resource_routes_1.default);
app.use('/api/gallery', gallery_routes_1.default);
app.use('/api/leaderboard', leaderboard_routes_1.default);
app.use('/api/announcements', announcement_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/calendar', calendar_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
const PORT = process.env.PORT || 4000;
async function connectDB() {
    try {
        await prisma_1.prisma.$connect();
        console.log("🟢 Database connected successfully!");
    }
    catch (error) {
        console.error("🔴 Database connection failed:", error);
        process.exit(1);
    }
}
console.log(PORT);
async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
}
startServer();
//# sourceMappingURL=index.js.map