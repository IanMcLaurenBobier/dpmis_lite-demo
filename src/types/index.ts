export type UserRole = 'researcher' | 'admin' | 'evaluator' | 'project_officer';

export interface UserAccount {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  account_status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  institution?: string;
  department?: string;
}

export interface ResearcherProfile {
  id: string;
  user_id: string;
  contact_number: string;
  institution: string;
  department: string;
  position: string;
  educational_background: string;
  specialization: string;
  address: string;
  updated_at: string;
}

export interface FundingOpportunity {
  id: string;
  title: string;
  description: string;
  funding_agency: string;
  eligibility: string;
  deadline: string;
  funding_status: 'active' | 'closed' | 'upcoming';
  budget_cap: number;
  priority_areas?: string[];
  created_at: string;
}

export type ProposalStatus =
  | 'Draft'
  | 'Submitted'
  | 'Administrative Review'
  | 'For Correction'
  | 'Under Evaluation'
  | 'For Approval'
  | 'Approved'
  | 'Disapproved';

export interface ProjectPersonnel {
  id: string;
  name: string;
  role: 'Project Leader' | 'Co-Project Leader' | 'Project Staff / Researcher' | 'Science Research Specialist' | 'Collaborator';
  institution: string;
  responsibilities: string;
}

export interface WorkPlanActivity {
  id: string;
  activity_description: string;
  start_date: string;
  end_date: string;
  expected_deliverable: string;
  responsible_personnel: string;
}

export interface BudgetBreakdown {
  personnel_services: number;
  mooe: number; // Maintenance and Other Operating Expenses
  equipment_outlay: number;
  other_expenses: number;
  total_budget: number;
}

export interface ProposalDocument {
  id: string;
  proposal_id: string;
  document_name: string;
  document_type: 'Complete Proposal' | 'Curriculum Vitae' | 'Work Plan' | 'Budget Breakdown' | 'Institutional Endorsement' | 'Ethics Clearance' | 'Other Supporting Document';
  storage_path: string;
  file_size?: number;
  uploaded_at: string;
  url?: string;
}

export interface Proposal {
  id: string;
  tracking_number: string;
  researcher_id: string;
  researcher_name: string;
  researcher_email: string;
  funding_opportunity_id: string;
  funding_opportunity_title: string;
  project_title: string;
  project_information: {
    classification: 'Basic Research' | 'Applied Research' | 'Developmental Research';
    sector: 'Health' | 'Agriculture & Aquatic' | 'Industry & Energy' | 'Emerging Technology' | 'Disaster Risk Reduction' | 'Basic Science';
    implementing_institution: string;
    project_location: string;
    duration_months: number;
    start_date: string;
    end_date: string;
  };
  project_description: {
    background: string;
    rationale: string;
    general_objective: string;
    specific_objectives: string[];
    methodology: string;
    expected_outcomes: string;
    expected_benefits: string;
  };
  personnel: ProjectPersonnel[];
  work_plan: WorkPlanActivity[];
  budget: BudgetBreakdown;
  status: ProposalStatus;
  admin_remarks?: string;
  submission_date?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EvaluatorAssignment {
  id: string;
  proposal_id: string;
  evaluator_id: string;
  evaluator_name: string;
  evaluator_email: string;
  assigned_by: string;
  assigned_at: string;
  assignment_status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
}

export interface EvaluationCriteriaScores {
  relevance: number; // 1-5
  technical_merit: number; // 1-5
  methodology: number; // 1-5
  feasibility: number; // 1-5
  expected_impact: number; // 1-5
  budget_justification: number; // 1-5
}

export interface Evaluation {
  id: string;
  proposal_id: string;
  evaluator_id: string;
  evaluator_name: string;
  scores: EvaluationCriteriaScores;
  overall_score: number; // average or weighted total
  strengths: string;
  weaknesses: string;
  remarks: string;
  recommendation: 'Recommended for Approval' | 'Recommended for Revision' | 'Not Recommended';
  status: 'Draft' | 'Submitted';
  submitted_at?: string;
  created_at: string;
}

export interface StatusHistoryItem {
  id: string;
  proposal_id: string;
  previous_status: string;
  new_status: string;
  remarks: string;
  changed_by: string;
  changed_by_name: string;
  changed_at: string;
}

export type ProjectStatus = 'Approved' | 'Ongoing' | 'Delayed' | 'For Monitoring' | 'Completed' | 'Terminated';

export interface Project {
  id: string;
  proposal_id: string;
  tracking_number: string;
  project_title: string;
  project_leader: string;
  researcher_id: string;
  institution: string;
  funding_program: string;
  approved_budget: number;
  start_date: string;
  end_date: string;
  project_status: ProjectStatus;
  accomplishment_rate?: number;
  monitoring_remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressReport {
  id: string;
  project_id: string;
  project_title?: string;
  tracking_number?: string;
  submitted_by: string;
  submitted_by_name: string;
  reporting_period: string;
  accomplishments: string;
  percentage_completed: number;
  issues_encountered: string;
  recommendations: string;
  report_status: 'submitted' | 'reviewed' | 'accepted' | 'for_revision';
  officer_remarks?: string;
  submitted_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  related_record_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  module: 'AUTH' | 'PROPOSAL' | 'REVIEW' | 'EVALUATION' | 'PROJECT' | 'MONITORING' | 'PROGRAM';
  record_id: string;
  description: string;
  timestamp: string;
}
