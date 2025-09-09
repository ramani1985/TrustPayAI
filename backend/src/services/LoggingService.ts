import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '@/types';
import logger from '@/utils/logger';

export class LoggingService {
  private static instance: LoggingService;
  private transactions: Map<string, Transaction> = new Map();

  private constructor() {}

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  public logTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    const fullTransaction: Transaction = {
      ...transaction,
      id,
      timestamp,
    };

    this.transactions.set(id, fullTransaction);
    
    logger.info('Transaction logged', { 
      transactionId: id, 
      status: transaction.status,
      provider: transaction.provider,
      amount: transaction.amount 
    });

    return fullTransaction;
  }

  public getTransactions(limit: number = 50, offset: number = 0, filters?: {
    status?: 'success' | 'failed' | 'blocked';
    provider?: 'stripe' | 'paypal' | 'none';
  }): Transaction[] {
    let transactions = Array.from(this.transactions.values());

    // Apply filters
    if (filters?.status) {
      transactions = transactions.filter(t => t.status === filters.status);
    }
    if (filters?.provider) {
      transactions = transactions.filter(t => t.provider === filters.provider);
    }

    // Sort by timestamp (newest first)
    transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    return transactions.slice(offset, offset + limit);
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  public getTransactionStats(): {
    total: number;
    success: number;
    failed: number;
    blocked: number;
    byProvider: Record<string, number>;
  } {
    const transactions = Array.from(this.transactions.values());
    
    const stats = {
      total: transactions.length,
      success: transactions.filter(t => t.status === 'success').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      blocked: transactions.filter(t => t.status === 'blocked').length,
      byProvider: {} as Record<string, number>,
    };

    // Count by provider
    transactions.forEach(t => {
      stats.byProvider[t.provider] = (stats.byProvider[t.provider] || 0) + 1;
    });

    return stats;
  }
}
