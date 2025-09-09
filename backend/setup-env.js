#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

console.log('Setting up environment variables for TrustPayAI Backend...\n');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Please check if GEMINI_API_KEY is set correctly.');
  console.log(`📁 Location: ${envPath}`);
  return;
}

// Read the example file
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ env.example file not found. Please ensure it exists in the project root.');
  return;
}

try {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  
  // Create .env file
  fs.writeFileSync(envPath, envExample);
  
  console.log('✅ .env file created successfully!');
  console.log(`📁 Location: ${envPath}`);
  console.log('\n🔑 IMPORTANT: Please update the following values in your .env file:');
  console.log('   - GEMINI_API_KEY: Set to your actual Gemini API key');
  console.log('   - STRIPE_SECRET_KEY: Set to your Stripe secret key');
  console.log('   - PAYPAL_CLIENT_ID: Set to your PayPal client ID');
  console.log('   - PAYPAL_CLIENT_SECRET: Set to your PayPal client secret');
  console.log('   - JWT_SECRET: Set to a secure random string');
  console.log('   - ENCRYPTION_KEY: Set to a 32-character random string');
  console.log('\n💡 You can get your Gemini API key from: https://makersuite.google.com/app/apikey');
  console.log('\n🚀 After updating the .env file, restart your development server.');
  
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
}
