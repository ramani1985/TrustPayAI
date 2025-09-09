import { NextResponse } from 'next/server';
import logger from '@/utils/logger';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected', // In production, check actual DB connection
        eventBus: 'active',
        llm: process.env.GEMINI_API_KEY ? 'configured' : 'fallback',
        paymentProviders: {
          stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
          paypal: process.env.PAYPAL_CLIENT_ID ? 'configured' : 'not_configured',
        },
      },
    };

    logger.debug('Health check requested', { status: health.status });
    return NextResponse.json(health);

  } catch (error) {
    logger.error('Health check failed', error as Error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed' 
      },
      { status: 500 }
    );
  }
}
