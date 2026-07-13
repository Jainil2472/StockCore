// pages/StaffStockRequestPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus, Minus, Package, Warehouse, AlertCircle, CheckCircle,
  TrendingUp, TrendingDown, Send, Sliders, Loader2
} from 'lucide-react';
import axios from 'axios';

// ============================================================================
// API SERVICE (INLINE)
// ============================================================================

import { API_BASE_URL } from '@/api/apiConfig';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const stockRequestApi = {
  requestStockIn: async (data) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/stock/request-in`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  requestStockOut: async (data) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/stock/request-out`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getProducts: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/products`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getWarehouses: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/warehouses`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // ── NEW ─────────────────────────────────────────────────────────────────
  getProductById: async (productId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/products/by-id/${productId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

// ============================================================================
// ATTRIBUTE CHIPS CARD (NEW COMPONENT)
// ============================================================================

/**
 * Renders a card with key → value attribute chips.
 * Shown below the product dropdown after a product is selected.
 *
 * States:
 *  - loading   → spinner row
 *  - no attrs  → "no attributes" note
 *  - has attrs → chip grid
 */
function ProductAttributesCard({ attributes, loading, productSelected }) {
  // Nothing to show until a product is picked
  if (!productSelected) return null;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-200">
        <Sliders className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Product attributes
        </span>
      </div>

      <div className="px-4 py-3">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin flex-shrink-0" />
            <span className="text-sm text-gray-400">Loading attributes…</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && Object.keys(attributes).length === 0 && (
          <p className="text-sm text-gray-400">
            No attributes defined for this product.
          </p>
        )}

        {/* Attribute chips */}
        {!loading && Object.keys(attributes).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(attributes).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  bg-white border border-gray-200 text-sm"
              >
                {/* Key label */}
                <span className="text-gray-400 capitalize font-normal">{key}</span>
                {/* Arrow separator */}
                <span className="text-gray-300 text-xs">→</span>
                {/* Value */}
                <span className="text-gray-800 font-semibold">{value}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN STAFF STOCK REQUEST PAGE
// ============================================================================

export default function StaffStockRequestPage() {
  const [transactionType, setTransactionType] = useState('IN');
  const [products, setProducts]   = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData]   = useState({
    productId:   '',
    warehouseId: '',
    quantity:    ''
  });
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState({});
  const [notification, setNotification] = useState(null);

  // ── NEW: attribute state ──────────────────────────────────────────────────
  const [selectedProductAttributes, setSelectedProductAttributes] = useState({});
  const [loadingAttributes, setLoadingAttributes]                 = useState(false);

  // Role guard
  const userRole  = localStorage.getItem('role');
  const isAllowed = userRole === 'STAFF' || userRole === 'OWNER';

  useEffect(() => {
    if (isAllowed) {
      fetchProducts();
      fetchWarehouses();
    }
  }, [isAllowed]);

  // ── Data fetchers ─────────────────────────────────────────────────────────

  const fetchProducts = async () => {
    try {
      const data = await stockRequestApi.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await stockRequestApi.getWarehouses();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  // ── NEW: fetch attributes whenever a product is chosen ────────────────────

  const fetchProductAttributes = async (productId) => {
    // Clear stale attributes immediately so nothing bleeds across selections
    setSelectedProductAttributes({});

    if (!productId) return;

    setLoadingAttributes(true);
    try {
      const data = await stockRequestApi.getProductById(productId);
      // Safely fall back to empty object if the key is missing
      setSelectedProductAttributes(
        data?.attributes && typeof data.attributes === 'object'
          ? data.attributes
          : {}
      );
    } catch (error) {
      console.error('Error fetching product attributes:', error);
      setSelectedProductAttributes({});
    } finally {
      setLoadingAttributes(false);
    }
  };

  // ── Notifications ─────────────────────────────────────────────────────────

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productId)
      newErrors.productId   = 'Please select a product';
    if (!formData.warehouseId)
      newErrors.warehouseId = 'Please select a warehouse';
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity    = 'Quantity must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Form submission ───────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const requestData = {
        productId:   formData.productId,
        warehouseId: formData.warehouseId,
        quantity:    parseInt(formData.quantity)
      };

      if (transactionType === 'IN') {
        await stockRequestApi.requestStockIn(requestData);
      } else {
        await stockRequestApi.requestStockOut(requestData);
      }

      // Reset form AND clear attributes on success
      setFormData({ productId: '', warehouseId: '', quantity: '' });
      setSelectedProductAttributes({});
      setErrors({});
      showNotification(
        `Stock ${transactionType} request submitted successfully! Awaiting owner approval.`,
        'success'
      );
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message ||
          `Failed to submit stock ${transactionType} request`
      });
    } finally {
      setLoading(false);
    }
  };

  // ── MODIFIED: handleInputChange — triggers attribute fetch on product pick ─

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-level error as user corrects it
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Fetch attributes whenever the product selection changes
    if (name === 'productId') {
      fetchProductAttributes(value);
    }
  };

  // ── Access guard ──────────────────────────────────────────────────────────

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            This page is only accessible to staff and owners.
          </p>
          <p className="text-sm text-gray-500">
            Only users with{' '}
            <span className="font-semibold text-gray-700">STAFF</span> or{' '}
            <span className="font-semibold text-gray-700">OWNER</span> role
            can submit stock requests.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Request</h1>
              <p className="text-gray-500">Submit stock transaction request for approval</p>
            </div>
          </div>

          {/* Role badge */}
          <div className="mt-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              userRole === 'OWNER'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {userRole === 'OWNER' ? '👑' : '👤'} {userRole}
            </span>
          </div>
        </div>

        {/* Toast notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-slide-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {notification.type === 'success'
              ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
            <p className={`font-medium ${
              notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
        )}

        {/* Request Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Request Stock Transaction
          </h2>

          {/* Transaction type toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransactionType('IN')}
                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  transactionType === 'IN'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'border-2 border-gray-200 text-gray-700 hover:border-emerald-300'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Stock IN
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('OUT')}
                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  transactionType === 'OUT'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                    : 'border-2 border-gray-200 text-gray-700 hover:border-red-300'
                }`}
              >
                <TrendingDown className="w-5 h-5" />
                Stock OUT
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Product dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  errors.productId ? 'border-red-300' : 'border-gray-200'
                } rounded-xl text-gray-900 focus:outline-none focus:ring-2
                  focus:ring-emerald-500 focus:border-transparent transition-all`}
                disabled={loading}
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.sku} – {product.name} – {product.brand?.name}
                  </option>
                ))}
              </select>
              {errors.productId && (
                <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
              )}
            </div>

            {/* ── PRODUCT ATTRIBUTES CARD ─────────────────────────────────── */}
            <ProductAttributesCard
              attributes={selectedProductAttributes}
              loading={loadingAttributes}
              productSelected={!!formData.productId}
            />

            {/* Warehouse dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse *
              </label>
              <select
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  errors.warehouseId ? 'border-red-300' : 'border-gray-200'
                } rounded-xl text-gray-900 focus:outline-none focus:ring-2
                  focus:ring-emerald-500 focus:border-transparent transition-all`}
                disabled={loading}
              >
                <option value="">Select a warehouse</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} – {warehouse.location}
                  </option>
                ))}
              </select>
              {errors.warehouseId && (
                <p className="mt-1 text-sm text-red-600">{errors.warehouseId}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  errors.quantity ? 'border-red-300' : 'border-gray-200'
                } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none
                  focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                placeholder="Enter quantity"
                disabled={loading}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Info box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ Your request will be sent to the owner for approval before stock is updated.
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || loadingAttributes}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 ${
                transactionType === 'IN'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-red-500    to-red-600    text-white hover:from-red-600    hover:to-red-700    shadow-lg shadow-red-500/25'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Request for Approval
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
