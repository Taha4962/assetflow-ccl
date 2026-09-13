import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { getAssetRequests, createAssetRequest, approveRequest, editAndResubmitRequest, rejectRequest } from '../../services/requestService';
import { getDepartmentBudget } from '../../services/budgetService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileSpreadsheet, Plus, X, AlertTriangle, CheckCircle, Edit2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending — Awaiting Costing', cls: 'bg-slate-700/50 text-slate-400 border-slate-600' },
  awaiting_approval: { label: 'Awaiting Your Review', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', pulse: true },
  approved: { label: 'Approved', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  rejected: { label: 'Rejected', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  fulfilled_from_stock: { label: 'Fulfilled from Stock', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  purchased: { label: 'Purchased', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  delivered: { label: 'Delivered', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export default function AssetRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [budget, setBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ assetName: '', quantity: 1, reason: '' });

  // Approve / Edit / Reject modals
  const [activeReq, setActiveReq] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ assetName: '', quantity: '', reason: '' });
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAssetRequests({ status: filterStatus || undefined });
      setRequests(res.data || []);
    } catch { toast.error('Failed to fetch requests'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => {
    if (user?.departmentId) {
      getDepartmentBudget(user.departmentId).then(r => setBudget(r.data.data)).catch(() => {});
    }
  }, [user]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await createAssetRequest({ assetName: formData.assetName, quantity: Number(formData.quantity), reason: formData.reason });
      toast.success('Request raised successfully!');
      setIsModalOpen(false);
      setFormData({ assetName: '', quantity: 1, reason: '' });
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to raise request'); }
  };

  const handleApprove = async (req) => {
    if (!window.confirm(`Approve request for "${req.assetName}"?`)) return;
    setSaving(true);
    try {
      const res = await approveRequest(req.id);
      if (res.data.warning) {
        toast.warning(`Request approved with budget warning: ${res.data.warning}`);
      } else {
        toast.success('Request approved successfully');
      }
      fetchRequests();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to approve'); }
    finally { setSaving(false); }
  };

  const openEditModal = (req) => {
    setActiveReq(req);
    setEditForm({ assetName: req.assetName, quantity: req.quantity.toString(), reason: req.reason });
    setEditModal(true);
  };

  const handleEditResubmit = async () => {
    setSaving(true);
    try {
      await editAndResubmitRequest(activeReq.id, { assetName: editForm.assetName, quantity: parseInt(editForm.quantity), reason: editForm.reason });
      toast.success('Request edited and sent back for costing');
      setEditModal(false);
      fetchRequests();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to edit'); }
    finally { setSaving(false); }
  };

  const openRejectModal = (req) => { setActiveReq(req); setRejectionReason(''); setRejectModal(true); };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return toast.error('Rejection reason is required');
    setSaving(true);
    try {
      await rejectRequest(activeReq.id, { rejectionReason });
      toast.success('Request rejected');
      setRejectModal(false);
      fetchRequests();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to reject'); }
    finally { setSaving(false); }
  };

  const allStatuses = ['', 'pending', 'awaiting_approval', 'approved', 'rejected', 'fulfilled_from_stock', 'purchased', 'delivered'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Procurement</span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Purchase Requisitions</h1>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shrink-0 transition-colors">
            <Plus className="w-4 h-4" />Raise Purchase Request
          </button>
        </div>

        {/* Budget Summary Card */}
        {budget && (
          <div className={`p-4 rounded-2xl border flex items-center gap-6 ${
            (Number(budget.usedBudget) / Number(budget.totalBudget)) > 0.9
              ? 'bg-rose-500/5 border-rose-500/20'
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">This Month's Budget</p>
              <p className="text-lg font-black text-slate-100">₹{Number(budget.totalBudget).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Used</p>
              <p className="text-lg font-black text-rose-400">₹{Number(budget.usedBudget).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Remaining</p>
              <p className="text-lg font-black text-emerald-400">₹{Number(budget.remainingBudget).toLocaleString('en-IN')}</p>
            </div>
            <div className="flex-1">
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-rose-500 transition-all" style={{ width: `${Math.min((Number(budget.usedBudget)/Number(budget.totalBudget))*100, 100)}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{((Number(budget.usedBudget)/Number(budget.totalBudget))*100).toFixed(1)}% utilized</p>
            </div>
          </div>
        )}
        {!budget && (
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 text-xs text-slate-500">
            Budget not set for this month. Contact Super Admin.
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {allStatuses.map(st => (
            <button key={st} onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all ${
                filterStatus === st ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}>
              {st === '' ? 'All' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner label="Loading requests..." /> : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No requests found.
              </div>
            ) : requests.map(req => {
              const { label, cls, pulse } = STATUS_CONFIG[req.status] || { label: req.status, cls: 'bg-slate-700/50 text-slate-400 border-slate-600' };
              const budgetWarning = budget && req.estimatedCost && Number(req.estimatedCost) > Number(budget.remainingBudget);

              return (
                <div key={req.id} className={`bg-slate-900/60 border rounded-2xl p-5 space-y-4 transition-colors ${pulse ? 'border-amber-500/30 shadow-amber-900/10 shadow-lg' : 'border-slate-800'}`}>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-mono text-slate-500">#{req.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${cls}`}>{label}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-2">{req.assetName} <span className="text-slate-500 text-sm font-normal">× {req.quantity}</span></h3>
                      <p className="text-xs text-slate-400 mt-1">{req.reason}</p>
                      <p className="text-[11px] text-slate-600 mt-2">{format(new Date(req.createdAt), 'dd MMM yyyy')}</p>
                    </div>

                    {/* AWAITING APPROVAL Action Card */}
                    {req.status === 'awaiting_approval' && (
                      <div className="md:w-80 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                        <p className="text-xs font-bold text-amber-400">Purchase Officer has submitted a cost estimate</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-slate-500 uppercase text-[10px] font-bold">Estimated Cost</p>
                            <p className="text-slate-200 font-bold">₹{req.estimatedCost ? Number(req.estimatedCost).toLocaleString('en-IN') : '—'}</p>
                          </div>
                          {budget && (
                            <div>
                              <p className="text-slate-500 uppercase text-[10px] font-bold">Budget Remaining</p>
                              <p className={`font-bold ${budgetWarning ? 'text-rose-400' : 'text-emerald-400'}`}>₹{Number(budget.remainingBudget).toLocaleString('en-IN')}</p>
                            </div>
                          )}
                        </div>
                        
                        {req.costNote && (
                          <div className="bg-slate-800/50 rounded-lg p-2 text-[11px] text-slate-400">
                            <span className="font-bold text-slate-300">Note: </span>{req.costNote}
                          </div>
                        )}

                        {budgetWarning && (
                          <div className="flex items-center gap-2 text-[11px] text-rose-400 bg-rose-500/5 border border-rose-500/20 rounded-lg p-2">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>This exceeds the remaining budget</span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button onClick={() => handleApprove(req)} disabled={saving}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" />Approve
                          </button>
                          <button onClick={() => openEditModal(req)} disabled={saving}
                            className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />Edit
                          </button>
                          <button onClick={() => openRejectModal(req)} disabled={saving}
                            className="flex-1 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors">
                            <XCircle className="w-3.5 h-3.5" />Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {req.status === 'rejected' && req.costNote && (
                      <div className="md:w-72 bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-400">
                        <p className="font-bold mb-1">Rejection Reason</p>
                        <p>{req.costNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New Request Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise Department Purchase Request">
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Asset Name / Model</label>
              <input type="text" required value={formData.assetName} onChange={e => setFormData({ ...formData, assetName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="e.g. Dell Latitude 5440 Laptops" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Quantity Required</label>
              <input type="number" min={1} required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Reason & Justification</label>
              <textarea rows={4} required value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="Specify purpose, project scope, or replacement need..." />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">Submit Request</button>
            </div>
          </form>
        </Modal>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Edit & Resubmit Request</h3>
              <button onClick={() => setEditModal(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500">Changes will reset the cost estimate and send back to Purchase Officer for re-costing.</p>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Asset Name</label>
                <input value={editForm.assetName} onChange={e => setEditForm(p => ({ ...p, assetName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Quantity</label>
                <input type="number" value={editForm.quantity} onChange={e => setEditForm(p => ({ ...p, quantity: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Reason</label>
                <textarea rows={3} value={editForm.reason} onChange={e => setEditForm(p => ({ ...p, reason: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs">Cancel</button>
                <button onClick={handleEditResubmit} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs disabled:opacity-50">
                  {saving ? 'Saving...' : 'Submit Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Reject Request</h3>
              <button onClick={() => setRejectModal(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400">
                Are you sure you want to reject the request for <strong>"{activeReq?.assetName}"</strong>? This will permanently close this request.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Rejection Reason *</label>
                <textarea rows={3} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-rose-500 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRejectModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs">Cancel</button>
                <button onClick={handleReject} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50">
                  {saving ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
