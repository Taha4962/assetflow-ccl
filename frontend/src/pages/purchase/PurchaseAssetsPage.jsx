import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAssets } from '../../services/assetService';
import { format } from 'date-fns';
import { Package, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PurchaseAssetsPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await getAssets({ page, limit, search });
      setAssets(res.data.data.assets || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, [page, search]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Purchasing Department</span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Registered Assets</h1>
            <p className="text-xs text-slate-400 mt-1">Assets you have purchased and registered in the system.</p>
          </div>
          <button
            onClick={() => navigate('/purchase/assets/new')}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/20 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" /><span>Register New Asset</span>
          </button>
        </div>

        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search by invoice or code..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500" />
            </div>
            <button type="submit" className="px-3 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white">Search</button>
          </form>
        </div>

        {loading ? <LoadingSpinner label="Loading assets..." /> : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Asset Code', 'Department', 'Vendor', 'Invoice', 'Amount', 'Status', 'Registered On'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {assets.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-500">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />No assets registered yet
                    </td></tr>
                  ) : assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold">
                        <button onClick={() => navigate(`/purchase/assets/${asset.id}`)} className="text-violet-400 hover:text-violet-300 hover:underline">
                          {asset.assetCode}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{asset.department?.code}</td>
                      <td className="px-4 py-3 text-slate-300">{asset.purchaseDetail?.vendorName || '—'}</td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-[10px]">{asset.purchaseDetail?.invoiceNumber || '—'}</td>
                      <td className="px-4 py-3 text-slate-200 font-semibold">
                        {asset.purchaseDetail?.totalAmount ? `₹${Number(asset.purchaseDetail.totalAmount).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full border text-[10px] font-bold bg-slate-800 text-slate-300 border-slate-700">
                          {asset.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{format(new Date(asset.createdAt), 'dd MMM yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
                <p className="text-xs text-slate-500">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-xs text-slate-400">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
