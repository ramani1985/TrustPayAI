import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PaymentForm from '../PaymentForm';
import paymentReducer from '@/store/slices/paymentSlice';
import transactionsReducer from '@/store/slices/transactionsSlice';

// Mock the API
jest.mock('@/services/api', () => ({
  paymentApi: {
    processCharge: jest.fn(),
  },
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      payment: paymentReducer,
      transactions: transactionsReducer,
    },
    preloadedState: initialState,
  });
};

describe('PaymentForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment form with all fields', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payment source/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /process payment/i })).toBeInTheDocument();
  });

  it('shows default values', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('USD')).toBeInTheDocument();
    expect(screen.getByDisplayValue('tok_test_visa')).toBeInTheDocument();
    expect(screen.getByDisplayValue('donor@example.com')).toBeInTheDocument();
  });

  it('shows amount in dollars when amount is entered', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '2500');

    expect(screen.getByText('$25.00 USD')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    const amountInput = screen.getByLabelText(/amount/i);
    const sourceInput = screen.getByLabelText(/payment source/i);
    const emailInput = screen.getByLabelText(/email address/i);

    // Clear required fields
    await user.clear(amountInput);
    await user.clear(sourceInput);
    await user.clear(emailInput);

    const submitButton = screen.getByRole('button', { name: /process payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Amount must be at least 1 cent')).toBeInTheDocument();
      expect(screen.getByText('Source is required')).toBeInTheDocument();
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('validates amount range', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    const amountInput = screen.getByLabelText(/amount/i);
    
    // Test minimum amount
    await user.clear(amountInput);
    await user.type(amountInput, '0');
    
    const submitButton = screen.getByRole('button', { name: /process payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Amount must be at least 1 cent')).toBeInTheDocument();
    });

    // Test maximum amount
    await user.clear(amountInput);
    await user.type(amountInput, '10000001');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Amount cannot exceed $100,000')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /process payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('validates currency format', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    const currencySelect = screen.getByLabelText(/currency/i);
    
    // Change to invalid currency (this would need to be done programmatically)
    fireEvent.change(currencySelect, { target: { value: 'INVALID' } });
    
    const submitButton = screen.getByRole('button', { name: /process payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Currency must be uppercase letters')).toBeInTheDocument();
    });
  });

  it('shows loading state when processing payment', async () => {
    const store = createMockStore({
      payment: {
        currentCharge: null,
        isLoading: true,
        error: null,
      },
    });
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
  });

  it('shows error message when payment fails', () => {
    const store = createMockStore({
      payment: {
        currentCharge: null,
        isLoading: false,
        error: 'Payment processing failed',
      },
    });
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    expect(screen.getByText('Payment processing failed')).toBeInTheDocument();
  });

  it('shows payment result when successful', () => {
    const mockCharge = {
      transactionId: 'txn_123',
      provider: 'stripe' as const,
      status: 'success' as const,
      riskScore: 0.2,
      explanation: 'Low risk transaction approved',
    };

    const store = createMockStore({
      payment: {
        currentCharge: mockCharge,
        isLoading: false,
        error: null,
      },
    });
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    expect(screen.getByText('Payment Result')).toBeInTheDocument();
    expect(screen.getByText('txn_123')).toBeInTheDocument();
    expect(screen.getByText('stripe')).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByText('20.0%')).toBeInTheDocument();
    expect(screen.getByText('Low risk transaction approved')).toBeInTheDocument();
  });

  it('clears form when clear button is clicked', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '5000');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  });

  it('shows different risk score colors based on score', () => {
    const highRiskCharge = {
      transactionId: 'txn_123',
      provider: 'stripe' as const,
      status: 'blocked' as const,
      riskScore: 0.8,
      explanation: 'High risk transaction blocked',
    };

    const store = createMockStore({
      payment: {
        currentCharge: highRiskCharge,
        isLoading: false,
        error: null,
      },
    });
    
    render(
      <Provider store={store}>
        <PaymentForm />
      </Provider>
    );

    const riskScoreElement = screen.getByText('80.0%');
    expect(riskScoreElement).toHaveClass('text-danger-600');
  });
});
