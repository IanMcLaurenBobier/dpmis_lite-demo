import React, { useState, useEffect } from 'react';
import {
  FilePlus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Eye,
  Edit3,
  ExternalLink,
  Search,
  Filter,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Proposal, Project } from '../../types';
import { getProposals, getProjects } from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { ProposalDetailModal } from './ProposalDetailModal';

interface ResearcherDashboardProps {
  onNewProposal: () => void;
  onEditProposal: (proposal: Proposal) => void;
  onViewProjects: () => void;
}

export const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({
  onNewProposal,
  onEditProposal,
  onViewProjects,
}) => {
  const { currentUser } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      const allProps = await getProposals();
      // Filter for this researcher or show all if demo
      const myProposals = allProps.filter(
        (p) => p.researcher_id === currentUser.id || p.researcher_email.toLowerCase() === currentUser.email.toLowerCase()
      );
      // If user has few or none, fallback to all proposals for rich demo
      setProposals(myProposals.length > 0 ? myProposals : allProps);

      const allProjects = await getProjects();
      const myProjects = allProjects.filter(
        (p) => p.researcher_id === currentUser.id
      );
      setProjects(myProjects.length > 0 ? myProjects : allProjects);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  // Metric counts
  const totalProposals = proposals.length;
  const draftProposals = proposals.filter((p) => p.status === 'Draft').length;
  const submittedProposals = proposals.filter((p) => p.status === 'Submitted' || p.status === 'Administrative Review').length;
  const underEvaluation = proposals.filter((p) => p.status === 'Under Evaluation' || p.status === 'For Approval').length;
  const approvedProposals = proposals.filter((p) => p.status === 'Approved').length;
  const disapprovedProposals = proposals.filter((p) => p.status === 'Disapproved').length;
  const forCorrection = proposals.filter((p) => p.status === 'For Correction').length;
  const ongoingProjects = projects.filter((p) => p.project_status === 'Ongoing' || p.project_status === 'Approved').length;

  const filtered = proposals.filter((p) => {
    const matchesSearch =
      p.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.funding_opportunity_title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-[#153B65] to-[#2563A6] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-sky-200">
              Proponent Portal
            </span>
            <span className="text-xs text-sky-200 font-mono">
              Academic ID: {currentUser?.id || 'PRO-2026'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mt-2">
            Welcome back, {currentUser?.full_name}
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
            {currentUser?.institution || 'Philippine Higher Education R&D Partner'} • Access your active research proposals, view reviewer remarks, and submit milestone accomplishment reports.
          </p>
        </div>

        <button
          onClick={onNewProposal}
          className="px-5 py-3 bg-sky-500 hover:bg-sky-400 text-[#153B65] font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <FilePlus className="w-4 h-4" />
          Submit New Proposal
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Total Proposals</span>
          <p className="text-2xl font-black text-[#153B65] mt-1">{totalProposals}</p>
          <span className="text-[10px] text-gray-400">All submissions</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Drafts</span>
          <p className="text-2xl font-black text-slate-700 mt-1">{draftProposals}</p>
          <span className="text-[10px] text-slate-400">Editable work in progress</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">In Review / Queue</span>
          <p className="text-2xl font-black text-sky-700 mt-1">{submittedProposals}</p>
          <span className="text-[10px] text-sky-500">Intake verification</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Under Evaluation</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{underEvaluation}</p>
          <span className="text-[10px] text-purple-500">Peer review rubric</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Approved</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{approvedProposals}</p>
          <span className="text-[10px] text-emerald-600">Funded grant awards</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs cursor-pointer hover:border-[#153B65] transition-colors" onClick={onViewProjects}>
          <span className="text-xs text-gray-500 font-medium">Active Projects</span>
          <p className="text-2xl font-black text-teal-700 mt-1">{ongoingProjects}</p>
          <span className="text-[10px] text-teal-600">Monitoring & Reports →</span>
        </div>
      </div>

      {/* For Correction Alert Banner if any */}
      {forCorrection > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Attention: {forCorrection} proposal(s) returned for correction</span>
              <p className="text-[11px] text-amber-800">
                Administrative intake identified incomplete attachments or missing signatures. Please review remarks and resubmit.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('For Correction')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs shrink-0"
          >
            Filter For Correction
          </button>
        </div>
      )}

      {/* Proposal Table & Filter Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[#153B65]">My Research Proposal Repository</h3>
            <p className="text-xs text-gray-500">Track application statuses, evaluator scores, and submission histories.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, tracking #..."
                className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#153B65] w-full sm:w-56"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs bg-gray-100 p-1 rounded-lg">
              {['all', 'Draft', 'Submitted', 'Under Evaluation', 'Approved', 'For Correction'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md capitalize whitespace-nowrap text-[11px] font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-white text-[#153B65] font-bold shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Tracking Number</th>
                <th className="p-3.5">Research Project Title</th>
                <th className="p-3.5">Funding Program</th>
                <th className="p-3.5">Budget</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                    No research proposals match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const canEdit = p.status === 'Draft' || p.status === 'For Correction';
                  return (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#153B65] whitespace-nowrap">
                        {p.tracking_number}
                      </td>
                      <td className="p-3.5 max-w-xs sm:max-w-md">
                        <p className="font-semibold text-gray-900 line-clamp-1">{p.project_title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {p.project_information?.classification} • {p.project_information?.duration_months} mo.
                        </p>
                      </td>
                      <td className="p-3.5 text-gray-600 max-w-xs truncate">
                        {p.funding_opportunity_title}
                      </td>
                      <td className="p-3.5 font-bold text-gray-800 whitespace-nowrap">
                        ₱{p.budget?.total_budget?.toLocaleString()}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="p-3.5 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {p.submission_date || p.created_at.split('T')[0]}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedProposal(p)}
                            className="p-1.5 text-gray-600 hover:text-[#153B65] hover:bg-gray-100 rounded-md transition-colors"
                            title="View proposal details & review history"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => onEditProposal(p)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                              title={p.status === 'For Correction' ? 'Edit & Resubmit Corrections' : 'Edit Draft'}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      <ProposalDetailModal
        proposal={selectedProposal}
        onClose={() => setSelectedProposal(null)}
        onEditDraft={(p) => {
          setSelectedProposal(null);
          onEditProposal(p);
        }}
      />
    </div>
  );
};
