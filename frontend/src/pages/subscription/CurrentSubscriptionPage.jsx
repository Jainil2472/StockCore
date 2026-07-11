// pages/CurrentSubscriptionPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Calendar, CheckCircle, XCircle, Loader, TrendingUp, Settings } from 'lucide-react';
import { subscriptionAPI } from '@/api/subscriptionApi.jsx';
import { useAuth } from '@/context/AuthContext';

export default function CurrentSubscriptionPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth(); // ✅ use context instead of localStorage
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login_signup');
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const data = await subscriptionAPI.getCurrentSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      alert('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setCanceling(true);
    try {
      await subscriptionAPI.cancelSubscription();
      alert('Subscription cancelled successfully');
      fetchSubscription();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show spinner while auth context is initializing or fetching
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
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
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
            <p className="text-gray-600 mb-8 text-lg">
              You don't have an active subscription. Choose a plan to get started.
            </p>
            <button
              onClick={() => navigate('/subscription')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              View Subscription Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = subscription.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
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

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hi, {user.name || user.role}</span>
              <button
                onClick={() => navigate('/subscription/usage')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
              >
                View Usage
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Current Subscription</h1>
          <p className="text-gray-600 text-lg">Manage your subscription and billing details</p>
        </div>

        {/* Subscription Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{subscription.plan} Plan</h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2">
                {isActive ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-300">ACTIVE</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-300">CANCELLED</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/subscription')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              <Settings className="w-5 h-5" />
              Change Plan
            </button>
          </div>

          {/* Subscription Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="text-xl font-bold text-gray-900">{formatDate(subscription.startDate)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="text-xl font-bold text-gray-900">{formatDate(subscription.endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Features */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Plan Includes</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-medium">
                  {subscription.plan === 'PRO' ? 'Unlimited' : subscription.plan === 'PLUS' ? '500' : '50'} Products
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-medium">
                  {subscription.plan === 'PRO' ? 'Unlimited' : subscription.plan === 'PLUS' ? '10' : '2'} Staff
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-medium">
                  {subscription.plan === 'PRO' ? 'Unlimited' : subscription.plan === 'PLUS' ? '5' : '1'} Warehouses
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/subscription/usage')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              <TrendingUp className="w-5 h-5" />
              View Usage Dashboard
            </button>

            <button
              onClick={handleCancelSubscription}
              disabled={canceling || !isActive}
              className="px-6 py-4 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canceling ? (
                <span className="flex items-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Canceling...
                </span>
              ) : (
                'Cancel Subscription'
              )}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-700 text-sm">
            Contact our support team at support@stockmanagement.com or visit our help center for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}