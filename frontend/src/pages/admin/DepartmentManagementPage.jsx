import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { getDepartments, getDepartmentById, createDepartment, updateDepartment } from '../../services/deptService';
import { toast } from 'sonner';
import { Building2, Plus, Edit3, Users, PackageCheck, FileSpreadsheet, Eye, Info } from 'lucide-react';

const DepartmentManagementPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedDept, setSelectedDept] = useState(null);
  const [deptDetails, setDeptDetails] = useState(null);

  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [editFormData, setEditFormData] = useState({ name: '', code: '', description: '' });

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDepartments();
      if (res.success) setDepartments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createDepartment(formData);
      if (res.success) {
        toast.success('Department created successfully');
        setIsAddModalOpen(false);
        setFormData({ name: '', code: '', description: '' });
        fetchDepartments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    try {
      const res = await updateDepartment(selectedDept.id, editFormData);
      if (res.success) {
        toast.success('Department updated successfully');
        setIsEditModalOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update department');
    }
  };

  const openEditModal = (dept) => {
    setSelectedDept(dept);
    setEditFormData({ name: dept.name, code: dept.code, description: dept.description || '' });
    setIsEditModalOpen(true);
  };

  const openDetailModal = async (dept) => {
    setSelectedDept(dept);
    setIsDetailModalOpen(true);
    setDeptDetails(null);
    try {
      const res = await getDepartmentById(dept.id);
      if (res.success) setDeptDetails(res.data);
    } catch (err) {
      toast.error('Failed to load department details');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
              CCL Structure • Divisions
            </span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
              Department Management ({departments.length})
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              View departmental structures, personnel allocation, and asset inventory statistics.
            </p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center space-x-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Department</span>
            </button>
          )}
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchDepartments} />}

        {loading ? (
          <LoadingSpinner label="Loading departments inventory..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-extrabold text-xs">
                      {dept.code}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDetailModal(dept)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="View Full Department Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => openEditModal(dept)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Edit Department"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 mt-3 group-hover:text-purple-300 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {dept.description || 'No detailed description specified for this department.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Assets</p>
                    <p className="text-base font-extrabold text-slate-200 mt-0.5">
                      {dept._count?.assets || 0}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Staff</p>
                    <p className="text-base font-extrabold text-slate-200 mt-0.5">
                      {dept._count?.users || 0}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Requests</p>
                    <p className="text-base font-extrabold text-slate-200 mt-0.5">
                      {dept._count?.requests || 0}
                    </p>
                  </div>
                </div>

                {isSuperAdmin && (
                  <button
                    onClick={() => navigate(`/admin/departments/${dept.id}/detail`)}
                    className="w-full mt-3 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-600/20 transition-colors"
                  >
                    View Full Details →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Department */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Department"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Department Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                placeholder="e.g. Mechanical Engineering"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Department Code (Unique)</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 uppercase focus:outline-none focus:border-purple-500"
                placeholder="e.g. MECH"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                placeholder="Scope of work and responsibilities..."
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
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                Save Department
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Department */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Department: ${selectedDept?.name}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Department Name</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Department Code</label>
              <input
                type="text"
                required
                value={editFormData.code}
                onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 uppercase focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
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
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                Update Department
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: View Single Department Details */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Department Breakdown: ${selectedDept?.name} (${selectedDept?.code})`}
        >
          {!deptDetails ? (
            <LoadingSpinner label="Fetching department staff & asset breakdown..." />
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-slate-400">{deptDetails.description || 'No description available'}</p>
              </div>

              {/* Users List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Assigned Personnel ({deptDetails.users?.length || 0})</span>
                </h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-800/60">
                  {deptDetails.users?.length === 0 ? (
                    <p className="p-4 text-xs text-slate-500 text-center">No staff assigned to this department.</p>
                  ) : (
                    deptDetails.users.map((u) => (
                      <div key={u.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-200">{u.fullName}</p>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </div>
                        <Badge variant="role">{u.role}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Asset Summary Counts */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  <span>Asset Inventory Status Summary</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(deptDetails.assetSummary || {}).length === 0 ? (
                    <p className="col-span-2 text-xs text-slate-500 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      No assets currently registered under this department.
                    </p>
                  ) : (
                    Object.entries(deptDetails.assetSummary || {}).map(([status, count]) => (
                      <div key={status} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-slate-400 capitalize">{status.replace('_', ' ')}</span>
                        <span className="font-extrabold text-slate-200">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default DepartmentManagementPage;
