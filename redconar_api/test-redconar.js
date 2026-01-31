/**
 * Redconar API Test Script
 * Run with: node test-redconar.js
 */

const fetch = require('node-fetch');

const CREDENTIALS = {
  usuario: 'admanastopulos@gmail.com',
  contrasena: 'consorcios.2022'
};

/**
 * Test login and obtain PHPSESSID
 */
async function testLogin() {
  console.log('🔐 Testing login to obtain PHPSESSID...\n');

  const loginUrl = 'https://www.redconar.net/userValidator.php';

  const params = new URLSearchParams({
    usuario: CREDENTIALS.usuario,
    contrasena: CREDENTIALS.contrasena,
    home_: 'https://www.redconar.net/login/ingresar.php?'
  });

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      body: params,
      redirect: 'manual',  // Important: don't follow redirects
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Get all cookies from response
    const setCookieHeader = response.headers.get('set-cookie');
    console.log('📥 Set-Cookie header:');
    console.log(setCookieHeader);

    // Extract PHPSESSID
    const sessionIdMatch = setCookieHeader?.match(/PHPSESSID=([^;]+)/);
    if (sessionIdMatch) {
      const sessionId = sessionIdMatch[1];
      console.log('\n✅ PHPSESSID extracted successfully:');
      console.log(`   ${sessionId}`);

      // Test a second request using the session
      await testWithSession(sessionId);
      return sessionId;
    } else {
      console.log('\n❌ Could not extract PHPSESSID from response');
    }

  } catch (error) {
    console.error('❌ Error during login:', error.message);
  }
}

/**
 * Test a request using the obtained session
 */
async function testWithSession(sessionId) {
  console.log('\n🔍 Testing session with a request...');

  // Example: Test accessing a protected page
  const testUrl = 'https://www.redconar.net/ajax/egresos/recognizingOutflows/formsAssistance.php';

  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Cookie': `PHPSESSID=${sessionId}`
      }
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response preview:', text.substring(0, 200));

  } catch (error) {
    console.error('Error testing session:', error.message);
  }
}

// Run the test
testLogin();
