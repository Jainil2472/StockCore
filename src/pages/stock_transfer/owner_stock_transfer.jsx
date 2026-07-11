// pages/OwnerPendingTransactionsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  CheckCircle, AlertCircle, Package, Warehouse, User,
  Clock, TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, X
} from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from '@/context/AuthContext';

// ============================================================================
// API SERVICE
// ============================================================================
const pendingTransactionsApi = {
  getPending: async () => {
    const response = await axiosInstance.get("/api/stock/pending");
    return response.data;
  },

  approve: async (id) => {
    const response = await axiosInstance.post(`/api/stock/approve/${id}`, {});
    return response.data;
  },

  // ✅ NEW — reject API call
  reject: async (id) => {
    const response = await axiosInstance.post(`/api/stock/reject/${id}`, {});
    return response.data;
  }
};

// ============================================================================
// CONFIRM MODAL COMPONENT
// ============================================================================
function ConfirmModal({ isOpen, onClose, onConfirm, transaction, actionType }) {
  if (!isOpen || !transaction) return null;

  const isApprove = actionType === 'approve';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Modal Header */}
        <div className={`p-6 rounded-t-2xl ${isApprove ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isApprove ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {isApprove
                  ? <ThumbsUp className="w-6 h-6 text-emerald-600" />
                  : <ThumbsDown className="w-6 h-6 text-red-600" />
                }
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isApprove ? 'Approve Request' : 'Reject Request'}
                </h3>
                <p className={`text-sm ${isApprove ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isApprove ? 'This will update stock immediately' : 'This will cancel the request'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Body — transaction details */}
        <div className="p-6 space-y-3">
          <p className="text-gray-600 text-sm mb-4">
            Are you sure you want to <strong>{isApprove ? 'approve' : 'reject'}</strong> this stock request?
          </p>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Product</span>
              <span className="font-medium text-gray-900">{transaction.product?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">SKU</span>
              <span className="font-medium text-gray-900">{transaction.product?.sku || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Warehouse</span>
              <span className="font-medium text-gray-900">{transaction.warehouse?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Type</span>
              <span className={`font-semibold ${
                transaction.type === 'IN' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                Stock {transaction.type}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Quantity</span>
              <span className="font-bold text-gray-900">{transaction.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Requested By</span>
              <span className="font-medium text-gray-900">
                {transaction.createdBy?.name || transaction.createdBy?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              isApprove
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            }`}
          >
            {isApprove
              ? <><ThumbsUp className="w-4 h-4" /> Approve</>
              : <><ThumbsDown className="w-4 h-4" /> Reject</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PENDING TRANSACTIONS TABLE
// ============================================================================
function PendingTransactionsTable({ transactions, onApprove, onReject, loading }) {
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const sortedTransactions = React.useMemo(() => {
    if (!transactions) return [];
    let sortable = [...transactions];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [transactions, sortConfig]);

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500">Loading pending transactions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-16 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-500 mb-1">No pending requests</p>
          <p className="text-sm text-gray-400">All stock requests have been processed</p>
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('product')}>Product</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('warehouse')}>Warehouse</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('quantity')}>Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('createdBy')}>Requested By</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              {/* ✅ Actions column — wider to fit both buttons */}
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">

                {/* Product */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.product?.name}</div>
                      <div className="text-xs text-gray-500">{transaction.product?.sku}</div>
                    </div>
                  </div>
                </td>

                {/* Warehouse */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{transaction.warehouse?.name}</span>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4">
                  {transaction.type === 'IN' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <TrendingUp className="w-3 h-3" /> Stock IN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <TrendingDown className="w-3 h-3" /> Stock OUT
                    </span>
                  )}
                </td>

                {/* Quantity */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{transaction.quantity}</span>
                </td>

                {/* Created By */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {transaction.createdBy?.name || transaction.createdBy?.email}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                </td>

                {/* ✅ Actions — Approve + Reject buttons */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onApprove(transaction)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm font-medium"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(transaction)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm font-medium"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function OwnerPendingTransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [notification, setNotification]   = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Modal state
  const [modal, setModal] = useState({
    isOpen:     false,
    transaction: null,
    actionType:  null  // 'approve' | 'reject'
  });

  const userRole = user?.role;
  const isOwner  = userRole === 'OWNER';

  useEffect(() => {
    if (isOwner) fetchPendingTransactions();
  }, [isOwner]);

  const fetchPendingTransactions = async () => {
    setLoading(true);
    try {
      const data = await pendingTransactionsApi.getPending();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      showNotification('Failed to load pending transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ✅ Open modal instead of window.confirm
  const handleApprove = (transaction) => {
    setModal({ isOpen: true, transaction, actionType: 'approve' });
  };

  const handleReject = (transaction) => {
    setModal({ isOpen: true, transaction, actionType: 'reject' });
  };

  const closeModal = () => {
    setModal({ isOpen: false, transaction: null, actionType: null });
  };

  // ✅ Called when user confirms in modal
  const handleConfirm = async () => {
    const { transaction, actionType } = modal;
    closeModal();
    setActionLoading(true);

    try {
      if (actionType === 'approve') {
        await pendingTransactionsApi.approve(transaction.id);
        showNotification(`✅ Stock ${transaction.type} request approved successfully!`, 'success');
      } else {
        await pendingTransactionsApi.reject(transaction.id);
        showNotification(`❌ Stock ${transaction.type} request rejected.`, 'error');
      }
      fetchPendingTransactions(); // refresh list
    } catch (error) {
      console.error(`Error ${actionType}ing transaction:`, error);
      showNotification(
        error.response?.data?.message || `Failed to ${actionType} transaction`,
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">This page is only accessible to owners.</p>
          <p className="text-sm text-gray-500">
            Only users with <span className="font-semibold text-gray-700">OWNER</span> role can approve or reject stock requests.
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = transactions.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ✅ Confirm Modal */}
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        transaction={modal.transaction}
        actionType={modal.actionType}
      />

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pending Transactions</h1>
                <p className="text-gray-500">Review and approve or reject stock requests</p>
              </div>
            </div>
            <button
              onClick={fetchPendingTransactions}
              disabled={loading || actionLoading}
              className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Role Badge */}
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              👑 Owner
            </span>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock IN Requests</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {transactions.filter(t => t.type === 'IN').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock OUT Requests</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {transactions.filter(t => t.type === 'OUT').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {notification.type === 'success'
              ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            }
            <p className={`font-medium ${
              notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
        )}

        {/* Table */}
        <PendingTransactionsTable
          transactions={transactions}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading || actionLoading}
        />

      </div>
    </div>
  );
}