import jwt from 'jsonwebtoken';
import { prisma } from './src/lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    try {
        const secret = process.env.JWT_SECRET!;
        const payload = { id: 1, email: 'devesh123@gmail.com', type: 'admin' };
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });

        await prisma.adminToken.create({
            data: {
                adminId: 1,
                token: token,
                expiresAt: new Date(Date.now() + 3600000)
            }
        });

        console.log('TOKEN:' + token);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
