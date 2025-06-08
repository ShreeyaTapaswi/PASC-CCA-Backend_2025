"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireUser = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            success: false,
            error: 'Access token is required',
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.type === 'user') {
            const userPayload = { ...decoded, type: 'user' };
            req.user = userPayload;
        }
        else if (decoded.type === 'admin') {
            const adminPayload = { ...decoded, type: 'admin' };
            req.admin = adminPayload;
        }
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            error: 'Invalid token',
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireUser = (req, res, next) => {
    if (!req.user) {
        res.status(403).json({
            success: false,
            error: 'User authentication required',
        });
        return;
    }
    next();
};
exports.requireUser = requireUser;
const requireAdmin = (req, res, next) => {
    if (!req.admin) {
        res.status(403).json({
            success: false,
            error: 'Admin authentication required',
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.middleware.js.map