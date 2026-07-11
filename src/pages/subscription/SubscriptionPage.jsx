// pages/SubscriptionPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Loader } from 'lucide-react';
import PricingCard from '@/components/PricingCard.jsx';
import { subscriptionAPI } from '@/api/subscriptionApi.jsx';
import { initiateRazorpayPayment } from '@/utils/razorpay.jsx';
import { useAuth } from '@/context/AuthContext';

const PLANS = [
  {
    id: 'BASIC',
    name: 'BASIC',
    price: 100,
    features: {
      products: 50,
      staff: 1,
      warehouses: 1
    }
  },
  {
    id: 'PLUS',
    name: 'PLUS',
    price: 499,
    recommended: true,
    features: {
      products: 500,
      staff: 10,
      warehouses: 5
    }
  },
  {
    id: 'PRO',
    name: 'PRO',
    price: 999,
    features: {
      products: 'Unlimited',
      staff: 'Unlimited',
      warehouses: 'Unlimited'
    }
  }
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth(); // ✅ use context instead of localStorage
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPlan, setFetchingPlan] = useState(true);

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login_signup');
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user) {
      fetchCurrentPlan();
    }
  }, [user]);

  const fetchCurrentPlan = async () => {
    try {
      const data = await subscriptionAPI.getCurrentSubscription();
      setCurrentPlan(data.plan);
    } catch (error) {
      console.error('Error fetching current plan:', error);
    } finally {
      setFetchingPlan(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!user) {
      navigate('/login_signup');
      return;
    }

    setLoading(true);

    try {
      const res = await subscriptionAPI.createSubscription(
        plan.id,
        user.email,
        user.name
      );

      const { subscriptionId, key } = res;

      await initiateRazorpayPayment({
        subscriptionId: subscriptionId,
        razorpayKey: key,
        planName: plan.name,
        onSuccess: (response) => {
          console.log('Payment successful:', response);
          alert('Payment Successful!');
          navigate('/subscription/current');
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          alert('Payment failed. Please try again.');
          setLoading(false);
        }
      });

    } catch (error) {
      console.error('Subscription error:', error);
      alert(error.response?.data?.message || 'Failed to create subscription');
      setLoading(false);
    }
  };

  // Show spinner while auth context is initializing
  if (isLoading || fetchingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
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
              <h1 className="text-2xl font-bold text-gray-900">
                Stock Management
              </h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hi, {user.name || user.role}</span>
              {currentPlan && (
                <button
                  onClick={() => navigate('/subscription/current')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  My Subscription
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the plan that best fits your stock management needs.
            Upgrade or downgrade anytime.
          </p>

          {currentPlan && (
            <div className="mt-8 inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-xl shadow-sm">
              <span className="text-sm font-medium">Your current plan:</span>
              <span className="font-bold text-lg">{currentPlan}</span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentPlan === plan.name}
              isRecommended={plan.recommended}
              onSubscribe={handleSubscribe}
              loading={loading}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            All Plans Include
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">24/7 Support</h4>
              <p className="text-sm text-gray-600">Round-the-clock customer assistance</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Secure Data</h4>
              <p className="text-sm text-gray-600">Enterprise-grade security</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Auto Updates</h4>
              <p className="text-sm text-gray-600">Latest features automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}