import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TransactionsResponse, Transaction, ApiError } from '@/types';
import { transactionsApi } from '@/services/api';

interface TransactionsState {
  transactions: Transaction[];
  stats: TransactionsResponse['stats'] | null;
  pagination: TransactionsResponse['pagination'] | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  stats: null,
  pagination: null,
  isLoading: false,
  error: null,
};

interface FetchTransactionsParams {
  limit?: number;
  offset?: number;
  status?: 'success' | 'failed' | 'blocked';
  provider?: 'stripe' | 'paypal';
}

export const fetchTransactions = createAsyncThunk<
  TransactionsResponse,
  FetchTransactionsParams,
  { rejectValue: ApiError }
>(
  'transactions/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getTransactions(params);
      return response;
    } catch (error: any) {
      return rejectWithValue({
        error: error.message || 'Failed to fetch transactions',
        details: error.response?.data,
      });
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
      if (state.stats) {
        state.stats.total += 1;
        state.stats[action.payload.status] += 1;
        state.stats.byProvider[action.payload.provider] = 
          (state.stats.byProvider[action.payload.provider] || 0) + 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<TransactionsResponse>) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.stats = action.payload.stats;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to fetch transactions';
      });
  },
});

export const { clearError, addTransaction } = transactionsSlice.actions;
export default transactionsSlice.reducer;
