import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRepairRequests } from '../../services/repairService';
import { format } from 'date-fns';
import { Wrench, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const URGENCY_STYLES = {
  low: 'text-slate-400',
  medium: 'text-amber-400',
  high: 'text-rose-400',
};

export default function EmployeeRepairsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRepairRequests()
      .then(res => setRequests(res.data.data.requests || []))
      .catch(() => toast.error('Failed to load repair requests'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Support & Maintenance</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">My Repair Requests</h1>
        </div>

        {loading ? <LoadingSpinner label="Loading requests..." /> : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                You have no active repair requests.
              </div>
            ) : requests.map(r => (
              <div key={r.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-5 hover:border-amber-500/30 transition-colors">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-100">{r.asset?.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{r.asset?.assetCode}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${STATUS_STYLES[r.status]}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{r.issueDescription}</p>
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 pt-2">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Raised: {format(new Date(r.raisedAt), 'dd MMM yyyy, hh:mm a')}</span>
                    <span className={`flex items-center gap-1.5 ${URGENCY_STYLES[r.urgency]}`}><AlertCircle className="w-3.5 h-3.5" /> Urgency: {r.urgency.toUpperCase()}</span>
                    {r.handler && <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Handled by: {r.handler.fullName}</span>}
                  </div>
                </div>
                
                {r.status === 'resolved' && r.resolutionNotes && (
                  <div className="md:w-1/3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1">Resolution Notes</p>
                    <p className="text-xs text-emerald-400">{r.resolutionNotes}</p>
                    <p className="text-[10px] text-emerald-500/70 mt-2">Resolved: {format(new Date(r.resolvedAt), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
