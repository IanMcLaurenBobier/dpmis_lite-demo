import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckSquare,
  FileSearch,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  X,
  Send,
  Calendar,
  CheckCircle2,
  DollarSign,
  Users,
  Award,
  ArrowUpDown,
} from 'lucide-react';
import { Proposal, UserAccount, Evaluation, ProposalStatus } from '../../types';
import {
  getProposals,
  getUsers,
  getEvaluations,
  updateProposalStatus,
  assignEvaluator,
} from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { ProposalDetailModal } from '../researcher/ProposalDetailModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface ProposalManagementProps {
  initialStatusTab?: string;
}

export const ProposalManagement: React.FC<ProposalManagementProps> = ({
  initialStatusTab = 'all',
}) => {
  const { currentUser } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [evaluators, setEvaluators] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<string>(initialStatusTab);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Administrative Review Modal State
  const [reviewProposal, setReviewProposal] = useState<Proposal | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [checklist, setChecklist] = useState({
    profileComplete: true,
    endorsementSigned: true,
    budgetWithinCap: true,
    workplanFeasible: true,
  });

  // Assign Evaluator Modal State
  const [assignModalProposal, setAssignModalProposal] = useState<Proposal | null>(null);
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState('');
  const [dueDate, setDueDate] = useState('2026-03-15');

  // Final Decision Modal State
  const [decisionProposal, setDecisionProposal] = useState<Proposal | null>(null);
  const [decisionType, setDecisionType] = useState<'Approved' | 'Disapproved'>('Approved');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [proposalEvaluations, setProposalEvaluations] = useState<Evaluation[]>([]);

  const [loading, setLoading] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [p, u] = await Promise.all([getProposals(), getUsers()]);
    setProposals(p);
    setEvaluators(u.filter((user) => user.role === 'evaluator'));
  };

  const handleOpenReview = (p: Proposal) => {
    setReviewProposal(p);
    setReviewRemarks(p.admin_remarks || 'All documentary requirements verified complete and compliant with DOST Guidelines.');
  };

  const handleSubmitReview = async (isApprovedCompleteness: boolean) => {
    if (!reviewProposal || !currentUser) return;
    setLoading(true);

    const newStatus: ProposalStatus = isApprovedCompleteness ? 'Under Evaluation' : 'For Correction';
    const finalRemarks = isApprovedCompleteness
      ? (reviewRemarks || 'Administrative completeness verified. Cleared for scientific evaluation.')
      : (reviewRemarks || 'Returned for correction: Please rectify missing attachments and signatures.');

    await updateProposalStatus(reviewProposal.id, newStatus, finalRemarks, currentUser);
    setReviewProposal(null);
    await loadData();
    setLoading(false);
  };

  const handleOpenAssign = (p: Proposal) => {
    setAssignModalProposal(p);
    if (evaluators.length > 0) {
      setSelectedEvaluatorId(evaluators[0].id);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!assignModalProposal || !selectedEvaluatorId || !currentUser) return;
    setLoading(true);

    const evaluator = evaluators.find((e) => e.id === selectedEvaluatorId);
    if (evaluator) {
      await assignEvaluator(assignModalProposal.id, evaluator, currentUser, dueDate);
    }
    setAssignModalProposal(null);
    await loadData();
    setLoading(false);
  };

  const handleOpenDecision = async (p: Proposal) => {
    setDecisionProposal(p);
    const evs = await getEvaluations(p.id);
    setProposalEvaluations(evs);
    setDecisionRemarks(
      `Executive Approval granted pursuant to Governing Council Resolution No. ${new Date().getFullYear()}-042. Project created.`
    );
  };

  const handleSubmitFinalDecision = async () => {
    if (!decisionProposal || !currentUser) return;
    setLoading(true);

    await updateProposalStatus(
      decisionProposal.id,
      decisionType,
      decisionRemarks || `${decisionType} by DOST Executive Committee.`,
      currentUser
    );

    setDecisionProposal(null);
    await loadData();
    setLoading(false);
  };

  // Filter and sort
  const filtered = proposals
    .filter((p) => {
      const matchSearch =
        p.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.researcher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.project_information?.implementing_institution?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (statusTab === 'all') return true;
      if (statusTab === 'intake') return p.status === 'Submitted' || p.status === 'Administrative Review';
      if (statusTab === 'evaluation') return p.status === 'Under Evaluation';
      if (statusTab === 'decision') return p.status === 'For Approval';
      return p.status === statusTab;
    })
    .sort((a, b) => {
      const d1 = new Date(a.created_at).getTime();
      const d2 = new Date(b.created_at).getTime();
      return sortAsc ? d1 - d2 : d2 - d1;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#153B65]">Proposal Administration & Review</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Administrative intake, peer evaluator assignment, and final executive funding decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortAsc ? 'Oldest First' : 'Newest First'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by proposal title, tracking number, lead proponent, or university..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#153B65]"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto bg-gray-100 p-1 rounded-xl text-xs">
          {[
            { id: 'all', label: 'All Proposals' },
            { id: 'intake', label: 'Intake Review' },
            { id: 'evaluation', label: 'Under Evaluation' },
            { id: 'decision', label: 'For Decision' },
            { id: 'Approved', label: 'Approved' },
            { id: 'For Correction', label: 'For Correction' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-[11px] font-semibold transition-all ${
                statusTab === tab.id
                  ? 'bg-white text-[#153B65] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Tracking Number</th>
                <th className="p-3.5">Research Project Title</th>
                <th className="p-3.5">Proponent & Institution</th>
                <th className="p-3.5">Funding Program</th>
                <th className="p-3.5">Proposed Budget</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                    No research proposals match the selected search or filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#153B65] whitespace-nowrap">
                      {p.tracking_number}
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <p className="font-semibold text-gray-900 line-clamp-1">{p.project_title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {p.project_information?.classification} • Submitted: {p.submission_date || 'Draft'}
                      </p>
                    </td>

                    <td className="p-3.5 whitespace-nowrap max-w-xs">
                      <p className="font-medium text-gray-800">{p.researcher_name}</p>
                      <p className="text-[10px] text-gray-500 truncate max-w-44">
                        {p.project_information?.implementing_institution}
                      </p>
                    </td>

                    <td className="p-3.5 text-gray-600 max-w-xs truncate">
                      {p.funding_opportunity_title}
                    </td>

                    <td className="p-3.5 font-bold text-gray-900 whitespace-nowrap">
                      ₱{p.budget?.total_budget?.toLocaleString()}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <StatusBadge status={p.status} size="sm" />
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Full Detail */}
                        <button
                          type="button"
                          onClick={() => setSelectedProposal(p)}
                          className="p-1.5 text-gray-500 hover:text-[#153B65] hover:bg-gray-100 rounded-md transition-colors"
                          title="View Complete Proposal Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Intake Administrative Completeness Check */}
                        {(p.status === 'Submitted' || p.status === 'Administrative Review') && (
                          <button
                            type="button"
                            onClick={() => handleOpenReview(p)}
                            className="px-2.5 py-1 bg-sky-50 text-sky-800 hover:bg-[#153B65] hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                            title="Perform Administrative Completeness Review"
                          >
                            <CheckSquare className="w-3.5 h-3.5" /> Intake Review
                          </button>
                        )}

                        {/* Evaluator Assignment */}
                        {(p.status === 'Submitted' || p.status === 'Administrative Review' || p.status === 'Under Evaluation') && (
                          <button
                            type="button"
                            onClick={() => handleOpenAssign(p)}
                            className="px-2.5 py-1 bg-purple-50 text-purple-800 hover:bg-purple-700 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                            title="Assign to Scientific Peer Evaluator"
                          >
                            <FileSearch className="w-3.5 h-3.5" /> Assign Reviewer
                          </button>
                        )}

                        {/* Final Decision */}
                        {(p.status === 'For Approval' || p.status === 'Under Evaluation') && (
                          <button
                            type="button"
                            onClick={() => handleOpenDecision(p)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                            title="Record Final Approval / Disapproval Decision"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Final Decision
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADMINISTRATIVE REVIEW & COMPLETENESS CHECK */}
      {reviewProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#153B65] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-5 h-5 text-sky-300" />
                <div>
                  <h3 className="font-bold text-sm">Administrative Completeness Intake Check</h3>
                  <p className="text-[11px] text-sky-200 font-mono">{reviewProposal.tracking_number}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewProposal(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-xs">
                <p className="font-bold text-gray-900">{reviewProposal.project_title}</p>
                <p className="text-gray-500 mt-0.5">Proponent: {reviewProposal.researcher_name} ({reviewProposal.project_information?.implementing_institution})</p>
                <p className="text-gray-500 font-bold mt-1">Total Proposed: ₱{reviewProposal.budget?.total_budget?.toLocaleString()}</p>
              </div>

              {/* Checklist */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                  Documentary Verification Checklist
                </span>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.profileComplete}
                    onChange={(e) => setChecklist({ ...checklist, profileComplete: e.target.checked })}
                    className="rounded-sm text-[#153B65]"
                  />
                  <span>Proponent Profile & Academic Accreditation Verified</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.endorsementSigned}
                    onChange={(e) => setChecklist({ ...checklist, endorsementSigned: e.target.checked })}
                    className="rounded-sm text-[#153B65]"
                  />
                  <span>Signed Institutional Endorsement by Head of Agency Attached</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.budgetWithinCap}
                    onChange={(e) => setChecklist({ ...checklist, budgetWithinCap: e.target.checked })}
                    className="rounded-sm text-[#153B65]"
                  />
                  <span>Budget Breakdown conforms to DBM Line-Item Classification</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.workplanFeasible}
                    onChange={(e) => setChecklist({ ...checklist, workplanFeasible: e.target.checked })}
                    className="rounded-sm text-[#153B65]"
                  />
                  <span>Work Plan schedule and milestone deliverables clearly stated</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Administrative Intake Remarks <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Record formal intake notes or required corrections..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSubmitReview(false)}
                disabled={loading}
                className="px-4 py-2 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-300 rounded-xl text-xs font-bold transition-colors"
              >
                Return for Correction
              </button>

              <button
                type="button"
                onClick={() => handleSubmitReview(true)}
                disabled={loading}
                className="px-5 py-2 bg-[#153B65] hover:bg-[#2563A6] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Completeness Verified
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN EVALUATOR */}
      {assignModalProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#153B65] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-sm">Assign Peer Evaluator</h3>
              </div>
              <button
                onClick={() => setAssignModalProposal(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl text-xs">
                <p className="font-bold text-purple-900">{assignModalProposal.project_title}</p>
                <p className="text-gray-500 mt-1">Sector: {assignModalProposal.project_information?.sector}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Technical Evaluator
                </label>
                <select
                  value={selectedEvaluatorId}
                  onChange={(e) => setSelectedEvaluatorId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
                >
                  {evaluators.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.full_name} ({ev.institution || 'NAST / Peer Panel'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Evaluation Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignModalProposal(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAssignment}
                disabled={loading}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" /> Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FINAL DECISION (APPROVAL / DISAPPROVAL) */}
      {decisionProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#153B65] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-sm">Executive Grant Funding Decision</h3>
                  <p className="text-[11px] text-sky-200 font-mono">{decisionProposal.tracking_number}</p>
                </div>
              </div>
              <button
                onClick={() => setDecisionProposal(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs">
                <p className="font-bold text-gray-900">{decisionProposal.project_title}</p>
                <p className="text-gray-600 mt-1">Lead: {decisionProposal.researcher_name} • {decisionProposal.project_information?.implementing_institution}</p>
                <p className="text-[#153B65] font-black mt-1">Proposed Budget: ₱{decisionProposal.budget?.total_budget?.toLocaleString()}</p>
              </div>

              {/* Evaluator score overview */}
              {proposalEvaluations.length > 0 ? (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900">Peer Evaluation Score:</span>
                    <span className="font-extrabold text-sm text-purple-900">
                      {proposalEvaluations[0].overall_score} / 5.0
                    </span>
                  </div>
                  <p className="text-gray-700"><span className="font-semibold">Recommendation:</span> <span className="text-emerald-700 font-bold">{proposalEvaluations[0].recommendation}</span></p>
                  <p className="text-gray-600 italic">"{proposalEvaluations[0].remarks}"</p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs">
                  Evaluation report is being completed.
                </div>
              )}

              {/* Decision Type Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecisionType('Approved')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    decisionType === 'Approved'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Proposal & Create Project
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('Disapproved')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    decisionType === 'Disapproved'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" /> Disapprove Proposal
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official Council Resolution & Decision Remarks <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  placeholder="Record formal governing council rationale, grant resolution number, or revision directives..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
                />
              </div>

              {decisionType === 'Approved' && (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  Notice: When approved, a project record is automatically generated with budget ₱{decisionProposal.budget?.total_budget?.toLocaleString()} and assigned to Project Officers for milestone monitoring.
                </p>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDecisionProposal(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitFinalDecision}
                disabled={loading}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-colors shadow-sm flex items-center gap-1.5 ${
                  decisionType === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {decisionType}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Detail View Modal */}
      <ProposalDetailModal
        proposal={selectedProposal}
        onClose={() => setSelectedProposal(null)}
      />
    </div>
  );
};
