import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getEmployeeAssets } from '../../services/assetService';
import { raiseRepairRequest } from '../../services/repairService';
import { format } from 'date-fns';
import { MonitorSmartphone, Wrench, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeAssetsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repairModal, setRepairModal] = useState({ show: false, assetId: null, assetName: '' });
  const [repairForm, setRepairForm] = useState({ issueDescription: '', urgency: 'medium' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await getEmployeeAssets(user.id);
      setAssets(res.data.data || []);
    } catch (err) { toast.error('Failed to load assets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleRaiseRepair = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await raiseRepairRequest({ ...repairForm, assetId: repairModal.assetId });
      toast.success('Repair request submitted successfully');
      setRepairModal({ show: false, assetId: null, assetName: '' });
      setRepairForm({ issueDescription: '', urgency: 'medium' });
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400">My Workspace</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Assigned Assets</h1>
        </div>

        {loading ? <LoadingSpinner label="Loading your assets..." /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                <MonitorSmartphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No assets currently assigned to you
              </div>
            ) : assets.map(a => (
              <div key={a.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-teal-500/30 transition-all flex flex-col">
                <div className="flex-1">
                  <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">{a.asset.assetCode}</span>
                  <button onClick={() => navigate(`/employee/assets/${a.asset.id}`)} className="text-lg font-bold text-slate-100 mt-2 leading-tight text-left hover:text-teal-300 hover:underline">
                    {a.asset.name}
                  </button>
                  <p className="text-xs text-slate-400 mt-1">{a.asset.category?.name}</p>
                  <p className="text-xs text-slate-500 mt-3">Assigned: {format(new Date(a.assignedDate), 'dd MMM yyyy')}</p>
                </div>
                <button onClick={() => setRepairModal({ show: true, assetId: a.asset.id, assetName: a.asset.name })}
                  className="mt-5 w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold transition-colors flex items-center justify-center gap-2">
                  <Wrench className="w-3.5 h-3.5" /><span>Report Issue</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Repair Modal */}
        {repairModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100">Report Issue</h3>
                <button onClick={() => setRepairModal({ show: false })} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleRaiseRepair} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Asset</label>
                  <input value={repairModal.assetName} disabled className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Issue Description *</label>
                  <textarea value={repairForm.issueDescription} onChange={e => setRepairForm({ ...repairForm, issueDescription: e.target.value })} required rows={3}
                    placeholder="Describe the problem in detail..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Urgency</label>
                  <select value={repairForm.urgency} onChange={e => setRepairForm({ ...repairForm, urgency: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:border-amber-500 focus:outline-none">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="w-full mt-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /><span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
