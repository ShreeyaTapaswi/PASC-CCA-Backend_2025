import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma } from './src/lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    try {
        const secret = process.env.JWT_SECRET!;
        const payload = { id: 1, email: 'devesh123@gmail.com', type: 'admin' };
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });

        // Ensure token is in DB
        await prisma.adminToken.upsert({
            where: { token: token },
            update: {},
            create: {
                adminId: 1,
                token: token,
                expiresAt: new Date(Date.now() + 3600000)
            }
        });

        console.log('Testing API with token...');
        try {
            const response = await axios.get('http://localhost:4000/api/analytics/admin', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Success:', response.status);
        } catch (error: any) {
            console.log('Error from API:', error.response?.status, error.response?.data);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
