// pages/MainDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Package, Users, Warehouse, TrendingUp, TrendingDown,
  IndianRupee, Activity, AlertCircle, CheckCircle
} from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from '@/context/AuthContext';

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================
function StatsCard({ title, value, change, icon: Icon, color, trend }) {
  const isPositive = trend === 'up';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {change}%
          </span>
          <span className="text-sm text-gray-500">vs last month</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================
export default function MainDashboard() {
  const { user } = useAuth(); // ✅ get user from context

  const [stats, setStats] = useState({
    totalProducts:  0,
    totalStaff:     0,
    totalWarehouses: 0,
    totalValue:     0,
    productsChange: 0,
    staffChange:    0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ✅ Get display info from context — no localStorage calls
  const companyName = user?.companyName || 'Stock Core';
  const displayName = user?.name || user?.email || 'User';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Only call the ONE API that actually exists
      const response = await axiosInstance.get("/api/dashboard/stats");
      console.log("✅ Dashboard stats:", response.data);
      setStats(response.data);
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-gray-700 font-medium">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold text-gray-800">{displayName}</span>!
            Here's what's happening with <span className="font-semibold text-gray-800">{companyName}</span> today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Products"
            value={(stats?.totalProducts ?? 0).toLocaleString()}
            change={stats?.productsChange}
            icon={Package}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            trend="up"
          />
          <StatsCard
            title="Total Staff"
            value={stats?.totalStaff ?? 0}
            change={stats?.staffChange}
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend="up"
          />
          <StatsCard
            title="Warehouses"
            value={stats?.totalWarehouses ?? 0}
            icon={Warehouse}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatsCard
            title="Total Value"
            value={`₹${((stats?.totalValue ?? 0) / 1000000).toFixed(2)}M`}
            icon={IndianRupee}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
          <StatsCard
  title="Total Stock"
  value={stats?.totalStock ?? 0}
  icon={Package}
  color="bg-gradient-to-br from-indigo-500 to-indigo-600"
/>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity — Coming Soon */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Coming Soon</p>
              <p className="text-gray-400 text-sm mt-1">
                Activity tracking will be available in the next update
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">API Server</p>
                    <p className="text-xs text-gray-500">All systems operational</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Database</p>
                    <p className="text-xs text-gray-500">Connected and responsive</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                  Healthy
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Authentication</p>
                    <p className="text-xs text-gray-500">JWT tokens active</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Storage Monitor</p>
                    <p className="text-xs text-gray-500">Coming in next update</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Soon
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}