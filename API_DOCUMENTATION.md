# TrustPay AI API Documentation

## Overview

TrustPay AI is a payment gateway proxy with LLM-powered risk assessment. This API provides secure payment processing with intelligent risk evaluation and detailed transaction explanations.

## Base URL

- **Production**: `https://your-backend-app.vercel.app`
- **Development**: `http://localhost:3001`

## Authentication

Currently, the API does not require authentication. In production, consider implementing API keys or JWT tokens.

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Payment endpoints**: 10 requests per minute per IP

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Endpoints

### 1. Health Check

Check if the API is running and healthy.

**Endpoint**: `GET /api/health`

**Response**:
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

**Status Codes**:
- `200` - Service is healthy
- `503` - Service is unhealthy

---

### 2. Process Payment

Process a payment with risk assessment and LLM-powered explanation.

**Endpoint**: `POST /api/charge`

**Request Body**:
```json
{
  "amount": 2500,
  "currency": "USD",
  "source": "tok_test_visa",
  "email": "customer@example.com"
}
```

**Request Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `amount` | number | Yes | Amount in cents (e.g., 2500 = $25.00) | `2500` |
| `currency` | string | Yes | Currency code (uppercase) | `"USD"` |
| `source` | string | Yes | Payment source (token, card number, etc.) | `"tok_test_visa"` |
| `email` | string | Yes | Customer email address | `"customer@example.com"` |

**Response**:
```json
{
  "transactionId": "txn_1705312200000_abc123def",
  "provider": "stripe",
  "status": "success",
  "riskScore": 15.5,
  "explanation": "Low risk transaction approved. Customer has a clean payment history and the amount is within normal limits for this type of transaction."
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `transactionId` | string | Unique transaction identifier |
| `provider` | string | Payment provider used (`stripe`, `paypal`, or `none`) |
| `status` | string | Transaction status (`success`, `failed`, `blocked`) |
| `riskScore` | number | Risk score (0-100, lower is safer) |
| `explanation` | string | LLM-generated explanation of the decision |

**Status Codes**:
- `200` - Payment processed successfully
- `400` - Invalid request data
- `500` - Internal server error

**Example cURL**:
```bash
curl -X POST https://your-backend-app.vercel.app/api/charge \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "currency": "USD",
    "source": "tok_test_visa",
    "email": "customer@example.com"
  }'
