import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Calendar, Building, DollarSign, Edit3, CheckCircle2, X } from 'lucide-react';
import { FundingOpportunity } from '../../types';
import { getFundingOpportunities, saveFundingOpportunity } from '../../firebase/services';
import { StatusBadge } from '../common/StatusBadge';

export const FundingManagement: React.FC = () => {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<FundingOpportunity | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [agency, setAgency] = useState('Philippine Council for Industry, Energy and Emerging Technology R&D (PCIEERD)');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [budgetCap, setBudgetCap] = useState(15000000);
  const [deadline, setDeadline] = useState('2026-12-31T23:59:59Z');
  const [status, setStatus] = useState<'active' | 'closed' | 'upcoming'>('active');

  useEffect(() => {
    loadOpps();
  }, []);

  const loadOpps = async () => {
    const list = await getFundingOpportunities();
    setOpportunities(list);
  };

  const handleOpenModal = (opp?: FundingOpportunity) => {
    if (opp) {
      setEditingOpp(opp);
      setTitle(opp.title);
      setAgency(opp.funding_agency);
      setDescription(opp.description);
      setEligibility(opp.eligibility);
      setBudgetCap(opp.budget_cap);
      setDeadline(opp.deadline);
      setStatus(opp.funding_status);
    } else {
      setEditingOpp(null);
      setTitle('');
      setDescription('');
      setEligibility('Higher Education Institutions, State Universities and Colleges, R&D Institutes.');
      setBudgetCap(10000000);
      setDeadline('2026-12-31T23:59:59Z');
      setStatus('active');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingOpp?.id || `opp-${Date.now()}`;
    const opp: FundingOpportunity = {
      id,
      title,
      funding_agency: agency,
      description,
      eligibility,
      budget_cap: Number(budgetCap),
      deadline,
      funding_status: status,
      created_at: editingOpp?.created_at || new Date().toISOString(),
    };
    await saveFundingOpportunity(opp);
    setIsModalOpen(false);
    await loadOpps();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#153B65]">Call for Proposals & Funding Opportunities</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure competitive grant programs, application eligibility, budget ceilings, and deadlines.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-[#153B65] hover:bg-[#2563A6] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create New Call
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <StatusBadge status={opp.funding_status} size="sm" />
                <span className="font-extrabold text-xs text-[#153B65]">
                  Cap: ₱{(opp.budget_cap / 1000000).toFixed(1)}M
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#153B65] leading-snug mb-2">
                {opp.title}
              </h3>

              <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                {opp.description}
              </p>

              <div className="space-y-1.5 text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{opp.funding_agency}</span>
                </div>
                <div className="flex items-center gap-2 text-rose-700">
                  <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-end">
              <button
                onClick={() => handleOpenModal(opp)}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-blue-50 text-[#153B65] rounded-lg transition-colors flex items-center gap-1 border border-gray-200"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Program
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#153B65] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingOpp ? 'Edit Funding Opportunity' : 'New Grant Call for Proposals'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Call Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Call for Proposals: Emerging Tech for Coastal Protection"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Funding Agency / Council</label>
                <select
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="Philippine Council for Industry, Energy and Emerging Technology R&D (PCIEERD)">PCIEERD</option>
                  <option value="Philippine Council for Health Research and Development (PCHRD)">PCHRD</option>
                  <option value="Philippine Council for Agriculture, Aquatic and Natural Resources R&D (PCAARRD)">PCAARRD</option>
                  <option value="National Research Council of the Philippines (NRCP)">NRCP</option>
                  <option value="Department of Science and Technology - Grants-in-Aid (DOST-GIA)">DOST-GIA</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Program Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Budget Ceiling (PHP)</label>
                  <input
                    type="number"
                    step="500000"
                    value={budgetCap}
                    onChange={(e) => setBudgetCap(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="active">Active (Open)</option>
                    <option value="closed">Closed</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Submission Deadline</label>
                <input
                  type="date"
                  value={deadline.split('T')[0]}
                  onChange={(e) => setDeadline(e.target.value + 'T23:59:59Z')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#153B65] text-white font-bold rounded-xl"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
