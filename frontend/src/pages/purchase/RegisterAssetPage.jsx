import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { registerAsset } from '../../services/assetService';
import { getDepartments } from '../../services/deptService';
import { getCategories } from '../../services/categoryService';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterAssetPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    departmentId: '', categoryId: '', vendorName: '', vendorContact: '',
    invoiceNumber: '', unitPrice: '', quantity: '1', purchaseDate: new Date().toISOString().split('T')[0],
    deliveryDate: '', deliveryCondition: 'Good', notes: ''
  });

  useEffect(() => {
    Promise.all([getDepartments(), getCategories()])
      .then(([depRes, catRes]) => {
        const depList = Array.isArray(depRes?.data) ? depRes.data : [];
        const catList = Array.isArray(catRes?.data) ? catRes.data : [];
        setDepartments(depList);
        setCategories(catList);
      })
      .catch(() => toast.error('Failed to load form data'));
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();

    const departmentId = Number(form.departmentId);
    const categoryId = Number(form.categoryId);
    const unitPrice = Number.parseFloat(form.unitPrice);
    const quantity = Number.parseInt(form.quantity, 10);

    if (!form.vendorName.trim() || !form.invoiceNumber.trim() || !form.purchaseDate) {
      toast.error('Please fill in all required purchase details.');
      return;
    }

    if (!departmentId || !categoryId || Number.isNaN(unitPrice) || unitPrice <= 0 || Number.isNaN(quantity) || quantity <= 0) {
      toast.error('Please select a valid department, category, and positive quantity/price.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        departmentId,
        categoryId,
        vendorName: form.vendorName.trim(),
        vendorContact: form.vendorContact?.trim() || '',
        invoiceNumber: form.invoiceNumber.trim(),
        unitPrice,
        quantity,
        totalAmount: unitPrice * quantity,
        deliveryDate: form.deliveryDate || '',
        notes: form.notes?.trim() || '',
      };

      await registerAsset(payload);
      toast.success('Asset registered successfully!');
      navigate('/purchase/assets');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Failed to register asset');
    } finally { setSubmitting(false); }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-1 text-slate-500 hover:text-slate-300 text-xs mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /><span>Back</span>
          </button>
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Step 1 — Financial Details</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Register New Asset</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Department *</label>
              <select name="departmentId" value={form.departmentId} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:border-violet-500 focus:outline-none">
                <option value="">Select department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Category *</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:border-violet-500 focus:outline-none">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Vendor Name *</label>
              <input name="vendorName" value={form.vendorName} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Invoice Number *</label>
              <input name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Unit Price (₹) *</label>
              <input type="number" step="0.01" name="unitPrice" value={form.unitPrice} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Quantity *</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} required min="1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Purchase Date *</label>
              <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Delivery Date</label>
              <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex justify-center items-center gap-2">
              <CheckCircle className="w-4 h-4" /><span>{submitting ? 'Registering...' : 'Register Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
