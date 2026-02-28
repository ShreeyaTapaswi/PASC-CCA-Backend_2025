import { getEventsAdmin } from './src/services/event.service';
import { prisma } from './src/lib/prisma';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const result = await getEventsAdmin();
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Test script caught error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
