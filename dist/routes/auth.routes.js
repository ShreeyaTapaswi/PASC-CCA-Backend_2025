"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const rateLimiter_middleware_1 = require("../middlewares/rateLimiter.middleware");
const router = (0, express_1.Router)();
router.post('/user/register', rateLimiter_middleware_1.authLimiter, (0, validation_middleware_1.validate)(validation_middleware_1.userRegisterSchema), auth_controller_1.registerUser);
router.post('/user/login', rateLimiter_middleware_1.authLimiter, (0, validation_middleware_1.validate)(validation_middleware_1.loginSchema), auth_controller_1.loginUserController);
router.post('/user/logout', auth_middleware_1.authenticateToken, auth_controller_1.logoutUserController);
router.get('/user/me', auth_middleware_1.authenticateToken, auth_controller_1.getCurrentUser);
router.post('/admin/register', rateLimiter_middleware_1.authLimiter, (0, validation_middleware_1.validate)(validation_middleware_1.adminRegisterSchema), auth_controller_1.registerAdmin);
router.post('/admin/login', rateLimiter_middleware_1.authLimiter, (0, validation_middleware_1.validate)(validation_middleware_1.loginSchema), auth_controller_1.loginAdminController);
router.post('/admin/logout', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, auth_controller_1.logoutAdminController);
router.get('/admin/me', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, auth_controller_1.getCurrentAdmin);
router.get('/user/count', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, auth_controller_1.getUserCountController);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map