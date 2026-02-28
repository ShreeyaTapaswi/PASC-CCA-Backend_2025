import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET || 'kjxdxdbajisjoeh2KNKFDBDFDSKD';

async function testAdminEvents() {
    try {
        const token = jwt.sign(
            { id: 1, role: 'admin' },
            SECRET,
            { expiresIn: '1h' }
        );

        console.log("Fetching admin events...");
        const eventsRes = await axios.get('http://localhost:4000/api/events/admin', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("RESPONSE:", JSON.stringify(eventsRes.data, null, 2));

    } catch (e: any) {
        console.error("Error:", e.response?.data || e.message);
    }
}

testAdminEvents();
