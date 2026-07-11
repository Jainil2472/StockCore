// components/UsageBar.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function UsageBar({ label, current, limit, icon: Icon, color = 'blue' }) {
  const percentage = limit === 'Unlimited' ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      fill: 'bg-blue-600',
      text: 'text-blue-600',
      icon: 'bg-blue-100 text-blue-600',
      warning: 'bg-orange-100 text-orange-600'
    },
    purple: {
      bg: 'bg-purple-100',
      fill: 'bg-purple-600',
      text: 'text-purple-600',
      icon: 'bg-purple-100 text-purple-600',
      warning: 'bg-orange-100 text-orange-600'
    },
    green: {
      bg: 'bg-green-100',
      fill: 'bg-green-600',
      text: 'text-green-600',
      icon: 'bg-green-100 text-green-600',
      warning: 'bg-orange-100 text-orange-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const displayColor = isAtLimit || isNearLimit ? colors.warning : colors.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${displayColor} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {current} <span className="text-sm text-gray-500">/ {limit === 'Unlimited' ? '∞' : limit}</span>
            </p>
          </div>
        </div>

        {(isNearLimit || isAtLimit) && limit !== 'Unlimited' && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            isAtLimit 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-orange-100 text-orange-700 border border-orange-300'
          }`}>
            {isAtLimit ? 'Limit Reached' : 'Near Limit'}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {limit !== 'Unlimited' && (
        <div className="mb-3">
          <div className={`w-full h-4 ${colors.bg} rounded-full overflow-hidden`}>
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isAtLimit ? 'bg-red-600' : isNearLimit ? 'bg-orange-500' : colors.fill
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">
              {percentage.toFixed(0)}% used
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {limit - current} remaining
            </span>
          </div>
        </div>
      )}

      {/* Warning Message */}
      {isAtLimit && limit !== 'Unlimited' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              You've reached your limit. Upgrade to add more {label.toLowerCase()}.
            </p>
          </div>
        </div>
      )}

      {isNearLimit && !isAtLimit && limit !== 'Unlimited' && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800">
              You're using over 80% of your limit. Consider upgrading soon.
            </p>
          </div>
        </div>
      )}

      {/* Unlimited Badge */}
      {limit === 'Unlimited' && (
        <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">Unlimited Access</span>
        </div>
      )}
    </div>
  );
}