```

---

### 3. Get Transactions

Retrieve transaction history with filtering and pagination.

**Endpoint**: `GET /api/transactions`

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 50 | Number of transactions to return (1-100) |
| `offset` | number | No | 0 | Number of transactions to skip |
| `status` | string | No | - | Filter by status (`success`, `failed`, `blocked`) |
| `provider` | string | No | - | Filter by provider (`stripe`, `paypal`, `none`) |

**Response**:
```json
{
  "transactions": [
    {
      "id": "txn_1705312200000_abc123def",
      "amount": 2500,
      "currency": "USD",
      "source": "tok_test_visa",
      "email": "customer@example.com",
      "provider": "stripe",
      "status": "success",
      "riskScore": 15.5,
      "explanation": "Low risk transaction approved...",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  },
  "stats": {
    "total": 150,
    "success": 120,
    "failed": 20,
    "blocked": 10,
    "byProvider": {
      "stripe": 100,
      "paypal": 40,
      "none": 10
    }
  }
}
```

**Status Codes**:
- `200` - Transactions retrieved successfully
- `400` - Invalid query parameters
- `500` - Internal server error

**Example cURL**:
```bash
curl "https://your-backend-app.vercel.app/api/transactions?limit=10&status=success"
```

---

### 4. Get Transaction by ID

Retrieve a specific transaction by its ID.

**Endpoint**: `GET /api/transactions/{id}`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Transaction ID |

**Response**:
```json
{
  "id": "txn_1705312200000_abc123def",
  "amount": 2500,
  "currency": "USD",
  "source": "tok_test_visa",
  "email": "customer@example.com",
  "provider": "stripe",
  "status": "success",
  "riskScore": 15.5,
  "explanation": "Low risk transaction approved...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "metadata": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "riskFactors": ["low_amount", "known_customer"]
  }
}
```

**Status Codes**:
- `200` - Transaction found
- `404` - Transaction not found
- `500` - Internal server error

**Example cURL**:
```bash
curl "https://your-backend-app.vercel.app/api/transactions/txn_1705312200000_abc123def"
```

---

## Risk Assessment

### Risk Score Ranges

| Score Range | Risk Level | Action |
|-------------|------------|--------|
| 0-25 | Low | Approve |
| 26-50 | Medium | Approve with monitoring |
| 51-75 | High | Manual review recommended |
| 76-100 | Very High | Block |

### Risk Factors

The system evaluates transactions based on:

- **Amount**: Unusually high or low amounts
- **Frequency**: Multiple transactions from same source
- **Email**: Known fraudulent email patterns
- **Source**: Payment method reputation
- **Time**: Unusual transaction times
- **Geographic**: Location-based risk

## Payment Providers

### Stripe
- **Supported**: Credit cards, debit cards
- **Test Mode**: Use `tok_test_*` tokens
- **Production**: Requires valid Stripe keys

### PayPal
- **Supported**: PayPal accounts, credit cards
- **Test Mode**: Use sandbox credentials
- **Production**: Requires live PayPal credentials

## Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `INVALID_AMOUNT` | Amount must be between 1 and 10000000 cents | Check amount value |
| `INVALID_CURRENCY` | Currency must be 3 uppercase letters | Use valid currency codes |
| `INVALID_EMAIL` | Email format is invalid | Provide valid email address |
| `MISSING_SOURCE` | Payment source is required | Provide payment source |
| `PAYMENT_FAILED` | Payment processing failed | Check payment source validity |
| `RISK_BLOCKED` | Transaction blocked due to high risk | Contact support for review |

## Webhooks

### Transaction Events

The system emits events for transaction lifecycle:

- `charge.requested` - Payment request received
- `risk.evaluated` - Risk assessment completed
- `payment.processed` - Payment processing completed
- `transaction.logged` - Transaction saved to database

### Webhook Payload Example

```json
{
  "type": "charge.requested",
  "data": {
    "transactionId": "txn_1705312200000_abc123def",
    "amount": 2500,
    "currency": "USD",
    "email": "customer@example.com"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "id": "evt_123456789"
}
```

## SDKs and Libraries

### JavaScript/Node.js

```javascript
const TrustPayAPI = {
  baseURL: 'https://your-backend-app.vercel.app',
  
  async processPayment(paymentData) {
    const response = await fetch(`${this.baseURL}/api/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });
    return response.json();
  },
  
  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/transactions?${queryString}`);
    return response.json();
  }
};

// Usage
const result = await TrustPayAPI.processPayment({
  amount: 2500,
  currency: 'USD',
  source: 'tok_test_visa',
  email: 'customer@example.com'
});
```

### Python

```python
import requests

class TrustPayAPI:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def process_payment(self, amount, currency, source, email):
        response = requests.post(
            f"{self.base_url}/api/charge",
            json={
                "amount": amount,
                "currency": currency,
                "source": source,
                "email": email
            }
        )
        return response.json()
    
    def get_transactions(self, **params):
        response = requests.get(
            f"{self.base_url}/api/transactions",
            params=params
        )
        return response.json()

# Usage
api = TrustPayAPI("https://your-backend-app.vercel.app")
result = api.process_payment(2500, "USD", "tok_test_visa", "customer@example.com")
```

## Testing

### Test Cards (Stripe)

| Card Number | Description |
|-------------|-------------|
| `4242424242424242` | Visa (successful) |
| `4000000000000002` | Visa (declined) |
| `4000000000009995` | Visa (insufficient funds) |

### Test Environment

- **Stripe**: Use test keys with `sk_test_` prefix
- **PayPal**: Use sandbox credentials
- **OpenAI**: Use test API key

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/health` | 1000/min | 1 minute |
| `/api/charge` | 10/min | 1 minute |
| `/api/transactions` | 100/min | 1 minute |

## Support

- **Documentation**: [API Documentation](./API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@trustpayai.com

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Payment processing with risk assessment
- Transaction history and filtering
- LLM-powered explanations
