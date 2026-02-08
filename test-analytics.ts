import { getAdminAnalytics } from './src/services/analytics.service';

async function test() {
    try {
        console.log('Fetching admin analytics...');
        const result = await getAdminAnalytics();
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error caught in test script:');
        console.error(error);
    } finally {
        process.exit();
    }
}

test();
