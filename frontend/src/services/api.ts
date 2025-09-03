import axios from 'axios';
import { ChargeRequest, ChargeResponse, TransactionsResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const paymentApi = {
  processCharge: async (chargeRequest: ChargeRequest): Promise<ChargeResponse> => {
    const response = await apiClient.post('/api/charge', chargeRequest);
    return response.data;
  },
};

export const transactionsApi = {
  getTransactions: async (params: {
    limit?: number;
    offset?: number;
    status?: 'success' | 'failed' | 'blocked';
    provider?: 'stripe' | 'paypal';
  } = {}): Promise<TransactionsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.provider) searchParams.append('provider', params.provider);

    const response = await apiClient.get(`/api/transactions?${searchParams.toString()}`);
    return response.data;
  },
};

export const healthApi = {
  checkHealth: async () => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },
};
