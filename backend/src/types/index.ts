export interface ChargeRequest {
  amount: number;
  currency: string;
  source: string;
  email: string;
}

export interface ChargeResponse {
  transactionId: string;
  provider: 'stripe' | 'paypal' | 'none';
  status: 'success' | 'failed' | 'blocked';
  riskScore: number;
  explanation: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  source: string;
  email: string;
  provider: 'stripe' | 'paypal' | 'none';
  status: 'success' | 'failed' | 'blocked';
  riskScore: number;
  explanation: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RiskEvaluation {
  score: number;
  factors: string[];
  recommendation: 'approve' | 'block';
}

export interface EventPayload {
  type: string;
  data: any;
  timestamp: string;
  id: string;
}

export interface PaymentProvider {
  name: 'stripe' | 'paypal';
  processPayment(amount: number, currency: string, source: string): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }>;
}

export interface EventBus {
  emit(event: string, data: any): boolean;
  on(event: string, handler: (data: any) => void): this;
  off(event: string, handler: (data: any) => void): this;
}

export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}
