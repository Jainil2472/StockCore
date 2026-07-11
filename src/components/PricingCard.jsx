// components/PricingCard.jsx
import React from 'react';
import { Check, Zap, Shield, Crown } from 'lucide-react';

const PLAN_ICONS = {
  BASIC: Shield,
  PLUS: Zap,
  PRO: Crown
};

const PLAN_COLORS = {
  BASIC: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    button: 'bg-gray-600 hover:bg-gray-700',
    accent: 'text-gray-600'
  },
  PLUS: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    button: 'bg-blue-600 hover:bg-blue-700',
    accent: 'text-blue-600'
  },
  PRO: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    button: 'bg-purple-600 hover:bg-purple-700',
    accent: 'text-purple-600'
  }
};

export default function PricingCard({ 
  plan, 
  isCurrentPlan, 
  isRecommended, 
  onSubscribe, 
  loading 
}) {
  const Icon = PLAN_ICONS[plan.name] || Shield;
  const colors = PLAN_COLORS[plan.name] || PLAN_COLORS.BASIC;

  return (
    <div className={`relative bg-white rounded-2xl border-2 ${
      isRecommended ? 'border-blue-500 shadow-2xl scale-105' : colors.border
    } p-8 transition-all duration-300 hover:shadow-xl ${
      isCurrentPlan ? 'ring-4 ring-green-200' : ''
    }`}>
      
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
            ⭐ Recommended
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            Current Plan
          </span>
        </div>
      )}

      {/* Plan Icon */}
      <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-6`}>
        <Icon className={`w-8 h-8 ${colors.accent}`} />
      </div>

      {/* Plan Name */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {plan.name}
      </h3>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-900">
            ₹{plan.price}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-600">/month</span>
          )}
        </div>
        {plan.price === 0 && (
          <p className="text-green-600 text-sm font-semibold mt-2">
            Free Forever
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-8">
        <li className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-gray-900 font-semibold">
              {plan.features.products === 'Unlimited' ? 'Unlimited' : plan.features.products} Products
            </p>
            <p className="text-sm text-gray-600">
              {plan.features.products === 'Unlimited' ? 'No limits' : `Up to ${plan.features.products} products`}
            </p>
          </div>
        </li>

        <li className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-gray-900 font-semibold">
              {plan.features.staff === 'Unlimited' ? 'Unlimited' : plan.features.staff} Staff Members
            </p>
            <p className="text-sm text-gray-600">
              {plan.features.staff === 'Unlimited' ? 'No limits' : `Up to ${plan.features.staff} staff`}
            </p>
          </div>
        </li>

        <li className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-gray-900 font-semibold">
              {plan.features.warehouses === 'Unlimited' ? 'Unlimited' : plan.features.warehouses} Warehouses
            </p>
            <p className="text-sm text-gray-600">
              {plan.features.warehouses === 'Unlimited' ? 'No limits' : `Up to ${plan.features.warehouses} warehouses`}
            </p>
          </div>
        </li>
      </ul>

      {/* Subscribe Button */}
      <button
        onClick={() => onSubscribe(plan)}
        disabled={loading || isCurrentPlan}
        className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          isCurrentPlan 
            ? 'bg-gray-400 cursor-not-allowed' 
            : colors.button
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : (
          `Subscribe to ${plan.name}`
        )}
      </button>
    </div>
  );
}