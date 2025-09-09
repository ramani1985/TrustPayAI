import { NextRequest, NextResponse } from 'next/server';
import { transactionQuerySchema } from '@/utils/validation';
import { LoggingService } from '@/services/LoggingService';
import logger from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = transactionQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      logger.warn('Invalid transaction query parameters', { errors: validationResult.error.errors });
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { limit, offset, status, provider } = validationResult.data;

    logger.info('Fetching transactions', { limit, offset, status, provider });

    const loggingService = LoggingService.getInstance();
    const transactions = loggingService.getTransactions(limit, offset, { status, provider });
    const stats = loggingService.getTransactionStats();

    const response = {
      transactions,
      pagination: {
        limit,
        offset,
        total: stats.total,
        hasMore: offset + limit < stats.total,
      },
      stats,
    };

    logger.info('Transactions fetched successfully', { 
      count: transactions.length, 
      total: stats.total 
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Failed to fetch transactions', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
