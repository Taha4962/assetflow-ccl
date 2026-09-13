import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAllBudgets, createBudget, updateBudget, getDepartmentBudgetHistory } from '../../services/budgetService';
import { getDepartments } from '../../services/deptService';
import { DollarSign, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, X, History, Settings } from 'lucide-react';
import { toast } from 'sonner';

const getCurrentMonthYear = () => new Date().toISOString().slice(0, 7);

const UtilizationBar = ({ pct }) => {
  const color = pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="w-full bg-slate-800 rounded-full h-2 mt-1">
      <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
};

export default function BudgetManagementPage() {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());

  // Set Budget Modal
  const [setModal, setSetModal] = useState({ show: false, dept: null, existing: null });
  const [budgetInput, setBudgetInput] = useState('');
  const [monthInput, setMonthInput] = useState(getCurrentMonthYear());
  const [saving, setSaving] = useState(false);

  // History Modal
  const [historyModal, setHistoryModal] = useState({ show: false, dept: null, records: [] });
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetsRes, deptsRes] = await Promise.all([getAllBudgets(selectedMonth), getDepartments()]);
      setBudgets(budgetsRes.data.data || []);
      setDepartments(deptsRes.data || []);
    } catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  }, [selectedMonth]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const openSetModal = (dept, existing) => {
    setSetModal({ show: true, dept, existing });
    setBudgetInput(existing ? Number(existing.totalBudget).toString() : '');
    setMonthInput(getCurrentMonthYear());
  };

  const handleSaveBudget = async () => {
    if (!budgetInput || isNaN(budgetInput) || Number(budgetInput) <= 0) {
      return toast.error('Enter a valid budget amount');
    }
    setSaving(true);
    try {
      if (setModal.existing) {
        await updateBudget(setModal.existing.id, { totalBudget: Number(budgetInput) });
      } else {
        await createBudget({ departmentId: setModal.dept.id, totalBudget: Number(budgetInput), monthYear: monthInput });
      }
      toast.success('Budget saved successfully');
      setSetModal({ show: false, dept: null, existing: null });
      fetchBudgets();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save budget');
    } finally { setSaving(false); }
  };

  const openHistory = async (dept) => {
    setHistoryModal({ show: true, dept, records: [] });
    setHistoryLoading(true);
    try {
      const res = await getDepartmentBudgetHistory(dept.id);
      setHistoryModal(prev => ({ ...prev, records: res.data.data || [] }));
    } catch { toast.error('Failed to load history'); }
    finally { setHistoryLoading(false); }
  };

  // Build a map of dept budgets
  const budgetByDept = {};
  budgets.forEach(b => { budgetByDept[b.departmentId] = b; });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Finance Administration</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Department Budget Management</h1>
          <div className="flex items-center gap-3 mt-2">
            <label htmlFor="budget-month" className="text-xs text-slate-400">Month:</label>
            <input id="budget-month" type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
          </div>
        </div>

        {loading ? <LoadingSpinner label="Loading budgets..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Department', 'Total Budget', 'Used', 'Remaining', 'Utilization', 'Actions'].map(h => (
                    <th key={h} className="pb-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {departments.map(dept => {
                  const b = budgetByDept[dept.id];
                  const pct = b ? (Number(b.usedBudget) / Number(b.totalBudget)) * 100 : 0;
                  const rowHighlight = pct >= 100 ? 'bg-rose-500/5 border-rose-500/20' : pct >= 80 ? 'bg-amber-500/5' : '';
                  return (
                    <tr key={dept.id} className={`${rowHighlight} transition-colors hover:bg-slate-800/30`}>
                      <td className="py-4 px-3">
                        <p className="font-bold text-slate-200">{dept.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{dept.code}</p>
                      </td>
                      <td className="py-4 px-3 font-mono font-semibold text-slate-300">
                        {b ? `₹${Number(b.totalBudget).toLocaleString('en-IN')}` : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-4 px-3 font-mono font-semibold text-rose-400">
                        {b ? `₹${Number(b.usedBudget).toLocaleString('en-IN')}` : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-4 px-3 font-mono font-semibold text-emerald-400">
                        {b ? `₹${Number(b.remainingBudget).toLocaleString('en-IN')}` : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-4 px-3 w-36">
                        {b ? (
                          <div>
                            <span className={`text-xs font-bold ${pct >= 100 ? 'text-rose-400' : pct >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {pct.toFixed(1)}%
                            </span>
                            <UtilizationBar pct={pct} />
                          </div>
                        ) : <span className="text-slate-600 text-xs">Not set</span>}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openSetModal(dept, b)}
                            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5">
                            <Settings className="w-3 h-3" />{b ? 'Update' : 'Set Budget'}
                          </button>
                          <button onClick={() => openHistory(dept)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5">
                            <History className="w-3 h-3" />History
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

      {/* Set Budget Modal */}
      {setModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">
                {setModal.existing ? 'Update Budget' : 'Set Budget'} — {setModal.dept?.name}
              </h3>
              <button onClick={() => setSetModal({ show: false, dept: null, existing: null })} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {!setModal.existing && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Month</label>
                  <input type="month" value={monthInput} onChange={e => setMonthInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-violet-500 focus:outline-none" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Total Budget (₹)</label>
                <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-violet-500 focus:outline-none" />
              </div>
              {setModal.existing && (
                <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400 space-y-1">
                  <p>Used: <span className="text-rose-400 font-semibold">₹{Number(setModal.existing.usedBudget).toLocaleString('en-IN')}</span></p>
                  <p>Updating total budget will recalculate remaining.</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSetModal({ show: false })} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs">Cancel</button>
                <button onClick={handleSaveBudget} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Budget History — {historyModal.dept?.name}</h3>
              <button onClick={() => setHistoryModal({ show: false, dept: null, records: [] })} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 max-h-96 overflow-y-auto space-y-3">
              {historyLoading ? <LoadingSpinner label="Loading history..." /> :
                historyModal.records.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-6">No budget history found.</p>
                ) : historyModal.records.map(r => {
                  const pct = (Number(r.usedBudget) / Number(r.totalBudget)) * 100;
                  return (
                    <div key={r.id} className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-200">{r.monthYear}</span>
                        <span className={`text-xs font-bold ${pct >= 100 ? 'text-rose-400' : pct >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{pct.toFixed(1)}%</span>
                      </div>
                      <UtilizationBar pct={pct} />
                      <div className="flex gap-4 mt-2 text-xs text-slate-400 font-mono">
                        <span>Total: ₹{Number(r.totalBudget).toLocaleString('en-IN')}</span>
                        <span>Used: ₹{Number(r.usedBudget).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
