import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { chargeRequestSchema } from '@/utils/validation';
import { RiskService } from '@/services/RiskService';
import { PaymentService } from '@/services/PaymentService';
import { LoggingService } from '@/services/LoggingService';
import { LLMService } from '@/services/LLMService';
import { eventBus, EVENTS } from '@/utils/eventBus';
import logger from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = chargeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Invalid charge request', { errors: validationResult.error.errors });
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { amount, currency, source, email } = validationResult.data;
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Processing charge request', { 
      transactionId, 
      amount, 
      currency, 
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2') // Mask email for logging
    });

    // Emit charge requested event
    eventBus.emit(EVENTS.CHARGE_REQUESTED, {
      transactionId,
      amount,
      currency,
      source,
      email,
    });

    // Evaluate risk
    const riskService = RiskService.getInstance();
    const riskEvaluation = await riskService.evaluateRisk(amount, email, source);

    // Emit risk evaluated event
    eventBus.emit(EVENTS.RISK_EVALUATED, {
      transactionId,
      riskEvaluation,
    });

    let paymentResult;
    let status: 'success' | 'failed' | 'blocked';

    if (riskEvaluation.recommendation === 'block') {
      // Block transaction due to high risk
      status = 'blocked';
      paymentResult = {
        success: false,
        provider: 'none' as const,
        error: 'Transaction blocked due to high risk score',
      };
      
      logger.warn('Transaction blocked due to high risk', { 
        transactionId, 
        riskScore: riskEvaluation.score 
      });
    } else {
      // Process payment
      const paymentService = PaymentService.getInstance();
      paymentResult = await paymentService.processPayment(amount, currency, source);
      
      status = paymentResult.success ? 'success' : 'failed';
      
      // Emit payment processed event
      eventBus.emit(EVENTS.PAYMENT_PROCESSED, {
        transactionId,
        paymentResult,
        status,
      });
    }

    // Generate explanation using LLM
    const llmService = LLMService.getInstance();
    const explanation = await llmService.generateExplanation(
      riskEvaluation.score,
      riskEvaluation.factors,
      amount,
      email,
      status
    );

    // Log transaction
    const loggingService = LoggingService.getInstance();
    const loggedTransaction = loggingService.logTransaction({
      amount,
      currency,
      source,
      email,
      provider: paymentResult.provider,
      status,
      riskScore: riskEvaluation.score,
      explanation,
    });

    // Emit transaction logged event
    eventBus.emit(EVENTS.TRANSACTION_LOGGED, {
      transaction: loggedTransaction,
    });

    const response = {
      transactionId: loggedTransaction.id,
      provider: paymentResult.provider,
      status,
      riskScore: riskEvaluation.score,
      explanation,
    };

    logger.info('Charge request completed', { 
      transactionId: loggedTransaction.id, 
      status, 
      riskScore: riskEvaluation.score 
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Charge request failed', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
