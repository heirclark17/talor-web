/**
 * Simple test to verify backend connection
 * Run with: node test-backend-connection.js
 */

const API_BASE_URL = 'https://resume-ai-backend-production-3134.up.railway.app';

async function testBackend() {
  console.log('Testing backend connection...');
  console.log('API Base URL:', API_BASE_URL);
  console.log('');

  // Test 1: Health check
  console.log('Test 1: Health Check');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    const text = await response.text();
    console.log('Response:', text.substring(0, 200));
    console.log('✅ Health check passed\n');
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    console.log('');
  }

  // Test 2: Interview prep list (no auth)
  console.log('Test 2: Interview Prep List (no auth)');
  try {
    const response = await fetch(`${API_BASE_URL}/api/interview-prep/list`);
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    const text = await response.text();
    console.log('Response:', text.substring(0, 300));

    if (response.headers.get('content-type')?.includes('application/json')) {
      console.log('✅ Returns JSON\n');
    } else {
      console.log('❌ Returns HTML instead of JSON\n');
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    console.log('');
  }

  // Test 3: CORS check
  console.log('Test 3: CORS Headers');
  try {
    const response = await fetch(`${API_BASE_URL}/api/interview-prep/list`, {
      method: 'OPTIONS',
    });
    console.log('Status:', response.status);
    console.log('Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Methods:', response.headers.get('access-control-allow-methods'));
    console.log('Access-Control-Allow-Headers:', response.headers.get('access-control-allow-headers'));
    console.log('✅ CORS check complete\n');
  } catch (error) {
    console.log('❌ CORS check failed:', error.message);
    console.log('');
  }

  // Test 4: Upload endpoint
  console.log('Test 4: Upload Resume Endpoint');
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    const text = await response.text();
    console.log('Response:', text.substring(0, 200));
    console.log('');
  } catch (error) {
    console.log('❌ Upload test failed:', error.message);
    console.log('');
  }

  // Test 5: List available endpoints
  console.log('Test 5: Root Endpoint');
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text.substring(0, 300));
    console.log('');
  } catch (error) {
    console.log('❌ Root endpoint failed:', error.message);
    console.log('');
  }

  console.log('=== Test Summary ===');
  console.log('If health check fails: Backend is down');
  console.log('If interview-prep returns HTML: Endpoint missing or crashing');
  console.log('If CORS headers missing: Mobile app will be blocked');
  console.log('Check Railway dashboard for logs: https://railway.app/');
}

testBackend().catch(console.error);
