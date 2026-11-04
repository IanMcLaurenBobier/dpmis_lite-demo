import React, { useState } from 'react';
import {
  Award,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Star,
  FileText,
  Info,
} from 'lucide-react';
import { Proposal, Evaluation, EvaluationCriteriaScores } from '../../types';
import { saveEvaluation } from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface EvaluationFormProps {
  proposal: Proposal;
  existingEvaluation?: Evaluation | null;
  onSuccess: (saved: Evaluation) => void;
  onCancel: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  proposal,
  existingEvaluation,
  onSuccess,
  onCancel,
}) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 6 Criteria ratings (1-5)
  const [scores, setScores] = useState<EvaluationCriteriaScores>(
    existingEvaluation?.scores || {
      relevance: 5,
      technical_merit: 4,
      methodology: 4,
      feasibility: 5,
      expected_impact: 5,
      budget_justification: 4,
    }
  );

  const [strengths, setStrengths] = useState(existingEvaluation?.strengths || '');
  const [weaknesses, setWeaknesses] = useState(existingEvaluation?.weaknesses || '');
  const [remarks, setRemarks] = useState(existingEvaluation?.remarks || '');
  const [recommendation, setRecommendation] = useState<
    'Recommended for Approval' | 'Recommended for Revision' | 'Not Recommended'
  >(existingEvaluation?.recommendation || 'Recommended for Approval');

  // Calculate overall score automatically
  const criteriaList = [
    {
      key: 'relevance' as keyof EvaluationCriteriaScores,
      title: '1. Research Relevance & National Priority Alignment',
      desc: 'Alignment with DOST Harmonized National R&D Agenda (HNRDA) and regional socio-economic priorities.',
    },
    {
      key: 'technical_merit' as keyof EvaluationCriteriaScores,
      title: '2. Technical Merit & Scientific Novelty',
      desc: 'Originality of concept, clarity of hypotheses, state-of-the-art gap addressing, and intellectual novelty.',
    },
    {
      key: 'methodology' as keyof EvaluationCriteriaScores,
      title: '3. Soundness of Research Methodology',
      desc: 'Appropriateness of experimental design, statistical robustness, controls, and risk mitigation strategies.',
    },
    {
      key: 'feasibility' as keyof EvaluationCriteriaScores,
      title: '4. Operational Feasibility & Institutional Capability',
      desc: 'Realistic work plan duration, technical track record of proponent team, and adequacy of lab facilities.',
    },
    {
      key: 'expected_impact' as keyof EvaluationCriteriaScores,
      title: '5. Expected Impact & Technology Transfer',
      desc: 'Potential for patent disclosures, Scopus publications, commercial adoption, or direct community benefit.',
    },
    {
      key: 'budget_justification' as keyof EvaluationCriteriaScores,
      title: '6. Budget Justification & Cost Effectiveness',
      desc: 'Reasonableness of itemized PS, MOOE, and Equipment Outlay against proposed deliverables and standard costs.',
    },
  ];

  const scoreValues = Object.values(scores);
  const overallScore = Number(
    (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1)
  );

  const handleScoreChange = (key: keyof EvaluationCriteriaScores, val: number) => {
    setScores({ ...scores, [key]: val });
  };

  const handleSaveDraft = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const evaluationData: Evaluation = {
        id: existingEvaluation?.id || `eval-${Date.now()}`,
        proposal_id: proposal.id,
        evaluator_id: currentUser.id,
        evaluator_name: currentUser.full_name,
        scores,
        overall_score: overallScore,
        strengths,
        weaknesses,
        remarks,
        recommendation,
        status: 'Draft',
        created_at: existingEvaluation?.created_at || new Date().toISOString(),
      };
      const saved = await saveEvaluation(evaluationData, currentUser);
      onSuccess(saved);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving evaluation draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!currentUser) return;
    if (!remarks.trim() || !strengths.trim()) {
      setErrorMsg('Please ensure strengths and general remarks are thoroughly completed.');
      setConfirmSubmitOpen(false);
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const evaluationData: Evaluation = {
        id: existingEvaluation?.id || `eval-${Date.now()}`,
        proposal_id: proposal.id,
        evaluator_id: currentUser.id,
        evaluator_name: currentUser.full_name,
        scores,
        overall_score: overallScore,
        strengths,
        weaknesses,
        remarks,
        recommendation,
        status: 'Submitted',
        created_at: existingEvaluation?.created_at || new Date().toISOString(),
      };
      const saved = await saveEvaluation(evaluationData, currentUser);
      setConfirmSubmitOpen(false);
      onSuccess(saved);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting final evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#153B65] mb-2 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assigned Reviews
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              {proposal.tracking_number}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Technical Peer Evaluation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#153B65] mt-1">
            {proposal.project_title}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Proponent: {proposal.researcher_name} • {proposal.project_information?.implementing_institution}
          </p>
        </div>

        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider block">
            Calculated Score
          </span>
          <span className="text-2xl font-black text-purple-900">{overallScore}</span>
          <span className="text-xs text-purple-600 font-medium block">out of 5.0</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 6-Criterion Scoring Rubric Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-6">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#153B65]">Part I: Technical Evaluation Criteria (1-5 Scale)</h3>
            <p className="text-xs text-gray-500">1 = Poor, 2 = Fair, 3 = Satisfactory, 4 = Very Satisfactory, 5 = Outstanding.</p>
          </div>
          <Award className="w-5 h-5 text-purple-600" />
        </div>

        <div className="space-y-4">
          {criteriaList.map((crit) => (
            <div
              key={crit.key}
              className="p-4 bg-slate-50/70 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="max-w-xl">
                <h4 className="font-bold text-xs text-[#153B65]">{crit.title}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{crit.desc}</p>
              </div>

              {/* 1-5 Rating buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = scores[crit.key] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleScoreChange(crit.key, val)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#153B65] text-white shadow-sm ring-2 ring-[#2563A6]'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-[#153B65] hover:bg-blue-50'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Qualitative Comments */}
        <div className="border-t border-gray-100 pt-6 space-y-4">
          <h3 className="font-bold text-sm text-[#153B65]">Part II: Qualitative Scientific Observations</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                Notable Strengths of the Proposal <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Highlight strong scientific rationale, competent personnel, or advanced laboratory facilities..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">
                Identified Weaknesses / Risk Factors
              </label>
              <textarea
                rows={3}
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                placeholder="Identify areas needing clarification, experimental blindspots, or logistical risks..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              General Evaluation Remarks & Synthesis <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide constructive feedback for the researcher and technical recommendation justification..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
            />
          </div>
        </div>

        {/* Recommendation Selection */}
        <div className="border-t border-gray-100 pt-6">
          <label className="block text-xs font-bold text-[#153B65] mb-2 uppercase tracking-wider">
            Part III: Formal Evaluator Recommendation
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'Recommended for Approval' as const,
                title: 'Recommended for Approval',
                desc: 'Proposal meets high scientific rigor and is recommended for grant allocation.',
                color: 'border-emerald-300 text-emerald-900 bg-emerald-50/50',
                activeColor: 'bg-emerald-600 text-white border-emerald-600',
              },
              {
                id: 'Recommended for Revision' as const,
                title: 'Recommended for Revision',
                desc: 'Proposal has merit but requires methodology refinement or budget trim.',
                color: 'border-amber-300 text-amber-900 bg-amber-50/50',
                activeColor: 'bg-amber-600 text-white border-amber-600',
              },
              {
                id: 'Not Recommended' as const,
                title: 'Not Recommended',
                desc: 'Significant technical flaws or low national relevance.',
                color: 'border-rose-300 text-rose-900 bg-rose-50/50',
                activeColor: 'bg-rose-600 text-white border-rose-600',
              },
            ].map((rec) => {
              const isSelected = recommendation === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setRecommendation(rec.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected ? rec.activeColor : `${rec.color} hover:shadow-xs`
                  }`}
                >
                  <p className="font-bold text-xs">{rec.title}</p>
                  <p className={`text-[11px] mt-1 leading-relaxed ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                    {rec.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-gray-500" />
              Save Draft Review
            </button>

            <button
              type="button"
              onClick={() => setConfirmSubmitOpen(true)}
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#153B65] hover:bg-[#2563A6] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              Submit Official Evaluation
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmSubmitOpen}
        title="Confirm Official Evaluation Submission"
        message={`Are you sure you want to submit your evaluation for "${proposal.project_title}" with score ${overallScore}/5.0 (${recommendation})? Once submitted, the review will be locked against modifications and forwarded to the DOST Executive Council.`}
        confirmLabel="Yes, Submit Official Review"
        type="primary"
        isLoading={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmSubmitOpen(false)}
      />
    </div>
  );
};
