import axios from 'axios';

async function testAdminEvents() {
    try {
        console.log("Registering admin...");
        const registerData = {
            name: "Test Admin",
            email: "testadmin@examplae.com",
            password: "password123",
            role: "admin",
            registrationKey: "ADMIN_REG_2025" // Assuming this is needed. If it fails, we'll see why
        };

        // Try to register first. If it fails due to already existing, that's fine.
        let token = null;
        try {
            const regRes = await axios.post('http://localhost:4000/api/auth/admin/register', registerData);
            token = regRes.data.token;
            console.log("Registered successfully.");
        } catch (e: any) {
            console.log("Register failed, trying to login. Reason:", e.response?.data || e.message);
            const loginRes = await axios.post('http://localhost:4000/api/auth/admin/login', {
                email: "testadmin@examplae.com",
                password: "password123"
            });
            token = loginRes.data.token;
            console.log("Logged in successfully.");
        }

        console.log("Fetching admin events...");
        const eventsRes = await axios.get('http://localhost:4000/api/events/admin', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log(JSON.stringify(eventsRes.data, null, 2));

    } catch (e: any) {
        console.error("Error fetching admin events:", e.response?.data || e.message);
    }
}

testAdminEvents();
