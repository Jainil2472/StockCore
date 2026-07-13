
// pages/AttributeManagementPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus, X, AlertCircle, CheckCircle, Edit2, Trash2,
  Sliders, Tag, Hash, Type, Calendar
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

const attributeApi = {
  getByCategory: async (categoryId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/attributes?categoryId=${categoryId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/attributes`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/attributes/${id}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

const categoryApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/categories`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

// ============================================================================
// DATA TYPE BADGE HELPER
// ============================================================================

const DATA_TYPE_CONFIG = {
  TEXT: {
    label: 'Text',
    icon: Type,
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  NUMBER: {
    label: 'Number',
    icon: Hash,
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200'
  },
  DATE: {
    label: 'Date',
    icon: Calendar,
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200'
  }
};

function DataTypeBadge({ dataType }) {
  const config = DATA_TYPE_CONFIG[dataType] || DATA_TYPE_CONFIG.TEXT;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ============================================================================
// ATTRIBUTE FORM MODAL
// ============================================================================

function AttributeForm({ isOpen, onClose, onSubmit, categoryId }) {
  const [formData, setFormData] = useState({ name: '', dataType: 'TEXT' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', dataType: 'TEXT' });
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Attribute name is required';
    if (!formData.dataType) newErrors.dataType = 'Data type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ ...formData, categoryId });
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create attribute' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Attribute</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Attribute Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attribute Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData((p) => ({ ...p, name: e.target.value }));
                if (errors.name) setErrors((p) => ({ ...p, name: '' }));
              }}
              className={`w-full px-4 py-3 bg-gray-50 border ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
              placeholder="e.g., Color, Weight, Material"
              autoFocus
              disabled={loading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Data Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(DATA_TYPE_CONFIG).map(([type, config]) => {
                const Icon = config.icon;
                const selected = formData.dataType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, dataType: type }))}
                    disabled={loading}
                    className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 font-medium text-sm transition-all ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${selected ? 'text-emerald-600' : 'text-gray-400'}`} />
                    {config.label}
                  </button>
                );
              })}
            </div>
            {errors.dataType && <p className="mt-1 text-sm text-red-600">{errors.dataType}</p>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Creating...' : 'Create Attribute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// ATTRIBUTE TABLE
// ============================================================================

function AttributeTable({ attributes, onDelete, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500">Loading attributes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!attributes || attributes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          <Sliders className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-500 mb-1">No attributes yet</p>
          <p className="text-sm text-gray-400">Add attributes to define product specifications for this category</p>
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Attribute Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data Type</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attributes.map((attr, index) => (
              <tr key={attr.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Sliders className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{attr.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <DataTypeBadge dataType={attr.dataType} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(attr)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Attribute"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
// MAIN ATTRIBUTE MANAGEMENT PAGE
// ============================================================================

export default function AttributeManagementPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const userRole = localStorage.getItem('role');
  const isOwner = userRole === 'OWNER';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchAttributes(selectedCategoryId);
    } else {
      setAttributes([]);
    }
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoryApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotification('Failed to load categories', 'error');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchAttributes = async (categoryId) => {
    setLoadingAttributes(true);
    try {
      const data = await attributeApi.getByCategory(categoryId);
      setAttributes(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotification('Failed to load attributes', 'error');
      setAttributes([]);
    } finally {
      setLoadingAttributes(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (formData) => {
    await attributeApi.create({
    categoryId: selectedCategoryId,
    attributes: [
        {
        name: formData.name,
        dataType: formData.dataType
        }
    ]
    });
    await fetchAttributes(selectedCategoryId);
    showNotification('Attribute created successfully!', 'success');
  };

  const handleDelete = async (attr) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the attribute "${attr.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await attributeApi.delete(attr.id);
      await fetchAttributes(selectedCategoryId);
      showNotification('Attribute deleted successfully!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete attribute', 'error');
    }
  };

  const selectedCategory = categories.find((c) => String(c.id) === String(selectedCategoryId));

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to manage attributes.</p>
          <p className="text-sm text-gray-500">
            Only <span className="font-semibold text-gray-700">OWNER</span> role can manage attributes.
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
                <Sliders className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Attribute Management</h1>
                <p className="text-gray-500">Define dynamic attributes for product categories</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!selectedCategoryId}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Add Attribute
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Attributes in View</p>
                  <p className="text-3xl font-bold text-gray-900">{attributes.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Sliders className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Selected Category</p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {selectedCategory?.name || '—'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Category to View / Manage Attributes
          </label>
          {loadingCategories ? (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading categories...</span>
            </div>
          ) : (
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full md:w-80 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">— Choose a category —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
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
            <p className={`font-medium ${notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
              {notification.message}
            </p>
          </div>
        )}

        {/* Attribute Table or Placeholder */}
        {selectedCategoryId ? (
          <AttributeTable
            attributes={attributes}
            onDelete={handleDelete}
            loading={loadingAttributes}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <Sliders className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-500 mb-1">No category selected</p>
            <p className="text-sm text-gray-400">Select a category above to view and manage its attributes</p>
          </div>
        )}

        {/* Attribute Form Modal */}
        <AttributeForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
          categoryId={selectedCategoryId}
        />
      </div>
    </div>
  );
}
