"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCount = exports.getAdminById = exports.getUserById = exports.logoutAdmin = exports.logoutUser = exports.loginAdmin = exports.createAdmin = exports.loginUser = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
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
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        if (userId) {
            await prisma_1.default.userToken.create({
                data: { token, expiresAt, user: { connect: { id: userId } } },
            });
        }
        else if (adminId) {
            await prisma_1.default.adminToken.create({
                data: { token, expiresAt, admin: { connect: { id: adminId } } },
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
    var _a;
    const hashedPassword = await hashPassword(userData.password);
    const user = await prisma_1.default.user.create({
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
        user: {
            id: user.id,
            name: (_a = user.name) !== null && _a !== void 0 ? _a : "",
            email: user.email,
            department: user.department,
            year: user.year,
            passoutYear: user.passoutYear,
            roll: user.roll,
            hours: user.hours,
        },
        token,
    };
};
exports.createUser = createUser;
const loginUser = async (credentials) => {
    var _a;
    const user = await prisma_1.default.user.findUnique({
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
        user: {
            id: user.id,
            name: (_a = user.name) !== null && _a !== void 0 ? _a : "",
            email: user.email,
            department: user.department,
            year: user.year,
            passoutYear: user.passoutYear,
            roll: user.roll,
            hours: user.hours,
        },
        token,
    };
};
exports.loginUser = loginUser;
const createAdmin = async (adminData) => {
    const hashedPassword = await hashPassword(adminData.password);
    const admin = await prisma_1.default.admin.create({
        data: {
            ...adminData,
            password: hashedPassword,
        },
    });
    const payload = { id: admin.id, email: admin.email, type: 'admin' };
    const token = generateToken(payload);
    await createTokenWithRetry(token, undefined, admin.id, payload);
    return {
        admin: {
            id: admin.id,
            name: admin.name !== null ? admin.name : "",
            email: admin.email
        },
        token
    };
};
exports.createAdmin = createAdmin;
const loginAdmin = async (credentials) => {
    const admin = await prisma_1.default.admin.findUnique({
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
        admin: {
            id: admin.id,
            name: admin.name !== null ? admin.name : "",
            email: admin.email
        },
        token
    };
};
exports.loginAdmin = loginAdmin;
const logoutUser = async (token) => {
    try {
        await prisma_1.default.userToken.delete({
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
        await prisma_1.default.adminToken.delete({
            where: { token },
        });
    }
    catch (error) {
        throw new Error('Failed to logout admin');
    }
};
exports.logoutAdmin = logoutAdmin;
const getUserById = async (id) => {
    var _a;
    const user = await prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        return null;
    }
    return {
        id: user.id,
        name: (_a = user.name) !== null && _a !== void 0 ? _a : "",
        email: user.email,
        department: user.department,
        year: user.year,
        passoutYear: user.passoutYear,
        roll: user.roll,
        hours: user.hours,
    };
};
exports.getUserById = getUserById;
const getAdminById = async (id) => {
    const admin = await prisma_1.default.admin.findUnique({
        where: { id },
    });
    if (!admin) {
        return null;
    }
    return {
        id: admin.id,
        name: admin.name !== null ? admin.name : "",
        email: admin.email
    };
};
exports.getAdminById = getAdminById;
const getUserCount = async () => {
    const count = await prisma_1.default.user.count();
    return count;
};
exports.getUserCount = getUserCount;
//# sourceMappingURL=auth.service.js.map