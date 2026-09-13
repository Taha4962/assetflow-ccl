import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAssetRequests, addCosting, fulfilFromStock } from '../../services/requestService';
import { getStockItems } from '../../services/stockService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ShoppingBag, Building2, DollarSign, Package, X, Clock, CheckCircle, XCircle, Warehouse } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending — Awaiting Costing', cls: 'bg-slate-700/50 text-slate-400 border-slate-600' },
  awaiting_approval: { label: 'Awaiting Manager Approval', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  approved: { label: 'Approved', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  rejected: { label: 'Rejected', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  fulfilled_from_stock: { label: 'Fulfilled from Stock', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  purchased: { label: 'Purchased', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  delivered: { label: 'Delivered', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [stockItems, setStockItems] = useState([]);

  // Add Costing Modal
  const [costModal, setCostModal] = useState({ show: false, req: null });
  const [costForm, setCostForm] = useState({ estimatedCost: '', costNote: '' });
  const [saving, setSaving] = useState(false);

  // Fulfil from Stock Modal
  const [fulfilModal, setFulfilModal] = useState({ show: false, req: null });
  const [fulfilForm, setFulfilForm] = useState({ stockItemId: '', quantityToFulfil: '' });

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
    getStockItems({ limit: 100 }).then(r => setStockItems(r.data.data?.items || [])).catch(() => {});
  }, []);

  const handleAddCosting = async () => {
    if (!costForm.estimatedCost) return toast.error('Estimated cost is required');
    setSaving(true);
    try {
      await addCosting(costModal.req.id, { estimatedCost: parseFloat(costForm.estimatedCost), costNote: costForm.costNote });
      toast.success('Cost submitted — request sent to manager for approval');
      setCostModal({ show: false, req: null });
      fetchRequests();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to submit costing'); }
    finally { setSaving(false); }
  };

  const handleFulfilFromStock = async () => {
    if (!fulfilForm.stockItemId || !fulfilForm.quantityToFulfil) return toast.error('Fill all fields');
    setSaving(true);
    try {
      await fulfilFromStock(fulfilModal.req.id, { stockItemId: parseInt(fulfilForm.stockItemId), quantityToFulfil: parseInt(fulfilForm.quantityToFulfil) });
      toast.success('Request fulfilled from stock successfully!');
      setFulfilModal({ show: false, req: null });
      fetchRequests();
    } catch (e) { toast.error(e.response?.data?.message || 'Fulfillment failed'); }
    finally { setSaving(false); }
  };

  const allStatuses = ['', 'pending', 'awaiting_approval', 'approved', 'rejected', 'fulfilled_from_stock', 'purchased', 'delivered'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Procurement • Fulfillment</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Purchase Requisitions Pipeline</h1>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {allStatuses.map(st => (
            <button key={st} onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all ${
                filterStatus === st ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}>
              {st === '' ? 'All' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner label="Loading requests..." /> : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No requests found.
              </div>
            ) : requests.map(req => {
              const { label, cls } = STATUS_CONFIG[req.status] || { label: req.status, cls: 'bg-slate-700/50 text-slate-400 border-slate-600' };
              // Find matching stock
              const matchingStock = stockItems.filter(s => s.itemName.toLowerCase().includes(req.assetName.toLowerCase().split(' ')[0]));
              const availableStock = matchingStock.filter(s => s.quantity >= req.quantity);
              const hasStock = availableStock.length > 0;

              return (
                <div key={req.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700/60 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-mono text-slate-500">#{req.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${cls}`}>{label}</span>
                        {req.status === 'approved' && (
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${hasStock ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-500 border-slate-700'}`}>
                            {hasStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-2">{req.assetName} <span className="text-slate-500 text-sm font-normal">× {req.quantity}</span></h3>
                      <p className="text-xs text-slate-400 mt-1">{req.reason}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{req.department?.name}</span>
                        <span>{format(new Date(req.createdAt), 'dd MMM yyyy')}</span>
                      </div>
                    </div>

                    {/* Actions per status */}
                    <div className="flex flex-col gap-2 md:w-48 shrink-0">
                      {req.status === 'pending' && (
                        <button onClick={() => { setCostModal({ show: true, req }); setCostForm({ estimatedCost: '', costNote: '' }); }}
                          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                          <DollarSign className="w-3.5 h-3.5" />Add Costing
                        </button>
                      )}
                      {req.status === 'awaiting_approval' && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
                          <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                          <p className="text-[11px] text-amber-400 font-semibold">Waiting for Manager Decision</p>
                          {req.estimatedCost && <p className="text-[11px] text-amber-400/70 mt-1">Submitted: ₹{Number(req.estimatedCost).toLocaleString('en-IN')}</p>}
                        </div>
                      )}
                      {req.status === 'approved' && (
                        <>
                          {hasStock && (
                            <button onClick={() => { setFulfilModal({ show: true, req }); setFulfilForm({ stockItemId: availableStock[0]?.id?.toString() || '', quantityToFulfil: req.quantity.toString() }); }}
                              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                              <Warehouse className="w-3.5 h-3.5" />Fulfil from Stock
                            </button>
                          )}
                          <button className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                            <ShoppingBag className="w-3.5 h-3.5" />Purchase Externally
                          </button>
                        </>
                      )}
                      {req.status === 'rejected' && (
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-center">
                          <XCircle className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                          <p className="text-[11px] text-rose-400 font-semibold">Rejected by Manager</p>
                          {req.costNote && <p className="text-[11px] text-rose-400/70 mt-1">{req.costNote}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Show submitted cost for awaiting_approval */}
                  {req.status === 'awaiting_approval' && req.costNote && (
                    <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400 border-t border-slate-800">
                      <span className="font-bold text-slate-300">Cost Note: </span>{req.costNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Costing Modal */}
      {costModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Add Costing — #{costModal.req?.id}</h3>
              <button onClick={() => setCostModal({ show: false, req: null })} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400">
                <p className="font-bold text-slate-200 mb-1">{costModal.req?.assetName} × {costModal.req?.quantity}</p>
                <p>{costModal.req?.department?.name}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Estimated Cost (₹) *</label>
                <input type="number" value={costForm.estimatedCost} onChange={e => setCostForm(p => ({ ...p, estimatedCost: e.target.value }))}
                  placeholder="e.g. 85000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Cost Note / Breakdown</label>
                <textarea value={costForm.costNote} onChange={e => setCostForm(p => ({ ...p, costNote: e.target.value }))} rows={3}
                  placeholder="Explain cost breakdown, vendor quotes, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCostModal({ show: false, req: null })} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs">Cancel</button>
                <button onClick={handleAddCosting} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs disabled:opacity-50">
                  {saving ? 'Submitting...' : 'Submit to Manager'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fulfil from Stock Modal */}
      {fulfilModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Fulfil from Stock — #{fulfilModal.req?.id}</h3>
              <button onClick={() => setFulfilModal({ show: false, req: null })} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Select Stock Item *</label>
                <select value={fulfilForm.stockItemId} onChange={e => setFulfilForm(p => ({ ...p, stockItemId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none">
                  <option value="">Select...</option>
                  {stockItems.filter(s => s.quantity > 0).map(s => (
                    <option key={s.id} value={s.id}>{s.itemName} (Qty: {s.quantity} @ ₹{Number(s.unitPrice).toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Quantity to Fulfil *</label>
                <input type="number" min="1" value={fulfilForm.quantityToFulfil} onChange={e => setFulfilForm(p => ({ ...p, quantityToFulfil: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setFulfilModal({ show: false, req: null })} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs">Cancel</button>
                <button onClick={handleFulfilFromStock} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50">
                  {saving ? 'Fulfilling...' : 'Confirm Fulfillment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
