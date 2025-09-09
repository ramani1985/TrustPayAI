import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { healthApi } from '@/services/api';

interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: string;
    eventBus: string;
    llm: string;
    paymentProviders: {
      stripe: string;
      paypal: string;
    };
  };
}

const HealthPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const healthData = await healthApi.checkHealth();
        setHealth(healthData);
      } catch (err: any) {
        setError(err.message || 'Failed to check health status');
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'active':
      case 'configured':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'unhealthy':
      case 'disconnected':
      case 'inactive':
      case 'not_configured':
        return <XCircle className="w-5 h-5 text-danger-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'active':
      case 'configured':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'unhealthy':
      case 'disconnected':
      case 'inactive':
      case 'not_configured':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      default:
        return 'text-warning-600 bg-warning-50 border-warning-200';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-danger-50 border border-danger-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="w-5 h-5 text-danger-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800">Health Check Failed</h3>
              <p className="mt-1 text-sm text-danger-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No health data</h3>
          <p className="mt-1 text-sm text-gray-500">Unable to retrieve system health information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Health</h2>
        <p className="text-gray-600">Monitor the health status of all system components.</p>
      </div>

      {/* Overall Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Overall Status</h3>
              <p className="text-sm text-gray-600">Last checked: {new Date(health.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon(health.status)}
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(health.status)}`}>
              {health.status}
            </span>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Version:</span>
              <span className="text-sm text-gray-900">{health.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Environment:</span>
              <span className="text-sm text-gray-900 capitalize">{health.environment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Timestamp:</span>
              <span className="text-sm text-gray-900">{new Date(health.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Services</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Database:</span>
              <div className="flex items-center">
                {getStatusIcon(health.services.database)}
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(health.services.database)}`}>
                  {health.services.database}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Event Bus:</span>
              <div className="flex items-center">
                {getStatusIcon(health.services.eventBus)}
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(health.services.eventBus)}`}>
                  {health.services.eventBus}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">LLM Service:</span>
              <div className="flex items-center">
                {getStatusIcon(health.services.llm)}
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(health.services.llm)}`}>
                  {health.services.llm}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Providers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Providers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">S</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Stripe</span>
            </div>
            <div className="flex items-center">
              {getStatusIcon(health.services.paymentProviders.stripe)}
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(health.services.paymentProviders.stripe)}`}>
                {health.services.paymentProviders.stripe}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 font-semibold text-sm">P</span>
              </div>
              <span className="text-sm font-medium text-gray-900">PayPal</span>
            </div>
            <div className="flex items-center">
              {getStatusIcon(health.services.paymentProviders.paypal)}
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(health.services.paymentProviders.paypal)}`}>
                {health.services.paymentProviders.paypal}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
