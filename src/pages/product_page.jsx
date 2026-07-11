// pages/ProductManagementPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Package, Search, X, AlertCircle,
  CheckCircle, Tag, Ruler, DollarSign, FileText, Sliders,
  Filter, RotateCcw, ChevronDown, AlertTriangle
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
    'Content-Type': 'application/json'
  };
};

const productApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/products`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getFiltered: async (queryParams) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/products/filter?${queryParams}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/products`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/products/${id}`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/products/${id}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getBrands: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/brands`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/categories`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getUnits: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/units`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getAttributesByCategory: async (categoryId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/attributes?categoryId=${categoryId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

// ============================================================================
// ATTRIBUTE CHIPS HELPER
// ============================================================================

function AttributeChips({ attributes, max = 3 }) {
  if (
    !attributes ||
    typeof attributes !== 'object' ||
    Array.isArray(attributes)
  ) {
    return <span className="text-gray-400 text-sm">—</span>;
  }

  const entries  = Object.entries(attributes);
  if (entries.length === 0) return <span className="text-gray-400 text-sm">—</span>;

  const visible  = entries.slice(0, max);
  const overflow = entries.length - max;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
            text-xs bg-gray-100 border border-gray-200 text-gray-700 whitespace-nowrap"
        >
          <span className="text-gray-400 font-normal capitalize">{key}:</span>
          <span className="font-semibold text-gray-700">{value}</span>
        </span>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md
          text-xs font-semibold bg-emerald-50 border border-emerald-200
          text-emerald-700 whitespace-nowrap">
          +{overflow} more
        </span>
      )}
    </div>
  );
}

// ============================================================================
// DELETE CONFIRMATION MODAL  ← NEW
// ============================================================================

/**
 * A polished, accessible delete confirmation modal.
 *
 * Props:
 *   product   — the product object being deleted  (null = closed)
 *   onClose   — called when the user cancels
 *   onConfirm — called when the user confirms; receives no arguments
 *   loading   — disables buttons and shows "Deleting…" while API call is in flight
 */
