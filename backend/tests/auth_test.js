const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runTests() {
  console.log('====================================================');
  console.log(' Starting Module 1: Auth & User Integration Tests');
  console.log('====================================================\n');

  // 1. Connect to DB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[+] Connected to MongoDB:', mongoose.connection.name);
  } catch (err) {
    console.error('[-] MongoDB connection failed. Is MongoDB running?', err.message);
    process.exit(1);
  }

  // Start temporary server instance
  const server = app.listen(TEST_PORT);

  try {
    // Clean up test user if previously created
    await User.deleteMany({ email: 'test_vault_user@example.com' });

    let authToken = null;
    let registeredUserId = null;

    // --- TEST 1: Register a new user ---
    console.log('[1] Testing User Registration (POST /api/auth/register)...');
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Vault User',
        email: 'test_vault_user@example.com',
        password: 'vaultSecretPassword123',
        role: 'ADMIN' // Malicious attempt to escalate role
      })
    });
    const regData = await regRes.json();
    console.log('    Status:', regRes.status);
    console.log('    Response Body:', JSON.stringify(regData, null, 2));

    if (regRes.status !== 201) throw new Error('Registration failed');
    if (!regData.user || !regData.token) throw new Error('Missing user or token in registration response');
    if (regData.user.password || regData.user.passwordHash) throw new Error('Password or hash leaked in response!');
    if (regData.user.role !== 'USER') throw new Error('Role escalation bug: user registered with non-USER role!');
    registeredUserId = regData.user.id;
    console.log('    [PASS] User registered successfully without password exposure & role strictly USER.\n');

    // --- TEST 2 & 3: Check MongoDB directly: user exists & password is encrypted/hashed ---
    console.log('[2 & 3] Checking MongoDB directly for user record & password hashing...');
    const dbUser = await User.findOne({ email: 'test_vault_user@example.com' });
    if (!dbUser) throw new Error('User not found in MongoDB!');
    console.log('    Found User in DB:');
    console.log('      _id          :', dbUser._id.toString());
    console.log('      name         :', dbUser.name);
    console.log('      email        :', dbUser.email);
    console.log('      role         :', dbUser.role);
    console.log('      passwordHash :', dbUser.passwordHash);

    if (!dbUser.passwordHash || !dbUser.passwordHash.startsWith('$2')) {
      throw new Error('Password is NOT properly hashed with bcrypt!');
    }
    if (dbUser.passwordHash === 'vaultSecretPassword123') {
      throw new Error('Plain text password was stored in database!');
    }
    console.log('    [PASS] MongoDB user record confirmed with secure bcrypt hash.\n');

    // --- TEST 4: Login with correct credentials ---
    console.log('[4] Testing Login with Correct Credentials (POST /api/auth/login)...');
    const loginSuccessRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_vault_user@example.com',
        password: 'vaultSecretPassword123'
      })
    });
    const loginSuccessData = await loginSuccessRes.json();
    console.log('    Status:', loginSuccessRes.status);
    console.log('    Response Token received:', Boolean(loginSuccessData.token));
    if (loginSuccessRes.status !== 200 || !loginSuccessData.token) {
      throw new Error('Login failed with correct credentials');
    }
    authToken = loginSuccessData.token;
    console.log('    [PASS] Login succeeded and returned valid JWT.\n');

    // --- TEST 5: Login with incorrect credentials ---
    console.log('[5] Testing Login with Incorrect Credentials (POST /api/auth/login)...');
    const loginFailRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_vault_user@example.com',
        password: 'wrongPassword_456'
      })
    });
    const loginFailData = await loginFailRes.json();
    console.log('    Status:', loginFailRes.status);
    console.log('    Response message:', loginFailData.message);
    if (loginFailRes.status !== 401) {
      throw new Error(`Expected status 401, but got ${loginFailRes.status}`);
    }
    console.log('    [PASS] Incorrect credentials correctly rejected.\n');

    // --- TEST 6: Call GET /api/users/me with JWT ---
    console.log('[6] Testing GET /api/users/me with JWT...');
    const meSuccessRes = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const meSuccessData = await meSuccessRes.json();
    console.log('    Status:', meSuccessRes.status);
    console.log('    Response Body:', JSON.stringify(meSuccessData, null, 2));
    if (meSuccessRes.status !== 200) {
      throw new Error('Failed to get /api/users/me with valid JWT');
    }
    if (meSuccessData.id !== registeredUserId || meSuccessData.email !== 'test_vault_user@example.com') {
      throw new Error('User data mismatch in /api/users/me response');
    }
    console.log('    [PASS] /api/users/me returned expected user payload.\n');

    // --- TEST 7: Call GET /api/users/me without JWT ---
    console.log('[7] Testing GET /api/users/me without JWT...');
    const meNoTokenRes = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'GET'
    });
    const meNoTokenData = await meNoTokenRes.json();
    console.log('    Status:', meNoTokenRes.status);
    console.log('    Response message:', meNoTokenData.message);
    if (meNoTokenRes.status !== 401) {
      throw new Error(`Expected status 401, but got ${meNoTokenRes.status}`);
    }
    console.log('    [PASS] Request without token rejected with 401 Unauthorized.\n');

    // Clean up test user
    await User.deleteMany({ email: 'test_vault_user@example.com' });

    console.log('====================================================');
    console.log(' ALL 7 AUTHENTICATION & USER TESTS PASSED! ');
    console.log('====================================================');
  } catch (err) {
    console.error('\n[-] Test Suite Error:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests();
