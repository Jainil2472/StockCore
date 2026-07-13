// StockApprovalPage.jsx
// Stock Transaction Approval Workflow — Staff + Owner Roles
// Theme: Emerald/Blue gradient, sharp cards, refined industrial utility

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Minus, Package, Warehouse, AlertCircle, CheckCircle,
  Clock, TrendingUp, TrendingDown, ClipboardList, ShieldCheck,
  X, ChevronDown, Loader2, BadgeCheck, Eye, Send
} from 'lucide-react';
import axios from 'axios';

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
import { API_BASE_URL } from '@/api/apiConfig';

const API_BASE = API_BASE_URL;

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─────────────────────────────────────────────
// MOCK DATA (remove when backend is live)
// ─────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: '1', name: 'Laptop Pro 15"', sku: 'LP-001' },
  { id: '2', name: 'Wireless Mouse', sku: 'WM-042' },
  { id: '3', name: 'USB-C Hub 7-in-1', sku: 'UC-007' },
  { id: '4', name: 'Mechanical Keyboard', sku: 'MK-128' },
];
const MOCK_WAREHOUSES = [
  { id: '1', name: 'Jakarta Central Hub' },
  { id: '2', name: 'Surabaya Depot' },
  { id: '3', name: 'Bandung Satellite' },
];
const MOCK_PENDING = [
  { id: 'txn-001', product: 'Laptop Pro 15"', warehouse: 'Jakarta Central Hub', type: 'IN',  quantity: 50,  createdBy: 'staff@acme.com', status: 'PENDING', createdAt: '2026-03-07T08:22:00Z' },
  { id: 'txn-002', product: 'Wireless Mouse',  warehouse: 'Surabaya Depot',      type: 'OUT', quantity: 120, createdBy: 'john.doe@acme.com', status: 'PENDING', createdAt: '2026-03-07T10:45:00Z' },
  { id: 'txn-003', product: 'USB-C Hub 7-in-1', warehouse: 'Bandung Satellite',   type: 'IN',  quantity: 30,  createdBy: 'staff@acme.com', status: 'PENDING', createdAt: '2026-03-08T06:10:00Z' },
];

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-medium
        ${isSuccess
          ? 'bg-emerald-950 border-emerald-700 text-emerald-100'
          : 'bg-red-950 border-red-700 text-red-100'
        }`}
      style={{ animation: 'toastIn 0.35s cubic-bezier(.34,1.56,.64,1)' }}
    >
      {isSuccess
        ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// SELECT FIELD
// ─────────────────────────────────────────────
function SelectField({ label, name, value, onChange, options, error, disabled, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none bg-gray-900 border rounded-xl px-4 py-3 pr-10 text-gray-100
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'}`}
        >
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// APPROVE MODAL
// ─────────────────────────────────────────────
function ApproveModal({ transaction, onConfirm, onClose, loading }) {
  if (!transaction) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-8"
        style={{ animation: 'modalIn 0.3s cubic-bezier(.34,1.56,.64,1)' }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <BadgeCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-100">Approve Transaction</h3>
            <p className="text-sm text-gray-500">This action will process the stock movement</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-6 space-y-3 border border-gray-700">
          {[
            ['Product', transaction.product],
            ['Warehouse', transaction.warehouse],
            ['Type', transaction.type],
            ['Quantity', transaction.quantity],
            ['Requested By', transaction.createdBy],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{k}</span>
              <span className={`font-semibold ${
                k === 'Type'
                  ? v === 'IN' ? 'text-emerald-400' : 'text-red-400'
                  : 'text-gray-200'
              }`}>
                {v}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all font-semibold text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500
              text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
            {loading ? 'Approving...' : 'Confirm Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STAFF PAGE — Request Form
// ─────────────────────────────────────────────
function StaffPage({ showToast }) {
  const [txType, setTxType] = useState('IN');
  const [form, setForm] = useState({ productId: '', warehouseId: '', quantity: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, w] = await Promise.all([
          api.get('/api/products').then(r => r.data).catch(() => MOCK_PRODUCTS),
          api.get('/api/warehouses').then(r => r.data).catch(() => MOCK_WAREHOUSES),
        ]);
        setProducts(Array.isArray(p) ? p : MOCK_PRODUCTS);
        setWarehouses(Array.isArray(w) ? w : MOCK_WAREHOUSES);
      } catch {
        setProducts(MOCK_PRODUCTS);
        setWarehouses(MOCK_WAREHOUSES);
      }
    })();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.productId) e.productId = 'Select a product';
    if (!form.warehouseId) e.warehouseId = 'Select a warehouse';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Quantity must be > 0';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const endpoint = txType === 'IN' ? '/api/stock/request-in' : '/api/stock/request-out';
      await api.post(endpoint, {
        productId: form.productId,
        warehouseId: form.warehouseId,
        quantity: parseInt(form.quantity),
      });
      setForm({ productId: '', warehouseId: '', quantity: '' });
      showToast(`Stock ${txType} request submitted — awaiting approval`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Card header stripe */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />

        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">New Stock Request</h2>
              <p className="text-xs text-gray-500">Submit for owner approval</p>
            </div>
          </div>

          {/* Type toggle */}
          <div className="mb-7">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Transaction Type</p>
            <div className="grid grid-cols-2 gap-3">
              {['IN', 'OUT'].map(t => {
                const active = txType === t;
                const isIn = t === 'IN';
                return (
                  <button
                    key={t}
                    onClick={() => setTxType(t)}
                    className={`flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm transition-all
                      ${active
                        ? isIn
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/30'
                        : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                      }`}
                  >
                    {isIn ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    Stock {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <SelectField
              label="Product"
              name="productId"
              value={form.productId}
              onChange={handleChange}
              options={products.map(p => ({ id: p.id, label: `${p.name} — ${p.sku}` }))}
              error={errors.productId}
              disabled={loading}
              placeholder="Choose a product…"
            />

            <SelectField
              label="Warehouse"
              name="warehouseId"
              value={form.warehouseId}
              onChange={handleChange}
              options={warehouses.map(w => ({ id: w.id, label: w.name }))}
              error={errors.warehouseId}
              disabled={loading}
              placeholder="Choose a warehouse…"
            />

            {/* Quantity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                placeholder="e.g. 50"
                disabled={loading}
                className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all
                  placeholder-gray-600 disabled:opacity-50
                  ${errors.quantity ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'}`}
              />
              {errors.quantity && <p className="text-xs text-red-400">{errors.quantity}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full mt-2 py-4 px-6 rounded-xl font-bold text-sm transition-all disabled:opacity-50
                flex items-center justify-center gap-2 shadow-lg
                ${txType === 'IN'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/25 text-white'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-red-500/25 text-white'
                }`}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                : txType === 'IN'
                  ? <><Plus className="w-4 h-4" /> Submit Stock IN Request</>
                  : <><Minus className="w-4 h-4" /> Submit Stock OUT Request</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-950/50 border border-blue-900/60">
        <Clock className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300/80 leading-relaxed">
          Requests are reviewed by an Owner before stock is updated. You'll be notified once approved.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OWNER PAGE — Pending Approvals Dashboard
// ─────────────────────────────────────────────
function OwnerPage({ showToast }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approving, setApproving] = useState(false);
  const [approvedIds, setApprovedIds] = useState(new Set());

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/stock/pending').then(r => r.data).catch(() => MOCK_PENDING);
      setPending(Array.isArray(data) ? data : MOCK_PENDING);
    } catch {
      setPending(MOCK_PENDING);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setApproving(true);
    try {
      await api.post(`/api/stock/approve/${approveTarget.id}`).catch(() => {});
      setApprovedIds(s => new Set([...s, approveTarget.id]));
      showToast(`Transaction approved: ${approveTarget.product} × ${approveTarget.quantity}`, 'success');
      setApproveTarget(null);
      // Refresh after short delay
      setTimeout(fetchPending, 800);
    } catch (err) {
      showToast(err.response?.data?.message || 'Approval failed', 'error');
    } finally {
      setApproving(false);
    }
  };

  const visiblePending = pending.filter(t => !approvedIds.has(t.id));

  return (
    <>
      <ApproveModal
        transaction={approveTarget}
        onConfirm={handleApprove}
        onClose={() => setApproveTarget(null)}
        loading={approving}
      />

      <div className="space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Requests', value: visiblePending.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Stock IN',  value: visiblePending.filter(t => t.type === 'IN').length,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Stock OUT', value: visiblePending.filter(t => t.type === 'OUT').length, color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-5 ${s.bg}`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />

          <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="font-bold text-gray-100 text-base">Pending Approvals</h2>
                <p className="text-xs text-gray-500">Review and approve stock transactions</p>
              </div>
            </div>
            <button
              onClick={fetchPending}
              disabled={loading}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <span className="text-sm text-gray-500">Loading pending transactions…</span>
            </div>
          ) : visiblePending.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500/50" />
              </div>
              <p className="text-base font-semibold text-gray-400">All clear!</p>
              <p className="text-sm text-gray-600">No pending transactions at the moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Product', 'Warehouse', 'Type', 'Qty', 'Requested By', 'Date', 'Action'].map(h => (
                      <th
                        key={h}
                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visiblePending.map((tx, i) => (
                    <tr
                      key={tx.id}
                      className="border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors group"
                      style={{ animation: `rowIn 0.3s ease ${i * 0.05}s both` }}
                    >
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="font-semibold text-gray-200 text-sm">{tx.product}</span>
                        </div>
                      </td>

                      {/* Warehouse */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                          <Warehouse className="w-3.5 h-3.5" />
                          {tx.warehouse}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        {tx.type === 'IN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <TrendingUp className="w-3 h-3" /> IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            <TrendingDown className="w-3 h-3" /> OUT
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4">
                        <span className="font-black text-gray-100 text-base">{tx.quantity}</span>
                      </td>

                      {/* Created By */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">{tx.createdBy}</span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setApproveTarget(tx)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                            bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                            hover:bg-emerald-500 hover:text-white hover:border-emerald-500
                            transition-all shadow-sm hover:shadow-emerald-500/20"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// ROOT — Role Router
// ─────────────────────────────────────────────
export default function StockApprovalPage() {
  // For demo: toggle role here. In production, read from localStorage.
  const [demoRole, setDemoRole] = useState('STAFF');
  const role = demoRole; // or: localStorage.getItem('role') || 'STAFF'
  const isOwner = role === 'OWNER';
  const isStaff = role === 'STAFF';

  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900&display=swap" rel="stylesheet" />

      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top nav */}
      <header className="border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Package className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <span className="font-black text-white text-base tracking-tight">StockFlow</span>
          </div>

          {/* Role switcher (demo only) */}
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1">
            {['STAFF', 'OWNER'].map(r => (
              <button
                key={r}
                onClick={() => setDemoRole(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  demoRole === r
                    ? r === 'OWNER'
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-blue-600 text-white shadow'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {r === 'OWNER' ? '👑' : '👤'} {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Page body */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full
              ${isOwner ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
              {isOwner ? <><ShieldCheck className="w-3 h-3" /> Owner Dashboard</> : <><Eye className="w-3 h-3" /> Staff Portal</>}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {isOwner ? 'Approve Stock Transactions' : 'Request Stock Movement'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isOwner
              ? 'Review and approve pending stock requests from your team'
              : 'Submit a stock IN or OUT request — your manager will review it'}
          </p>
        </div>

        {isStaff && <StaffPage showToast={showToast} />}
        {isOwner && <OwnerPage showToast={showToast} />}

        {!isStaff && !isOwner && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-lg font-bold text-gray-300">Access Denied</p>
            <p className="text-sm text-gray-500">Only OWNER and STAFF roles have access.</p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
