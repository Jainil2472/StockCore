// pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, CheckCircle, Folder, Edit2, Trash2, X, Package } from 'lucide-react';
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

const categoryApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/categories`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  create: async (categoryData) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/categories`,
      categoryData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/categories/${id}`,
      categoryData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/categories/${id}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

// ============================================================================
// CATEGORY FORM COMPONENT (INLINE)
// ============================================================================

function CategoryForm({ isOpen, onClose, onSubmit, initialData, isEdit }) {
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({ name: initialData.name || '' });
    } else {
      setFormData({ name: '' });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      setFormData({ name: '' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* Modal Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Category' : 'Add New Category'}
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="e.g., Electronics, Furniture, Clothing"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
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
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// CATEGORY TABLE COMPONENT (INLINE)
// ============================================================================

function CategoryTable({ categories, onEdit, onDelete, loading }) {
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500">Loading categories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-500 mb-1">No categories yet</p>
          <p className="text-sm text-gray-400">Create your first category to get started</p>
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
                Category Name
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category, index) => (
              <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(category)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
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
// MAIN CATEGORY PAGE COMPONENT
// ============================================================================

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notification, setNotification] = useState(null);

  // Check user role
  const userRole = localStorage.getItem('role');
  const isOwner = userRole === 'OWNER';

  // Fetch categories on mount
  useEffect(() => {
    if (isOwner) {
      fetchCategories();
    }
  }, [isOwner]);

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle create category
  const handleCreate = async (formData) => {
    try {
      await categoryApi.create(formData);
      await fetchCategories();
      showNotification('Category created successfully!', 'success');
    } catch (error) {
      throw error;
    }
  };

  // Handle update category
  const handleUpdate = async (formData) => {
    try {
      await categoryApi.update(selectedCategory.id, formData);
      await fetchCategories();
      showNotification('Category updated successfully!', 'success');
    } catch (error) {
      throw error;
    }
  };

  // Open modal for creating new category
  const openCreateModal = () => {
    setSelectedCategory(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Open modal for editing category
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle delete category
  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await categoryApi.delete(category.id);
      await fetchCategories();
      showNotification('Category deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete category',
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
            You do not have permission to access categories.
          </p>
          <p className="text-sm text-gray-500">
            Only <span className="font-semibold text-gray-700">OWNER</span> role can manage categories.
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
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                <p className="text-gray-500">Manage your product categories</p>
              </div>
            </div>

            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          </div>

          {/* Stats Card */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Folder className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
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
            <p
              className={`font-medium ${
                notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'
              }`}
            >
              {notification.message}
            </p>
          </div>
        )}

        {/* Category Table */}
        <CategoryTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />

        {/* Category Form Modal */}
        <CategoryForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={isEditMode ? handleUpdate : handleCreate}
          initialData={selectedCategory}
          isEdit={isEditMode}
        />
      </div>
    </div>
  );
}
