import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { ExpenseCategory, ExpenseApproval } from '../../types';

export const ExpensesView: React.FC = () => {
  const { t } = useLanguage();
  const { expenses, accounts, addExpense, updateExpenseApproval } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('software_subscriptions');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money (ZAAD)');
  const [paidWithAccountId, setPaidWithAccountId] = useState(
    accounts.find(a => a.code === '1030')?.id || accounts[0]?.id || ''
  );
  const [notes, setNotes] = useState('');

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch =
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      exp.expenseRef.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || exp.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    addExpense({
      category,
      description,
      amount: Number(amount),
      currency: 'USD',
      date: expenseDate,
      paymentMethod,
      paidWithAccountId,
      recordedBy: 'Finance Lead',
      approvalStatus: 'approved',
      notes,
    });

    setIsAddModalOpen(false);
    setDescription('');
    setAmount(0);
    setNotes('');
  };

  const getApprovalBadge = (status: ExpenseApproval) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'submitted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.expenses.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">{t.expenses.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-rose-50 rounded-xl text-xs font-bold text-rose-800 border border-rose-200">
            Total Expenditure: <span className="font-extrabold">${totalSpent.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF5407] hover:bg-[#E04703] text-white shadow-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.expenses.addExpense}</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search description, reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#FF5407]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white font-medium text-neutral-700 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="software_subscriptions">Software & Subscriptions</option>
            <option value="office_rent_utilities">Office Rent & Utilities</option>
            <option value="hardware_equipment">Hardware & Equipment</option>
            <option value="marketing_advertising">Marketing & Advertising</option>
            <option value="contractor_freelance">Contractor & Freelance</option>
            <option value="travel_transport">Travel & Transport</option>
            <option value="other_operating">Other Operating</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Amount ($)</th>
                <th className="py-3 px-4 text-center">Approval</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-neutral-400 text-xs">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-800">{exp.expenseRef}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{exp.description}</div>
                      {exp.notes && <div className="text-[10px] text-neutral-400">{exp.notes}</div>}
                    </td>
                    <td className="py-3 px-4 capitalize text-neutral-600">
                      {exp.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{exp.date}</td>
                    <td className="py-3 px-4 text-neutral-700">{exp.paymentMethod}</td>
                    <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                      -${exp.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getApprovalBadge(
                          exp.approvalStatus
                        )}`}
                      >
                        {exp.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {exp.approvalStatus === 'approved' && (
                        <button
                          onClick={() => updateExpenseApproval(exp.id, 'paid')}
                          className="px-2 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900">Record Business Expense</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adobe Creative Cloud Monthly"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  >
                    <option value="software_subscriptions">Software & Subscriptions</option>
                    <option value="office_rent_utilities">Office Rent & Utilities</option>
                    <option value="hardware_equipment">Hardware & Equipment</option>
                    <option value="marketing_advertising">Marketing & Ads</option>
                    <option value="contractor_freelance">Contractor & Freelance</option>
                    <option value="travel_transport">Travel & Transport</option>
                    <option value="other_operating">Other Operating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Paid Out From
                  </label>
                  <select
                    value={paidWithAccountId}
                    onChange={e => setPaidWithAccountId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  >
                    {accounts
                      .filter(a => a.type === 'asset')
                      .map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} (${acc.balance.toFixed(0)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Payment Method</label>
                <input
                  type="text"
                  placeholder="e.g. ZAAD Merchant 778899"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Internal notes..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#FF5407] hover:bg-[#E04703] text-white rounded-lg shadow-xs"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
