# TrustPay AI - Mini Payment Gateway

A production-ready mini payment gateway proxy with LLM-powered risk assessment, built following MACH architecture principles (Microservices, API-first, Cloud-native, Headless).

## 🚀 Features

- **AI-Powered Risk Assessment**: Real-time fraud detection using heuristics and LLM explanations
- **Multi-Provider Support**: Integrated with Stripe and PayPal payment processors
- **Event-Driven Architecture**: Scalable microservices with in-memory event bus (extensible to Kafka/RabbitMQ)
- **Modern Tech Stack**: Next.js backend, React frontend with Redux Toolkit
- **Production Ready**: Docker containerization, CI/CD pipelines, comprehensive testing
- **12-Factor App**: Environment-based configuration, structured logging, health checks

## 🏗️ Architecture

### MACH Principles Implementation

- **Microservices**: Modular service architecture (RiskService, PaymentService, LoggingService, LLMService)
- **API-first**: RESTful APIs with OpenAPI specification
- **Cloud-native**: Docker containers, health checks, horizontal scaling ready
- **Headless**: Decoupled frontend and backend, API-driven

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │   Next.js API   │    │   Event Bus     │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (In-Memory)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Payment APIs   │
                       │ Stripe | PayPal │
                       └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Next.js 14 with TypeScript
- **Validation**: Zod schema validation
- **Logging**: Pino structured logging
- **AI**: Google Gemini integration with fallback templates
- **Payments**: Stripe & PayPal SDKs
- **Testing**: Jest with comprehensive test coverage
- **Configuration**: Environment-based config with Next.js env support

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Testing**: Vitest, React Testing Library, Cypress E2E
- **Build Tool**: Vite with separate test configuration

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local development
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Monitoring**: Health checks, structured logging, error tracking

## 🚦 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Gemini API key (optional, fallback templates available)
- PowerShell (for Windows users)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TrustPayAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   # This will install dependencies for the monorepo workspace
   # If you encounter issues, try: npm install --no-optional
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # The .env file will be automatically copied to backend/ and frontend/ directories
   # Edit .env with your configuration (Gemini API key, payment provider keys, etc.)
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend API on http://localhost:3001
   - Frontend SPA on http://localhost:3000

   **Note**: If you encounter module resolution issues, ensure environment variables are properly set up and try restarting the development servers.

### Docker Development

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Or start production build
docker-compose up
```

## 📋 API Documentation

### Core Endpoints

#### Process Payment
```http
POST /api/charge
Content-Type: application/json

{
  "amount": 1000,
  "currency": "USD",
  "source": "tok_test_visa",
  "email": "donor@example.com"
}
```

**Response:**
```json
{
  "transactionId": "txn_abc123",
  "provider": "stripe",
  "status": "success",
  "riskScore": 0.32,
  "explanation": "Transaction approved with low risk score..."
}
```

#### Get Transactions
```http
GET /api/transactions?limit=20&offset=0&status=success
```

#### Health Check
```http
GET /api/health
```

### Risk Assessment Logic

The system evaluates transactions based on:

- **Amount Risk**: Large amounts (≥$10) increase risk score
- **Email Analysis**: Suspicious domains (.ru, .tk, etc.) flagged
- **Source Validation**: Test tokens and unusual patterns detected
- **Pattern Recognition**: Historical analysis and heuristics

Risk scores range from 0.0 (low risk) to 1.0 (high risk):
- **< 0.5**: Approved and processed
- **≥ 0.5**: Blocked for manual review

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

### Test Coverage
- **Backend**: Unit tests for all services, API integration tests
- **Frontend**: Component tests, Redux store tests, API integration
- **E2E**: Full user journey testing with Cypress

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Production
```bash
docker-compose up --build
```

### Environment Variables

Required environment variables:

```env
# Backend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=3001
NODE_ENV=production

# Gemini Configuration (optional)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Payment Providers
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## 📊 Monitoring & Observability

### Health Checks
- **Endpoint**: `/api/health`
- **Checks**: Database, Event Bus, LLM Service, Payment Providers
- **Response**: Service status and configuration details

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Context**: Request/response logging, error tracking, performance metrics

### Metrics
- Transaction volume and success rates
- Risk score distribution
- Payment provider performance
- API response times

## 🔧 Development

### Troubleshooting

#### Common Issues

1. **Environment Variables Not Loading**
   ```bash
   # Ensure .env files exist in all directories
   cp env.example .env
   cp .env backend/.env
   cp .env frontend/.env
   ```

2. **TypeScript Type Definition Errors**
   ```bash
   # The project includes separate TypeScript configs for Jest
   # Main config: tsconfig.json
   # Jest config: tsconfig.jest.json
   ```

3. **Module Resolution Issues**
   ```bash
   # Clear node_modules and reinstall
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Recurse -Force backend/node_modules
   Remove-Item -Recurse -Force frontend/node_modules
   npm install --no-optional
   ```

4. **Vite Configuration**
   - Main config: `vite.config.ts` (for development)
   - Test config: `vitest.config.ts` (for testing)

### Project Structure
```
TrustPayAI/
├── backend/                 # Next.js API server
│   ├── src/
│   │   ├── app/api/        # API routes
│   │   ├── services/       # Business logic services
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Utilities and helpers
│   └── tests/              # Backend tests
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   └── services/       # API client
│   └── cypress/            # E2E tests
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Production orchestration
├── docker-compose.dev.yml  # Development orchestration
├── openapi.yaml           # API specification
├── .env                   # Environment variables (copy from env.example)
├── backend/.env           # Backend environment variables
├── frontend/.env          # Frontend environment variables
├── backend/tsconfig.jest.json  # Jest TypeScript configuration
└── frontend/vitest.config.ts   # Vitest configuration
```

### Adding New Features

1. **Backend Services**: Add new services in `backend/src/services/`
2. **API Routes**: Create new routes in `backend/src/app/api/`
3. **Frontend Components**: Add components in `frontend/src/components/`
4. **State Management**: Update Redux slices in `frontend/src/store/slices/`
5. **Tests**: Add corresponding tests for all new functionality

### Code Quality

- **ESLint**: Configured for both backend and frontend
- **TypeScript**: Strict type checking enabled with separate configs for Jest
- **Prettier**: Code formatting (configure as needed)
- **Husky**: Pre-commit hooks (configure as needed)
- **Type Definitions**: Comprehensive @types packages for testing libraries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for all new functionality
- Follow TypeScript best practices
- Use conventional commit messages
- Ensure all CI checks pass
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [OpenAPI specification](openapi.yaml)
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🎯 Roadmap

- [ ] Kafka/RabbitMQ event bus integration
- [ ] PostgreSQL database integration
- [ ] Redis caching layer
- [ ] Advanced fraud detection ML models
- [ ] Webhook support for real-time notifications
- [ ] Multi-currency support
- [ ] Admin dashboard
- [ ] Rate limiting and DDoS protection
- [ ] API versioning strategy
- [ ] GraphQL API option

---

Built with ❤️ following MACH architecture principles for modern, scalable applications.