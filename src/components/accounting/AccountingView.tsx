import React, { useState } from 'react';
import {
  Scale,
  Plus,
  BookOpen,
  PieChart,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { AccountType } from '../../types';

export const AccountingView: React.FC = () => {
  const { t } = useLanguage();
  const { accounts, journalEntries, postManualJournal } = useApp();

  const [activeTab, setActiveTab] = useState<'chart' | 'journals' | 'reports'>('chart');
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

  // Manual Journal Entry Form State
  const [description, setDescription] = useState('');
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<
    { accountId: string; debit: number; credit: number; memo: string }[]
  >([
    { accountId: accounts[0]?.id || '', debit: 0, credit: 0, memo: '' },
    { accountId: accounts[1]?.id || '', debit: 0, credit: 0, memo: '' },
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalDebits = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredits = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;

  // Account Type summary
  const getTypeColor = (type: AccountType) => {
    switch (type) {
      case 'asset':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'liability':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'equity':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'revenue':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'expense':
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  const handleAddLine = () => {
    setLines([
      ...lines,
      { accountId: accounts[0]?.id || '', debit: 0, credit: 0, memo: '' },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== idx));
    }
  };

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      setErrorMsg('Debits and Credits must be equal and greater than zero.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a description for this journal entry.');
      return;
    }

    const formattedLines = lines.map((l, index) => {
      const acc = accounts.find(a => a.id === l.accountId);
      return {
        id: `jl-${index}-${Date.now()}`,
        accountId: l.accountId,
        accountCode: acc?.code || '0000',
        accountName: acc?.name || 'General Account',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        memo: l.memo,
      };
    });

    postManualJournal({
      date: journalDate,
      referenceType: 'manual',
      description,
      lines: formattedLines,
      postedBy: 'Chief Accountant',
    });

    setIsJournalModalOpen(false);
    setDescription('');
    setLines([
      { accountId: accounts[0]?.id || '', debit: 0, credit: 0, memo: '' },
      { accountId: accounts[1]?.id || '', debit: 0, credit: 0, memo: '' },
    ]);
    setErrorMsg(null);
  };

  // Financial Report Stats
  const revenueAccounts = accounts.filter(a => a.type === 'revenue');
  const expenseAccounts = accounts.filter(a => a.type === 'expense');
  const assetAccounts = accounts.filter(a => a.type === 'asset');
  const liabilityAccounts = accounts.filter(a => a.type === 'liability');

  const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalExpense = expenseAccounts.reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalRevenue - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.accounting.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">{t.accounting.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsJournalModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF5407] hover:bg-[#E04703] text-white shadow-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.accounting.newJournalEntry}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'chart'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Chart of Accounts</span>
        </button>
        <button
          onClick={() => setActiveTab('journals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'journals'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>General Ledger Entries ({journalEntries.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Profit & Loss / Balance Summary</span>
        </button>
      </div>

      {/* Tab 1: Chart of Accounts */}
      {activeTab === 'chart' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {accounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">{acc.code}</td>
                    <td className="py-3 px-4 font-bold text-neutral-800">{acc.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getTypeColor(
                          acc.type
                        )}`}
                      >
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-[11px]">{acc.description}</td>
                    <td className="py-3 px-4 text-right font-black text-neutral-900 text-sm">
                      ${acc.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Journal Entries */}
      {activeTab === 'journals' && (
        <div className="space-y-4">
          {journalEntries.map(entry => (
            <div
              key={entry.id}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[#FF5407] bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                    {entry.entryNumber}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{entry.description}</h4>
                    <p className="text-[10px] text-neutral-400">
                      Date: {entry.date} • Reference: {entry.referenceType} • Posted by: {entry.postedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Balanced Entry</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-100">
                    <tr>
                      <th className="py-1.5 px-2">Account</th>
                      <th className="py-1.5 px-2">Memo</th>
                      <th className="py-1.5 px-2 text-right">Debit ($)</th>
                      <th className="py-1.5 px-2 text-right">Credit ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 font-medium">
                    {entry.lines.map(line => (
                      <tr key={line.id}>
                        <td className="py-1.5 px-2 font-mono text-neutral-800">
                          {line.accountCode} - {line.accountName}
                        </td>
                        <td className="py-1.5 px-2 text-neutral-500 text-[11px]">{line.memo || '-'}</td>
                        <td className="py-1.5 px-2 text-right font-bold text-neutral-900">
                          {line.debit > 0 ? `$${line.debit.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-neutral-900">
                          {line.credit > 0 ? `$${line.credit.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Profit & Loss Statement */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Statement */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
              Income Statement (P&L)
            </h3>

            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-500 uppercase text-[10px]">Recognized Revenue</p>
              {revenueAccounts.map(r => (
                <div key={r.id} className="flex justify-between text-xs py-1 border-b border-neutral-50">
                  <span className="text-neutral-700">{r.name}</span>
                  <span className="font-bold text-neutral-900">${r.balance.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-extrabold text-blue-700 pt-2 border-t border-neutral-200">
                <span>Total Revenue:</span>
                <span>${totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-neutral-500 uppercase text-[10px]">Operating Expenses</p>
              {expenseAccounts.map(e => (
                <div key={e.id} className="flex justify-between text-xs py-1 border-b border-neutral-50">
                  <span className="text-neutral-700">{e.name}</span>
                  <span className="font-bold text-rose-600">${e.balance.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-extrabold text-rose-700 pt-2 border-t border-neutral-200">
                <span>Total Expenses:</span>
                <span>${totalExpense.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-neutral-100 p-4 rounded-xl flex items-center justify-between text-sm font-black text-neutral-900">
              <span>Net Profit:</span>
              <span className={netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                ${netIncome.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Balance Sheet Summary */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
              Balance Sheet Summary
            </h3>

            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-500 uppercase text-[10px]">Assets</p>
              {assetAccounts.map(a => (
                <div key={a.id} className="flex justify-between text-xs py-1 border-b border-neutral-50">
                  <span className="text-neutral-700">{a.name}</span>
                  <span className="font-bold text-neutral-900">${a.balance.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-neutral-500 uppercase text-[10px]">Liabilities & Equity</p>
              {liabilityAccounts.map(l => (
                <div key={l.id} className="flex justify-between text-xs py-1 border-b border-neutral-50">
                  <span className="text-neutral-700">{l.name}</span>
                  <span className="font-bold text-neutral-900">${l.balance.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Journal Modal */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900">Post Manual Journal Entry</h3>
              <button
                onClick={() => setIsJournalModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleJournalSubmit} className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Entry Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Month-end studio equipment adjustment"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={journalDate}
                    onChange={e => setJournalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Journal Lines */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 uppercase text-[10px]">
                    Debit & Credit Accounts
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-[#FF5407] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Line</span>
                  </button>
                </div>

                {lines.map((l, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-5">
                      <select
                        value={l.accountId}
                        onChange={e => {
                          const updated = [...lines];
                          updated[idx].accountId = e.target.value;
                          setLines(updated);
                        }}
                        className="w-full text-xs px-2 py-1.5 border border-neutral-300 rounded bg-white font-medium"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name} ({acc.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Debit ($)"
                        value={l.debit || ''}
                        onChange={e => {
                          const updated = [...lines];
                          updated[idx].debit = Number(e.target.value) || 0;
                          setLines(updated);
                        }}
                        className="w-full text-xs px-2 py-1.5 border border-neutral-300 rounded bg-white font-bold"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Credit ($)"
                        value={l.credit || ''}
                        onChange={e => {
                          const updated = [...lines];
                          updated[idx].credit = Number(e.target.value) || 0;
                          setLines(updated);
                        }}
                        className="w-full text-xs px-2 py-1.5 border border-neutral-300 rounded bg-white font-bold"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="text-neutral-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Balance Verification Bar */}
              <div
                className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold border ${
                  isBalanced
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <div>
                  Total Debits: ${totalDebits.toFixed(2)} | Total Credits: ${totalCredits.toFixed(2)}
                </div>
                <div>{isBalanced ? '✓ Balanced' : '⚠ Unbalanced (Difference: $' + Math.abs(totalDebits - totalCredits).toFixed(2) + ')'}</div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsJournalModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className="px-4 py-2 text-xs font-bold bg-[#FF5407] hover:bg-[#E04703] text-white rounded-lg shadow-xs disabled:opacity-50"
                >
                  Post to General Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

