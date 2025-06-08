"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminById = exports.getUserById = exports.logoutAdmin = exports.logoutUser = exports.loginAdmin = exports.createAdmin = exports.loginUser = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
};
const comparePasswords = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};
const createTokenWithRetry = async (token, userId, adminId, payload) => {
    try {
        if (userId) {
            await prisma.userToken.create({
                data: { token, userId },
            });
        }
        else if (adminId) {
            await prisma.adminToken.create({
                data: { token, adminId },
            });
        }
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint') && payload) {
            const newToken = generateToken(payload);
            await createTokenWithRetry(newToken, userId, adminId, payload);
        }
        else {
            throw error;
        }
    }
};
const createUser = async (userData) => {
    const hashedPassword = await hashPassword(userData.password);
    const user = await prisma.user.create({
        data: {
            ...userData,
            password: hashedPassword,
            hours: 0,
        },
    });
    const payload = { id: user.id, email: user.email, type: 'user' };
    const token = generateToken(payload);
    await createTokenWithRetry(token, user.id, undefined, payload);
    return {
        user,
        token,
    };
};
exports.createUser = createUser;
const loginUser = async (credentials) => {
    const user = await prisma.user.findUnique({
        where: { email: credentials.email },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = await comparePasswords(credentials.password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    const payload = { id: user.id, email: user.email, type: 'user' };
    const token = generateToken(payload);
    await createTokenWithRetry(token, user.id, undefined, payload);
    return {
        user,
        token,
    };
};
exports.loginUser = loginUser;
const createAdmin = async (adminData) => {
    const hashedPassword = await hashPassword(adminData.password);
    const admin = await prisma.admin.create({
        data: {
            ...adminData,
            password: hashedPassword,
        },
    });
    const payload = { id: admin.id, email: admin.email, type: 'admin' };
    const token = generateToken(payload);
    await createTokenWithRetry(token, undefined, admin.id, payload);
    return {
        admin,
        token,
    };
};
exports.createAdmin = createAdmin;
const loginAdmin = async (credentials) => {
    const admin = await prisma.admin.findUnique({
        where: { email: credentials.email },
    });
    if (!admin) {
        throw new Error('Admin not found');
    }
    const isPasswordValid = await comparePasswords(credentials.password, admin.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    const payload = { id: admin.id, email: admin.email, type: 'admin' };
    const token = generateToken(payload);
    await createTokenWithRetry(token, undefined, admin.id, payload);
    return {
        admin,
        token,
    };
};
exports.loginAdmin = loginAdmin;
const logoutUser = async (token) => {
    try {
        await prisma.userToken.delete({
            where: { token },
        });
    }
    catch (error) {
        throw new Error('Failed to logout user');
    }
};
exports.logoutUser = logoutUser;
const logoutAdmin = async (token) => {
    try {
        await prisma.adminToken.delete({
            where: { token },
        });
    }
    catch (error) {
        throw new Error('Failed to logout admin');
    }
};
exports.logoutAdmin = logoutAdmin;
const getUserById = async (id) => {
    return prisma.user.findUnique({
        where: { id },
    });
};
exports.getUserById = getUserById;
const getAdminById = async (id) => {
    return prisma.admin.findUnique({
        where: { id },
    });
};
exports.getAdminById = getAdminById;
//# sourceMappingURL=auth.service.js.map