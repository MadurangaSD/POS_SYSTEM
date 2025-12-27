require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            password: String,
            role: String,
        }));

        const users = await User.find({}).select('+password');
        
        console.log('=== Users in Database ===');
        for (const user of users) {
            console.log(`\nUsername: ${user.username}`);
            console.log(`Role: ${user.role}`);
            console.log(`Password (hashed): ${user.password}`);
            console.log(`Password length: ${user.password.length}`);
            
            // Test password comparison
            const testPassword = user.username === 'admin' ? 'admin123' : 'cashier123';
            const isValid = await bcryptjs.compare(testPassword, user.password);
            console.log(`Testing "${testPassword}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
            
            // Try other common passwords
            const testPasswords = ['admin', 'admin123', 'cashier', 'cashier123', '123456'];
            console.log('Testing other passwords:');
            for (const pwd of testPasswords) {
                const result = await bcryptjs.compare(pwd, user.password);
                if (result) {
                    console.log(`  ✅ "${pwd}" works!`);
                }
            }
        }
        
        console.log('\n=== Total users:', users.length);
        
        await mongoose.disconnect();
        console.log('\n✓ Disconnected');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
