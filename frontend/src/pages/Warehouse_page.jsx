// pages/WarehouseManagementPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, Search, X, AlertCircle, CheckCircle,
  Warehouse, MapPin, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Building2
} from 'lucide-react';
import axios from 'axios';

// ============================================================================
// API SERVICE
// ============================================================================

import { API_BASE_URL } from '@/api/apiConfig';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const warehouseApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/warehouses`, {
      headers: getAuthHeader()
    });
    return response.data; // [{ id, name, location }]
  },

  create: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/warehouses`, data, {
      headers: getAuthHeader()
    });
    return response.data; // { id, name, location }
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_BASE_URL}/api/warehouses/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/api/warehouses/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

// ============================================================================
// CONSTANTS
// ============================================================================

const EMPTY_FORM = { name: '', location: '' };
const PAGE_SIZE = 8;

// ============================================================================
// SORT ICON
// ============================================================================

function SortIcon({ field, sortConfig }) {
  if (sortConfig.field !== field) return <ChevronUp className="w-3 h-3 text-gray-300" />;
  return sortConfig.direction === 'asc'
    ? <ChevronUp className="w-3 h-3 text-emerald-500" />
    : <ChevronDown className="w-3 h-3 text-emerald-500" />;
}

// ============================================================================
// WAREHOUSE TABLE
// ============================================================================

function WarehouseTable({ warehouses, onEdit, onDelete, loading }) {
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const sorted = useMemo(() => {
    return [...warehouses].sort((a, b) => {
      const aVal = (a[sortConfig.field] || '').toLowerCase();
      const bVal = (b[sortConfig.field] || '').toLowerCase();
      return sortConfig.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [warehouses, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [warehouses.length]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-16 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Loading warehouses...</span>
        </div>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-20 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-2">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-600">No warehouses found</p>
          <p className="text-sm text-gray-400 max-w-xs">
            Add your first warehouse to start managing storage locations.
          </p>
        </div>
      </div>
    );
  }

  const SortTh = ({ field, children }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-1.5">
        {children}
        <SortIcon field={field} sortConfig={sortConfig} />
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                #
              </th>
              <SortTh field="name">Warehouse Name</SortTh>
              <SortTh field="location">Location</SortTh>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((wh, index) => (
              <tr key={wh.id} className="hover:bg-gray-50/70 transition-colors group">

                {/* Row number */}
                <td className="px-6 py-4 text-sm text-gray-400">
                  {(currentPage - 1) * PAGE_SIZE + index + 1}
                </td>

                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Warehouse className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{wh.name}</span>
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="max-w-xs truncate">{wh.location || '—'}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(wh)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(wh)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium text-gray-700">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)}
            </span>{' '}
            of <span className="font-medium text-gray-700">{sorted.length}</span> warehouses
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  page === currentPage
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WAREHOUSE FORM MODAL  (fields: name + location only)
// ============================================================================

function WarehouseFormModal({ isOpen, onClose, onSubmit, initialData, isEdit }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData && isEdit
          ? { name: initialData.name || '', location: initialData.location || '' }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }, [isOpen, initialData, isEdit]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Warehouse name is required';
    if (!formData.location.trim()) e.location = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ name: formData.name.trim(), location: formData.location.trim() });
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to save warehouse' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  if (!isOpen) return null;

  const inputCls = (field) =>
    `w-full px-4 py-3 bg-gray-50 border ${
      errors[field]
        ? 'border-red-300 focus:ring-red-400'
        : 'border-gray-200 focus:ring-emerald-500'
    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Warehouse className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? 'Edit Warehouse' : 'Add New Warehouse'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Warehouse Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={inputCls('name')}
              placeholder="e.g., Main Storage Hub"
              autoFocus
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <textarea
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              className={`${inputCls('location')} resize-none`}
              placeholder="e.g., Plot 12, Industrial Area, Surat, Gujarat"
            />
            {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:from-emerald-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : isEdit ? 'Update Warehouse' : 'Create Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// DELETE CONFIRMATION MODAL
// ============================================================================

function DeleteConfirmModal({ warehouse, onConfirm, onCancel, loading }) {
  if (!warehouse) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Warehouse</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-800">"{warehouse.name}"</span>?
              <br />This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TOAST
// ============================================================================

function Toast({ notification }) {
  if (!notification) return null;
  const ok = notification.type === 'success';
  return (
    <div className={`fixed top-5 right-5 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in max-w-sm ${
      ok ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
    }`}>
      {ok
        ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
      <p className={`text-sm font-medium ${ok ? 'text-emerald-800' : 'text-red-800'}`}>
        {notification.message}
      </p>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function WarehouseManagementPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formModal, setFormModal] = useState({ open: false, isEdit: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => { fetchWarehouses(); }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const data = await warehouseApi.getAll();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showNotification('Failed to load warehouses', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Search ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return warehouses;
    return warehouses.filter(
      (w) =>
        w.name?.toLowerCase().includes(term) ||
        w.location?.toLowerCase().includes(term)
    );
  }, [warehouses, searchTerm]);

  // ── Notification ─────────────────────────────────────────────────────────
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const handleCreate = async (payload) => {
    await warehouseApi.create(payload);
    await fetchWarehouses();
    showNotification('Warehouse created successfully!');
  };

  const handleUpdate = async (payload) => {
    await warehouseApi.update(formModal.data.id, payload);
    await fetchWarehouses();
    showNotification('Warehouse updated successfully!');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await warehouseApi.delete(deleteTarget.id);
      await fetchWarehouses();
      showNotification('Warehouse deleted successfully!');
      setDeleteTarget(null);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete warehouse', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const total = warehouses.length;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast notification={notification} />

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
              <p className="text-sm text-gray-500">Manage your storage locations</p>
            </div>
          </div>
          <button
            onClick={() => setFormModal({ open: true, isEdit: false, data: null })}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </button>
        </div>

        {/* Stat card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between w-full sm:w-56">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Warehouses</p>
            <p className="text-3xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or location..."
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
          />
          {searchTerm && (
            <>
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>

        {/* Table */}
        <WarehouseTable
          warehouses={filtered}
          onEdit={(wh) => setFormModal({ open: true, isEdit: true, data: wh })}
          onDelete={(wh) => setDeleteTarget(wh)}
          loading={loading}
        />
      </div>

      {/* Form Modal */}
      <WarehouseFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, isEdit: false, data: null })}
        onSubmit={formModal.isEdit ? handleUpdate : handleCreate}
        initialData={formModal.data}
        isEdit={formModal.isEdit}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        warehouse={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
