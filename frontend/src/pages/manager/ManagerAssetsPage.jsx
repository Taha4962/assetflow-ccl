import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAssets } from '../../services/assetService';
import { getCategories } from '../../services/categoryService';
import { format } from 'date-fns';
import { Package, Plus, Eye, QrCode, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function ManagerAssetsPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search, status: statusFilter, categoryId: categoryFilter };
      const res = await getAssets(params);
      setAssets(res.data.data.assets || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Department Assets</span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Asset Inventory</h1>
            <p className="text-xs text-slate-400 mt-1">{total} total assets in your department</p>
          </div>
          <button
            onClick={() => navigate('/manager/assets/new-from-request')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" /><span>Complete Asset Details</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, asset code, serial number..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white">Search</button>
          </form>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? <LoadingSpinner label="Loading assets..." /> : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Asset Code', 'Name', 'Category', 'Status', 'Assigned To', 'Warranty', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {assets.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-500">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No assets found
                    </td></tr>
                  ) : assets.map(asset => {
                    const currentAssignment = asset.assignments?.[0];
                    return (
                      <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-4 py-3 font-mono text-blue-400 font-semibold">{asset.assetCode}</td>
                        <td className="px-4 py-3 text-slate-200 font-medium">{asset.name}</td>
                        <td className="px-4 py-3 text-slate-400">{asset.category?.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_STYLES[asset.status]}`}>
                            {STATUS_LABELS[asset.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {currentAssignment ? currentAssignment.employee?.fullName : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {asset.warrantyExpiry ? format(new Date(asset.warrantyExpiry), 'dd MMM yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/manager/assets/${asset.id}`)}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                              title="View Details"
                            ><Eye className="w-3.5 h-3.5" /></button>
                            <button
                              onClick={() => navigate(`/manager/assets/${asset.id}/qr`)}
                              className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                              title="QR Code"
                            ><QrCode className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
                <p className="text-xs text-slate-500">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
