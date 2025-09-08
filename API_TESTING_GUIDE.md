# TrustPay AI API Testing Guide

## 🧪 Testing Overview

This guide provides comprehensive testing instructions for the TrustPay AI API, including manual testing, automated testing, and integration testing scenarios.

## 📋 Prerequisites

- API endpoint URL (production or development)
- Test payment tokens (Stripe test tokens)
- API testing tool (Postman, curl, or similar)

## 🔧 Test Environment Setup

### 1. Environment Variables

Set up your test environment with the following variables:

```bash
# Production
API_BASE_URL=https://your-backend-app.vercel.app

# Development
API_BASE_URL=http://localhost:3001
```

### 2. Test Data

#### Valid Test Cards (Stripe)
| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| `4242424242424242` | Visa (successful) | Success |
| `4000000000000002` | Visa (declined) | Failed |
| `4000000000009995` | Visa (insufficient funds) | Failed |

#### Test Email Addresses
- `customer@example.com` - Low risk
- `suspicious@example.com` - High risk
- `test@trustpayai.com` - Medium risk

## 🚀 Manual Testing

### 1. Health Check

**Test**: Verify API is running
```bash
curl -X GET "https://your-backend-app.vercel.app/api/health"
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "openai": "connected",
    "stripe": "connected",
    "paypal": "connected"
  }
}
```

### 2. Payment Processing Tests

#### Test Case 1: Successful Payment (Low Risk)
```bash
curl -X POST "https://your-backend-app.vercel.app/api/charge" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "currency": "USD",
    "source": "tok_test_visa",
    "email": "customer@example.com"
  }'
```

**Expected Response**:
```json
{
  "transactionId": "txn_1705312200000_abc123def",
  "provider": "stripe",
  "status": "success",
  "riskScore": 15.5,
  "explanation": "Low risk transaction approved..."
}
```

#### Test Case 2: High Risk Payment (Blocked)
```bash
curl -X POST "https://your-backend-app.vercel.app/api/charge" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000000,
    "currency": "USD",
    "source": "tok_test_visa",
    "email": "suspicious@example.com"
  }'
```

**Expected Response**:
```json
{
  "transactionId": "txn_1705312200000_xyz789",
  "provider": "none",
  "status": "blocked",
  "riskScore": 85.2,
  "explanation": "High risk transaction blocked due to suspicious patterns..."
}
```

#### Test Case 3: Invalid Data Validation
```bash
curl -X POST "https://your-backend-app.vercel.app/api/charge" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -100,
    "currency": "INVALID",
    "source": "",
    "email": "invalid-email"
  }'
```

**Expected Response**:
```json
{
  "error": "Invalid request data",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be at least 1 cent"
    },
    {
      "field": "currency",
      "message": "Currency must be uppercase letters"
    },
    {
      "field": "source",
      "message": "Source is required"
    },
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 3. Transaction Retrieval Tests

#### Test Case 1: Get All Transactions
```bash
curl -X GET "https://your-backend-app.vercel.app/api/transactions"
```

#### Test Case 2: Filtered Transactions
```bash
curl -X GET "https://your-backend-app.vercel.app/api/transactions?limit=10&status=success&provider=stripe"
```

#### Test Case 3: Get Transaction by ID
```bash
curl -X GET "https://your-backend-app.vercel.app/api/transactions/txn_1705312200000_abc123def"
```

## 🤖 Automated Testing

### 1. Postman Collection

Import the provided `TrustPay-API.postman_collection.json` into Postman:

1. Open Postman
2. Click "Import"
3. Select the collection file
4. Set the `baseUrl` variable to your API endpoint
5. Run the collection

### 2. Newman (Command Line)

```bash
# Install Newman
npm install -g newman

# Run the collection
newman run TrustPay-API.postman_collection.json \
  --environment production.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export report.html
```

### 3. Jest/JavaScript Testing

```javascript
const axios = require('axios');

