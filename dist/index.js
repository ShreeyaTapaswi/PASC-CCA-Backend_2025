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
const dotenv_1 = __importDefault(require("dotenv"));
const auth_controller_1 = require("./controllers/auth.controller");
const auth_middleware_1 = require("./middlewares/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
//# sourceMappingURL=index.js.map