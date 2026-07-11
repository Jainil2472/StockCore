// pages/UnitPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, CheckCircle, Ruler, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';

// ============================================================================
// API SERVICE (INLINE)
// ============================================================================

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const unitApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/units`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  create: async (unitData) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/units`,
      unitData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  update: async (id, unitData) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/units/${id}`,
      unitData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/units/${id}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

// ============================================================================
// UNIT FORM COMPONENT (INLINE)
// ============================================================================

function UnitForm({ isOpen, onClose, onSubmit, initialData, isEdit }) {
  const [formData, setFormData] = useState({ name: '', symbol: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        symbol: initialData.symbol || ''
      });
    } else {
      setFormData({ name: '', symbol: '' });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Unit name is required';
    }
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      await onSubmit(formData);
      setFormData({ name: '', symbol: '' });
      onClose();
    } catch (err) {
      setErrors({ 
        submit: err.response?.data?.message || 'Failed to save unit' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', symbol: '' });
    setErrors({});
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* Modal Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Unit' : 'Add New Unit'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Unit Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-50 border ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
              placeholder="e.g., Kilogram, Meter, Liter"
              disabled={loading}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symbol *
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-50 border ${
                errors.symbol ? 'border-red-300' : 'border-gray-200'
              } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
              placeholder="e.g., kg, m, L"
              disabled={loading}
            />
            {errors.symbol && (
              <p className="mt-1 text-sm text-red-600">{errors.symbol}</p>
            )}
          </div>

          {/* Submit Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Unit' : 'Create Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// UNIT TABLE COMPONENT (INLINE)
// ============================================================================

function UnitTable({ units, onEdit, onDelete, loading }) {
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500">Loading units...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          <Ruler className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-500 mb-1">No units yet</p>
          <p className="text-sm text-gray-400">Add your first measurement unit to get started</p>
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
                #
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Unit Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {units.map((unit, index) => (
              <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{unit.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    {unit.symbol}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(unit)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Unit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(unit)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Unit"
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
    </div>
  );
}

// ============================================================================
// MAIN UNIT PAGE COMPONENT
// ============================================================================

export default function UnitPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [notification, setNotification] = useState(null);

  // Check user role
  const userRole = localStorage.getItem('role');
  const isOwner = userRole === 'OWNER';

  // Fetch units on mount
  useEffect(() => {
    if (isOwner) {
      fetchUnits();
    }
  }, [isOwner]);

  // Fetch all units
  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await unitApi.getAll();
      setUnits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching units:', error);
      showNotification('Failed to load units', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification (toast)
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle create unit
  const handleCreate = async (formData) => {
    try {
      await unitApi.create(formData);
      await fetchUnits();
      showNotification('Unit created successfully!', 'success');
    } catch (error) {
      throw error;
    }
  };

  // Handle update unit
  const handleUpdate = async (formData) => {
    try {
      await unitApi.update(selectedUnit.id, formData);
      await fetchUnits();
      showNotification('Unit updated successfully!', 'success');
    } catch (error) {
      throw error;
    }
  };

  // Open modal for creating new unit
  const openCreateModal = () => {
    setSelectedUnit(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Open modal for editing unit
  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle delete unit
  const handleDelete = async (unit) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${unit.name} (${unit.symbol})"?\n\nThis action cannot be undone and may affect products using this unit.`
    );

    if (!confirmed) return;

    try {
      await unitApi.delete(unit.id);
      await fetchUnits();
      showNotification('Unit deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting unit:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete unit',
        'error'
      );
    }
  };

  // If not owner, show permission denied
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You are not authorized to manage units.
          </p>
          <p className="text-sm text-gray-500">
            Only users with <span className="font-semibold text-gray-700">OWNER</span> role can manage measurement units.
          </p>
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
                <Ruler className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Measurement Units</h1>
                <p className="text-gray-500">Manage product measurement units</p>
              </div>
            </div>

            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-5 h-5" />
              Add Unit
            </button>
          </div>

          {/* Stats Card */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Units</p>
                  <p className="text-3xl font-bold text-gray-900">{units.length}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Ruler className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Units</p>
                  <p className="text-3xl font-bold text-gray-900">{units.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Recently Added</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {units.slice(-5).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-slide-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p
              className={`font-medium ${
                notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'
              }`}
            >
              {notification.message}
            </p>
          </div>
        )}

        {/* Unit Table */}
        <UnitTable
          units={units}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />

        {/* Unit Form Modal */}
        <UnitForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={isEditMode ? handleUpdate : handleCreate}
          initialData={selectedUnit}
          isEdit={isEditMode}
        />
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}