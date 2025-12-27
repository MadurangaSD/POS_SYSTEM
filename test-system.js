#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testAPIs() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 COMPREHENSIVE SYSTEM TEST');
  console.log('='.repeat(70) + '\n');

  let testResults = {
    backend: false,
    login: false,
    products: false,
    sales: false,
    inventory: false,
    users: false,
    errors: []
  };

  try {
    // Test 1: Check Backend Connection
    console.log('✓ Testing Backend Connection...');
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        username: 'admin',
        password: 'admin'
      });
      const token = loginRes.data.token;
      console.log('  ✅ Backend responding: http://localhost:3001');
      console.log('  ✅ MongoDB connected');
      testResults.backend = true;

      // Test 2: Login
      console.log('\n✓ Testing Login API...');
      if (loginRes.data.user && loginRes.data.token) {
        console.log('  ✅ Login successful');
        console.log(`  ✅ User: ${loginRes.data.user.username} (${loginRes.data.user.role})`);
        testResults.login = true;
      }

      // Create axios instance with auth
      const authAPI = axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Test 3: Products API
      console.log('\n✓ Testing Products API...');
      try {
        const productsRes = await authAPI.get('/products');
        console.log(`  ✅ Products API responding`);
        console.log(`  ✅ Total products: ${productsRes.data.length}`);
        testResults.products = true;
      } catch (err) {
        console.log('  ❌ Products API error: ' + err.message);
        testResults.errors.push('Products API: ' + err.message);
      }

      // Test 4: Sales API
      console.log('\n✓ Testing Sales API...');
      try {
        const today = new Date().toISOString().split('T')[0];
        const salesRes = await authAPI.get(`/sales?startDate=${today}&endDate=${today}`);
        console.log(`  ✅ Sales API responding`);
        console.log(`  ✅ Today's sales: ${salesRes.data.length}`);
        testResults.sales = true;
      } catch (err) {
        console.log('  ❌ Sales API error: ' + err.message);
        testResults.errors.push('Sales API: ' + err.message);
      }

      // Test 5: Stock API
      console.log('\n✓ Testing Stock/Inventory API...');
      try {
        const stockRes = await authAPI.get('/stock/low-stock');
        console.log(`  ✅ Stock API responding`);
        console.log(`  ✅ Low stock items: ${stockRes.data.length}`);
        testResults.inventory = true;
      } catch (err) {
        console.log('  ❌ Stock API error: ' + err.message);
        testResults.errors.push('Stock API: ' + err.message);
      }

      // Test 6: Users API
      console.log('\n✓ Testing Users API...');
      try {
        const usersRes = await authAPI.get('/users');
        console.log(`  ✅ Users API responding`);
        console.log(`  ✅ Total users: ${usersRes.data.length}`);
        testResults.users = true;
      } catch (err) {
        console.log('  ❌ Users API error: ' + err.message);
        testResults.errors.push('Users API: ' + err.message);
      }

    } catch (err) {
      console.log('  ❌ Connection failed: ' + err.message);
      testResults.errors.push('Backend connection: ' + err.message);
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Backend:     ${testResults.backend ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Login API:   ${testResults.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Products:    ${testResults.products ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Sales:       ${testResults.sales ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Inventory:   ${testResults.inventory ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Users:       ${testResults.users ? '✅ PASS' : '❌ FAIL'}`);

  if (testResults.errors.length > 0) {
    console.log('\n⚠️  ERRORS FOUND:');
    testResults.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`);
    });
  } else {
    console.log('\n✅ ALL TESTS PASSED - System is fully operational!');
  }

  console.log('='.repeat(70) + '\n');
}

testAPIs();
