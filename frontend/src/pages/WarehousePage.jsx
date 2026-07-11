// pages/WarehouseManagementPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, Warehouse, AlertCircle, CheckCircle,
  X, MapPin, Search, Calendar, Building2, Package
} from 'lucide-react';
import axios from 'axios';

// ============================================================================
// API SERVICE (INLINE)
// ============================================================================

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const warehouseApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/warehouses`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  create: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/warehouses`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  update: async (id, data) => {
    const response = await axios.put(`${API_BASE_URL}/api/warehouses/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/api/warehouses/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ============================================================================
// WAREHOUSE FORM MODAL (CREATE / EDIT)
// ============================================================================

function WarehouseFormModal({ isOpen, onClose, onSubmit, initialData, isEdit }) {
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData && isEdit) {
        setFormData({ name: initialData.name || '', location: initialData.location || '' });
      } else {
        setFormData({ name: '', location: '' });
      }
      setErrors({});
    }
  }, [initialData, isEdit, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Warehouse name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ name: formData.name.trim(), location: formData.location.trim() });
      handleClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to save warehouse' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', location: '' });
    setErrors({});
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        style={{ animation: 'modalIn 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? 'Edit Warehouse' : 'Add New Warehouse'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warehouse Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Main Storage Hub"
                disabled={loading}
                autoFocus
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Mumbai, Maharashtra"
                disabled={loading}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                  errors.location ? 'border-red-300' : 'border-gray-200'
                } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
              />
            </div>
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Warehouse' : 'Create Warehouse'}
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

function DeleteConfirmModal({ isOpen, onClose, onConfirm, warehouse, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        style={{ animation: 'modalIn 0.25s ease-out' }}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Warehouse</h2>
          <p className="text-gray-600 mb-1">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">"{warehouse?.name}"</span>?
          </p>
          <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
            >
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WAREHOUSE TABLE COMPONENT
// ============================================================================

function WarehouseTable({ warehouses, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 font-medium">Loading warehouses...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!warehouses || warehouses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-600 mb-1">No warehouses found</p>
          <p className="text-sm text-gray-400">Add your first warehouse to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Warehouse Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {warehouses.map((wh) => (
              <tr key={wh.id} className="hover:bg-gray-50 transition-colors group">
                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">{wh.name}</span>
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{wh.location || '—'}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {wh.createdDate
                      ? new Date(wh.createdDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(wh)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Warehouse"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(wh)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Warehouse"
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

      {/* Footer count */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{warehouses.length}</span>{' '}
          warehouse{warehouses.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// TOAST NOTIFICATION
// ============================================================================

function Toast({ notification }) {
  if (!notification) return null;
  const isSuccess = notification.type === 'success';
  return (
    <div
      className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
        isSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
      }`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      )}
      <p className={`font-medium ${isSuccess ? 'text-emerald-800' : 'text-red-800'}`}>
        {notification.message}
      </p>
    </div>
  );
}

// ============================================================================
// MAIN WAREHOUSE MANAGEMENT PAGE
// ============================================================================

export default function WarehouseManagementPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);

  // Toast
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const data = await warehouseApi.getAll();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      showNotification('Failed to load warehouses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered warehouses (frontend search)
  const filteredWarehouses = useMemo(() => {
    if (!searchQuery.trim()) return warehouses;
    return warehouses.filter((wh) =>
      wh.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [warehouses, searchQuery]);

  // Create
  const handleCreate = async (formData) => {
    await warehouseApi.create(formData);
    await fetchWarehouses();
    showNotification('Warehouse created successfully!', 'success');
  };

  // Update
  const handleUpdate = async (formData) => {
    await warehouseApi.update(selectedWarehouse.id, formData);
    await fetchWarehouses();
    showNotification('Warehouse updated successfully!', 'success');
  };

  // Open edit modal
  const handleEdit = (wh) => {
    setSelectedWarehouse(wh);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  // Open add modal
  const handleOpenCreate = () => {
    setSelectedWarehouse(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  // Delete flow
  const handleDeleteClick = (wh) => {
    setWarehouseToDelete(wh);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await warehouseApi.delete(warehouseToDelete.id);
      await fetchWarehouses();
      showNotification('Warehouse deleted successfully!', 'success');
      setIsDeleteOpen(false);
      setWarehouseToDelete(null);
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete warehouse',
        'error'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Warehouse className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
                <p className="text-gray-500 text-sm mt-0.5">Manage all your storage locations</p>
              </div>
            </div>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all shadow-lg shadow-emerald-500/25 self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              Add Warehouse
            </button>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Total */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Warehouses</p>
                <p className="text-3xl font-bold text-gray-900">{warehouses.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>

            {/* Active */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active</p>
                <p className="text-3xl font-bold text-gray-900">{warehouses.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>

            {/* Search results */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Search Results</p>
                <p className="text-3xl font-bold text-gray-900">{filteredWarehouses.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* ── SEARCH BAR ── */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search warehouses by name..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* ── TOAST ── */}
        <Toast notification={notification} />

        {/* ── TABLE ── */}
        <WarehouseTable
          warehouses={filteredWarehouses}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        {/* ── MODALS ── */}
        <WarehouseFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={isEditMode ? handleUpdate : handleCreate}
          initialData={selectedWarehouse}
          isEdit={isEditMode}
        />

        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setWarehouseToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          warehouse={warehouseToDelete}
          loading={deleteLoading}
        />
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}