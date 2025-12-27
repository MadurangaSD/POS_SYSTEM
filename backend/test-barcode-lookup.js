// Test Barcode Lookup API
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test barcodes
const testBarcodes = [
  { code: '4900590001807', name: 'Coca Cola' },
  { code: '8718215168876', name: 'Milk Product' },
  { code: '3017620422003', name: 'Nutella' },
  { code: '5000159407236', name: 'Cadbury Dairy Milk' },
  { code: '0012345678905', name: 'General Product' },
  { code: 'invalid', name: 'Invalid Barcode' },
];

async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin'
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    process.exit(1);
  }
}

async function testBarcodeLookup(token, barcode, expectedName) {
  try {
    console.log(`\n🔍 Testing: ${barcode} (${expectedName})`);
    
    const response = await axios.get(
      `${API_BASE}/products/lookup/${barcode}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.found) {
      console.log(`✅ Found via ${response.data.product.source}`);
      console.log(`   Name: ${response.data.product.name}`);
      console.log(`   Brand: ${response.data.product.brand}`);
      console.log(`   Category: ${response.data.product.category}`);
      if (response.data.existsInDatabase) {
        console.log(`   ℹ️  Already in your database`);
      }
    } else {
      console.log('❌ Not found');
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  Not found in any database');
    } else if (error.response?.status === 400) {
      console.log('❌ Invalid barcode format');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Barcode Lookup Tests\n');
  console.log('Testing with Open Food Facts and UPCitemdb APIs...\n');

  // Login
  console.log('🔐 Logging in...');
  const token = await login();
  console.log('✅ Logged in successfully\n');

  // Test each barcode
  for (const test of testBarcodes) {
    await testBarcodeLookup(token, test.code, test.name);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between requests
  }

  console.log('\n✅ All tests completed!\n');
  console.log('📝 Notes:');
  console.log('   - Some barcodes may not be found (especially invalid ones)');
  console.log('   - Free tier: 100 requests/day from UPCitemdb');
  console.log('   - Open Food Facts: Unlimited (for food products)');
  console.log('\n💡 Try scanning real product barcodes from your inventory!');
}

// Run tests
runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
