import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  CheckCircle2,
  Clock,
  Award,
  Eye,
  Edit3,
  Calendar,
  Building,
  DollarSign,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Proposal, EvaluatorAssignment, Evaluation } from '../../types';
import {
  getProposals,
  getEvaluatorAssignments,
  getEvaluations,
} from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { ProposalDetailModal } from '../researcher/ProposalDetailModal';
import { EvaluationForm } from './EvaluationForm';

export const EvaluatorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [assignedProposals, setAssignedProposals] = useState<Proposal[]>([]);
  const [assignments, setAssignments] = useState<EvaluatorAssignment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedProposalForModal, setSelectedProposalForModal] = useState<Proposal | null>(null);
  const [activeEvaluatingProposal, setActiveEvaluatingProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'rubric'>('pending');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    const [allProps, allAssigns, allEvals] = await Promise.all([
      getProposals(),
      getEvaluatorAssignments(),
      getEvaluations(),
    ]);

    // Assigned to this evaluator (or all proposals for demo if few assigned)
    const myAssigns = allAssigns.filter((a) => a.evaluator_id === currentUser.id);
    const assignedIds = new Set(myAssigns.map((a) => a.proposal_id));

    let matchedProps = allProps.filter((p) => assignedIds.has(p.id) || p.status === 'Under Evaluation' || p.status === 'For Approval');
    if (matchedProps.length === 0) matchedProps = allProps.slice(0, 4);

    setAssignedProposals(matchedProps);
    setAssignments(myAssigns);
    setEvaluations(allEvals.filter((e) => e.evaluator_id === currentUser.id));
  };

  const completedEvalMap = new Map(evaluations.map((e) => [e.proposal_id, e]));

  const pendingList = assignedProposals.filter((p) => {
    const ev = completedEvalMap.get(p.id);
    return !ev || ev.status !== 'Submitted';
  });

  const completedList = assignedProposals.filter((p) => {
    const ev = completedEvalMap.get(p.id);
    return ev && ev.status === 'Submitted';
  });

  if (activeEvaluatingProposal) {
    const existing = completedEvalMap.get(activeEvaluatingProposal.id);
    return (
      <EvaluationForm
        proposal={activeEvaluatingProposal}
        existingEvaluation={existing}
        onCancel={() => setActiveEvaluatingProposal(null)}
        onSuccess={async () => {
          setActiveEvaluatingProposal(null);
          await loadData();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-[#153B65] via-[#2A3F6D] to-[#4A3B73] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-purple-200">
              Scientific Review Panel
            </span>
            <span className="text-xs text-purple-200 font-mono">
              NAST / Academic Peer Evaluator
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mt-2">
            Evaluator Portal: {currentUser?.full_name}
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
            Assess national research grant proposals across technical merit, methodology, socioeconomic impact, and budget feasibility.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-white/10 rounded-xl text-center border border-white/20">
            <span className="text-xs text-purple-200 block">Pending Reviews</span>
            <span className="text-xl font-black text-white">{pendingList.length}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-xl text-center border border-white/20">
            <span className="text-xs text-purple-200 block">Completed</span>
            <span className="text-xl font-black text-white">{completedList.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-[#153B65] text-[#153B65]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Evaluations ({pendingList.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-[#153B65] text-[#153B65]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Completed Reviews ({completedList.length})
        </button>

        <button
          onClick={() => setActiveTab('rubric')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'rubric'
              ? 'border-[#153B65] text-[#153B65]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-600" />
          Evaluation Rubric Guide
        </button>
      </div>

      {/* TAB CONTENT: PENDING */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
              <h4 className="font-bold text-sm text-gray-800">All Assigned Evaluations Completed</h4>
              <p className="text-xs text-gray-500 mt-1">There are no pending proposal reviews assigned to you at this time.</p>
            </div>
          ) : (
            pendingList.map((proposal) => {
              const draftEval = completedEvalMap.get(proposal.id);
              return (
                <div
                  key={proposal.id}
                  className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="max-w-2xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#153B65] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {proposal.tracking_number}
                      </span>
                      <StatusBadge status={proposal.status} size="sm" />
                      {draftEval && (
                        <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                          Draft Review Saved
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-gray-900 leading-snug">
                      {proposal.project_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>Proponent: <strong className="text-gray-700">{proposal.researcher_name}</strong></span>
                      <span>•</span>
                      <span>{proposal.project_information?.implementing_institution}</span>
                      <span>•</span>
                      <span className="font-bold text-gray-800">₱{proposal.budget?.total_budget?.toLocaleString()}</span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 pt-1 leading-relaxed">
                      {proposal.project_description?.background || proposal.project_description?.general_objective}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedProposalForModal(proposal)}
                      className="px-3.5 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                      Inspect Proposal
                    </button>

                    <button
                      onClick={() => setActiveEvaluatingProposal(proposal)}
                      className="px-4 py-2 bg-[#153B65] hover:bg-[#2563A6] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Award className="w-4 h-4" />
                      {draftEval ? 'Resume Evaluation' : 'Score Proposal'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT: COMPLETED */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedList.map((proposal) => {
            const ev = completedEvalMap.get(proposal.id);
            return (
              <div
                key={proposal.id}
                className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="max-w-2xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {proposal.tracking_number}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {ev?.recommendation}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 leading-snug">
                    {proposal.project_title}
                  </h3>

                  <p className="text-xs text-gray-600">
                    Lead: {proposal.researcher_name} ({proposal.project_information?.implementing_institution})
                  </p>

                  {ev && (
                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-purple-950 mt-2">
                      <div className="flex items-center justify-between font-bold text-purple-900 mb-1">
                        <span>Official Evaluation Score: {ev.overall_score} / 5.0</span>
                        <span className="font-mono text-[10px] text-gray-400">
                          Submitted: {new Date(ev.submitted_at || '').toLocaleDateString()}
                        </span>
                      </div>
                      <p className="italic text-gray-700">"{ev.remarks}"</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedProposalForModal(proposal)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                    View Dossier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: RUBRIC GUIDE */}
      {activeTab === 'rubric' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-[#153B65]">National Science & Technology Evaluation Rubric Guidelines</h3>
          <p className="text-gray-600 leading-relaxed">
            Evaluators must score proposals strictly based on scientific merits without conflict of interest. Ratings are on a 1.0 to 5.0 scale:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold text-gray-900">1. Relevance (20%)</span>
              <p className="text-gray-600">Solves high-priority national bottlenecks identified in DOST agendas.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold text-gray-900">2. Technical Merit (25%)</span>
              <p className="text-gray-600">State-of-the-art methodology, novel algorithms, and intellectual rigor.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold text-gray-900">3. Methodology (20%)</span>
              <p className="text-gray-600">Sound statistical validation, proper controls, and ethical compliance.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold text-gray-900">4. Feasibility (15%)</span>
              <p className="text-gray-600">Work plan scheduling, team capability, and adequate laboratory equipment.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold text-gray-900">5. Socioeconomic Impact (10%)</span>
              <p className="text-gray-600">Direct livelihood, disaster safety, or industrial productivity benefits.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold text-gray-900">6. Budget Justification (10%)</span>
              <p className="text-gray-600">Prudent line-item cost estimates aligned with DBM compensation standards.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <ProposalDetailModal
        proposal={selectedProposalForModal}
        onClose={() => setSelectedProposalForModal(null)}
      />
    </div>
  );
};
