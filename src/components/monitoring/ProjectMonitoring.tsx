import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  Calendar,
  Building,
  DollarSign,
  Send,
  Eye,
  FileText,
  User,
  Plus,
  X,
  MessageSquare,
} from 'lucide-react';
import { Project, ProgressReport, ProjectStatus } from '../../types';
import {
  getProjects,
  getProgressReports,
  updateProjectStatus,
  reviewProgressReport,
} from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressReportForm } from './ProgressReportForm';

export const ProjectMonitoringView: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'projects' | 'reports'>('projects');

  // Submit report modal
  const [reportProject, setReportProject] = useState<Project | null>(null);

  // Review report modal
  const [reviewingReport, setReviewingReport] = useState<ProgressReport | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'reviewed' | 'accepted' | 'for_revision'>('accepted');

  // Update Project Status modal
  const [statusModalProject, setStatusModalProject] = useState<Project | null>(null);
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>('Ongoing');
  const [newAccomplishment, setNewAccomplishment] = useState<number>(0);
  const [statusRemarks, setStatusRemarks] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [p, r] = await Promise.all([getProjects(), getProgressReports()]);
    setProjects(p);
    setReports(r);
  };

  const totalProjects = projects.length;
  const ongoingCount = projects.filter((p) => p.project_status === 'Ongoing').length;
  const approvedCount = projects.filter((p) => p.project_status === 'Approved').length;
  const forMonitoringCount = projects.filter((p) => p.project_status === 'For Monitoring').length;
  const completedCount = projects.filter((p) => p.project_status === 'Completed').length;
  const delayedCount = projects.filter((p) => p.project_status === 'Delayed').length;

  const handleOpenStatusModal = (p: Project) => {
    setStatusModalProject(p);
    setNewProjectStatus(p.project_status);
    setNewAccomplishment(p.accomplishment_rate || 0);
    setStatusRemarks(p.monitoring_remarks || '');
  };

  const handleSaveStatusModal = async () => {
    if (!statusModalProject || !currentUser) return;
    await updateProjectStatus(
      statusModalProject.id,
      newProjectStatus,
      newAccomplishment,
      statusRemarks,
      currentUser
    );
    setStatusModalProject(null);
    await loadData();
  };

  const handleOpenReviewReport = (rep: ProgressReport) => {
    setReviewingReport(rep);
    setReviewRemarks(rep.officer_remarks || 'Milestone accomplishments verified satisfactory. Deliverables match approved work plan.');
    setReviewStatus('accepted');
  };

  const handleSubmitReportReview = async () => {
    if (!reviewingReport || !currentUser) return;
    await reviewProgressReport(
      reviewingReport.id,
      reviewStatus,
      reviewRemarks,
      currentUser
    );
    setReviewingReport(null);
    await loadData();
  };

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.project_status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-[#153B65] via-[#1F507E] to-[#1E6B7B] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-teal-200">
              Project Monitoring Directorate
            </span>
            <span className="text-xs text-teal-200 font-mono">
              Grant Execution & Accomplishment Audits
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mt-2">
            Funded Research Project Monitoring
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
            Track implementation timelines, milestone deliveries, progress reports, and physical accomplishment percentages for approved DOST R&D grant projects.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="p-3 bg-white/10 rounded-xl text-center border border-white/20">
            <span className="text-xs text-teal-200 block">Total Active</span>
            <span className="text-xl font-black text-white">{totalProjects}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-xl text-center border border-white/20">
            <span className="text-xs text-teal-200 block">Reports Filed</span>
            <span className="text-xl font-black text-white">{reports.length}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('Approved')}
          className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs cursor-pointer hover:border-[#153B65] transition-all"
        >
          <span className="text-xs text-gray-500 font-medium">Newly Approved</span>
          <p className="text-2xl font-black text-[#153B65] mt-1">{approvedCount}</p>
          <span className="text-[10px] text-gray-400">Notice to Proceed pending</span>
        </div>

        <div
          onClick={() => setStatusFilter('Ongoing')}
          className="p-4 bg-white rounded-xl border border-teal-200 shadow-2xs cursor-pointer hover:border-teal-400 transition-all"
        >
          <span className="text-xs text-teal-700 font-bold">Ongoing Execution</span>
          <p className="text-2xl font-black text-teal-800 mt-1">{ongoingCount}</p>
          <span className="text-[10px] text-teal-600">Active milestone delivery</span>
        </div>

        <div
          onClick={() => setStatusFilter('For Monitoring')}
          className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs cursor-pointer hover:border-amber-400 transition-all"
        >
          <span className="text-xs text-amber-800 font-bold">For Monitoring</span>
          <p className="text-2xl font-black text-amber-900 mt-1">{forMonitoringCount}</p>
          <span className="text-[10px] text-amber-600">Inspection & terminal audit</span>
        </div>

        <div
          onClick={() => setStatusFilter('Completed')}
          className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs cursor-pointer hover:border-emerald-400 transition-all"
        >
          <span className="text-xs text-emerald-800 font-bold">Completed</span>
          <p className="text-2xl font-black text-emerald-900 mt-1">{completedCount}</p>
          <span className="text-[10px] text-emerald-600">Final outputs verified</span>
        </div>

        <div
          onClick={() => setStatusFilter('Delayed')}
          className="p-4 bg-white rounded-xl border border-rose-200 shadow-2xs cursor-pointer hover:border-rose-400 transition-all"
        >
          <span className="text-xs text-rose-800 font-bold">Delayed</span>
          <p className="text-2xl font-black text-rose-900 mt-1">{delayedCount}</p>
          <span className="text-[10px] text-rose-600">Bottlenecks identified</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab('projects')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'projects'
              ? 'border-[#153B65] text-[#153B65]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          Funded Projects Directory ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-[#153B65] text-[#153B65]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Activity className="w-4 h-4 text-teal-600" />
          Periodic Progress Reports ({reports.length})
        </button>
      </div>

      {/* TAB 1: PROJECTS DIRECTORY */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => {
              const accomplishment = p.accomplishment_rate || 0;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#153B65] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {p.tracking_number}
                      </span>
                      <StatusBadge status={p.project_status} size="sm" />
                    </div>

                    <h3 className="font-bold text-sm text-[#153B65] leading-snug line-clamp-2">
                      {p.project_title}
                    </h3>

                    <div className="space-y-1 text-xs text-gray-600">
                      <p><span className="text-gray-400">Leader:</span> <strong className="text-gray-800">{p.project_leader}</strong></p>
                      <p className="truncate"><span className="text-gray-400">Institution:</span> {p.institution}</p>
                      <p><span className="text-gray-400">Approved Budget:</span> <span className="font-bold text-[#153B65]">₱{p.approved_budget?.toLocaleString()}</span></p>
                      <p className="text-[11px] text-gray-500 font-mono">
                        {p.start_date} to {p.end_date}
                      </p>
                    </div>

                    {/* Accomplishment Rate Progress Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-600">Accomplishment</span>
                        <span className="font-bold text-[#153B65]">{accomplishment}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${accomplishment}%` }}
                          className={`h-full rounded-full transition-all ${
                            accomplishment >= 100
                              ? 'bg-emerald-500'
                              : accomplishment >= 50
                              ? 'bg-teal-500'
                              : 'bg-blue-500'
                          }`}
                        />
                      </div>
                    </div>

                    {p.monitoring_remarks && (
                      <p className="text-[11px] bg-slate-50 p-2.5 rounded-lg border border-gray-100 text-gray-600 italic">
                        "{p.monitoring_remarks}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setReportProject(p)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-[#153B65] text-[#153B65] hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Submit Report
                    </button>

                    {(activeRole === 'project_officer' || activeRole === 'admin') && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(p)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Update Status
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PROGRESS REPORTS LIST */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#153B65]">Periodic Progress & Accomplishment Reports</h3>
            <span className="text-xs text-gray-400">Verified milestone submissions</span>
          </div>

          <div className="divide-y divide-gray-100">
            {reports.map((r) => (
              <div key={r.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#153B65] text-sm">{r.reporting_period}</span>
                    <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm">
                      {r.tracking_number || r.project_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.report_status === 'accepted'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : r.report_status === 'reviewed'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {r.report_status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {r.percentage_completed}% Accomplished
                    </span>
                    {(activeRole === 'project_officer' || activeRole === 'admin') && (
                      <button
                        onClick={() => handleOpenReviewReport(r)}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-700 hover:text-white text-teal-800 font-semibold rounded-lg transition-colors border border-teal-200"
                      >
                        Review Report
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-800 font-medium">{r.project_title}</p>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <strong className="text-gray-800">Key Accomplishments:</strong> {r.accomplishments}
                </p>

                {r.issues_encountered && (
                  <p className="text-rose-800 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                    <strong>Issues:</strong> {r.issues_encountered}
                  </p>
                )}

                {r.officer_remarks && (
                  <p className="text-teal-900 bg-teal-50/50 p-2 rounded-lg border border-teal-100">
                    <strong>Officer Review Remarks:</strong> {r.officer_remarks}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span>Submitted by: <strong>{r.submitted_by_name}</strong></span>
                  <span className="font-mono">{new Date(r.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: SUBMIT PROGRESS REPORT */}
      {reportProject && (
        <ProgressReportForm
          project={reportProject}
          onClose={() => setReportProject(null)}
          onSuccess={async () => {
            setReportProject(null);
            await loadData();
          }}
        />
      )}

      {/* MODAL 2: UPDATE PROJECT STATUS (Project Officer / Admin) */}
      {statusModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#153B65] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Update Project Monitoring Status</h3>
              <button
                onClick={() => setStatusModalProject(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl">
                <p className="font-bold text-gray-900">{statusModalProject.project_title}</p>
                <p className="text-gray-500 font-mono mt-0.5">{statusModalProject.tracking_number}</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Project Status
                </label>
                <select
                  value={newProjectStatus}
                  onChange={(e) => setNewProjectStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="Approved">Approved (Initial)</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="For Monitoring">For Monitoring (Terminal Review)</option>
                  <option value="Completed">Completed (Outputs Verified)</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Accomplishment Rate: {newAccomplishment}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newAccomplishment}
                  onChange={(e) => setNewAccomplishment(Number(e.target.value))}
                  className="w-full accent-[#153B65]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Monitoring Remarks & Directives
                </label>
                <textarea
                  rows={3}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Official project officer observations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatusModalProject(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatusModal}
                  className="px-5 py-2 bg-[#153B65] text-white font-bold rounded-xl"
                >
                  Save Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REVIEW REPORT (Officer / Admin) */}
      {reviewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#153B65] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Review Accomplishment Report</h3>
              <button
                onClick={() => setReviewingReport(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl">
                <p className="font-bold text-gray-900">{reviewingReport.reporting_period}</p>
                <p className="text-gray-500 mt-0.5">Submitted by: {reviewingReport.submitted_by_name}</p>
                <p className="text-gray-700 mt-2"><strong className="text-gray-900">Accomplishments:</strong> {reviewingReport.accomplishments}</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Review Assessment Decision
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="accepted">Accepted (Verified Complete)</option>
                  <option value="reviewed">Reviewed (Subject to Liquidation)</option>
                  <option value="for_revision">For Revision (Incomplete Accomplishment)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Officer Review Remarks <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Record formal monitoring assessment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingReport(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReportReview}
                  className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl"
                >
                  Confirm Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
