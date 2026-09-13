import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAssetById, assignAsset } from '../../services/assetService';
import { getUsers } from '../../services/userService';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AssignAssetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    assignedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    Promise.all([getAssetById(id), getUsers({ role: 'employee' })])
      .then(([assetRes, usersRes]) => {
        setAsset(assetRes.data.data);
        // const allUsers = usersRes.data.data?.users || usersRes.data.data || [];
        // setEmployees(allUsers.filter(u => u.role === 'employee' && u.isActive));
        const allUsers = Array.isArray(usersRes?.users)
        ? usersRes.users
        : Array.isArray(usersRes?.data?.users)
        ? usersRes.data.users
        : [];

        setEmployees(allUsers.filter(u => u.role === 'employee' && u.isActive));
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.employeeId) { toast.error('Please select an employee'); return; }
    setSubmitting(true);
    try {
      await assignAsset(id, { ...form, employeeId: parseInt(form.employeeId) });
      toast.success('Asset assigned successfully! QR code generated.');
      navigate(`/manager/assets/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign asset');
    } finally { setSubmitting(false); }
  };

  if (loading) return <Layout><LoadingSpinner label="Loading..." /></Layout>;
  if (!asset) return <Layout><div className="text-center text-slate-400 mt-20">Asset not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-1 text-slate-500 hover:text-slate-300 text-xs mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /><span>Back</span>
          </button>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Assign Asset</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">{asset.name}</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">{asset.assetCode}</p>
        </div>

        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-xs text-emerald-400">
            After assigning, the asset status will change to <strong>Active</strong> and a QR code will be automatically generated.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Select Employee *</label>
            <select name="employeeId" value={form.employeeId} onChange={handleChange} required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500">
              <option value="">Choose an employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Assignment Date *</label>
            <input type="date" name="assignedDate" value={form.assignedDate} onChange={handleChange} required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
              placeholder="Assignment notes or purpose..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              <UserCheck className="w-4 h-4" />
              <span>{submitting ? 'Assigning...' : 'Assign Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
