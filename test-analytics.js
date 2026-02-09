const axios = require('axios');

// Test analytics API endpoints
async function testAnalyticsAPI() {
    const baseURL = 'http://localhost:3001/api';

    // You need to replace this with a real admin token
    // Get it from localStorage in the browser after logging in as admin
    const adminToken = process.argv[2] || 'YOUR_ADMIN_TOKEN_HERE';

    console.log('=== Testing Analytics API ===\n');

    try {
        // Test 1: Admin Analytics
        console.log('1. Testing GET /api/analytics/admin');
        const adminAnalytics = await axios.get(`${baseURL}/analytics/admin`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log('✅ Success!');
        console.log('Response:', JSON.stringify(adminAnalytics.data, null, 2));
        console.log('\n');

        // Test 2: Event Analytics (use a real event ID)
        const eventId = process.argv[3] || '1';
        console.log(`2. Testing GET /api/analytics/event/${eventId}`);
        const eventAnalytics = await axios.get(`${baseURL}/analytics/event/${eventId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log('✅ Success!');
        console.log('Response:', JSON.stringify(eventAnalytics.data, null, 2));
        console.log('\n');

        // Test 3: Event Reviews
        console.log(`3. Testing GET /api/reviews/event/${eventId}`);
        const reviews = await axios.get(`${baseURL}/reviews/event/${eventId}`);
        console.log('✅ Success!');
        console.log('Response:', JSON.stringify(reviews.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
    }
}

testAnalyticsAPI();
