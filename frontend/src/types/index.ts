export interface ChargeRequest {
  amount: number;
  currency: string;
  source: string;
  email: string;
}

export interface ChargeResponse {
  transactionId: string;
  provider: 'stripe' | 'paypal';
  status: 'success' | 'failed' | 'blocked';
  riskScore: number;
  explanation: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  source: string;
  email: string;
  provider: 'stripe' | 'paypal';
  status: 'success' | 'failed' | 'blocked';
  riskScore: number;
  explanation: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  stats: {
    total: number;
    success: number;
    failed: number;
    blocked: number;
    byProvider: Record<string, number>;
  };
}

export interface ApiError {
  error: string;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