describe('TrustPay API', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3001';
  
  test('Health check should return 200', async () => {
    const response = await axios.get(`${baseURL}/api/health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('healthy');
  });
  
  test('Payment processing should work', async () => {
    const paymentData = {
      amount: 2500,
      currency: 'USD',
      source: 'tok_test_visa',
      email: 'customer@example.com'
    };
    
    const response = await axios.post(`${baseURL}/api/charge`, paymentData);
    expect(response.status).toBe(200);
    expect(response.data.transactionId).toBeDefined();
    expect(response.data.status).toBe('success');
  });
  
  test('Invalid payment should return 400', async () => {
    const invalidData = {
      amount: -100,
      currency: 'INVALID',
      source: '',
      email: 'invalid-email'
    };
    
    try {
      await axios.post(`${baseURL}/api/charge`, invalidData);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});
```

## 🔄 Integration Testing

### 1. End-to-End Payment Flow

```bash
#!/bin/bash
# Complete payment flow test

API_URL="https://your-backend-app.vercel.app"

echo "1. Testing health check..."
curl -s "$API_URL/api/health" | jq '.status'

echo "2. Processing payment..."
RESPONSE=$(curl -s -X POST "$API_URL/api/charge" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "currency": "USD",
    "source": "tok_test_visa",
    "email": "customer@example.com"
  }')

TRANSACTION_ID=$(echo $RESPONSE | jq -r '.transactionId')
echo "Transaction ID: $TRANSACTION_ID"

echo "3. Retrieving transaction..."
curl -s "$API_URL/api/transactions/$TRANSACTION_ID" | jq '.status'

echo "4. Getting transaction history..."
curl -s "$API_URL/api/transactions?limit=5" | jq '.transactions | length'
```

### 2. Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test health endpoint
ab -n 1000 -c 10 "https://your-backend-app.vercel.app/api/health"

# Test payment endpoint (be careful with rate limits)
ab -n 100 -c 5 -p payment.json -T "application/json" "https://your-backend-app.vercel.app/api/charge"
```

## 📊 Performance Testing

### 1. Response Time Benchmarks

| Endpoint | Expected Response Time | Max Acceptable |
|----------|----------------------|----------------|
| `/api/health` | < 100ms | < 500ms |
| `/api/charge` | < 2s | < 5s |
| `/api/transactions` | < 500ms | < 2s |

### 2. Load Testing Scenarios

```javascript
// Artillery.js load testing
module.exports = {
  config: {
    target: 'https://your-backend-app.vercel.app',
    phases: [
      { duration: '2m', arrivalRate: 10 },
      { duration: '5m', arrivalRate: 20 },
      { duration: '2m', arrivalRate: 10 }
    ]
  },
  scenarios: [
    {
      name: 'Health Check',
      weight: 50,
      flow: [
        { get: { url: '/api/health' } }
      ]
    },
    {
      name: 'Payment Processing',
      weight: 30,
      flow: [
        {
          post: {
            url: '/api/charge',
            json: {
              amount: 2500,
              currency: 'USD',
              source: 'tok_test_visa',
              email: 'customer@example.com'
            }
          }
        }
      ]
    },
    {
      name: 'Get Transactions',
      weight: 20,
      flow: [
        { get: { url: '/api/transactions?limit=10' } }
      ]
    }
  ]
};
```

## 🐛 Error Testing

### 1. Network Error Simulation

```bash
# Test with invalid endpoint
curl -X GET "https://your-backend-app.vercel.app/api/invalid"

# Test with malformed JSON
curl -X POST "https://your-backend-app.vercel.app/api/charge" \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'
```

### 2. Rate Limiting Tests

```bash
# Test rate limits by making rapid requests
for i in {1..20}; do
  curl -X POST "https://your-backend-app.vercel.app/api/charge" \
    -H "Content-Type: application/json" \
    -d '{"amount": 1000, "currency": "USD", "source": "tok_test_visa", "email": "test@example.com"}' &
done
wait
```

## 📈 Monitoring and Alerting

### 1. Health Check Monitoring

```bash
#!/bin/bash
# Health check script for monitoring

API_URL="https://your-backend-app.vercel.app"
LOG_FILE="/var/log/trustpay-health.log"

response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health")

if [ "$response" != "200" ]; then
  echo "$(date): Health check failed with status $response" >> $LOG_FILE
  # Send alert (email, Slack, etc.)
fi
```

### 2. Performance Monitoring

```javascript
// Performance monitoring script
const axios = require('axios');

async function monitorPerformance() {
  const start = Date.now();
  
  try {
    const response = await axios.get('https://your-backend-app.vercel.app/api/health');
    const duration = Date.now() - start;
    
    console.log(`Response time: ${duration}ms`);
    
    if (duration > 1000) {
      console.warn('Slow response detected!');
    }
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

// Run every minute
setInterval(monitorPerformance, 60000);
```

## 🎯 Test Scenarios Checklist

### Functional Testing
- [ ] Health check returns 200
- [ ] Payment processing works with valid data
- [ ] High-risk payments are blocked
- [ ] Invalid data returns 400 errors
- [ ] Transaction retrieval works
- [ ] Filtering and pagination work
- [ ] Error responses are properly formatted

### Performance Testing
- [ ] Response times meet benchmarks
- [ ] API handles expected load
- [ ] No memory leaks under load
- [ ] Database queries are optimized

### Security Testing
- [ ] Input validation works
- [ ] No sensitive data in responses
- [ ] Rate limiting is enforced
- [ ] CORS is properly configured

### Integration Testing
- [ ] Stripe integration works
- [ ] PayPal integration works
- [ ] OpenAI integration works
- [ ] Database operations work
- [ ] Event system works

## 📝 Test Report Template

```markdown
# TrustPay AI API Test Report

## Test Summary
- **Date**: 2024-01-15
- **Environment**: Production
- **Total Tests**: 25
- **Passed**: 23
- **Failed**: 2
- **Success Rate**: 92%

## Failed Tests
1. High-risk payment blocking (expected behavior change)
2. Rate limiting edge case

## Performance Results
- Average response time: 450ms
- 95th percentile: 1.2s
- Error rate: 0.1%

## Recommendations
- Monitor rate limiting behavior
- Optimize database queries
- Add more comprehensive error logging
```

## 🚀 Continuous Testing

Set up automated testing in your CI/CD pipeline:

```yaml
# .github/workflows/api-test.yml
name: API Tests
on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run API tests
        run: npm run test:api
        env:
          API_BASE_URL: ${{ secrets.API_BASE_URL }}
```

This comprehensive testing guide ensures your TrustPay AI API is robust, performant, and reliable! 🎉
