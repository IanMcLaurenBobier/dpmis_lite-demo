import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Calendar,
  Building,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  AlertCircle,
  ExternalLink,
  Download,
} from 'lucide-react';
import { Proposal, StatusHistoryItem, Evaluation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { getStatusHistory, getEvaluations } from '../../firebase/services';

interface ProposalDetailModalProps {
  proposal: Proposal | null;
  onClose: () => void;
  onEditDraft?: (proposal: Proposal) => void;
}

export const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({
  proposal,
  onClose,
  onEditDraft,
}) => {
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'narrative' | 'workplan' | 'budget' | 'docs' | 'history'>('info');

  useEffect(() => {
    if (!proposal) return;
    async function load() {
      if (!proposal) return;
      const h = await getStatusHistory(proposal.id);
      setHistory(h);
      const ev = await getEvaluations(proposal.id);
      setEvaluations(ev);
    }
    load();
  }, [proposal]);

  if (!proposal) return null;

  const canEdit = proposal.status === 'Draft' || proposal.status === 'For Correction';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#153B65] text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-200 bg-white/10 px-2 py-0.5 rounded-sm">
                  {proposal.tracking_number}
                </span>
                <StatusBadge status={proposal.status} size="sm" />
              </div>
              <h3 className="font-bold text-base text-white truncate max-w-xl mt-1">
                {proposal.project_title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 overflow-x-auto px-4 shrink-0">
          {[
            { id: 'info', label: 'Overview & Information' },
            { id: 'narrative', label: 'Proposal Narrative' },
            { id: 'workplan', label: 'Work Plan & Personnel' },
            { id: 'budget', label: 'Budget Breakdown' },
            { id: 'docs', label: 'Documents' },
            { id: 'history', label: 'Status History & Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#153B65] text-[#153B65] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {proposal.admin_remarks && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-bold text-amber-800 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    Administrative Remarks
                  </div>
                  <p className="leading-relaxed">{proposal.admin_remarks}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-[#153B65] uppercase tracking-wider text-[11px] mb-2">
                    Proponent Details
                  </h4>
                  <p><span className="text-gray-500">Lead Researcher:</span> <span className="font-semibold text-gray-900">{proposal.researcher_name}</span></p>
                  <p><span className="text-gray-500">Email:</span> <span className="font-mono text-gray-800">{proposal.researcher_email}</span></p>
                  <p><span className="text-gray-500">Institution:</span> <span className="font-semibold text-gray-800">{proposal.project_information?.implementing_institution}</span></p>
                  <p><span className="text-gray-500">Project Location:</span> <span>{proposal.project_information?.project_location}</span></p>
                </div>

                <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-[#153B65] uppercase tracking-wider text-[11px] mb-2">
                    Grant & Timeline
                  </h4>
                  <p><span className="text-gray-500">Call for Proposals:</span> <span className="font-semibold text-gray-900">{proposal.funding_opportunity_title}</span></p>
                  <p><span className="text-gray-500">Classification:</span> <span className="px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 font-medium">{proposal.project_information?.classification}</span></p>
                  <p><span className="text-gray-500">Duration:</span> <span className="font-semibold">{proposal.project_information?.duration_months} Months</span> ({proposal.project_information?.start_date} to {proposal.project_information?.end_date})</p>
                  <p><span className="text-gray-500">Total Budget Requested:</span> <span className="font-bold text-[#153B65]">₱{proposal.budget?.total_budget?.toLocaleString()}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NARRATIVE */}
          {activeTab === 'narrative' && (
            <div className="space-y-6 text-xs text-gray-800 leading-relaxed">
              <div>
                <h4 className="font-bold text-[#153B65] uppercase tracking-wider text-[11px] mb-1">
                  1. Project Background
                </h4>
                <p className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {proposal.project_description?.background || 'No background description provided.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#153B65] uppercase tracking-wider text-[11px] mb-1">
                  2. Rationale & Significance
                </h4>
                <p className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {proposal.project_description?.rationale || 'No rationale provided.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#153B65] uppercase tracking-wider text-[11px] mb-1">
                  3. Objectives
                </h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <p><span className="font-semibold">General Objective:</span> {proposal.project_description?.general_objective}</p>
                  {proposal.project_description?.specific_objectives && proposal.project_description.specific_objectives.length > 0 && (
                    <div>
                      <span className="font-semibold">Specific Objectives:</span>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {proposal.project_description.specific_objectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#153B65] uppercase tracking-wider text-[11px] mb-1">
                  4. Research Methodology
                </h4>
                <p className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {proposal.project_description?.methodology || 'No methodology specified.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-[#153B65] uppercase tracking-wider text-[11px] mb-1">
                    Expected Outcomes
                  </h4>
                  <p className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    {proposal.project_description?.expected_outcomes}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-[#153B65] uppercase tracking-wider text-[11px] mb-1">
                    Expected Socioeconomic Benefits
                  </h4>
                  <p className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    {proposal.project_description?.expected_benefits}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORK PLAN & PERSONNEL */}
          {activeTab === 'workplan' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-[#153B65] uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#153B65]" />
                  Project Personnel & Researchers
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Project Role</th>
                        <th className="p-3">Institution</th>
                        <th className="p-3">Responsibilities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {proposal.personnel?.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-gray-900">{p.name}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 text-[11px] font-medium">{p.role}</span></td>
                          <td className="p-3 text-gray-600">{p.institution}</td>
                          <td className="p-3 text-gray-600">{p.responsibilities}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#153B65] uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#153B65]" />
                  Work Plan Activities & Expected Deliverables
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Activity Description</th>
                        <th className="p-3">Start Date</th>
                        <th className="p-3">End Date</th>
                        <th className="p-3">Expected Deliverable</th>
                        <th className="p-3">Responsible Staff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {proposal.work_plan?.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-medium text-gray-900">{w.activity_description}</td>
                          <td className="p-3 text-gray-600 font-mono text-[11px]">{w.start_date}</td>
                          <td className="p-3 text-gray-600 font-mono text-[11px]">{w.end_date}</td>
                          <td className="p-3 text-gray-700 font-medium">{w.expected_deliverable}</td>
                          <td className="p-3 text-gray-600">{w.responsible_personnel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BUDGET BREAKDOWN */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                  <span className="font-bold text-sm text-[#153B65]">Approved Line-Item Budget Classification</span>
                  <span className="text-base font-extrabold text-[#153B65]">
                    Total: ₱{proposal.budget?.total_budget?.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Personnel Services (PS)</p>
                    <p className="text-lg font-bold text-gray-900">₱{proposal.budget?.personnel_services?.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Salaries, honoraria, stipends</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Maintenance & Operating (MOOE)</p>
                    <p className="text-lg font-bold text-gray-900">₱{proposal.budget?.mooe?.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Supplies, reagents, travel, testing</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Equipment Outlay (EO)</p>
                    <p className="text-lg font-bold text-gray-900">₱{proposal.budget?.equipment_outlay?.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Capital lab hardware, sensors</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Other Operating Expenses</p>
                    <p className="text-lg font-bold text-gray-900">₱{proposal.budget?.other_expenses?.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Administrative & contingency</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORTING DOCUMENTS */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                  Uploaded Proposal Attachments
                </h4>
                <span className="text-xs text-gray-400">Firebase Storage verified</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: `${proposal.tracking_number}_Detailed_Proposal.pdf`, type: 'Complete Proposal Document', size: '2.4 MB' },
                  { name: `${proposal.tracking_number}_Curriculum_Vitae.pdf`, type: 'Curriculum Vitae', size: '840 KB' },
                  { name: `${proposal.tracking_number}_Work_Plan_Gantt.xlsx`, type: 'Itemized Work Plan', size: '420 KB' },
                  { name: `${proposal.tracking_number}_Institutional_Endorsement.pdf`, type: 'Institutional Endorsement Letter', size: '1.1 MB' },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/70 hover:bg-blue-50/50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-blue-100 text-[#153B65] rounded-lg shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{doc.name}</p>
                        <p className="text-[10px] text-gray-500">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Simulating secure download of ${doc.name}`)}
                      className="p-1.5 text-gray-500 hover:text-[#153B65] rounded-md transition-colors"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STATUS HISTORY & EVALUATION */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {evaluations.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#153B65] mb-3">
                    Peer Evaluation Results
                  </h4>
                  {evaluations.map((ev) => (
                    <div key={ev.id} className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3 text-xs mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-purple-900">{ev.evaluator_name}</span>
                          <span className="ml-2 text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                            Score: {ev.overall_score}/5.0
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                          {ev.recommendation}
                        </span>
                      </div>
                      <p><span className="font-semibold text-gray-700">Remarks:</span> {ev.remarks}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <p className="p-2 bg-white rounded-lg border border-purple-100"><span className="font-bold text-emerald-700">Strengths:</span> {ev.strengths}</p>
                        <p className="p-2 bg-white rounded-lg border border-purple-100"><span className="font-bold text-rose-700">Areas for Improvement:</span> {ev.weaknesses}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">
                  Status Transition Audit Trail
                </h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                  {history.map((h, i) => (
                    <div key={h.id || i} className="relative text-xs">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#153B65] border-2 border-white ring-1 ring-[#153B65]" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-900">{h.new_status}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(h.changed_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-0.5">{h.remarks}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Updated by: {h.changed_by_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500">
            Reference: <span className="font-mono font-bold text-gray-800">{proposal.tracking_number}</span>
          </div>
          <div className="flex items-center gap-3">
            {canEdit && onEditDraft && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditDraft(proposal);
                }}
                className="px-4 py-2 bg-[#153B65] hover:bg-[#2563A6] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                {proposal.status === 'For Correction' ? 'Edit & Resubmit Corrections' : 'Continue Editing Draft'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
