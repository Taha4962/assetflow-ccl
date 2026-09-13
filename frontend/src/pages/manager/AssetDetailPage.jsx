import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAssetById, unassignAsset, getAssetHistory } from '../../services/assetService';
import { format } from 'date-fns';
import {
  Package, QrCode, UserCheck, UserX, Trash2, Edit3, ClipboardList,
  ShoppingBag, Wrench, FileText, ChevronRight, ArrowLeft, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES = {
  delivered: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  unassigned: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  under_maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  disposed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};
const STATUS_LABELS = {
  delivered: 'Delivered', unassigned: 'Unassigned', active: 'Active',
  under_maintenance: 'Under Maintenance', disposed: 'Disposed',
};

const TABS = ['Details', 'Assignments', 'Repairs', 'Purchase Info', 'Audit Trail'];

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Details');
  const [unassigning, setUnassigning] = useState(false);

  const fetchAsset = async () => {
    setLoading(true);
    try {
      const res = await getAssetById(id);
      setAsset(res.data.data);
    } catch (err) {
      toast.error('Failed to load asset details');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAsset(); }, [id]);

  const handleUnassign = async () => {
    if (!window.confirm('Unassign this asset? It will be set to Unassigned status.')) return;
    setUnassigning(true);
    try {
      await unassignAsset(id, { notes: 'Unassigned via asset detail page' });
      toast.success('Asset unassigned successfully');
      fetchAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unassign asset');
    } finally { setUnassigning(false); }
  };

  if (loading) return <Layout><LoadingSpinner label="Loading asset details..." /></Layout>;
  if (!asset) return <Layout><div className="text-center text-slate-400 mt-20">Asset not found</div></Layout>;

  const currentAssignment = asset.assignments?.find(a => a.isCurrent);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center space-x-1 text-slate-500 hover:text-slate-300 text-xs mb-2 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /><span>Back to Assets</span>
            </button>
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Asset Detail</span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">{asset.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-blue-400 text-sm font-semibold">{asset.assetCode}</span>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_STYLES[asset.status]}`}>
                {STATUS_LABELS[asset.status]}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {asset.status === 'delivered' && (
              <button onClick={() => navigate(`/manager/assets/${id}/complete`)}
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /><span>Complete Details</span>
              </button>
            )}
            {asset.status === 'unassigned' && (
              <button onClick={() => navigate(`/manager/assets/${id}/assign`)}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /><span>Assign</span>
              </button>
            )}
            {asset.status === 'active' && (
              <button onClick={handleUnassign} disabled={unassigning}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50">
                <UserX className="w-3.5 h-3.5" /><span>{unassigning ? 'Unassigning...' : 'Unassign'}</span>
              </button>
            )}
            {!['disposed', 'under_maintenance'].includes(asset.status) && (
              <>
                <button onClick={() => navigate(`/manager/assets/${id}/qr`)}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" /><span>QR Code</span>
                </button>
                <button onClick={() => navigate(`/manager/assets/${id}/dispose`)}
                  className="px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /><span>Dispose</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-800 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}>{tab}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          {activeTab === 'Details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ['Asset Code', asset.assetCode],
                ['Name', asset.name],
                ['Category', asset.category?.name],
                ['Department', `${asset.department?.name} (${asset.department?.code})`],
                ['Serial Number', asset.serialNumber || '—'],
                ['Model Number', asset.modelNumber || '—'],
                ['Condition', asset.condition || '—'],
                ['Warranty Expiry', asset.warrantyExpiry ? format(new Date(asset.warrantyExpiry), 'dd MMM yyyy') : '—'],
                ['Status', STATUS_LABELS[asset.status]],
                ['Created At', format(new Date(asset.createdAt), 'dd MMM yyyy')],
              ].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="text-sm text-slate-200">{value}</p>
                </div>
              ))}
              {asset.description && (
                <div className="md:col-span-2 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</p>
                  <p className="text-sm text-slate-300">{asset.description}</p>
                </div>
              )}
              {asset.notes && (
                <div className="md:col-span-2 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Notes</p>
                  <p className="text-sm text-slate-300">{asset.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Assignments' && (
            <div className="space-y-3">
              {asset.assignments?.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No assignment history</p>
              ) : asset.assignments?.map(a => (
                <div key={a.id} className={`flex items-center justify-between p-4 rounded-xl border ${a.isCurrent ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/40'}`}>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{a.employee?.fullName}</p>
                    <p className="text-xs text-slate-500">{a.employee?.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Assigned: {format(new Date(a.assignedDate), 'dd MMM yyyy')}
                      {a.returnedDate ? ` → Returned: ${format(new Date(a.returnedDate), 'dd MMM yyyy')}` : ''}
                    </p>
                  </div>
                  {a.isCurrent && <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Current</span>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Repairs' && (
            <div className="space-y-3">
              {asset.repairRequests?.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No repair history</p>
              ) : asset.repairRequests?.map(r => (
                <div key={r.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-200">{r.issueDescription}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      r.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      r.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>{r.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-slate-500">Raised by: {r.raiser?.fullName} • {format(new Date(r.raisedAt), 'dd MMM yyyy')}</p>
                  {r.resolutionNotes && <p className="text-xs text-emerald-400">Resolution: {r.resolutionNotes}</p>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Purchase Info' && asset.purchaseDetail && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ['Vendor Name', asset.purchaseDetail.vendorName],
                ['Vendor Contact', asset.purchaseDetail.vendorContact || '—'],
                ['Invoice Number', asset.purchaseDetail.invoiceNumber],
                ['Unit Price', `₹${Number(asset.purchaseDetail.unitPrice).toLocaleString('en-IN')}`],
                ['Total Amount', `₹${Number(asset.purchaseDetail.totalAmount).toLocaleString('en-IN')}`],
                ['Quantity', asset.purchaseDetail.quantity],
                ['Purchase Date', format(new Date(asset.purchaseDetail.purchaseDate), 'dd MMM yyyy')],
                ['Delivery Date', asset.purchaseDetail.deliveryDate ? format(new Date(asset.purchaseDetail.deliveryDate), 'dd MMM yyyy') : '—'],
                ['Delivery Condition', asset.purchaseDetail.deliveryCondition || '—'],
                ['Purchased By', asset.purchaseDetail.purchaser?.fullName],
              ].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="text-sm text-slate-200">{value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Audit Trail' && (
            <div className="space-y-3">
              {asset.auditLogs?.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No audit trail</p>
              ) : asset.auditLogs?.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-800/50 bg-slate-900/30">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{log.description}</p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {log.user?.fullName} • {format(new Date(log.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
