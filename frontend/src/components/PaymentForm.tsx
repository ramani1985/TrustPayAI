import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, Mail, DollarSign, Globe } from 'lucide-react';
import { processCharge, clearCharge, clearError } from '@/store/slices/paymentSlice';
import { addTransaction } from '@/store/slices/transactionsSlice';
import { RootState, AppDispatch } from '@/store';

const paymentSchema = z.object({
  amount: z
    .number()
    .min(1, 'Amount must be at least 1 cent')
    .max(10000000, 'Amount cannot exceed $100,000'),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters'),
  source: z
    .string()
    .min(1, 'Source is required')
    .max(100, 'Source cannot exceed 100 characters'),
  email: z
    .string()
    .email('Invalid email format')
    .max(254, 'Email cannot exceed 254 characters'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const PaymentForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentCharge, isLoading, error } = useSelector((state: RootState) => state.payment);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 1000,
      currency: 'USD',
      source: 'tok_test_visa',
      email: 'donor@example.com',
    },
  });

  const amount = watch('amount');

  const onSubmit = async (data: PaymentFormData) => {
    dispatch(clearError());
    const result = await dispatch(processCharge(data));
    
    if (processCharge.fulfilled.match(result)) {
      // Add the new transaction to the transactions list
      dispatch(addTransaction({
        ...result.payload,
        id: result.payload.transactionId,
        amount: data.amount,
        currency: data.currency,
        source: data.source,
        email: data.email,
        timestamp: new Date().toISOString(),
      }));
    }
  };

  const handleClear = () => {
    dispatch(clearCharge());
    reset();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'failed':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'blocked':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 0.3) return 'text-success-600';
    if (score < 0.7) return 'text-warning-600';
    return 'text-danger-600';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Process Payment</h2>
        <p className="text-gray-600">Enter payment details to process a charge with AI risk assessment.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Amount (cents)
            </label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              id="amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="1000"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-danger-600">{errors.amount.message}</p>
            )}
            {amount && (
              <p className="mt-1 text-sm text-gray-500">
                ${(amount / 100).toFixed(2)} {watch('currency')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline w-4 h-4 mr-1" />
              Currency
            </label>
            <select
              {...register('currency')}
              id="currency"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-danger-600">{errors.currency.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="inline w-4 h-4 mr-1" />
            Payment Source
          </label>
          <input
            {...register('source')}
            type="text"
            id="source"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="tok_test_visa"
          />
          {errors.source && (
            <p className="mt-1 text-sm text-danger-600">{errors.source.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="donor@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
          )}
        </div>

        {error && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-md">
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Process Payment'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Clear
          </button>
        </div>
      </form>

      {currentCharge && (
        <div className="mt-6 p-4 border rounded-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Result</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Transaction ID:</span>
              <span className="text-sm text-gray-900 font-mono">{currentCharge.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Provider:</span>
              <span className="text-sm text-gray-900 capitalize">{currentCharge.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full border ${getStatusColor(currentCharge.status)}`}>
                {currentCharge.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Risk Score:</span>
              <span className={`text-sm font-medium ${getRiskScoreColor(currentCharge.riskScore)}`}>
                {(currentCharge.riskScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-3">
              <span className="text-sm font-medium text-gray-600 block mb-1">Explanation:</span>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                {currentCharge.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
