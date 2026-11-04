import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  Award,
  TrendingUp,
  ShieldCheck,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Proposal, Project, UserAccount, AuditLog } from '../../types';
import { getProposals, getProjects, getUsers, getAuditLogs } from '../../firebase/services';
import { StatusBadge } from '../common/StatusBadge';

interface AdminDashboardProps {
  onNavigateTab: (view: string) => void;
  onOpenProposal: (proposal: Proposal) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenProposal,
}) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    async function load() {
      const [p, pr, u, a] = await Promise.all([
        getProposals(),
        getProjects(),
        getUsers(),
        getAuditLogs(),
      ]);
      setProposals(p);
      setProjects(pr);
      setUsers(u);
      setAuditLogs(a.slice(0, 6));
    }
    load();
  }, []);

  const totalResearchers = users.filter((u) => u.role === 'researcher').length;
  const totalProposals = proposals.length;
  const pendingIntake = proposals.filter((p) => p.status === 'Submitted' || p.status === 'Administrative Review').length;
  const underEvaluation = proposals.filter((p) => p.status === 'Under Evaluation').length;
  const forApproval = proposals.filter((p) => p.status === 'For Approval').length;
  const approved = proposals.filter((p) => p.status === 'Approved').length;
  const disapproved = proposals.filter((p) => p.status === 'Disapproved').length;
  const ongoingProjects = projects.filter((p) => p.project_status === 'Ongoing' || p.project_status === 'Approved').length;
  const completedProjects = projects.filter((p) => p.project_status === 'Completed').length;

  const totalAllocatedBudget = projects.reduce((sum, p) => sum + (p.approved_budget || 0), 0);

  // Status breakdown percentages
  const statusStats = [
    { label: 'Approved', count: approved, color: 'bg-emerald-500' },
    { label: 'For Approval', count: forApproval, color: 'bg-indigo-500' },
    { label: 'Under Evaluation', count: underEvaluation, color: 'bg-purple-500' },
    { label: 'Pending Review', count: pendingIntake, color: 'bg-sky-500' },
    { label: 'Disapproved', count: disapproved, color: 'bg-rose-500' },
    { label: 'Drafts', count: proposals.filter(p => p.status === 'Draft').length, color: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Overview Header */}
      <div className="bg-linear-to-r from-[#153B65] via-[#1A4575] to-[#2563A6] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-sky-200">
              Executive Directorate
            </span>
            <span className="text-xs text-sky-200 font-mono">
              National R&D Portfolio 2026
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mt-2">
            Grants Management Information System
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
            Consolidated oversight across national councils (PCIEERD, PCHRD, PCAARRD, NRCP). Review incoming proponent submissions, monitor evaluator scores, and authorize grant awards.
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-xl p-3.5 text-right shrink-0">
          <span className="text-[11px] text-sky-200 uppercase tracking-wider block">Total Active Grant Portfolio</span>
          <span className="text-2xl font-black text-white">
            ₱{(totalAllocatedBudget / 1000000).toFixed(1)}M
          </span>
          <span className="text-[10px] text-sky-200 block mt-0.5">Across {projects.length} Funded Research Projects</span>
        </div>
      </div>

      {/* KPI Stat Cards (Section 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          onClick={() => onNavigateTab('admin-reviews')}
          className="p-4 bg-white rounded-xl border border-sky-200 shadow-2xs cursor-pointer hover:border-sky-400 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-sky-700">
            <span className="text-xs font-bold">Pending Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-[#153B65] mt-1">{pendingIntake}</p>
          <span className="text-[10px] text-sky-600 font-medium">Completeness intake →</span>
        </div>

        <div
          onClick={() => onNavigateTab('admin-evaluators')}
          className="p-4 bg-white rounded-xl border border-purple-200 shadow-2xs cursor-pointer hover:border-purple-400 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-bold">Under Evaluation</span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-purple-900 mt-1">{underEvaluation}</p>
          <span className="text-[10px] text-purple-600 font-medium">Assigned to peer evaluators →</span>
        </div>

        <div
          onClick={() => onNavigateTab('admin-decisions')}
          className="p-4 bg-white rounded-xl border border-indigo-200 shadow-2xs cursor-pointer hover:border-indigo-400 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-indigo-700">
            <span className="text-xs font-bold">For Final Decision</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-indigo-900 mt-1">{forApproval}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Awaiting council sign-off →</span>
        </div>

        <div
          onClick={() => onNavigateTab('admin-projects')}
          className="p-4 bg-white rounded-xl border border-teal-200 shadow-2xs cursor-pointer hover:border-teal-400 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-teal-700">
            <span className="text-xs font-bold">Ongoing Projects</span>
            <FolderKanban className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-teal-900 mt-1">{ongoingProjects}</p>
          <span className="text-[10px] text-teal-600 font-medium">Actively funded & monitored →</span>
        </div>

        <div
          onClick={() => onNavigateTab('admin-users')}
          className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs cursor-pointer hover:border-[#153B65] transition-all"
        >
          <div className="flex items-center justify-between text-gray-600">
            <span className="text-xs font-bold">Researchers</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{totalResearchers}</p>
          <span className="text-[10px] text-gray-500">Accredited proponents →</span>
        </div>
      </div>

      {/* Analytics & Distribution Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposal Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-[#153B65]">Proposal Lifecycle Distribution</h3>
              <p className="text-xs text-gray-500">Total {totalProposals} proposals across all scientific review stages.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Firestore Counts
            </span>
          </div>

          {/* Visual Stacked Bar Chart */}
          <div className="h-6 w-full rounded-xl overflow-hidden flex bg-gray-100 mb-6 shadow-inner">
            {statusStats.map((st) => {
              const pct = totalProposals > 0 ? (st.count / totalProposals) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={st.label}
                  style={{ width: `${pct}%` }}
                  className={`${st.color} h-full transition-all`}
                  title={`${st.label}: ${st.count} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Grid of statuses */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statusStats.map((st) => (
              <div key={st.label} className="p-3 bg-slate-50/60 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-md ${st.color}`} />
                  <span className="text-xs font-medium text-gray-700">{st.label}</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{st.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-[#153B65]">Recent System Audit Trail</h3>
            <button
              onClick={() => onNavigateTab('admin-audit')}
              className="text-xs text-[#2563A6] hover:underline font-semibold"
            >
              All Logs →
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="text-xs border-b border-gray-100 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-semibold text-[#153B65]">{log.user_name}</span>
                  <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-gray-700 font-medium mt-0.5 line-clamp-1">{log.description}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600 font-mono mt-1 inline-block">
                  {log.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#153B65]">Recent Proposal Submissions</h3>
            <p className="text-xs text-gray-500">Latest proposals received through the proponent portal.</p>
          </div>
          <button
            onClick={() => onNavigateTab('admin-proposals')}
            className="text-xs font-bold text-[#2563A6] hover:text-[#153B65] flex items-center gap-1"
          >
            Manage All Proposals <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Tracking Number</th>
                <th className="p-3.5">Research Title</th>
                <th className="p-3.5">Lead Researcher</th>
                <th className="p-3.5">Institution</th>
                <th className="p-3.5">Budget</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proposals.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#153B65] whitespace-nowrap">
                    {p.tracking_number}
                  </td>
                  <td className="p-3.5 font-semibold text-gray-900 max-w-xs truncate">
                    {p.project_title}
                  </td>
                  <td className="p-3.5 text-gray-700 whitespace-nowrap">
                    {p.researcher_name}
                  </td>
                  <td className="p-3.5 text-gray-500 max-w-xs truncate">
                    {p.project_information?.implementing_institution}
                  </td>
                  <td className="p-3.5 font-bold text-gray-800 whitespace-nowrap">
                    ₱{p.budget?.total_budget?.toLocaleString()}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenProposal(p)}
                      className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-[#153B65] text-[#153B65] hover:text-white rounded-lg transition-colors shadow-2xs"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
