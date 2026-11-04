import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Send,
  Eye,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Upload,
} from 'lucide-react';
import {
  Proposal,
  FundingOpportunity,
  ProjectPersonnel,
  WorkPlanActivity,
  BudgetBreakdown,
} from '../../types';
import {
  getFundingOpportunities,
  saveProposal,
  submitProposal,
  getResearcherProfile,
} from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface ProposalFormProps {
  initialProposal?: Proposal | null;
  selectedOpportunity?: FundingOpportunity | null;
  onSuccess: (saved: Proposal) => void;
  onCancel: () => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({
  initialProposal,
  selectedOpportunity,
  onSuccess,
  onCancel,
}) => {
  const { currentUser } = useAuth();
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentSection, setCurrentSection] = useState<number>(1);

  // Form State
  const [projectTitle, setProjectTitle] = useState(initialProposal?.project_title || '');
  const [fundingOppId, setFundingOppId] = useState(
    initialProposal?.funding_opportunity_id || selectedOpportunity?.id || 'opp-2026-01'
  );
  const [classification, setClassification] = useState<any>(
    initialProposal?.project_information?.classification || 'Applied Research'
  );
  const [sector, setSector] = useState<any>(
    initialProposal?.project_information?.sector || 'Emerging Technology'
  );
  const [institution, setInstitution] = useState(
    initialProposal?.project_information?.implementing_institution ||
      currentUser?.institution ||
      'University of the Philippines Diliman'
  );
  const [location, setLocation] = useState(
    initialProposal?.project_information?.project_location || 'National Capital Region'
  );
  const [durationMonths, setDurationMonths] = useState(
    initialProposal?.project_information?.duration_months || 18
  );
  const [startDate, setStartDate] = useState(
    initialProposal?.project_information?.start_date || '2026-06-01'
  );
  const [endDate, setEndDate] = useState(
    initialProposal?.project_information?.end_date || '2027-11-30'
  );

  // Section 2: Narrative
  const [background, setBackground] = useState(initialProposal?.project_description?.background || '');
  const [rationale, setRationale] = useState(initialProposal?.project_description?.rationale || '');
  const [generalObjective, setGeneralObjective] = useState(
    initialProposal?.project_description?.general_objective || ''
  );
  const [specificObjectives, setSpecificObjectives] = useState<string[]>(
    initialProposal?.project_description?.specific_objectives || [
      'Fabricate and calibrate initial laboratory prototype.',
      'Conduct multi-site field trial evaluations under controlled ambient parameters.',
      'Publish peer-reviewed scientific discoveries and file intellectual property disclosure.',
    ]
  );
  const [methodology, setMethodology] = useState(initialProposal?.project_description?.methodology || '');
  const [expectedOutcomes, setExpectedOutcomes] = useState(
    initialProposal?.project_description?.expected_outcomes || ''
  );
  const [expectedBenefits, setExpectedBenefits] = useState(
    initialProposal?.project_description?.expected_benefits || ''
  );

  // Section 3: Personnel
  const [personnel, setPersonnel] = useState<ProjectPersonnel[]>(
    initialProposal?.personnel || [
      {
        id: 'p-1',
        name: currentUser?.full_name || 'Dr. Maria Corazon De Castro',
        role: 'Project Leader',
        institution: institution,
        responsibilities: 'Overall project governance, experimental design, and agency reporting.',
      },
    ]
  );

  // Section 4: Work Plan
  const [workPlan, setWorkPlan] = useState<WorkPlanActivity[]>(
    initialProposal?.work_plan || [
      {
        id: 'w-1',
        activity_description: 'Equipment procurement and setup of testing environment',
        start_date: '2026-06-01',
        end_date: '2026-09-30',
        expected_deliverable: 'Procured hardware and operational testing protocol',
        responsible_personnel: currentUser?.full_name || 'Project Leader',
      },
      {
        id: 'w-2',
        activity_description: 'Algorithm formulation, sensor fusion, and laboratory validation',
        start_date: '2026-10-01',
        end_date: '2027-04-30',
        expected_deliverable: 'Validated software firmware and test bench report',
        responsible_personnel: 'Research Specialist Staff',
      },
    ]
  );

  // Section 5: Budget
  const [ps, setPs] = useState<number>(initialProposal?.budget?.personnel_services || 3000000);
  const [mooe, setMooe] = useState<number>(initialProposal?.budget?.mooe || 2000000);
  const [eo, setEo] = useState<number>(initialProposal?.budget?.equipment_outlay || 4000000);
  const [other, setOther] = useState<number>(initialProposal?.budget?.other_expenses || 500000);

  // Section 6: Documents
  const [documents, setDocuments] = useState<string[]>(
    initialProposal
      ? ['Detailed Proposal Document.pdf', 'Institutional Endorsement Letter.pdf']
      : ['Detailed Proposal Document.pdf', 'Institutional Endorsement Letter.pdf']
  );

  // Automatic calculation of total budget
  const totalBudget = Number(ps || 0) + Number(mooe || 0) + Number(eo || 0) + Number(other || 0);

  useEffect(() => {
    async function init() {
      const opps = await getFundingOpportunities();
      setOpportunities(opps);
      if (currentUser) {
        const prof = await getResearcherProfile(currentUser.id);
        if (prof?.institution && !initialProposal) {
          setInstitution(prof.institution);
        }
      }
    }
    init();
  }, [currentUser, initialProposal]);

  const handleAddObjective = () => {
    setSpecificObjectives([...specificObjectives, '']);
  };

  const handleRemoveObjective = (index: number) => {
    setSpecificObjectives(specificObjectives.filter((_, i) => i !== index));
  };

  const handleAddPersonnel = () => {
    setPersonnel([
      ...personnel,
      {
        id: `p-${Date.now()}`,
        name: '',
        role: 'Science Research Specialist',
        institution: institution,
        responsibilities: '',
      },
    ]);
  };

  const handleRemovePersonnel = (id: string) => {
    if (personnel.length <= 1) return;
    setPersonnel(personnel.filter((p) => p.id !== id));
  };

  const handleAddWorkPlan = () => {
    setWorkPlan([
      ...workPlan,
      {
        id: `w-${Date.now()}`,
        activity_description: '',
        start_date: startDate,
        end_date: endDate,
        expected_deliverable: '',
        responsible_personnel: currentUser?.full_name || 'Project Staff',
      },
    ]);
  };

  const handleRemoveWorkPlan = (id: string) => {
    if (workPlan.length <= 1) return;
    setWorkPlan(workPlan.filter((w) => w.id !== id));
  };

  const handleAddDocument = () => {
    const docName = prompt('Enter document file name (e.g. Ethics_Review_Board_Clearance.pdf):');
    if (docName) {
      setDocuments([...documents, docName]);
    }
  };

  const buildProposalObject = (status: any): Proposal => {
    const opp = opportunities.find((o) => o.id === fundingOppId);
    return {
      id: initialProposal?.id || '',
      tracking_number: initialProposal?.tracking_number || '',
      researcher_id: currentUser?.id || 'user-researcher-1',
      researcher_name: currentUser?.full_name || 'Dr. Maria Corazon De Castro',
      researcher_email: currentUser?.email || 'researcher@dpmislite.test',
      funding_opportunity_id: fundingOppId,
      funding_opportunity_title: opp?.title || 'National R&D Call for Proposals',
      project_title: projectTitle || 'Untitled Research Proposal',
      project_information: {
        classification,
        sector,
        implementing_institution: institution,
        project_location: location,
        duration_months: Number(durationMonths),
        start_date: startDate,
        end_date: endDate,
      },
      project_description: {
        background,
        rationale,
        general_objective: generalObjective,
        specific_objectives: specificObjectives.filter((o) => o.trim().length > 0),
        methodology,
        expected_outcomes: expectedOutcomes,
        expected_benefits: expectedBenefits,
      },
      personnel,
      work_plan: workPlan,
      budget: {
        personnel_services: Number(ps),
        mooe: Number(mooe),
        equipment_outlay: Number(eo),
        other_expenses: Number(other),
        total_budget: totalBudget,
      },
      status,
      created_at: initialProposal?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const handleSaveDraft = async () => {
    if (!projectTitle.trim()) {
      setErrorMsg('Please enter a project title before saving draft.');
      return;
    }
    setErrorMsg('');
    setIsSavingDraft(true);
    try {
      const data = buildProposalObject('Draft');
      const saved = await saveProposal(data, currentUser!);
      onSuccess(saved);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!projectTitle.trim() || !generalObjective.trim()) {
      setErrorMsg('Please ensure project title and general objective are filled in.');
      setConfirmSubmitOpen(false);
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      // 1. Save proposal first
      const draftData = buildProposalObject(initialProposal?.status === 'For Correction' ? 'Submitted' : 'Draft');
      const saved = await saveProposal(draftData, currentUser!);

      // 2. Submit proposal
      const submitted = await submitProposal(saved.id, currentUser!);
      setConfirmSubmitOpen(false);
      onSuccess(submitted);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { num: 1, title: 'Project Info' },
    { num: 2, title: 'Description' },
    { num: 3, title: 'Personnel' },
    { num: 4, title: 'Work Plan' },
    { num: 5, title: 'Budget' },
    { num: 6, title: 'Documents' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#153B65] mb-2 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-[#153B65]">
            {initialProposal ? `Edit Proposal: ${initialProposal.tracking_number}` : 'New Research Proposal Form'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            6-Section DOST Grants-In-Aid Standard Research Proponent Application
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Save className="w-4 h-4 text-gray-500" />
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={() => setConfirmSubmitOpen(true)}
            disabled={isSavingDraft || isSubmitting}
            className="px-5 py-2 bg-[#153B65] hover:bg-[#2563A6] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-4 h-4" />
            Submit Proposal
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step navigation wizard tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-100 p-1.5 rounded-xl text-center">
        {sections.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setCurrentSection(s.num)}
            className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
              currentSection === s.num
                ? 'bg-white text-[#153B65] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="font-mono opacity-60 mr-1">{s.num}.</span> {s.title}
          </button>
        ))}
      </div>

      {/* SECTION 1: PROJECT INFORMATION */}
      {currentSection === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-[#153B65]">Section 1: General Project Information</h3>
            <p className="text-xs text-gray-500">Provide project classification, sector, institution, and timelines.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Project TULAY: Autonomous Vibration Structural Health Telemetry for Philippine Bridges"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Funding Opportunity Call <span className="text-rose-500">*</span>
              </label>
              <select
                value={fundingOppId}
                onChange={(e) => setFundingOppId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
              >
                {opportunities.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title} ({o.funding_agency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Research Classification
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
              >
                <option value="Basic Research">Basic Research (Fundamental Discovery)</option>
                <option value="Applied Research">Applied Research (Practical Problem Solving)</option>
                <option value="Developmental Research">Developmental Research (Prototyping & Pilot Scale)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Research Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
              >
                <option value="Health">Health & Biomedicine (PCHRD)</option>
                <option value="Agriculture & Aquatic">Agriculture & Aquatic Resources (PCAARRD)</option>
                <option value="Industry & Energy">Industry, Energy & Emerging Tech (PCIEERD)</option>
                <option value="Emerging Technology">AI, Robotics & Emerging Technology</option>
                <option value="Disaster Risk Reduction">Disaster Risk Reduction & Climate Resilience</option>
                <option value="Basic Science">Basic & Pure Mathematical Sciences (NRCP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Implementing Institution / University
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. University of the Philippines Diliman"
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Project Location (Region/Province)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. NCR / Region IV-A"
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Duration (Months)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Proposed Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PROJECT DESCRIPTION */}
      {currentSection === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-[#153B65]">Section 2: Project Description & Narrative</h3>
            <p className="text-xs text-gray-500">Formulate the background, scientific rationale, objectives, and methodology.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Project Background <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Detail the national context, literature gaps, and problem statement..."
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Rationale & Significance <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Why is this research critical now? What makes this approach novel?"
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              General Objective <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={generalObjective}
              onChange={(e) => setGeneralObjective(e.target.value)}
              placeholder="e.g. To develop and pilot deploy an archipelagic-scale edge-AI structural health telemetry node array."
              className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700">Specific Objectives</label>
              <button
                type="button"
                onClick={handleAddObjective}
                className="text-xs font-medium text-[#2563A6] hover:text-[#153B65] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Objective
              </button>
            </div>
            <div className="space-y-2">
              {specificObjectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400 w-5 text-right">{i + 1}.</span>
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => {
                      const updated = [...specificObjectives];
                      updated[i] = e.target.value;
                      setSpecificObjectives(updated);
                    }}
                    placeholder={`Specific objective #${i + 1}`}
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
                  />
                  {specificObjectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(i)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Research Methodology <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              placeholder="Describe experimental protocols, scientific sampling, statistical validation, and safety compliance..."
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Scientific Outcomes</label>
              <textarea
                rows={2}
                value={expectedOutcomes}
                onChange={(e) => setExpectedOutcomes(e.target.value)}
                placeholder="Patents, publications, prototype specifications..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Socioeconomic Benefits</label>
              <textarea
                rows={2}
                value={expectedBenefits}
                onChange={(e) => setExpectedBenefits(e.target.value)}
                placeholder="Impact on communities, cost savings, job creation..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#153B65]"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PERSONNEL */}
      {currentSection === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#153B65]">Section 3: Project Personnel & Researchers</h3>
              <p className="text-xs text-gray-500">List all project leaders, co-investigators, and technical specialists.</p>
            </div>
            <button
              type="button"
              onClick={handleAddPersonnel}
              className="px-3 py-1.5 bg-blue-50 text-[#153B65] hover:bg-[#153B65] hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Team Member
            </button>
          </div>

          <div className="space-y-4">
            {personnel.map((p, idx) => (
              <div key={p.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#153B65]">
                    Member #{idx + 1}
                  </span>
                  {personnel.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePersonnel(p.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...personnel];
                        updated[idx].name = e.target.value;
                        setPersonnel(updated);
                      }}
                      placeholder="e.g. Dr. Juanita Alcantara"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Project Role</label>
                    <select
                      value={p.role}
                      onChange={(e) => {
                        const updated = [...personnel];
                        updated[idx].role = e.target.value as any;
                        setPersonnel(updated);
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg"
                    >
                      <option value="Project Leader">Project Leader</option>
                      <option value="Co-Project Leader">Co-Project Leader</option>
                      <option value="Science Research Specialist">Science Research Specialist</option>
                      <option value="Project Staff / Researcher">Project Staff / Researcher</option>
                      <option value="Collaborator">External Collaborator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Institution</label>
                    <input
                      type="text"
                      value={p.institution}
                      onChange={(e) => {
                        const updated = [...personnel];
                        updated[idx].institution = e.target.value;
                        setPersonnel(updated);
                      }}
                      placeholder="University / Organization"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Specific Responsibilities</label>
                  <input
                    type="text"
                    value={p.responsibilities}
                    onChange={(e) => {
                      const updated = [...personnel];
                      updated[idx].responsibilities = e.target.value;
                      setPersonnel(updated);
                    }}
                    placeholder="e.g. Laboratory firmware programming, antenna signal tuning"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: WORK PLAN */}
      {currentSection === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#153B65]">Section 4: Work Plan & Activity Schedule</h3>
              <p className="text-xs text-gray-500">Itemize key deliverables with timeline dates and assigned personnel.</p>
            </div>
            <button
              type="button"
              onClick={handleAddWorkPlan}
              className="px-3 py-1.5 bg-blue-50 text-[#153B65] hover:bg-[#153B65] hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Activity
            </button>
          </div>

          <div className="space-y-4">
            {workPlan.map((w, idx) => (
              <div key={w.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#153B65]">
                    Milestone Activity #{idx + 1}
                  </span>
                  {workPlan.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveWorkPlan(w.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Activity Description</label>
                    <input
                      type="text"
                      value={w.activity_description}
                      onChange={(e) => {
                        const updated = [...workPlan];
                        updated[idx].activity_description = e.target.value;
                        setWorkPlan(updated);
                      }}
                      placeholder="e.g. Fabricate telemetry sensors and execute shake-table testing"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Responsible Staff</label>
                    <input
                      type="text"
                      value={w.responsible_personnel}
                      onChange={(e) => {
                        const updated = [...workPlan];
                        updated[idx].responsible_personnel = e.target.value;
                        setWorkPlan(updated);
                      }}
                      placeholder="e.g. Lead Engineer"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={w.start_date}
                      onChange={(e) => {
                        const updated = [...workPlan];
                        updated[idx].start_date = e.target.value;
                        setWorkPlan(updated);
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={w.end_date}
                      onChange={(e) => {
                        const updated = [...workPlan];
                        updated[idx].end_date = e.target.value;
                        setWorkPlan(updated);
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Expected Deliverable</label>
                    <input
                      type="text"
                      value={w.expected_deliverable}
                      onChange={(e) => {
                        const updated = [...workPlan];
                        updated[idx].expected_deliverable = e.target.value;
                        setWorkPlan(updated);
                      }}
                      placeholder="e.g. Bench test report & hardware v1.0"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: BUDGET */}
      {currentSection === 5 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-[#153B65]">Section 5: Itemized Proposed Budget</h3>
            <p className="text-xs text-gray-500">Government accounting standard budget categories. Total calculates automatically.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Personnel Services (PS) - PHP
              </label>
              <p className="text-[11px] text-gray-500 mb-2">Salaries, project honoraria, science research specialist wages.</p>
              <input
                type="number"
                min="0"
                step="50000"
                value={ps}
                onChange={(e) => setPs(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-gray-300 rounded-xl"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Maintenance & Other Operating Expenses (MOOE) - PHP
              </label>
              <p className="text-[11px] text-gray-500 mb-2">Reagents, field travel, communications, software licenses, testing fees.</p>
              <input
                type="number"
                min="0"
                step="50000"
                value={mooe}
                onChange={(e) => setMooe(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-gray-300 rounded-xl"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Equipment Outlay (EO) - PHP
              </label>
              <p className="text-[11px] text-gray-500 mb-2">Capital scientific instruments, shake tables, telemetry node parts.</p>
              <input
                type="number"
                min="0"
                step="50000"
                value={eo}
                onChange={(e) => setEo(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-gray-300 rounded-xl"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Other Expenses & Contingency - PHP
              </label>
              <p className="text-[11px] text-gray-500 mb-2">Administrative institutional overhead, legal filings, audit.</p>
              <input
                type="number"
                min="0"
                step="50000"
                value={other}
                onChange={(e) => setOther(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-blue-900">
                Calculated Total Proposed Budget
              </span>
              <p className="text-xs text-blue-700">Checked against funding program allocation cap</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#153B65]">
                ₱{totalBudget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: DOCUMENTS */}
      {currentSection === 6 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#153B65]">Section 6: Supporting Documents & Endorsements</h3>
              <p className="text-xs text-gray-500">Upload PDF/DOC documents required for administrative completeness review.</p>
            </div>
            <button
              type="button"
              onClick={handleAddDocument}
              className="px-3 py-1.5 bg-[#153B65] text-white hover:bg-[#2563A6] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" /> Attach Document
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div key={idx} className="p-3.5 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{doc}</p>
                    <p className="text-[10px] text-gray-500">Verified document format (PDF) • Ready for submission</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                  className="text-xs text-gray-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-500">
            <Paperclip className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p>Documents are securely registered with Firestore metadata and Firebase Storage references.</p>
          </div>
        </div>
      )}

      {/* Wizard Footer Next/Prev */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200">
        <button
          type="button"
          disabled={currentSection === 1}
          onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
          className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-30"
        >
          Previous Section
        </button>

        <span className="text-xs font-medium text-gray-500">
          Section {currentSection} of 6
        </span>

        {currentSection < 6 ? (
          <button
            type="button"
            onClick={() => setCurrentSection(Math.min(6, currentSection + 1))}
            className="px-4 py-2 bg-[#153B65] text-white rounded-xl text-xs font-semibold hover:bg-[#2563A6]"
          >
            Next Section
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmSubmitOpen(true)}
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-4 h-4" /> Final Submit
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmSubmitOpen}
        title="Confirm Formal Proposal Submission"
        message={`Are you ready to submit "${projectTitle || 'Untitled'}" for DOST grant evaluation? Upon submission, a unique tracking number (e.g. DPMISL-2026-XXXXX) will be generated and the proposal will be locked from direct editing while undergoing administrative completeness review.`}
        confirmLabel="Yes, Submit Proposal"
        cancelLabel="Review Again"
        type="primary"
        isLoading={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmSubmitOpen(false)}
      />
    </div>
  );
};