function DeleteModal({ product, onClose, onConfirm, loading }) {
  // Don't render anything when there is no target product
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center
      justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md
          animate-scale-in overflow-hidden"
      >
        {/* Danger stripe */}
        <div className="h-1.5 bg-gradient-to-r from-red-400 to-red-600" />

        <div className="p-6">
          {/* Icon + title row */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center
              justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Delete Product</h2>
              <p className="text-sm text-gray-500">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          {/* Product summary card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600
                rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  SKU:&nbsp;
                  <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                    {product.sku}
                  </span>
                  {product.category?.name && (
                    <span className="ml-2 text-gray-400">· {product.category.name}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation prompt */}
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">"{product.name}"</span>?
            All associated data will be permanently removed.
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-5 py-2.5 border-2 border-gray-200 text-gray-700
                rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300
                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600
                text-white rounded-xl font-semibold
                hover:from-red-600 hover:to-red-700
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent
                    rounded-full animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Product
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FILTER PANEL COMPONENT
// ============================================================================

function FilterPanel({
  filters,
  setFilters,
  attributeFilters,
  setAttributeFilters,
  filterAttributes,
  brands,
  categories,
  onApply,
  onReset,
  isFiltered,
  loading
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange    = (key, value) => setFilters(p => ({ ...p, [key]: value }));
  const handleAttrFilterChange = (key, value) => setAttributeFilters(p => ({ ...p, [key]: value }));

  const activeFilterCount = [
    filters.categoryId,
    filters.brandId,
    ...Object.values(attributeFilters)
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      <button
        onClick={() => setIsExpanded(p => !p)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600
            rounded-lg flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-800">Filter Products</span>
          {activeFilterCount > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200
          ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.categoryId}
                onChange={e => handleFilterChange('categoryId', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                  text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500
                  focus:border-transparent transition-all"
                disabled={loading}
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                value={filters.brandId}
                onChange={e => handleFilterChange('brandId', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                  text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500
                  focus:border-transparent transition-all"
                disabled={loading}
              >
                <option value="">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {filterAttributes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-700">Attribute Filters</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filterAttributes.map(attr => (
                  <div key={attr.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {attr.name}
                      <span className="ml-1.5 text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {attr.dataType}
                      </span>
                    </label>
                    {attr.dataType === 'NUMBER' ? (
                      <input type="number"
                        value={attributeFilters[attr.name] ?? ''}
                        onChange={e => handleAttrFilterChange(attr.name, e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                          text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                          focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder={`Filter by ${attr.name.toLowerCase()}`}
                        step="any" disabled={loading} />
                    ) : attr.dataType === 'DATE' ? (
                      <input type="date"
                        value={attributeFilters[attr.name] ?? ''}
                        onChange={e => handleAttrFilterChange(attr.name, e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                          text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500
                          focus:border-transparent transition-all"
                        disabled={loading} />
                    ) : (
                      <input type="text"
                        value={attributeFilters[attr.name] ?? ''}
                        onChange={e => handleAttrFilterChange(attr.name, e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                          text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                          focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder={`Filter by ${attr.name.toLowerCase()}`}
                        disabled={loading} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onApply} disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2.5
                rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all
                flex items-center gap-2 shadow-md shadow-emerald-500/20
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
            {isFiltered && (
              <button
                onClick={onReset} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200
                  text-gray-600 rounded-xl font-semibold hover:bg-gray-50
                  hover:border-gray-300 transition-all disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PRODUCT FORM COMPONENT
// ============================================================================

function ProductForm({
  isOpen, onClose, onSubmit, initialData, isEdit, brands, categories, units
}) {
  const [formData, setFormData] = useState({
    name: '', sku: '', description: '', price: '', costPrice: '',
    brandId: '', categoryId: '', unitId: ''
  });
  const [attributeDefinitions, setAttributeDefinitions] = useState([]);
  const [attributeValues, setAttributeValues]           = useState({});
  const [loadingAttributes, setLoadingAttributes]       = useState(false);
  const [loading, setLoading]                           = useState(false);
  const [errors, setErrors]                             = useState({});

  // ── Pre-fill on open ────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        name:        initialData.name         || '',
        sku:         initialData.sku          || '',
        description: initialData.description  || '',
        price:       initialData.price        || '',
        costPrice:   initialData.costPrice    || '',
        brandId:     initialData.brand?.id    || '',
        categoryId:  initialData.category?.id || '',
        unitId:      initialData.unit?.id     || ''
      });

      // ── Map product.attributes → attributeValues ─────────────────────────
      // Handles both object shape { size: "55" } and array shape [{ name, value }]
      const existingAttrs = {};
      if (initialData.attributes && Array.isArray(initialData.attributes)) {
        initialData.attributes.forEach(a => {
          // Support both { name, value } and { attributeId, value }
          const key = a.name || a.attributeId || a.id;
          if (key) existingAttrs[key] = a.value;
        });
      } else if (
        initialData.attributes &&
        typeof initialData.attributes === 'object'
      ) {
        Object.assign(existingAttrs, initialData.attributes);
      }
      setAttributeValues(existingAttrs);
    } else {
      setFormData({
        name: '', sku: '', description: '', price: '', costPrice: '',
        brandId: '', categoryId: '', unitId: ''
      });
      setAttributeValues({});
    }
    setAttributeDefinitions([]);
    setErrors({});
  }, [initialData, isEdit, isOpen]);

  // ── Fetch attribute definitions when category changes ──────────────────────
  useEffect(() => {
    if (formData.categoryId) {
      fetchCategoryAttributes(formData.categoryId);
    } else {
      setAttributeDefinitions([]);
      setAttributeValues({});
    }
  }, [formData.categoryId]);

  const fetchCategoryAttributes = async (categoryId) => {
    setLoadingAttributes(true);
    try {
      const data = await productApi.getAttributesByCategory(categoryId);
      setAttributeDefinitions(Array.isArray(data) ? data : []);
      // Preserve existing values when opening the same category in edit mode
      if (!isEdit || String(initialData?.category?.id) !== String(categoryId)) {
        setAttributeValues({});
      }
    } catch (err) {
      console.error('Failed to fetch category attributes:', err);
      setAttributeDefinitions([]);
    } finally {
      setLoadingAttributes(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim())                  newErrors.name      = 'Product name is required';
    if (!formData.sku.trim())                   newErrors.sku       = 'SKU is required';
    if (!formData.brandId)                      newErrors.brandId   = 'Brand is required';
    if (!formData.categoryId)                   newErrors.categoryId = 'Category is required';
    if (!formData.unitId)                       newErrors.unitId    = 'Unit is required';
    if (!formData.price    || formData.price    <= 0) newErrors.price    = 'Price must be greater than 0';
    if (!formData.costPrice || formData.costPrice <= 0) newErrors.costPrice = 'Cost price must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await onSubmit({
        name:        formData.name,
        sku:         formData.sku,
        description: formData.description,
        price:       parseFloat(formData.price),
        costPrice:   parseFloat(formData.costPrice),
        brandId:     formData.brandId,
        categoryId:  formData.categoryId,
        unitId:      formData.unitId,
        attributes:  attributeValues
      });
      handleClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to save product' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '', sku: '', description: '', price: '', costPrice: '',
      brandId: '', categoryId: '', unitId: ''
    });
    setAttributeValues({});
    setAttributeDefinitions([]);
    setErrors({});
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAttributeChange = (attrName, value) => {
    setAttributeValues(prev => ({ ...prev, [attrName]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center
      justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl
        max-h-[90vh] overflow-y-auto">

        {/* Modal header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4
          flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
              ${isEdit
                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                : 'bg-gradient-to-br from-emerald-500 to-blue-600'
              }`}>
              {isEdit
                ? <Edit2 className="w-5 h-5 text-white" />
                : <Plus  className="w-5 h-5 text-white" />
              }
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text" name="name" value={formData.name}
              onChange={handleInputChange} disabled={loading}
              className={`w-full px-4 py-3 bg-gray-50 border ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none
                focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all
                disabled:opacity-60 disabled:cursor-not-allowed`}
              placeholder="e.g., iPhone 15 Pro"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
            <input
              type="text" name="sku" value={formData.sku}
              onChange={handleInputChange} disabled={loading}
              className={`w-full px-4 py-3 bg-gray-50 border ${
                errors.sku ? 'border-red-300' : 'border-gray-200'
              } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none
                focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all
                disabled:opacity-60 disabled:cursor-not-allowed`}
              placeholder="e.g., IPH15P"
            />
            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
          </div>

          {/* Brand / Category / Unit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'brandId',    label: 'Brand *',    options: brands,      placeholder: 'Select Brand',    render: b => b.name },
              { name: 'categoryId', label: 'Category *', options: categories,  placeholder: 'Select Category', render: c => c.name },
              { name: 'unitId',     label: 'Unit *',     options: units,       placeholder: 'Select Unit',     render: u => `${u.name} (${u.symbol})` }
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 bg-gray-50 border ${
                    errors[field.name] ? 'border-red-300' : 'border-gray-200'
                  } rounded-xl text-gray-900 focus:outline-none focus:ring-2
                    focus:ring-emerald-500 focus:border-transparent transition-all
                    disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <option value="">{field.placeholder}</option>
                  {field.options.map(o => (
                    <option key={o.id} value={o.id}>{field.render(o)}</option>
                  ))}
                </select>
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'price',     label: 'Selling Price (₹) *', placeholder: '80000' },
              { name: 'costPrice', label: 'Buying Price (₹) *',  placeholder: '70000' }
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <input
                  type="number" name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  min="0" step="0.01" disabled={loading}
                  className={`w-full px-4 py-3 bg-gray-50 border ${
                    errors[field.name] ? 'border-red-300' : 'border-gray-200'
                  } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none
                    focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all
                    disabled:opacity-60 disabled:cursor-not-allowed`}
                  placeholder={field.placeholder}
                />
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description" value={formData.description}
              onChange={handleInputChange} rows={3} disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                focus:ring-emerald-500 focus:border-transparent transition-all resize-none
                disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Enter product description..."
            />
          </div>

          {/* Dynamic Category Attributes */}
          {formData.categoryId && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-700">Category Attributes</span>
                {loadingAttributes && (
                  <div className="ml-auto w-4 h-4 border-2 border-emerald-500
                    border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div className="p-4">
                {loadingAttributes ? (
                  <p className="text-sm text-gray-400 text-center py-4">Loading attributes…</p>
                ) : attributeDefinitions.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No attributes defined for this category.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attributeDefinitions.map(attr => (
                      <div key={attr.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {attr.name}
                          <span className="ml-2 text-xs font-normal text-gray-400
                            bg-gray-100 px-1.5 py-0.5 rounded">
                            {attr.dataType}
                          </span>
                        </label>
                        <input
                          type={attr.dataType === 'NUMBER' ? 'number' : 'text'}
                          value={attributeValues[attr.name] ?? ''}
                          onChange={e => handleAttributeChange(attr.name, e.target.value)}
                          step={attr.dataType === 'NUMBER' ? 'any' : undefined}
                          disabled={loading}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200
                            rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none
                            focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                            transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          placeholder={`Enter ${attr.name.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Form actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={handleClose} disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700
                rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300
                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className={`flex-1 text-white px-6 py-3 rounded-xl font-semibold
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg
                ${isEdit
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25'
                  : 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 shadow-emerald-500/25'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent
                    rounded-full animate-spin" />
                  {isEdit ? 'Updating…' : 'Creating…'}
                </>
              ) : (
                isEdit ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// PRODUCT TABLE COMPONENT
// ============================================================================

function ProductTable({ products, onEdit, onDelete, loading, isOwner, actionLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product => {
    const search = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      product.brand?.name?.toLowerCase().includes(search) ||
      product.category?.name?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent
              rounded-full animate-spin" />
            <span className="text-gray-500">Loading products…</span>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    { key: 'product',     label: 'Product',     align: 'left'  },
    { key: 'sku',         label: 'SKU',         align: 'left'  },
    { key: 'brand',       label: 'Brand',       align: 'left'  },
    { key: 'category',    label: 'Category',    align: 'left'  },
    { key: 'unit',        label: 'Unit',        align: 'left'  },
    { key: 'price',       label: 'Price',       align: 'left'  },
    { key: 'costPrice',   label: 'Cost Price',  align: 'left'  },
    { key: 'attributes',  label: 'Attributes',  align: 'left'  },
    { key: 'description', label: 'Description', align: 'left'  },
    ...(isOwner ? [{ key: 'actions', label: 'Actions', align: 'right' }] : [])
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products by name, SKU, brand, or category…"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200
              rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none
              focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-500 mb-1">
            {searchTerm ? 'No products found' : 'No products match the current filters'}
          </p>
          <p className="text-sm text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Try adjusting or resetting your filters'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    className={`px-6 py-4 text-xs font-semibold text-gray-600
                      uppercase tracking-wider
                      ${col.align === 'right' ? 'text-right' : 'text-left'}
                      ${col.key === 'attributes' ? 'min-w-[200px]' : ''}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors align-top group"
                >
                  {/* Product name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500
                        to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900 whitespace-nowrap">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {product.sku}
                    </span>
                  </td>

                  {/* Brand */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                      text-xs font-medium bg-blue-100 text-blue-800">
                      <Tag className="w-3 h-3" />
                      {product.brand?.name || '—'}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {product.category?.name || '—'}
                    </span>
                  </td>

                  {/* Unit */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <Ruler className="w-3 h-3" />
                      {product.unit?.name || '—'}
                    </span>
                  </td>

                  {/* Selling price */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-emerald-600 whitespace-nowrap">
                      ₹{product.price?.toLocaleString('en-IN') || 0}
                    </span>
                  </td>

                  {/* Cost price */}
                  <td className="px-6 py-4">
                    <span className="text-gray-600 whitespace-nowrap">
                      ₹{product.costPrice?.toLocaleString('en-IN') || 0}
                    </span>
                  </td>

                  {/* Attributes */}
                  <td className="px-6 py-4 min-w-[200px] max-w-[260px]">
                    <AttributeChips attributes={product.attributes} max={3} />
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 max-w-[200px]">
                    <span className="text-sm text-gray-600 truncate block">
                      {product.description || '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  {isOwner && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit button */}
                        <button
                          onClick={() => onEdit(product)}
                          disabled={actionLoading}
                          title="Edit product"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50
                            rounded-lg transition-all disabled:opacity-40
                            disabled:cursor-not-allowed group/btn"
                        >
                          <Edit2 className="w-4 h-4 transition-transform
                            group-hover/btn:scale-110" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => onDelete(product)}
                          disabled={actionLoading}
                          title="Delete product"
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50
                            rounded-lg transition-all disabled:opacity-40
                            disabled:cursor-not-allowed group/btn"
                        >
                          <Trash2 className="w-4 h-4 transition-transform
                            group-hover/btn:scale-110" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PRODUCT MANAGEMENT PAGE
// ============================================================================

export default function ProductManagementPage() {
  const [products, setProducts]     = useState([]);
  const [brands, setBrands]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits]           = useState([]);
  const [loading, setLoading]       = useState(true);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [isEditMode, setIsEditMode]           = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification]       = useState(null);

  // ── Delete modal state ── NEW ────────────────────────────────────────────
  const [deleteProduct, setDeleteProduct]   = useState(null);  // null = closed
  const [deleteLoading, setDeleteLoading]   = useState(false);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [filters, setFilters]                       = useState({ categoryId: '', brandId: '' });
  const [attributeFilters, setAttributeFilters]     = useState({});
  const [filterAttributes, setFilterAttributes]     = useState([]);
  const [isFiltered, setIsFiltered]                 = useState(false);
  const [loadingFilterAttrs, setLoadingFilterAttrs] = useState(false);

  // ── Auth ─────────────────────────────────────────────────────────────────
  const userRole  = localStorage.getItem('role');
  const isOwner   = userRole === 'OWNER';
  const isStaff   = userRole === 'STAFF';
  const hasAccess = isOwner || isStaff;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasAccess) {
      fetchProducts();
      fetchDropdownData();
    }
  }, [hasAccess]);

  useEffect(() => {
    if (filters.categoryId) {
      fetchFilterAttributes(filters.categoryId);
    } else {
      setFilterAttributes([]);
      setAttributeFilters({});
    }
  }, [filters.categoryId]);

  // ── Data fetchers ─────────────────────────────────────────────────────────

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productApi.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [brandsData, categoriesData, unitsData] = await Promise.all([
        productApi.getBrands(),
        productApi.getCategories(),
        productApi.getUnits()
      ]);
      setBrands(Array.isArray(brandsData)       ? brandsData       : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setUnits(Array.isArray(unitsData)         ? unitsData         : []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchFilterAttributes = async (categoryId) => {
    setLoadingFilterAttrs(true);
    try {
      const data = await productApi.getAttributesByCategory(categoryId);
      setFilterAttributes(Array.isArray(data) ? data : []);
      setAttributeFilters({});
    } catch (error) {
      console.error('Error fetching filter attributes:', error);
      setFilterAttributes([]);
    } finally {
      setLoadingFilterAttrs(false);
    }
  };

  // ── Filter helpers ────────────────────────────────────────────────────────

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.brandId)    params.append('brandId',    filters.brandId);
    Object.entries(attributeFilters).forEach(([key, value]) => {
      if (value && value.toString().trim() !== '') {
        params.append(key.toLowerCase(), value.toString());
      }
    });
    return params.toString();
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const data = await productApi.getFiltered(buildQueryParams());
      setProducts(Array.isArray(data) ? data : []);
      setIsFiltered(true);
    } catch (error) {
      console.error('Error filtering products:', error);
      showNotification('Failed to apply filters', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    setFilters({ categoryId: '', brandId: '' });
    setAttributeFilters({});
    setFilterAttributes([]);
    setIsFiltered(false);
    await fetchProducts();
  };

  // ── Notifications ─────────────────────────────────────────────────────────

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Refresh — respects current filter state ───────────────────────────────

  const refreshProducts = async () => {
    if (isFiltered) {
      const data = await productApi.getFiltered(buildQueryParams());
      setProducts(Array.isArray(data) ? data : []);
    } else {
      await fetchProducts();
    }
  };

  // ── CRUD handlers ─────────────────────────────────────────────────────────

  const handleCreate = async (formData) => {
    await productApi.create(formData);
    await refreshProducts();
    showNotification('Product created successfully!', 'success');
  };

  const handleUpdate = async (formData) => {
    await productApi.update(selectedProduct.id, formData);
    await refreshProducts();
    showNotification('Product updated successfully!', 'success');
  };

  const openCreateModal = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // ── UPDATED: opens DeleteModal instead of window.confirm ─────────────────
  const handleDelete = (product) => {
    setDeleteProduct(product);   // opens the modal
  };

  // ── NEW: called when user clicks "Delete Product" inside DeleteModal ──────
  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;
    setDeleteLoading(true);
    try {
      await productApi.delete(deleteProduct.id);
      setDeleteProduct(null);          // close modal
      await refreshProducts();
      showNotification(
        `"${deleteProduct.name}" deleted successfully.`,
        'success'
      );
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete product. Please try again.',
        'error'
      );
      setDeleteProduct(null);           // still close modal on error
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Access guard ──────────────────────────────────────────────────────────

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200
          p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center
            justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You do not have permission to access product management.
          </p>
          <p className="text-sm text-gray-500">
            Only <span className="font-semibold text-gray-700">OWNER</span> and{' '}
            <span className="font-semibold text-gray-700">STAFF</span> can view products.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600
                rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                <p className="text-gray-500">Manage your inventory products</p>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white
                  px-6 py-3 rounded-xl font-semibold hover:from-emerald-600
                  hover:to-blue-700 transition-all flex items-center gap-2
                  shadow-lg shadow-emerald-500/25"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            )}
          </div>

          {/* Role badge */}
          <div className="mt-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full
              text-xs font-medium ${
                isOwner ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
              {isOwner ? '👑 Owner' : '👤 Staff'}
            </span>
          </div>

          {/* Stats cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {isFiltered ? 'Filtered Products' : 'Total Products'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isFiltered ? 'bg-amber-100' : 'bg-emerald-100'
                }`}>
                  <Package className={`w-6 h-6 ${
                    isFiltered ? 'text-amber-600' : 'text-emerald-600'
                  }`} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{products
                      .reduce((sum, p) => sum + (p.price || 0), 0)
                      .toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3
            animate-slide-in ${
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

        {/* Filter panel */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          attributeFilters={attributeFilters}
          setAttributeFilters={setAttributeFilters}
          filterAttributes={filterAttributes}
          brands={brands}
          categories={categories}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          isFiltered={isFiltered}
          loading={loading || loadingFilterAttrs}
        />

        {/* Product table */}
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          isOwner={isOwner}
          actionLoading={deleteLoading}
        />

        {/* Product form modal (owner only) */}
        {isOwner && (
          <ProductForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={isEditMode ? handleUpdate : handleCreate}
            initialData={selectedProduct}
            isEdit={isEditMode}
            brands={brands}
            categories={categories}
            units={units}
          />
        )}

        {/* Delete confirmation modal (owner only) ← NEW */}
        {isOwner && (
          <DeleteModal
            product={deleteProduct}
            onClose={() => setDeleteProduct(null)}
            onConfirm={handleConfirmDelete}
            loading={deleteLoading}
          />
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}