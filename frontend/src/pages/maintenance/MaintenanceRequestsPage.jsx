import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRepairRequests, updateRepairStatus } from '../../services/repairService';
import { format } from 'date-fns';
import { Wrench, CheckCircle, AlertCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function MaintenanceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [statusFilter, setStatusFilter] = useState('');
  const [resolutionModal, setResolutionModal] = useState({ show: false, reqId: null });
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getRepairRequests({ page, limit, status: statusFilter });
      const payload = res?.data?.data ?? res?.data ?? {};
      setRequests(Array.isArray(payload.requests) ? payload.requests : []);
      setTotal(Number(payload.total ?? 0));
    } catch (err) { toast.error('Failed to load repair requests'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [page, statusFilter]);

  const handleUpdateStatus = async (id, newStatus, notes = '') => {
    if (newStatus === 'in_progress' && !window.confirm('Mark this request as In Progress?')) return;
    
    setUpdating(true);
    try {
      await updateRepairStatus(id, { status: newStatus, resolutionNotes: notes });
      toast.success(`Request marked as ${newStatus.replace('_', ' ')}`);
      if (newStatus === 'resolved') {
        setResolutionModal({ show: false, reqId: null });
        setResolutionNotes('');
      }
      fetchRequests();
    } catch (err) {
      toast.error('Failed to update status');
    } finally { setUpdating(false); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Maintenance Queue</span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Repair Requests</h1>
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full md:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {loading ? <LoadingSpinner label="Loading requests..." /> : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No repair requests found.
              </div>
            ) : requests.map(r => (
              <div key={r.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-5 hover:border-slate-700/50 transition-colors">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${STATUS_STYLES[r.status]}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{r.asset?.name}</h3>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{r.asset?.assetCode}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{r.asset?.department?.code}</span>
                  </div>
                  
                  <p className="text-sm text-slate-300 font-medium">{r.issueDescription}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 pt-2 border-t border-slate-800/50">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {format(new Date(r.raisedAt), 'dd MMM yyyy, hh:mm a')}</span>
                    <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Urgency: <span className={r.urgency === 'high' ? 'text-rose-400' : r.urgency === 'medium' ? 'text-amber-400' : ''}>{r.urgency.toUpperCase()}</span></span>
                    <span className="flex items-center gap-1.5 text-slate-400">Raised by: {r.raiser?.fullName}</span>
                  </div>
                </div>
                
                <div className="md:w-48 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-5">
                  {r.status === 'pending' && (
                    <button onClick={() => handleUpdateStatus(r.id, 'in_progress')} disabled={updating}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex justify-center items-center gap-2">
                      <Wrench className="w-3.5 h-3.5" /><span>Start Repair</span>
                    </button>
                  )}
                  {r.status === 'in_progress' && (
                    <button onClick={() => setResolutionModal({ show: true, reqId: r.id })} disabled={updating}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex justify-center items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5" /><span>Mark Resolved</span>
                    </button>
                  )}
                  {r.status === 'resolved' && (
                    <div className="text-xs text-emerald-400 text-center">
                      <p className="font-bold mb-1">Resolved On</p>
                      <p>{format(new Date(r.resolvedAt), 'dd MMM yyyy')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <p className="text-xs text-slate-500">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-slate-400">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Resolution Modal */}
        {resolutionModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800"><h3 className="text-sm font-bold text-slate-100">Resolve Repair Request</h3></div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Resolution Notes *</label>
                  <textarea value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} rows={3}
                    placeholder="Describe what was fixed..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setResolutionModal({ show: false, reqId: null })} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs">Cancel</button>
                  <button onClick={() => handleUpdateStatus(resolutionModal.reqId, 'resolved', resolutionNotes)} disabled={updating || !resolutionNotes.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex justify-center items-center gap-2 disabled:opacity-50">
                    <CheckCircle className="w-4 h-4" /><span>Confirm Resolve</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
