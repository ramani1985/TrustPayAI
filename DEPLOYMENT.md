# Deployment Guide

This guide covers deploying TrustPay AI to various environments following production best practices.

## 🏗️ Architecture Overview

TrustPay AI follows MACH architecture principles and is designed for cloud-native deployment:

- **Microservices**: Modular backend services
- **API-first**: RESTful APIs with OpenAPI specification
- **Cloud-native**: Containerized with Docker
- **Headless**: Decoupled frontend and backend

## 🚀 Deployment Options

### 1. Docker Compose (Recommended for Development/Staging)

#### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

#### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd TrustPayAI

# Copy environment file
cp env.example .env

# Edit environment variables
nano .env

# Start all services
docker-compose up -d

# Check health
curl http://localhost:3001/api/health
curl http://localhost:3000
```

#### Environment Configuration
```env
# Production Environment Variables
NODE_ENV=production
PORT=3001

# OpenAI Configuration
OPENAI_API_KEY=open_api_key
OPENAI_MODEL=gpt-3.5-turbo

# Payment Providers
STRIPE_SECRET_KEY=sk_live_your_stripe_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live

# Database
POSTGRES_USER=trustpay
POSTGRES_PASSWORD=secure_password_here
DATABASE_URL=postgresql://trustpay:secure_password_here@postgres:5432/trustpay_ai

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 2. Kubernetes Deployment

#### Prerequisites
- Kubernetes cluster (1.20+)
- kubectl configured
- Helm 3.0+ (optional)

#### Create Namespace
```bash
kubectl create namespace trustpay-ai
```

#### Deploy with kubectl
```bash
# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

#### Deploy with Helm
```bash
# Add Helm repository (if using custom charts)
helm repo add trustpay-ai ./helm

# Install with values
helm install trustpay-ai ./helm \
  --namespace trustpay-ai \
  --values helm/values-production.yaml
```

### 3. Cloud Platform Deployment

#### AWS ECS/Fargate
```bash
# Build and push images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -t trustpay-ai-backend ./backend
docker build -t trustpay-ai-frontend ./frontend

docker tag trustpay-ai-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/trustpay-ai-backend:latest
docker tag trustpay-ai-frontend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/trustpay-ai-frontend:latest

docker push <account>.dkr.ecr.us-east-1.amazonaws.com/trustpay-ai-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/trustpay-ai-frontend:latest

# Deploy with ECS CLI or AWS Console
```

#### Google Cloud Run
```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/PROJECT-ID/trustpay-ai-backend ./backend
gcloud run deploy trustpay-ai-backend \
  --image gcr.io/PROJECT-ID/trustpay-ai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Build and deploy frontend
gcloud builds submit --tag gcr.io/PROJECT-ID/trustpay-ai-frontend ./frontend
gcloud run deploy trustpay-ai-frontend \
  --image gcr.io/PROJECT-ID/trustpay-ai-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances
```bash
# Create resource group
az group create --name trustpay-ai --location eastus

# Deploy backend
az container create \
  --resource-group trustpay-ai \
  --name trustpay-ai-backend \
  --image <registry>/trustpay-ai-backend:latest \
  --ports 3001 \
  --environment-variables NODE_ENV=production

# Deploy frontend
az container create \
  --resource-group trustpay-ai \
  --name trustpay-ai-frontend \
  --image <registry>/trustpay-ai-frontend:latest \
  --ports 80
```

## 🔧 Production Configuration

### Environment Variables

#### Required Variables
```env
# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Payment Providers
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# Security
JWT_SECRET=your_secure_jwt_secret
ENCRYPTION_KEY=your_32_character_key
```

#### Optional Variables
```env
# OpenAI (for enhanced explanations)
OPENAI_API_KEY=open_api_key
OPENAI_MODEL=gpt-3.5-turbo

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Event Bus (for scaling)
EVENT_BUS_TYPE=kafka
KAFKA_BROKERS=localhost:9092
```

### Security Configuration

#### SSL/TLS
```nginx
# Nginx configuration for SSL
server {
    listen 443 ssl http2;
    server_name api.trustpay-ai.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    location / {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Security Headers
```javascript
// Backend security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Database Configuration

#### PostgreSQL Production Setup
```sql
-- Create production database
CREATE DATABASE trustpay_ai_prod;
CREATE USER trustpay_app WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE trustpay_ai_prod TO trustpay_app;

-- Configure connection pooling
-- In postgresql.conf:
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

#### Connection Pooling
```javascript
// Database connection with pooling
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 📊 Monitoring & Observability

### Health Checks
```bash
# Application health
curl http://localhost:3001/api/health

# Database health
curl http://localhost:3001/api/health/database

# Payment provider health
curl http://localhost:3001/api/health/providers
```

### Logging Configuration
```javascript
// Structured logging with correlation IDs
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
```

### Metrics Collection
```javascript
// Prometheus metrics
const promClient = require('prom-client');

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const transactionCounter = new promClient.Counter({
  name: 'transactions_total',
  help: 'Total number of transactions processed',
  labelNames: ['status', 'provider'],
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Deployment
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Your deployment script
          ./scripts/deploy.sh
```

### Deployment Script
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "Starting deployment..."

# Build and push images
docker build -t trustpay-ai-backend ./backend
docker build -t trustpay-ai-frontend ./frontend

# Deploy to production
kubectl apply -f k8s/production/
kubectl rollout status deployment/trustpay-ai-backend
kubectl rollout status deployment/trustpay-ai-frontend

echo "Deployment completed successfully!"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connectivity
docker exec -it trustpay-ai-postgres psql -U trustpay -d trustpay_ai -c "SELECT 1;"

# Check connection string
echo $DATABASE_URL
```

#### 2. Payment Provider Issues
```bash
# Test Stripe connectivity
curl -u sk_test_...: https://api.stripe.com/v1/charges

# Test PayPal connectivity
curl -X POST https://api.sandbox.paypal.com/v1/oauth2/token
```

#### 3. Memory Issues
```bash
# Check container memory usage
docker stats

# Increase memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_transactions_created_at_status 
ON transactions(created_at DESC, status);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM transactions 
WHERE created_at > NOW() - INTERVAL '1 day';
```

#### 2. Application Optimization
```javascript
// Enable compression
app.use(compression());

// Cache static assets
app.use(express.static('public', {
  maxAge: '1y',
  etag: true
}));

// Connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
});
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Implement session affinity if needed
- Scale database with read replicas
- Use Redis for session storage

### Vertical Scaling
- Increase container memory/CPU limits
- Optimize database configuration
- Use faster storage (SSD)
- Implement caching layers

### Auto-scaling
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: trustpay-ai-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: trustpay-ai-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] SSL/TLS certificates configured
- [ ] Security headers implemented
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF protection configured
- [ ] API authentication implemented
- [ ] Logging and monitoring active
- [ ] Regular security updates
- [ ] Backup and recovery tested

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test health endpoints
4. Review monitoring dashboards
5. Contact support team

---

This deployment guide ensures TrustPay AI is deployed securely and efficiently in production environments.
