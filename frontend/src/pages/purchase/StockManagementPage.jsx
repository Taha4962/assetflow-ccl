import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getStockItems, createStockItem, updateStockItem, updateStockQuantity } from '../../services/stockService';
import { getCategories } from '../../services/categoryService';
import { Package, AlertTriangle, TrendingDown, Plus, Edit, RefreshCcw, X } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  in_stock: { label: 'In Stock', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  low_stock: { label: 'Low Stock', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  out_of_stock: { label: 'Out of Stock', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

const getStatus = (qty) => qty === 0 ? 'out_of_stock' : qty < 5 ? 'low_stock' : 'in_stock';

const ModalWrapper = ({ show, onClose, title, children }) => !show ? null : (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100">{title}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default function StockManagementPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const limit = 15;

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, item: null });
  const [qtyModal, setQtyModal] = useState({ show: false, item: null });

  const [form, setForm] = useState({ itemName: '', categoryId: '', quantity: '', unitPrice: '', description: '', notes: '' });
  const [qtyForm, setQtyForm] = useState({ quantity: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStockItems({ page, limit, search: search || undefined, categoryId: categoryFilter || undefined });
      setItems(res.data.data.items || []);
      setTotal(res.data.data.total || 0);
    } catch { toast.error('Failed to load stock'); }
    finally { setLoading(false); }
  }, [page, search, categoryFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => {
    getCategories().then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  const totalValue = items.reduce((sum, i) => sum + (i.quantity * Number(i.unitPrice)), 0);
  const lowStockCount = items.filter(i => getStatus(i.quantity) === 'low_stock').length;
  const outOfStockCount = items.filter(i => getStatus(i.quantity) === 'out_of_stock').length;

  const resetForm = () => setForm({ itemName: '', categoryId: '', quantity: '', unitPrice: '', description: '', notes: '' });

  const handleAdd = async () => {
    if (!form.itemName || !form.categoryId || !form.quantity || !form.unitPrice) return toast.error('Fill all required fields');
    setSaving(true);
    try {
      await createStockItem({ ...form, categoryId: parseInt(form.categoryId), quantity: parseInt(form.quantity), unitPrice: parseFloat(form.unitPrice) });
      toast.success('Stock item added');
      setAddModal(false); resetForm(); fetchItems();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add item'); }
    finally { setSaving(false); }
  };

  const openEdit = (item) => {
    setEditModal({ show: true, item });
    setForm({ itemName: item.itemName, categoryId: item.categoryId.toString(), unitPrice: Number(item.unitPrice).toString(), description: item.description || '', notes: item.notes || '' });
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      await updateStockItem(editModal.item.id, { ...form, categoryId: parseInt(form.categoryId), unitPrice: parseFloat(form.unitPrice) });
      toast.success('Stock item updated');
      setEditModal({ show: false, item: null }); fetchItems();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const openQty = (item) => {
    setQtyModal({ show: true, item });
    setQtyForm({ quantity: item.quantity.toString(), reason: '' });
  };

  const handleUpdateQty = async () => {
    const newQuantity = Number(qtyForm.quantity);
    if (!Number.isInteger(newQuantity) || newQuantity < 0) return toast.error('Enter a valid quantity');
    if (!qtyForm.reason.trim()) return toast.error('Reason is required');
    setSaving(true);
    try {
      const delta = newQuantity - qtyModal.item.quantity;
      await updateStockQuantity(qtyModal.item.id, { delta, reason: qtyForm.reason });
      toast.success('Quantity updated');
      setQtyModal({ show: false, item: null }); fetchItems();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update quantity'); }
    finally { setSaving(false); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Procurement</span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Stock & Warehouse Management</h1>
          </div>
          <button onClick={() => { resetForm(); setAddModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-violet-600/20">
            <Plus className="w-4 h-4" />Add New Stock Item
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Items</p>
            <p className="text-3xl font-black text-slate-100 mt-1">{total}</p>
          </div>
          <div className={`bg-slate-900/60 border rounded-2xl p-5 ${lowStockCount > 0 ? 'border-amber-500/30' : 'border-slate-800'}`}>
            <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider">Low Stock Items</p>
            <p className="text-3xl font-black text-amber-400 mt-1">{lowStockCount}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Stock Value</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">₹{totalValue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search items..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500 w-full md:w-52">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? <LoadingSpinner label="Loading inventory..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Item Name', 'Category', 'Qty', 'Unit Price', 'Total Value', 'Status', 'Actions'].map(h => (
                    <th key={h} className="pb-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {items.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-500">No items found.</td></tr>
                ) : items.map(item => {
                  const status = getStatus(item.quantity);
                  const { label, cls } = STATUS_CONFIG[status];
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-3">
                        <p className="font-semibold text-slate-200">{item.itemName}</p>
                        {item.description && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>}
                      </td>
                      <td className="py-4 px-3 text-slate-400 text-xs font-semibold">{item.category?.name}</td>
                      <td className="py-4 px-3 font-bold text-slate-200">{item.quantity}</td>
                      <td className="py-4 px-3 font-mono text-slate-300">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-3 font-mono font-semibold text-slate-300">₹{(item.quantity * Number(item.unitPrice)).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${cls}`}>{label}</span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors" title="Edit details">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openQty(item)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors" title="Update quantity">
                            <RefreshCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <ModalWrapper show={addModal} onClose={() => setAddModal(false)} title="Add New Stock Item">
        <div className="space-y-3">
          {[
            { label: 'Item Name *', key: 'itemName', type: 'text', placeholder: 'e.g. Dell Laptop' },
            { label: 'Quantity *', key: 'quantity', type: 'number', placeholder: '0' },
            { label: 'Unit Price (₹) *', key: 'unitPrice', type: 'number', placeholder: '0.00' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-violet-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Category *</label>
            <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:border-violet-500 focus:outline-none">
              <option value="">Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-violet-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* Edit Modal */}
      <ModalWrapper show={editModal.show} onClose={() => setEditModal({ show: false, item: null })} title={`Edit — ${editModal.item?.itemName}`}>
        <div className="space-y-3">
          {[
            { label: 'Item Name *', key: 'itemName', type: 'text' },
            { label: 'Unit Price (₹) *', key: 'unitPrice', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-violet-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Category *</label>
            <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:border-violet-500 focus:outline-none">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-violet-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditModal({ show: false, item: null })} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs">Cancel</button>
            <button onClick={handleEdit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* Update Qty Modal */}
      <ModalWrapper show={qtyModal.show} onClose={() => setQtyModal({ show: false, item: null })} title={`Update Quantity — ${qtyModal.item?.itemName}`}>
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400">
            Current Quantity: <span className="text-slate-200 font-bold">{qtyModal.item?.quantity}</span>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">New Total Quantity *</label>
            <input type="number" min="0" value={qtyForm.quantity} onChange={e => setQtyForm(p => ({ ...p, quantity: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-violet-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Reason for Change *</label>
            <textarea value={qtyForm.reason} onChange={e => setQtyForm(p => ({ ...p, reason: e.target.value }))} rows={2}
              placeholder="e.g. Stock received from vendor, Audit correction..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-violet-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setQtyModal({ show: false, item: null })} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs">Cancel</button>
            <button onClick={handleUpdateQty} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Quantity'}
            </button>
          </div>
        </div>
      </ModalWrapper>
    </Layout>
  );
}
