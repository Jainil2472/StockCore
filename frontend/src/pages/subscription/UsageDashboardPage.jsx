// pages/UsageDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Users, Warehouse, Loader, ArrowUp, AlertTriangle } from 'lucide-react';
import UsageBar from '@/components/UsageBar.jsx';
import { subscriptionAPI } from '@/api/subscriptionApi.jsx';
import { useAuth } from '@/context/AuthContext';

export default function UsageDashboardPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth(); // ✅ use context instead of localStorage
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login_signup');
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user]);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const data = await subscriptionAPI.getUsage();
      setUsage(data);
    } catch (error) {
      console.error('Error fetching usage:', error);
      alert('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  // Show spinner while auth context is initializing or fetching
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading usage data...</p>
        </div>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
            <p className="text-gray-600">Unable to load usage statistics.</p>
          </div>
        </div>
      </div>
    );
  }

  const hasWarnings =
    (usage.productsUsed / usage.productsLimit >= 0.8) ||
    (usage.staffUsed / usage.staffLimit >= 0.8) ||
    (usage.warehousesUsed / usage.warehousesLimit >= 0.8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/subscription/current')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-100 border border-blue-300 px-4 py-2 rounded-lg">
                <span className="text-sm text-blue-700 font-medium">Current Plan:</span>
                <span className="font-bold text-blue-900">{usage.plan}</span>
              </div>
              <button
                onClick={() => navigate('/subscription')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
              >
                <ArrowUp className="w-5 h-5" />
                Upgrade Plan
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Usage Dashboard</h1>
          <p className="text-gray-600 text-lg">Monitor your subscription usage and limits</p>
        </div>

        {/* Warning Banner */}
        {hasWarnings && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-orange-900 text-lg mb-2">
                  Approaching Usage Limits
                </h3>
                <p className="text-orange-800 mb-4">
                  You're using more than 80% of your allocated resources.
                  Consider upgrading your plan to avoid service interruptions.
                </p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-lg"
                >
                  View Upgrade Options
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Usage Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resource Usage</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <UsageBar
              label="Products"
              current={usage.productsUsed}
              limit={usage.productsLimit}
              icon={Package}
              color="blue"
            />
            <UsageBar
              label="Staff Members"
              current={usage.staffUsed}
              limit={usage.staffLimit}
              icon={Users}
              color="purple"
            />
            <UsageBar
              label="Warehouses"
              current={usage.warehousesUsed}
              limit={usage.warehousesLimit}
              icon={Warehouse}
              color="green"
            />
          </div>
        </div>

        {/* Upgrade CTA */}
        {(usage.plan === 'BASIC' || usage.plan === 'PLUS') && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-3">
                  {usage.plan === 'BASIC' ? 'Unlock More Features' : 'Go Unlimited'}
                </h3>
                <p className="text-blue-100 mb-4 text-lg max-w-2xl">
                  {usage.plan === 'BASIC'
                    ? 'Upgrade to PLUS for 500 products, 10 staff members, and 5 warehouses.'
                    : 'Upgrade to PRO for unlimited everything and priority support.'}
                </p>
                <ul className="space-y-2 text-blue-50">
                  {usage.plan === 'BASIC' ? (
                    <>
                      <li className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        500 Products (10x more)
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        10 Staff Members (5x more)
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        5 Warehouses (5x more)
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Unlimited Everything
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Priority Support
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Advanced Features
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <button
                onClick={() => navigate('/subscription')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-2xl flex items-center gap-2 whitespace-nowrap"
              >
                Upgrade Now
                <ArrowUp className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Usage Summary</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{usage.productsUsed}</p>
              <p className="text-sm text-gray-600 mt-1">Products Created</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">{usage.staffUsed}</p>
              <p className="text-sm text-gray-600 mt-1">Active Staff</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{usage.warehousesUsed}</p>
              <p className="text-sm text-gray-600 mt-1">Warehouses</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{usage.plan}</p>
              <p className="text-sm text-gray-600 mt-1">Current Plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}