import { getAdminAnalytics } from './src/services/analytics.service';
import { prisma } from './src/lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
    try {
        console.log('Testing getAdminAnalytics...');
        const result = await getAdminAnalytics();
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error in getAdminAnalytics:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
