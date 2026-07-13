// pages/BrandPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, CheckCircle, Tag, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

const brandApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/brands`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  create: async (brandData) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/brands`,
      brandData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  update: async (id, brandData) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/brands/${id}`,
      brandData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/brands/${id}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

// ============================================================================
// BRAND FORM COMPONENT (INLINE)
// ============================================================================

function BrandForm({ isOpen, onClose, onSubmit, initialData, isEdit }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || ''
      });
    } else {
      setFormData({ name: '', description: '' });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Brand name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      setFormData({ name: '', description: '' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save brand');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setError('');
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        
        {/* Modal Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Brand' : 'Add New Brand'}
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
          
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="e.g., Apple, Samsung, Nike"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              placeholder="Enter brand description..."
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
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
              {loading ? 'Saving...' : isEdit ? 'Update Brand' : 'Create Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// BRAND TABLE COMPONENT (INLINE)
// ============================================================================

function BrandTable({ brands, onEdit, onDelete, loading }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = brands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(brands.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500">Loading brands...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-500 mb-1">No brands yet</p>
          <p className="text-sm text-gray-400">Create your first brand to get started</p>
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
                Brand Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentBrands.map((brand, index) => (
              <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {indexOfFirstItem + index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">{brand.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 max-w-md truncate">
                    {brand.description || '—'}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(brand)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Brand"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(brand)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Brand"
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
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, brands.length)} of {brands.length} brands
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow'
                    : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN BRAND PAGE COMPONENT
// ============================================================================

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [notification, setNotification] = useState(null);

  // Check user role
  const userRole = localStorage.getItem('role');
  const isOwner = userRole === 'OWNER';

  // Fetch brands on mount
  useEffect(() => {
    if (isOwner) {
      fetchBrands();
    }
  }, [isOwner]);

  // Fetch all brands
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await brandApi.getAll();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      showNotification('Failed to load brands', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle create brand
  const handleCreate = async (formData) => {
    try {
      await brandApi.create(formData);
      await fetchBrands();
      showNotification('Brand created successfully!', 'success');
    } catch (error) {
      throw error;
    }
  };

  // Handle update brand
  const handleUpdate = async (formData) => {
    try {
      await brandApi.update(selectedBrand.id, formData);
      await fetchBrands();
      showNotification('Brand updated successfully!', 'success');
    } catch (error) {
      throw error;
    }
  };

  // Open modal for creating new brand
  const openCreateModal = () => {
    setSelectedBrand(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Open modal for editing brand
  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle delete brand
  const handleDelete = async (brand) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${brand.name}"?\n\nThis action cannot be undone and may affect products using this brand.`
    );

    if (!confirmed) return;

    try {
      await brandApi.delete(brand.id);
      await fetchBrands();
      showNotification('Brand deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting brand:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete brand',
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
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            Access restricted to owners only.
          </p>
          <p className="text-sm text-gray-500">
            Only users with <span className="font-semibold text-gray-700">OWNER</span> role can manage brands.
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
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
                <p className="text-gray-500">Manage product brands</p>
              </div>
            </div>

            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-5 h-5" />
              Add Brand
            </button>
          </div>

          {/* Stats Card */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Brands</p>
                  <p className="text-3xl font-bold text-gray-900">{brands.length}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">With Description</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {brands.filter(b => b.description).length}
                  </p>
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
                    {brands.slice(-5).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
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

        {/* Brand Table */}
        <BrandTable
          brands={brands}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />

        {/* Brand Form Modal */}
        <BrandForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={isEditMode ? handleUpdate : handleCreate}
          initialData={selectedBrand}
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
