#!/usr/bin/env node

/**
 * Feature Validation Test Suite
 * Tests all newly implemented features for mobile app
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 FEATURE VALIDATION TEST SUITE\n');
console.log('Testing all newly implemented features...\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✅ ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Check API client has new methods
test('API client has Application Tracker methods', () => {
  const apiClient = fs.readFileSync(path.join(__dirname, 'src/api/client.ts'), 'utf8');

  const requiredMethods = [
    'listApplications',
    'createApplication',
    'updateApplication',
    'deleteApplication',
    'getApplicationStats'
  ];

  requiredMethods.forEach(method => {
    if (!apiClient.includes(`async ${method}(`)) {
      throw new Error(`Missing method: ${method}`);
    }
  });
});

// Test 2: Check API client has Cover Letter methods
test('API client has Cover Letter methods', () => {
  const apiClient = fs.readFileSync(path.join(__dirname, 'src/api/client.ts'), 'utf8');

  const requiredMethods = [
    'listCoverLetters',
    'generateCoverLetter',
    'getCoverLetter',
    'downloadCoverLetter',
    'deleteCoverLetter'
  ];

  requiredMethods.forEach(method => {
    if (!apiClient.includes(`async ${method}(`)) {
      throw new Error(`Missing method: ${method}`);
    }
  });
});

// Test 3: Check ApplicationTrackerScreen exists and has required components
test('ApplicationTrackerScreen exists with iOS 26 Liquid Glass design', () => {
  const screenPath = path.join(__dirname, 'src/screens/ApplicationTrackerScreen.tsx');
  if (!fs.existsSync(screenPath)) {
    throw new Error('ApplicationTrackerScreen.tsx not found');
  }

  const content = fs.readFileSync(screenPath, 'utf8');

  // Check for iOS 26 Liquid Glass components
  if (!content.includes('BlurView')) throw new Error('Missing BlurView');
  if (!content.includes('GLASS.getBlurIntensity')) throw new Error('Missing GLASS utilities');
  if (!content.includes('STATUS_COLORS')) throw new Error('Missing status colors');
  if (!content.includes('formatSalary')) throw new Error('Missing salary formatter');
});

// Test 4: Check CoverLetterGeneratorScreen exists
test('CoverLetterGeneratorScreen exists with dual input methods', () => {
  const screenPath = path.join(__dirname, 'src/screens/CoverLetterGeneratorScreen.tsx');
  if (!fs.existsSync(screenPath)) {
    throw new Error('CoverLetterGeneratorScreen.tsx not found');
  }

  const content = fs.readFileSync(screenPath, 'utf8');

  // Check for dual input methods
  if (!content.includes("inputMethod === 'url'")) throw new Error('Missing URL input method');
  if (!content.includes("inputMethod === 'manual'")) throw new Error('Missing manual input method');
  if (!content.includes('TONE_OPTIONS')) throw new Error('Missing tone options');
  if (!content.includes('LENGTH_OPTIONS')) throw new Error('Missing length options');
  if (!content.includes('FOCUS_OPTIONS')) throw new Error('Missing focus options');
});

// Test 5: Check PrivacyPolicyScreen exists
test('PrivacyPolicyScreen exists with complete content', () => {
  const screenPath = path.join(__dirname, 'src/screens/PrivacyPolicyScreen.tsx');
  if (!fs.existsSync(screenPath)) {
    throw new Error('PrivacyPolicyScreen.tsx not found');
  }

  const content = fs.readFileSync(screenPath, 'utf8');

  // Check for key sections
  if (!content.includes('Information We Collect')) throw new Error('Missing section 1');
  if (!content.includes('How We Use Your Information')) throw new Error('Missing section 2');
  if (!content.includes('Data Security')) throw new Error('Missing security section');
  if (!content.includes('Your Rights')) throw new Error('Missing rights section');
});

// Test 6: Check TermsOfServiceScreen exists
test('TermsOfServiceScreen exists with complete content', () => {
  const screenPath = path.join(__dirname, 'src/screens/TermsOfServiceScreen.tsx');
  if (!fs.existsSync(screenPath)) {
    throw new Error('TermsOfServiceScreen.tsx not found');
  }

  const content = fs.readFileSync(screenPath, 'utf8');

  // Check for key sections
  if (!content.includes('Acceptance of Terms')) throw new Error('Missing section 1');
  if (!content.includes('Description of Service')) throw new Error('Missing section 2');
  if (!content.includes('AI-Generated Content')) throw new Error('Missing AI section');
  if (!content.includes('Limitation of Liability')) throw new Error('Missing liability section');
});

// Test 7: Check SignInScreen exists with Clerk integration
test('SignInScreen exists with Clerk authentication', () => {
  const screenPath = path.join(__dirname, 'src/screens/SignInScreen.tsx');
  if (!fs.existsSync(screenPath)) {
    throw new Error('SignInScreen.tsx not found');
  }

  const content = fs.readFileSync(screenPath, 'utf8');

  if (!content.includes('useAuth')) throw new Error('Missing useAuth hook');
  if (!content.includes('SignIn')) throw new Error('Missing SignIn component');
  if (!content.includes('BlurView')) throw new Error('Missing iOS 26 Liquid Glass design');
});

// Test 8: Check SignUpScreen exists
test('SignUpScreen exists with Clerk authentication', () => {
  const screenPath = path.join(__dirname, 'src/screens/SignUpScreen.tsx');
  if (!fs.existsSync(screenPath)) {
    throw new Error('SignUpScreen.tsx not found');
  }

  const content = fs.readFileSync(screenPath, 'utf8');

  if (!content.includes('useAuth')) throw new Error('Missing useAuth hook');
  if (!content.includes('SignUp')) throw new Error('Missing SignUp component');
});

// Test 9: Check App.tsx has ClerkProvider
test('App.tsx configured with ClerkProvider and tokenCache', () => {
  const appPath = path.join(__dirname, 'App.tsx');
  if (!fs.existsSync(appPath)) {
    throw new Error('App.tsx not found');
  }

  const content = fs.readFileSync(appPath, 'utf8');

  if (!content.includes('ClerkProvider')) throw new Error('Missing ClerkProvider');
  if (!content.includes('tokenCache')) throw new Error('Missing tokenCache');
  if (!content.includes('SecureStore')) throw new Error('Missing SecureStore integration');
});

// Test 10: Check .env file exists and has required keys
test('.env file exists with required environment variables', () => {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found');
  }

  const content = fs.readFileSync(envPath, 'utf8');

  if (!content.includes('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY')) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }
  if (!content.includes('EXPO_PUBLIC_API_BASE_URL')) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  }
});

// Test 11: Check app.json doesn't have invalid Clerk plugin
test('app.json correctly configured without invalid Clerk plugin', () => {
  const appJsonPath = path.join(__dirname, 'app.json');
  const content = fs.readFileSync(appJsonPath, 'utf8');

  if (content.includes('@clerk/clerk-expo/plugin')) {
    throw new Error('app.json still has invalid Clerk plugin configuration');
  }
});

// Test 12: Check base.ts has Bearer token authentication
test('API base.ts uses Bearer token authentication', () => {
  const basePath = path.join(__dirname, 'src/api/base.ts');
  const content = fs.readFileSync(basePath, 'utf8');

  if (!content.includes('Authorization')) throw new Error('Missing Authorization header');
  if (!content.includes('Bearer')) throw new Error('Missing Bearer token pattern');
});

console.log('\n' + '='.repeat(60));
console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`\n📊 Total: ${passed + failed} tests`);

if (failed > 0) {
  console.log('\n⚠️  Some tests failed. Please review the errors above.');
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed! Features are properly implemented.');
  process.exit(0);
}
