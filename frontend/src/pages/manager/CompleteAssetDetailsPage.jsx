import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAssetById, completeAssetDetails } from '../../services/assetService';
import { getCategories } from '../../services/categoryService';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CompleteAssetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', serialNumber: '', modelNumber: '', description: '',
    warrantyExpiry: '', condition: 'Good', notes: '', categoryId: '',
  });

  useEffect(() => {
    Promise.all([getAssetById(id), getCategories()])
      .then(([assetRes, catRes]) => {
        const a = assetRes.data.data;
        setAsset(a);
        setCategories(catRes.data.data || []);
        setForm(f => ({
          ...f,
          categoryId: String(a.categoryId || ''),
          name: a.name?.startsWith('Asset CCL') ? '' : a.name || '',
        }));
      })
      .catch(() => toast.error('Failed to load asset'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Asset name is required'); return; }
    setSubmitting(true);
    try {
      await completeAssetDetails(id, {
        ...form,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
      });
      toast.success('Asset details completed! Asset is now Unassigned.');
      navigate(`/manager/assets/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete details');
    } finally { setSubmitting(false); }
  };

  if (loading) return <Layout><LoadingSpinner label="Loading..." /></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-1 text-slate-500 hover:text-slate-300 text-xs mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /><span>Back</span>
          </button>
          <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400">Step 2 — Technical Details</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Complete Asset Registration</h1>
          <p className="text-xs text-slate-400 mt-1">Asset Code: <span className="font-mono text-blue-400">{asset?.assetCode}</span></p>
          <div className="mt-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/20">
            <p className="text-xs text-sky-400">
              <strong>Note:</strong> Completing these details will move the asset from "Delivered" → "Unassigned" status, making it ready for assignment.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          {/* Asset Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Asset Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. Dell Latitude 5540 Laptop"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Serial Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Serial Number</label>
              <input name="serialNumber" value={form.serialNumber} onChange={handleChange}
                placeholder="e.g. SN-DELL-001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500" />
            </div>
            {/* Model Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Model Number</label>
              <input name="modelNumber" value={form.modelNumber} onChange={handleChange}
                placeholder="e.g. LAT-5540"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Category</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500">
                {['Excellent', 'Good', 'Fair', 'Needs Repair', 'Poor'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Warranty Expiry */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Warranty Expiry Date</label>
            <input type="date" name="warrantyExpiry" value={form.warrantyExpiry} onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              placeholder="Additional technical description..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              placeholder="Any additional notes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Complete Asset Registration'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
