// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.PAYPAL_CLIENT_ID = 'mock-client-id'
process.env.PAYPAL_CLIENT_SECRET = 'mock-client-secret'
