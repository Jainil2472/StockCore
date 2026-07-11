// pages/TransactionsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Package, ArrowUp, ArrowDown, Clock, CheckCircle, XCircle,
  Search, Filter, Calendar, User, Warehouse, ChevronDown,
  AlertCircle, Loader
} from 'lucide-react';
import { transactionApi } from '@/api/transactionapi.jsx';

// ============================================================================
// FILTER DROPDOWN COMPONENT
// ============================================================================

function FilterDropdown({ selectedFilter, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const filters = [
    { value: 'ALL', label: 'All Transactions' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  const handleSelect = (filter) => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  const selectedLabel = filters.find(f => f.value === selectedFilter)?.label || 'All Transactions';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-900">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {filters.map((filter, index) => (
            <button
              key={filter.value}
              onClick={() => handleSelect(filter.value)}
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

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

function StatusBadge({ status }) {
  const statusConfig = {
    APPROVED: {
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-800',
      label: 'Approved'
    },
    PENDING: {
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Pending'
    },
    REJECTED: {
      icon: XCircle,
      color: 'bg-red-100 text-red-800',
      label: 'Rejected'
    }
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ============================================================================
// TYPE BADGE COMPONENT
// ============================================================================

function TypeBadge({ type }) {
  const isStockIn = type === 'IN';

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
      isStockIn ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
    }`}>
      {isStockIn ? (
        <ArrowUp className="w-3 h-3" />
      ) : (
        <ArrowDown className="w-3 h-3" />
      )}
      {isStockIn ? 'Stock In' : 'Stock Out'}
    </span>
  );
}

// ============================================================================
// TRANSACTIONS TABLE COMPONENT
// ============================================================================

function TransactionsTable({ transactions, searchTerm, statusFilter }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 10;

  // Filter transactions with null safety
  const filteredTransactions = transactions.filter(transaction => {
    const productName = transaction.productName || '';
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort by date
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  // Format date with null safety
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (filteredTransactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-500 mb-1">
            {searchTerm || statusFilter !== 'ALL' ? 'No transactions found' : 'No transactions yet'}
          </p>
          <p className="text-sm text-gray-400">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filters' 
              : 'Transaction history will appear here'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Warehouse
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                >
                  Date & Time
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    sortOrder === 'asc' ? 'rotate-180' : ''
                  }`} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentTransactions.map((transaction, index) => (
              <tr key={transaction.id || index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      {transaction.productName || 'Unknown Product'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {transaction.warehouseName || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <TypeBadge type={transaction.type || 'IN'} />
                </td>
                <td className="px-6 py-4">
                  <span className={`text-lg font-bold ${
                    transaction.type === 'IN' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'IN' ? '+' : '-'}
                    {transaction.quantity || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={transaction.status || 'PENDING'} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {transaction.createdBy || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {formatDate(transaction.createdAt)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, sortedTransactions.length)} of {sortedTransactions.length} transactions
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow'
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN TRANSACTIONS PAGE
// ============================================================================

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await transactionApi.getTransactions();
      console.log('🔍 DEBUG - Raw API data:', data); // DEBUG LOG
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CRITICAL: Calculate stats EXCLUDING REJECTED transactions
  // ============================================================================
  const totalTransactions = transactions.length;
  const approvedCount = transactions.filter(t => t.status === 'APPROVED').length;
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const rejectedCount = transactions.filter(t => t.status === 'REJECTED').length;
  
  // Stock In: Count ONLY APPROVED and PENDING (EXCLUDE REJECTED)
  const totalStockIn = transactions
    .filter(t => {
      const isStockIn = t.type === 'IN';
      const isNotRejected = t.status !== 'REJECTED';
      return isStockIn && isNotRejected;
    })
    .reduce((sum, t) => sum + (t.quantity || 0), 0);
  
  // Stock Out: Count ONLY APPROVED and PENDING (EXCLUDE REJECTED)
  const totalStockOut = transactions
    .filter(t => {
      const isStockOut = t.type === 'OUT';
      const isNotRejected = t.status !== 'REJECTED';
      return isStockOut && isNotRejected;
    })
    .reduce((sum, t) => sum + (t.quantity || 0), 0);

  // DEBUG: Log the calculations
  console.log('📊 DEBUG - Stats Calculation:');
  console.log('Total transactions:', totalTransactions);
  console.log('Approved:', approvedCount);
  console.log('Pending:', pendingCount);
  console.log('Rejected:', rejectedCount);
  console.log('Stock IN (excl rejected):', totalStockIn);
  console.log('Stock OUT (excl rejected):', totalStockOut);
  
  // Show which transactions are being counted
  console.log('Stock IN transactions:', transactions.filter(t => t.type === 'IN' && t.status !== 'REJECTED'));
  console.log('Stock OUT transactions:', transactions.filter(t => t.type === 'OUT' && t.status !== 'REJECTED'));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
                <p className="text-gray-500">View all stock activity in the system</p>
              </div>
            </div>

            <FilterDropdown
              selectedFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />
          </div>

          {/* Stats Cards - 5 cards total */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Approved */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Stock In - EXCLUDES REJECTED */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock In</p>
                  <p className="text-2xl font-bold text-emerald-600">+{totalStockIn}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Excl. Rejected</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <ArrowUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Stock Out - EXCLUDES REJECTED */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock Out</p>
                  <p className="text-2xl font-bold text-red-600">-{totalStockOut}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Excl. Rejected</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">{error}</p>
              <p className="text-sm text-yellow-700 mt-1">Check browser console for details</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions by product name..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <TransactionsTable
          transactions={transactions}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  );
}