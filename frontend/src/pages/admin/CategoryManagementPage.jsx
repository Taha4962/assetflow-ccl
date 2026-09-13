import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { getCategories, createCategory, updateCategory } from '../../services/categoryService';
import { toast } from 'sonner';
import { FolderTree, Plus, Edit3, Layers } from 'lucide-react';

const CategoryManagementPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCategories();
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch asset categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createCategory(formData);
      if (res.success) {
        toast.success('Asset category created successfully');
        setIsAddModalOpen(false);
        setFormData({ name: '', description: '' });
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create asset category');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      const res = await updateCategory(selectedCategory.id, editFormData);
      if (res.success) {
        toast.success('Asset category updated successfully');
        setIsEditModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update asset category');
    }
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setEditFormData({ name: cat.name, description: cat.description || '' });
    setIsEditModalOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Asset Taxonomy • Classification
            </span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
              Asset Categories ({categories.length})
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Standardized equipment and asset categories used across CCL operations.
            </p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Asset Category</span>
            </button>
          )}
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchCategories} />}

        {loading ? (
          <LoadingSpinner label="Loading asset categories taxonomy..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <FolderTree className="w-5 h-5" />
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 mt-4 group-hover:text-emerald-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-3">
                    {cat.description || 'No detailed description provided for this classification.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Registered Assets</span>
                  </span>
                  <span className="font-extrabold text-slate-200 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {cat._count?.assets || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Category */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Asset Category"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. IT Equipment"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                placeholder="Types of assets included in this category..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Save Category
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Category */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Asset Category: ${selectedCategory?.name}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Update Category
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CategoryManagementPage;
