const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login with admin/admin...');
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin'
        });
        console.log('✅ Login SUCCESS!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        if (error.response) {
            console.log('❌ Login FAILED');
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ Cannot connect to server at http://localhost:3001');
            console.log('Make sure the backend server is running with: npm run dev');
        } else {
            console.log('❌ Error:', error.message);
        }
        return false;
    }
}

testLogin().then(() => process.exit(0));
