# TrustPay AI API - Quick Reference

## 🚀 Base URL
```
Production: https://your-backend-app.vercel.app
Development: http://localhost:3001
```

## 📋 Endpoints

### Health Check
```bash
GET /api/health
```

### Process Payment
```bash
POST /api/charge
Content-Type: application/json

{
  "amount": 2500,
  "currency": "USD", 
  "source": "tok_test_visa",
  "email": "customer@example.com"
}
```

### Get Transactions
```bash
GET /api/transactions?limit=10&status=success&provider=stripe
```

### Get Transaction by ID
```bash
GET /api/transactions/{id}
```

## 🧪 Test Data

### Stripe Test Cards
| Card | Result |
|------|--------|
| `4242424242424242` | ✅ Success |
| `4000000000000002` | ❌ Declined |
| `4000000000009995` | ❌ Insufficient funds |

### Test Emails
- `customer@example.com` - Low risk
- `suspicious@example.com` - High risk

## 📊 Response Examples

### Successful Payment
```json
{
  "transactionId": "txn_1705312200000_abc123def",
  "provider": "stripe",
  "status": "success",
  "riskScore": 15.5,
  "explanation": "Low risk transaction approved..."
}
```

### Blocked Payment
```json
{
  "transactionId": "txn_1705312200000_xyz789",
  "provider": "none", 
  "status": "blocked",
  "riskScore": 85.2,
  "explanation": "High risk transaction blocked..."
}
```

### Error Response
```json
{
  "error": "Invalid request data",
  "details": "Amount must be between 1 and 10000000 cents"
}
```

## 🔧 cURL Examples

### Health Check
```bash
curl -X GET "https://your-backend-app.vercel.app/api/health"
```

### Process Payment
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

### Get Transactions
```bash
curl "https://your-backend-app.vercel.app/api/transactions?limit=10"
```

## 📈 Risk Score Ranges

| Score | Risk Level | Action |
|-------|------------|--------|
| 0-25 | Low | ✅ Approve |
| 26-50 | Medium | ✅ Approve |
| 51-75 | High | ⚠️ Review |
| 76-100 | Very High | ❌ Block |

## 🚦 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

## 🔄 Status Values

| Status | Description |
|--------|-------------|
| `success` | Payment completed successfully |
| `failed` | Payment failed (declined, insufficient funds, etc.) |
| `blocked` | Payment blocked due to high risk |

## 🏦 Provider Values

| Provider | Description |
|----------|-------------|
| `stripe` | Processed via Stripe |
| `paypal` | Processed via PayPal |
| `none` | No provider (blocked transaction) |

## 📝 Validation Rules

### Amount
- Type: `integer`
- Range: 1 - 10,000,000 cents
- Example: 2500 = $25.00

### Currency
- Type: `string`
- Format: 3 uppercase letters
- Examples: `USD`, `EUR`, `GBP`

### Email
- Type: `string`
- Format: Valid email address
- Example: `customer@example.com`

### Source
- Type: `string`
- Required: Yes
- Examples: `tok_test_visa`, `card_1234567890`

## 🚨 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `INVALID_AMOUNT` | Amount out of range | Use 1-10,000,000 cents |
| `INVALID_CURRENCY` | Wrong currency format | Use 3 uppercase letters |
| `INVALID_EMAIL` | Bad email format | Use valid email address |
| `MISSING_SOURCE` | No payment source | Provide payment source |
| `PAYMENT_FAILED` | Payment declined | Check payment source |
| `RISK_BLOCKED` | High risk score | Contact support |

## 🔗 Useful Links

- [Full API Documentation](./API_DOCUMENTATION.md)
- [OpenAPI Specification](./api-spec.yaml)
- [Postman Collection](./TrustPay-API.postman_collection.json)
- [Testing Guide](./API_TESTING_GUIDE.md)
- [Vercel Deployment Guide](./DEPLOYMENT.md)

## 💡 Tips

1. **Always test with Stripe test tokens** in development
2. **Check risk scores** to understand why transactions are blocked
3. **Use pagination** for transaction lists to avoid timeouts
4. **Handle errors gracefully** - check status codes and error messages
5. **Monitor rate limits** - don't exceed 10 requests/minute for payments

## 🆘 Support

- **Documentation**: Check the full API docs
- **Issues**: Report bugs on GitHub
- **Email**: support@trustpayai.com

---
*Last updated: 2024-01-15*
