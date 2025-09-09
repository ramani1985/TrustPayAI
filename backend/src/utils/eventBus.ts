import { EventEmitter } from 'events';
import { EventBus, EventPayload } from '@/types';
import logger from './logger';

class InMemoryEventBus extends EventEmitter implements EventBus {
  private static instance: InMemoryEventBus;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  public static getInstance(): InMemoryEventBus {
    if (!InMemoryEventBus.instance) {
      InMemoryEventBus.instance = new InMemoryEventBus();
    }
    return InMemoryEventBus.instance;
  }

  emit(event: string, data: any): boolean {
    const payload: EventPayload = {
      type: event,
      data,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9),
    };

    logger.info(`Event emitted: ${event}`, { eventId: payload.id });
    return super.emit(event, payload);
  }

  on(event: string, handler: (data: EventPayload) => void): this {
    logger.debug(`Event listener registered: ${event}`);
    super.on(event, handler);
    return this;
  }

  off(event: string, handler: (data: EventPayload) => void): this {
    logger.debug(`Event listener removed: ${event}`);
    super.off(event, handler);
    return this;
  }
}

// Export singleton instance
export const eventBus = InMemoryEventBus.getInstance();

// Event types
export const EVENTS = {
  CHARGE_REQUESTED: 'charge.requested',
  RISK_EVALUATED: 'risk.evaluated',
  PAYMENT_PROCESSED: 'payment.processed',
  TRANSACTION_LOGGED: 'transaction.logged',
  PAYMENT_FAILED: 'payment.failed',
} as const;
