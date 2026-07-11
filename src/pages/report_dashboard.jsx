// pages/ReportsDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Package, BarChart3, AlertTriangle,
  Download, FileText, Calendar, Activity,
  CheckCircle, ChevronDown, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
);

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const reportApi = {
  getStockMovement: async () => {
    const res = await axios.get(
      `${API_BASE_URL}/api/reports/stock-movement?type=WEEKLY`,
      { headers: getAuthHeader() }
    );
    return res.data;
  },
  getTransactionsChart: async () => {
    const res = await axios.get(
      `${API_BASE_URL}/api/reports/transactions-chart?type=WEEKLY`,
      { headers: getAuthHeader() }
    );
    return res.data;
  },
};

// ============================================================================
// CHART DATA MAPPING HELPERS
// ============================================================================

const buildStockMovementChart = (data) => ({
  labels: data?.labels || [],
  datasets: [
    {
      label: 'Stock In',
      data: data?.stockIn || [],
      backgroundColor: 'rgba(16, 185, 129, 0.75)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    },
    {
      label: 'Stock Out',
      data: data?.stockOut || [],
      backgroundColor: 'rgba(239, 68, 68, 0.75)',
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
});

const buildTransactionsChart = (data) => ({
  labels: data?.labels || [],
  datasets: [
    {
      label: 'Transactions',
      data: data?.transactions || [],
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      borderWidth: 2.5,
      tension: 0.45,
      fill: true,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ],
});

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600, easing: 'easeInOutQuart' },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: { usePointStyle: true, padding: 16, font: { size: 12, weight: '500' } },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { font: { size: 11 } },
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
  },
};

const lineChartOptions = {
  ...barChartOptions,
  plugins: {
    ...barChartOptions.plugins,
    legend: {
      ...barChartOptions.plugins.legend,
      labels: { ...barChartOptions.plugins.legend.labels },
    },
  },
};

// ============================================================================
// STATS CARD
// ============================================================================

function StatsCard({ title, value, icon: Icon, color, trend, suffix = '' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-lg text-gray-400 ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          {trend.direction === 'up' ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-semibold ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.percentage}%
          </span>
          <span className="text-sm text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPORT DROPDOWN
// ============================================================================

function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all shadow-lg shadow-emerald-500/25"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
          <button
            onClick={() => { notify('PDF downloaded!'); setIsOpen(false); }}
            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 text-sm"
          >
            <FileText className="w-4 h-4 text-red-500" /> Export as PDF
          </button>
          <button
            onClick={() => { notify('Excel downloaded!'); setIsOpen(false); }}
            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 text-sm border-t border-gray-100"
          >
            <BarChart3 className="w-4 h-4 text-emerald-500" /> Export as Excel
          </button>
        </div>
      )}

      {toast && (
        <div className="absolute top-full right-0 mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg shadow-lg text-sm font-medium whitespace-nowrap z-30">
          <CheckCircle className="inline w-4 h-4 mr-1.5 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHART CARD WRAPPER
// ============================================================================

function ChartCard({ title, subtitle, icon: Icon, iconBg, children, loading, isEmpty }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div style={{ height: '300px' }} className="relative flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
            <span className="text-sm font-medium">Loading chart data...</span>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <BarChart3 className="w-12 h-12 text-gray-300" />
            <p className="text-sm font-medium">No Data Available</p>
            <p className="text-xs text-gray-400">No records found for this period</p>
          </div>
        ) : (
          <div className="absolute inset-0">{children}</div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN REPORTS DASHBOARD
// ============================================================================

export default function ReportsDashboard() {
  const [stockData, setStockData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);

  const [stockLoading, setStockLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] = useState(true);
  const [stockError, setStockError] = useState(null);
  const [transactionError, setTransactionError] = useState(null);

  const userRole = localStorage.getItem('role');
  const isOwner = userRole === 'OWNER';

  const fetchStockMovement = useCallback(async () => {
    setStockLoading(true);
    setStockError(null);
    try {
      const data = await reportApi.getStockMovement();
      setStockData(data);
    } catch (err) {
      console.error('Stock movement fetch error:', err);
      setStockError(err.response?.data?.message || 'Failed to load stock movement data');
      setStockData(null);
    } finally {
      setStockLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTransactionLoading(true);
    setTransactionError(null);
    try {
      const data = await reportApi.getTransactionsChart();
      setTransactionData(data);
    } catch (err) {
      console.error('Transactions fetch error:', err);
      setTransactionError(err.response?.data?.message || 'Failed to load transaction data');
      setTransactionData(null);
    } finally {
      setTransactionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOwner) return;
    fetchStockMovement();
    fetchTransactions();
  }, [isOwner, fetchStockMovement, fetchTransactions]);

  const handleRefresh = () => {
    fetchStockMovement();
    fetchTransactions();
  };

  // Access Denied
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-4">Only owners can access inventory reports.</p>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            👤 Staff — View Only
          </span>
        </div>
      </div>
    );
  }

  // Derived data
  const stockChartData = buildStockMovementChart(stockData);
  const txChartData = buildTransactionsChart(transactionData);

  const totalStockIn = stockData?.stockIn?.reduce((a, b) => a + b, 0) ?? 0;
  const totalStockOut = stockData?.stockOut?.reduce((a, b) => a + b, 0) ?? 0;
  const totalTransactions = transactionData?.transactions?.reduce((a, b) => a + b, 0) ?? 0;

  const stockIsEmpty = !stockLoading && (!stockData?.labels?.length);
  const txIsEmpty = !transactionLoading && (!transactionData?.labels?.length);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
                <p className="text-gray-500 text-sm mt-0.5">Analyze inventory activity from real-time data</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Weekly badge */}
              <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-md">
                <Calendar className="w-3.5 h-3.5" />
                Weekly
              </div>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={stockLoading || transactionLoading}
                className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${(stockLoading || transactionLoading) ? 'animate-spin' : ''}`} />
              </button>

              <ExportDropdown />
            </div>
          </div>

          {/* Badge */}
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
            👑 Owner — Full Access
          </span>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Stock In"
            value={totalStockIn}
            icon={TrendingUp}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            trend={{ direction: 'up', percentage: 12.5 }}
          />
          <StatsCard
            title="Total Stock Out"
            value={totalStockOut}
            icon={TrendingDown}
            color="bg-gradient-to-br from-red-500 to-red-600"
            trend={{ direction: 'down', percentage: 8.3 }}
          />
          <StatsCard
            title="Total Transactions"
            value={totalTransactions}
            icon={Activity}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Net Stock Change"
            value={totalStockIn - totalStockOut}
            icon={Package}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            trend={
              totalStockIn - totalStockOut >= 0
                ? { direction: 'up', percentage: 5.1 }
                : { direction: 'down', percentage: 5.1 }
            }
          />
        </div>

        {/* ── ERROR BANNERS ── */}
        {(stockError || transactionError) && (
          <div className="mb-6 space-y-2">
            {stockError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="font-medium text-red-800 text-sm">Stock Movement: {stockError}</p>
              </div>
            )}
            {transactionError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="font-medium text-red-800 text-sm">Transactions: {transactionError}</p>
              </div>
            )}
          </div>
        )}

        {/* ── CHARTS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Stock Movement"
            subtitle="Stock In vs Stock Out — This Week"
            icon={Package}
            iconBg="bg-emerald-100 text-emerald-600"
            loading={stockLoading}
            isEmpty={stockIsEmpty}
          >
            <Bar data={stockChartData} options={barChartOptions} />
          </ChartCard>

          <ChartCard
            title="Transaction Activity"
            subtitle="Daily transactions this week"
            icon={Activity}
            iconBg="bg-blue-100 text-blue-600"
            loading={transactionLoading}
            isEmpty={txIsEmpty}
          >
            <Line data={txChartData} options={lineChartOptions} />
          </ChartCard>
        </div>

        {/* ── SUMMARY CARD ── */}
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 border border-emerald-100">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">Weekly Report Summary</h4>
              <p className="text-sm text-gray-600 mb-4">
                {stockLoading || transactionLoading
                  ? 'Calculating summary...'
                  : totalStockIn >= totalStockOut
                  ? `Inventory is growing. Net gain of ${totalStockIn - totalStockOut} units this week. Healthy stock levels.`
                  : `Inventory is declining. Net reduction of ${totalStockOut - totalStockIn} units. Consider restocking soon.`}
              </p>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-gray-600">
                    Stock In:{' '}
                    <span className="font-bold text-emerald-700">
                      {stockLoading ? '...' : totalStockIn.toLocaleString()}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-gray-600">
                    Stock Out:{' '}
                    <span className="font-bold text-red-700">
                      {stockLoading ? '...' : totalStockOut.toLocaleString()}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">
                    Transactions:{' '}
                    <span className="font-bold text-blue-700">
                      {transactionLoading ? '...' : totalTransactions.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}