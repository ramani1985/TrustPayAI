import { NextRequest } from 'next/server';
import { POST } from '../charge/route';

// Mock services
jest.mock('@/services/RiskService');
jest.mock('@/services/PaymentService');
jest.mock('@/services/LoggingService');
jest.mock('@/services/LLMService');
jest.mock('@/utils/eventBus');
jest.mock('@/utils/logger');

describe('/api/charge', () => {
  const mockRiskService = {
    evaluateRisk: jest.fn(),
  };

  const mockPaymentService = {
    processPayment: jest.fn(),
  };

  const mockLoggingService = {
    logTransaction: jest.fn(),
  };

  const mockLLMService = {
    generateExplanation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    require('@/services/RiskService').RiskService.getInstance.mockReturnValue(mockRiskService);
    require('@/services/PaymentService').PaymentService.getInstance.mockReturnValue(mockPaymentService);
    require('@/services/LoggingService').LoggingService.getInstance.mockReturnValue(mockLoggingService);
    require('@/services/LLMService').LLMService.getInstance.mockReturnValue(mockLLMService);
  });

  describe('POST', () => {
    it('should process a successful charge request', async () => {
      const requestBody = {
        amount: 1000,
        currency: 'USD',
        source: 'tok_test',
        email: 'test@example.com',
      };

      const request = new NextRequest('http://localhost:3001/api/charge', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock service responses
      mockRiskService.evaluateRisk.mockReturnValue({
        score: 0.2,
        factors: ['Low risk'],
        recommendation: 'approve',
      });

      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        provider: 'stripe',
        transactionId: 'txn_123',
      });

      mockLLMService.generateExplanation.mockResolvedValue('Low risk transaction approved');

      mockLoggingService.logTransaction.mockReturnValue({
        id: 'txn_123',
        amount: 1000,
        currency: 'USD',
        source: 'tok_test',
        email: 'test@example.com',
        provider: 'stripe',
        status: 'success',
        riskScore: 0.2,
        explanation: 'Low risk transaction approved',
        timestamp: '2023-01-01T00:00:00.000Z',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transactionId).toBe('txn_123');
      expect(data.provider).toBe('stripe');
      expect(data.status).toBe('success');
      expect(data.riskScore).toBe(0.2);
      expect(data.explanation).toBe('Low risk transaction approved');
    });

    it('should block high-risk transactions', async () => {
      const requestBody = {
        amount: 10000,
        currency: 'USD',
        source: 'tok_test',
        email: 'test@example.ru',
      };

      const request = new NextRequest('http://localhost:3001/api/charge', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock high risk evaluation
      mockRiskService.evaluateRisk.mockReturnValue({
        score: 0.8,
        factors: ['Large amount', 'Suspicious email domain'],
        recommendation: 'block',
      });

      mockLLMService.generateExplanation.mockResolvedValue('High risk transaction blocked');

      mockLoggingService.logTransaction.mockReturnValue({
        id: 'txn_456',
        amount: 10000,
        currency: 'USD',
        source: 'tok_test',
        email: 'test@example.ru',
        provider: 'none',
        status: 'blocked',
        riskScore: 0.8,
        explanation: 'High risk transaction blocked',
        timestamp: '2023-01-01T00:00:00.000Z',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('blocked');
      expect(data.riskScore).toBe(0.8);
      expect(mockPaymentService.processPayment).not.toHaveBeenCalled();
    });

    it('should handle failed payments', async () => {
      const requestBody = {
        amount: 1000,
        currency: 'USD',
        source: 'tok_invalid',
        email: 'test@example.com',
      };

      const request = new NextRequest('http://localhost:3001/api/charge', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      mockRiskService.evaluateRisk.mockReturnValue({
        score: 0.3,
        factors: [],
        recommendation: 'approve',
      });

      mockPaymentService.processPayment.mockResolvedValue({
        success: false,
        provider: 'stripe',
        error: 'Payment failed',
      });

      mockLLMService.generateExplanation.mockResolvedValue('Payment processing failed');

      mockLoggingService.logTransaction.mockReturnValue({
        id: 'txn_789',
        amount: 1000,
        currency: 'USD',
        source: 'tok_invalid',
        email: 'test@example.com',
        provider: 'stripe',
        status: 'failed',
        riskScore: 0.3,
        explanation: 'Payment processing failed',
        timestamp: '2023-01-01T00:00:00.000Z',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('failed');
    });

    it('should return 400 for invalid request data', async () => {
      const requestBody = {
        amount: -100, // Invalid amount
        currency: 'INVALID', // Invalid currency
        source: '', // Empty source
        email: 'invalid-email', // Invalid email
      };

      const request = new NextRequest('http://localhost:3001/api/charge', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should return 500 for internal server errors', async () => {
      const requestBody = {
        amount: 1000,
        currency: 'USD',
        source: 'tok_test',
        email: 'test@example.com',
      };

      const request = new NextRequest('http://localhost:3001/api/charge', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock service to throw error
      mockRiskService.evaluateRisk.mockImplementation(() => {
        throw new Error('Service error');
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
