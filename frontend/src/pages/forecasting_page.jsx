// pages/ForecastDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Package, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Search, Filter, ChevronDown, Loader, TrendingDown,
  Activity, Clock, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function StatusBadge({ status }) {
  const config = {
    SAFE: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Safe' },
    LOW: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Low' },
    CRITICAL: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Critical' }
  };

  const { color, icon: Icon, label } = config[status] || config.SAFE;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function SpeedBadge({ speed }) {
  const config = {
    FAST: { color: 'bg-emerald-100 text-emerald-800', icon: TrendingUp, label: 'Fast Moving' },
    MEDIUM: { color: 'bg-blue-100 text-blue-800', icon: Activity, label: 'Medium' },
    SLOW: { color: 'bg-yellow-100 text-yellow-800', icon: TrendingDown, label: 'Slow Moving' },
    DEAD: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Dead Stock' }
  };

  const { color, icon: Icon, label } = config[speed] || config.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function ForecastCard({ item }) {
  const isCritical = item.status === 'CRITICAL';

  return (
    <div className={`bg-white rounded-xl border-2 ${
      isCritical ? 'border-red-300 shadow-lg shadow-red-100' : 'border-gray-200'
    } p-6 hover:shadow-xl transition-all duration-300 group`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
            {item.productName}
          </h3>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={item.status} />
            <SpeedBadge speed={item.speed} />
            {item.overStock && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <AlertTriangle className="w-3 h-3" />
                Overstock
              </span>
            )}
          </div>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Current Stock</p>
          <p className="text-xl font-bold text-gray-900">{item.currentStock}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Avg Daily Usage</p>
          <p className="text-xl font-bold text-gray-900">{item.avgDailyUsage}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Days Left</p>
          <p className={`text-xl font-bold ${
            item.daysLeft <= 7 ? 'text-red-600' : 
            item.daysLeft <= 14 ? 'text-yellow-600' : 
            'text-emerald-600'
          }`}>
            {item.daysLeft}
            <span className="text-sm text-gray-500 ml-1">days</span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Reorder Point</p>
          <p className="text-xl font-bold text-gray-900">{item.reorderPoint}</p>
        </div>
      </div>

      {/* Suggested Restock */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-700 mb-1">Suggested Restock</p>
            <p className="text-2xl font-bold text-emerald-900">{item.suggestedRestock} units</p>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">{item.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({ selectedFilter, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const filters = [
    { value: 'ALL', label: 'All Products' },
    { value: 'SAFE', label: 'Safe' },
    { value: 'LOW', label: 'Low Stock' },
    { value: 'CRITICAL', label: 'Critical' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-900">{filters.find(f => f.value === selectedFilter)?.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {filters.map((filter, index) => (
            <button
              key={filter.value}
              onClick={() => {
                onFilterChange(filter.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                selectedFilter === filter.value ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${index === filters.length - 1 ? 'rounded-b-lg' : ''}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortDropdown({ selectedSort, onSortChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'daysLeft', label: 'Days Left (Low to High)' },
    { value: 'stock', label: 'Stock Level (Low to High)' },
    { value: 'usage', label: 'Daily Usage (High to Low)' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Activity className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-900">Sort by</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {sortOptions.map((option, index) => (
            <button
              key={option.value}
              onClick={() => {
                onSortChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                selectedSort === option.value ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${index === sortOptions.length - 1 ? 'rounded-b-lg' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ForecastDashboard() {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('daysLeft');

  useEffect(() => {
    fetchForecastData();
  }, []);

  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get('/api/forecast');
      setForecastData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching forecast data:', err);
      setError(err.response?.data?.message || 'Failed to load forecast data');
      
      // Mock data
      setForecastData([
        {
          productName: 'iPhone 15 Pro',
          currentStock: 15,
          avgDailyUsage: 3,
          daysLeft: 5,
          status: 'CRITICAL',
          speed: 'FAST',
          overStock: false,
          reorderPoint: 20,
          suggestedRestock: 50,
          recommendation: 'Order immediately! Stock will run out in 5 days based on current usage.'
        },
        {
          productName: 'Samsung Galaxy S24',
          currentStock: 45,
          avgDailyUsage: 2,
          daysLeft: 22,
          status: 'SAFE',
          speed: 'MEDIUM',
          overStock: false,
          reorderPoint: 25,
          suggestedRestock: 30,
          recommendation: 'Stock is sufficient for the next 3 weeks. Monitor usage trends.'
        },
        {
          productName: 'MacBook Pro M3',
          currentStock: 8,
          avgDailyUsage: 1,
          daysLeft: 8,
          status: 'LOW',
          speed: 'SLOW',
          overStock: false,
          reorderPoint: 10,
          suggestedRestock: 15,
          recommendation: 'Consider restocking soon to maintain optimal inventory levels.'
        },
        {
          productName: 'iPad Air',
          currentStock: 150,
          avgDailyUsage: 1,
          daysLeft: 150,
          status: 'SAFE',
          speed: 'DEAD',
          overStock: true,
          reorderPoint: 15,
          suggestedRestock: 0,
          recommendation: 'Overstock detected! Slow down purchasing and focus on selling existing inventory.'
        },
        {
          productName: 'AirPods Pro',
          currentStock: 35,
          avgDailyUsage: 5,
          daysLeft: 7,
          status: 'CRITICAL',
          speed: 'FAST',
          overStock: false,
          reorderPoint: 30,
          suggestedRestock: 60,
          recommendation: 'High demand product running low. Place urgent order to avoid stockout.'
        },
        {
          productName: 'Apple Watch Series 9',
          currentStock: 28,
          avgDailyUsage: 2,
          daysLeft: 14,
          status: 'LOW',
          speed: 'MEDIUM',
          overStock: false,
          reorderPoint: 20,
          suggestedRestock: 25,
          recommendation: 'Stock approaching reorder point. Plan procurement within 2 weeks.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredData = forecastData
    .filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'daysLeft':
          return a.daysLeft - b.daysLeft;
        case 'stock':
          return a.currentStock - b.currentStock;
        case 'usage':
          return b.avgDailyUsage - a.avgDailyUsage;
        default:
          return 0;
      }
    });

  // Calculate summary stats
  const criticalCount = forecastData.filter(item => item.status === 'CRITICAL').length;
  const lowCount = forecastData.filter(item => item.status === 'LOW').length;
  const overstockCount = forecastData.filter(item => item.overStock).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading forecast insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Forecast Insights</h1>
              <p className="text-gray-500">Smart inventory predictions & recommendations</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{forecastData.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Critical Items</p>
                  <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowCount}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overstock</p>
                  <p className="text-2xl font-bold text-orange-600">{overstockCount}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">{error}</p>
              <p className="text-sm text-yellow-700 mt-1">Showing demo data for preview</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-3">
            <FilterDropdown
              selectedFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />
            <SortDropdown
              selectedSort={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </div>

        {/* Cards Grid */}
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-500 mb-1">No products found</p>
            <p className="text-sm text-gray-400">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'No forecast data available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item, index) => (
              <ForecastCard key={index} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}