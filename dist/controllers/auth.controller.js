"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAdmin = exports.getCurrentUser = exports.logoutAdminController = exports.loginAdminController = exports.registerAdmin = exports.logoutUserController = exports.loginUserController = exports.registerUser = void 0;
const auth_service_1 = require("../services/auth.service");
const registerUser = async (req, res) => {
    try {
        const userData = req.body;
        const result = await (0, auth_service_1.createUser)(userData);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Registration failed',
        });
    }
};
exports.registerUser = registerUser;
const loginUserController = async (req, res) => {
    try {
        const credentials = req.body;
        const result = await (0, auth_service_1.loginUser)(credentials);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error instanceof Error ? error.message : 'Login failed',
        });
    }
};
exports.loginUserController = loginUserController;
const logoutUserController = async (req, res) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            throw new Error('No token provided');
        }
        await (0, auth_service_1.logoutUser)(token);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Logout failed',
        });
    }
};
exports.logoutUserController = logoutUserController;
const registerAdmin = async (req, res) => {
    try {
        const adminData = req.body;
        const result = await (0, auth_service_1.createAdmin)(adminData);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Admin registration failed',
        });
    }
};
exports.registerAdmin = registerAdmin;
const loginAdminController = async (req, res) => {
    try {
        const credentials = req.body;
        const result = await (0, auth_service_1.loginAdmin)(credentials);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error instanceof Error ? error.message : 'Admin login failed',
        });
    }
};
exports.loginAdminController = loginAdminController;
const logoutAdminController = async (req, res) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            throw new Error('No token provided');
        }
        await (0, auth_service_1.logoutAdmin)(token);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Logout failed',
        });
    }
};
exports.logoutAdminController = logoutAdminController;
const getCurrentUser = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const user = await (0, auth_service_1.getUserById)(userId);
        if (!user) {
            throw new Error('User not found');
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
        });
    }
};
exports.getCurrentUser = getCurrentUser;
const getCurrentAdmin = async (req, res) => {
    var _a;
    try {
        const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
        if (!adminId) {
            throw new Error('Admin not authenticated');
        }
        const admin = await (0, auth_service_1.getAdminById)(adminId);
        if (!admin) {
            throw new Error('Admin not found');
        }
        res.status(200).json({
            success: true,
            data: admin,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
        });
    }
};
exports.getCurrentAdmin = getCurrentAdmin;
//# sourceMappingURL=auth.controller.js.map