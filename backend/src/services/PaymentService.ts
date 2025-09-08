import Stripe from 'stripe';
import paypal from 'paypal-rest-sdk';
import { PaymentProvider } from '@/types';
import logger from '@/utils/logger';

// Configure Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID || '',
  client_secret: process.env.PAYPAL_CLIENT_SECRET || '',
});

class StripeProvider implements PaymentProvider {
  name = 'stripe' as const;

  async processPayment(amount: number, currency: string, source: string) {
    try {
      logger.info('Processing payment with Stripe', { amount, currency, source });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        payment_method: source,
        confirm: true,
        return_url: 'https://example.com/return',
      });

      if (paymentIntent.status === 'succeeded') {
        logger.info('Stripe payment succeeded', { paymentIntentId: paymentIntent.id });
        return {
          success: true,
          transactionId: paymentIntent.id,
        };
      } else {
        logger.warn('Stripe payment failed', { status: paymentIntent.status });
        return {
          success: false,
          error: `Payment failed with status: ${paymentIntent.status}`,
        };
      }
    } catch (error) {
      logger.error('Stripe payment error', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

class PayPalProvider implements PaymentProvider {
  name = 'paypal' as const;

  async processPayment(amount: number, currency: string, source: string) {
    return new Promise<{ success: boolean; transactionId?: string; error?: string }>((resolve) => {
      try {
        logger.info('Processing payment with PayPal', { amount, currency, source });

        const payment = {
          intent: 'sale',
          payer: {
            payment_method: 'credit_card',
            funding_instruments: [{
              credit_card: {
                number: source,
                type: 'visa',
                expire_month: '12',
                expire_year: '2025',
                cvv2: '123',
                first_name: 'Test',
                last_name: 'User',
              },
            }],
          },
          transactions: [{
            amount: {
              total: (amount / 100).toFixed(2),
              currency: currency.toUpperCase(),
            },
            description: 'TrustPay AI Payment',
          }],
        };

        paypal.payment.create(payment, (error, payment) => {
          if (error) {
            logger.error('PayPal payment error', error as unknown as Error);
            resolve({
              success: false,
              error: error.message || 'PayPal payment failed',
            });
          } else {
            logger.info('PayPal payment succeeded', { paymentId: payment.id });
            resolve({
              success: true,
              transactionId: payment.id,
            });
          }
        });
      } catch (error) {
        logger.error('PayPal payment error', error as Error);
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }
}

export class PaymentService {
  private static instance: PaymentService;
  private providers: PaymentProvider[];

  private constructor() {
    this.providers = [
      new StripeProvider(),
      new PayPalProvider(),
    ];
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public async processPayment(amount: number, currency: string, source: string) {
    logger.info('Processing payment', { amount, currency, source });

    // For demo purposes, randomly select a provider
    // In production, you might have logic to select based on currency, amount, etc.
    const provider = this.providers[Math.floor(Math.random() * this.providers.length)];
    
    logger.info('Selected payment provider', { provider: provider.name });

    const result = await provider.processPayment(amount, currency, source);
    
    return {
      ...result,
      provider: provider.name,
    };
  }
}
