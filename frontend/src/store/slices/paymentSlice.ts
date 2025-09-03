import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChargeRequest, ChargeResponse, ApiError } from '@/types';
import { paymentApi } from '@/services/api';

interface PaymentState {
  currentCharge: ChargeResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  currentCharge: null,
  isLoading: false,
  error: null,
};

export const processCharge = createAsyncThunk<
  ChargeResponse,
  ChargeRequest,
  { rejectValue: ApiError }
>(
  'payment/processCharge',
  async (chargeRequest, { rejectWithValue }) => {
    try {
      const response = await paymentApi.processCharge(chargeRequest);
      return response;
    } catch (error: any) {
      return rejectWithValue({
        error: error.message || 'Failed to process charge',
        details: error.response?.data,
      });
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearCharge: (state) => {
      state.currentCharge = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processCharge.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processCharge.fulfilled, (state, action: PayloadAction<ChargeResponse>) => {
        state.isLoading = false;
        state.currentCharge = action.payload;
        state.error = null;
      })
      .addCase(processCharge.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to process charge';
      });
  },
});

export const { clearCharge, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
