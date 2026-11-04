import React, { useState } from 'react';
import { X, Send, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Project, ProgressReport } from '../../types';
import { submitProgressReport } from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';

interface ProgressReportFormProps {
  project: Project;
  onClose: () => void;
  onSuccess: (report: ProgressReport) => void;
}

export const ProgressReportForm: React.FC<ProgressReportFormProps> = ({
  project,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [period, setPeriod] = useState('Year 1 - Q2 Progress Report');
  const [accomplishments, setAccomplishments] = useState('');
  const [percentCompleted, setPercentCompleted] = useState<number>(
    project.accomplishment_rate || 25
  );
  const [issues, setIssues] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accomplishments.trim()) {
      setErrorMsg('Please specify completed activities and milestones.');
      return;
    }
    if (!currentUser) return;
    setLoading(true);

    try {
      const report: ProgressReport = {
        id: `rep-${Date.now()}`,
        project_id: project.id,
        project_title: project.project_title,
        tracking_number: project.tracking_number,
        submitted_by: currentUser.id,
        submitted_by_name: currentUser.full_name,
        reporting_period: period,
        accomplishments,
        percentage_completed: Number(percentCompleted),
        issues_encountered: issues,
        recommendations,
        report_status: 'submitted',
        submitted_at: new Date().toISOString(),
      };
      const saved = await submitProgressReport(report, currentUser);
      onSuccess(saved);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#153B65] text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Submit Project Progress Report</h3>
            <p className="text-xs text-sky-200 font-mono">{project.tracking_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
            <p className="font-bold text-gray-900">{project.project_title}</p>
            <p className="text-gray-500 mt-0.5">Project Leader: {project.project_leader} ({project.institution})</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Reporting Period <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. Q1-Q2 Semi-Annual Accomplishment Report"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Cumulative Physical Accomplishment: {percentCompleted}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={percentCompleted}
                onChange={(e) => setPercentCompleted(Number(e.target.value))}
                className="w-full mt-2 accent-[#153B65]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Key Activities & Deliverables Accomplished <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              placeholder="Detail laboratory experiments completed, prototypes constructed, or community field trials conducted during this period..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Issues, Delays, or Technical Bottlenecks Encountered
            </label>
            <textarea
              rows={2}
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="e.g. Weather disruptions, customs delay for imported chemical reagents..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Recommendations & Next Period Work Targets
            </label>
            <textarea
              rows={2}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Planned activities for the upcoming quarter..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
            />
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#153B65] hover:bg-[#2563A6] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
