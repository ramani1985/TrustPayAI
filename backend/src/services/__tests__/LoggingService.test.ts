import { LoggingService } from '../LoggingService';

describe('LoggingService', () => {
  let loggingService: LoggingService;

  beforeEach(() => {
    loggingService = LoggingService.getInstance();
  });

  describe('logTransaction', () => {
    it('should log a transaction with all required fields', () => {
      const transactionData = {
        amount: 1000,
        currency: 'USD',
        source: 'tok_test',
        email: 'test@example.com',
        provider: 'stripe' as const,
        status: 'success' as const,
        riskScore: 0.2,
        explanation: 'Low risk transaction',
      };

      const result = loggingService.logTransaction(transactionData);

      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.amount).toBe(1000);
      expect(result.currency).toBe('USD');
      expect(result.source).toBe('tok_test');
      expect(result.email).toBe('test@example.com');
      expect(result.provider).toBe('stripe');
      expect(result.status).toBe('success');
      expect(result.riskScore).toBe(0.2);
      expect(result.explanation).toBe('Low risk transaction');
    });

    it('should generate unique transaction IDs', () => {
      const transactionData = {
        amount: 1000,
        currency: 'USD',
        source: 'tok_test',
        email: 'test@example.com',
        provider: 'stripe' as const,
        status: 'success' as const,
        riskScore: 0.2,
        explanation: 'Low risk transaction',
      };

      const result1 = loggingService.logTransaction(transactionData);
      const result2 = loggingService.logTransaction(transactionData);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('getTransactions', () => {
    beforeEach(() => {
      // Add some test transactions
      const transactions = [
        {
          amount: 1000,
          currency: 'USD',
          source: 'tok_test1',
          email: 'test1@example.com',
          provider: 'stripe' as const,
          status: 'success' as const,
          riskScore: 0.2,
          explanation: 'Low risk transaction',
        },
        {
          amount: 2000,
          currency: 'USD',
          source: 'tok_test2',
          email: 'test2@example.com',
          provider: 'paypal' as const,
          status: 'failed' as const,
          riskScore: 0.8,
          explanation: 'High risk transaction',
        },
        {
          amount: 5000,
          currency: 'USD',
          source: 'tok_test3',
          email: 'test3@example.com',
          provider: 'stripe' as const,
          status: 'blocked' as const,
          riskScore: 0.9,
          explanation: 'Blocked transaction',
        },
      ];

      transactions.forEach(tx => loggingService.logTransaction(tx));
    });

    it('should return all transactions by default', () => {
      const result = loggingService.getTransactions();
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('should respect limit parameter', () => {
      const result = loggingService.getTransactions(2);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should respect offset parameter', () => {
      const result1 = loggingService.getTransactions(1, 0);
      const result2 = loggingService.getTransactions(1, 1);
      
      expect(result1[0].id).not.toBe(result2[0].id);
    });

    it('should filter by status', () => {
      const result = loggingService.getTransactions(10, 0, { status: 'success' });
      expect(result.every(tx => tx.status === 'success')).toBe(true);
    });

    it('should filter by provider', () => {
      const result = loggingService.getTransactions(10, 0, { provider: 'stripe' });
      expect(result.every(tx => tx.provider === 'stripe')).toBe(true);
    });

    it('should filter by both status and provider', () => {
      const result = loggingService.getTransactions(10, 0, { 
        status: 'success', 
        provider: 'stripe' 
      });
      expect(result.every(tx => tx.status === 'success' && tx.provider === 'stripe')).toBe(true);
    });
  });

  describe('getTransactionStats', () => {
    beforeEach(() => {
      // Add test transactions with different statuses
      const transactions = [
        { amount: 1000, currency: 'USD', source: 'tok1', email: 'test1@example.com', provider: 'stripe' as const, status: 'success' as const, riskScore: 0.2, explanation: 'Success' },
        { amount: 2000, currency: 'USD', source: 'tok2', email: 'test2@example.com', provider: 'stripe' as const, status: 'success' as const, riskScore: 0.3, explanation: 'Success' },
        { amount: 3000, currency: 'USD', source: 'tok3', email: 'test3@example.com', provider: 'paypal' as const, status: 'failed' as const, riskScore: 0.8, explanation: 'Failed' },
        { amount: 4000, currency: 'USD', source: 'tok4', email: 'test4@example.com', provider: 'paypal' as const, status: 'blocked' as const, riskScore: 0.9, explanation: 'Blocked' },
      ];

      transactions.forEach(tx => loggingService.logTransaction(tx));
    });

    it('should return correct statistics', () => {
      const stats = loggingService.getTransactionStats();

      expect(stats.total).toBeGreaterThanOrEqual(4);
      expect(stats.success).toBeGreaterThanOrEqual(2);
      expect(stats.failed).toBeGreaterThanOrEqual(1);
      expect(stats.blocked).toBeGreaterThanOrEqual(1);
      expect(stats.byProvider.stripe).toBeGreaterThanOrEqual(2);
      expect(stats.byProvider.paypal).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by ID', () => {
      const transactionData = {
        amount: 1000,
        currency: 'USD',
        source: 'tok_test',
        email: 'test@example.com',
        provider: 'stripe' as const,
        status: 'success' as const,
        riskScore: 0.2,
        explanation: 'Low risk transaction',
      };

      const loggedTransaction = loggingService.logTransaction(transactionData);
      const retrievedTransaction = loggingService.getTransactionById(loggedTransaction.id);

      expect(retrievedTransaction).toEqual(loggedTransaction);
    });

    it('should return undefined for non-existent ID', () => {
      const result = loggingService.getTransactionById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });
});
