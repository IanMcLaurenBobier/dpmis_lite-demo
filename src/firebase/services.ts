import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import {
  UserAccount,
  ResearcherProfile,
  FundingOpportunity,
  Proposal,
  Project,
  EvaluatorAssignment,
  Evaluation,
  StatusHistoryItem,
  ProgressReport,
  AppNotification,
  AuditLog,
  ProposalStatus,
  ProjectStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_RESEARCHER_PROFILES,
  INITIAL_FUNDING_OPPORTUNITIES,
  INITIAL_PROPOSALS,
  INITIAL_PROJECTS,
  INITIAL_EVALUATOR_ASSIGNMENTS,
  INITIAL_EVALUATIONS,
  INITIAL_PROGRESS_REPORTS,
  INITIAL_STATUS_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './seedData';

// Storage cache keys for offline/instant-feedback state
const STORAGE_PREFIX = 'dpmis_store_';

function getLocalStore<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function setLocalStore<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage sync warn:', e);
  }
}

/* =========================================================================
   DATABASE SEEDER
========================================================================= */
export async function seedDatabase(forceReset = false): Promise<void> {
  try {
    // Check if proposals already seeded in Firestore
    const proposalsSnap = await getDocs(collection(db, 'proposals'));
    if (!forceReset && !proposalsSnap.empty) {
      console.info('Database already seeded in Firestore.');
      return;
    }

    console.info('Seeding database to Firestore...');

    // Seed Users
    for (const item of INITIAL_USERS) {
      await setDoc(doc(db, 'users', item.id), item);
    }
    // Seed Profiles
    for (const item of INITIAL_RESEARCHER_PROFILES) {
      await setDoc(doc(db, 'researcher_profiles', item.id), item);
    }
    // Seed Opportunities
    for (const item of INITIAL_FUNDING_OPPORTUNITIES) {
      await setDoc(doc(db, 'funding_opportunities', item.id), item);
    }
    // Seed Proposals
    for (const item of INITIAL_PROPOSALS) {
      await setDoc(doc(db, 'proposals', item.id), item);
    }
    // Seed Projects
    for (const item of INITIAL_PROJECTS) {
      await setDoc(doc(db, 'projects', item.id), item);
    }
    // Seed Assignments
    for (const item of INITIAL_EVALUATOR_ASSIGNMENTS) {
      await setDoc(doc(db, 'evaluator_assignments', item.id), item);
    }
    // Seed Evaluations
    for (const item of INITIAL_EVALUATIONS) {
      await setDoc(doc(db, 'evaluations', item.id), item);
    }
    // Seed Status History
    for (const item of INITIAL_STATUS_HISTORY) {
      await setDoc(doc(db, 'status_history', item.id), item);
    }
    // Seed Progress Reports
    for (const item of INITIAL_PROGRESS_REPORTS) {
      await setDoc(doc(db, 'progress_reports', item.id), item);
    }
    // Seed Notifications
    for (const item of INITIAL_NOTIFICATIONS) {
      await setDoc(doc(db, 'notifications', item.id), item);
    }
    // Seed Audit Logs
    for (const item of INITIAL_AUDIT_LOGS) {
      await setDoc(doc(db, 'audit_logs', item.id), item);
    }

    // Also update local cache
    setLocalStore('users', INITIAL_USERS);
    setLocalStore('researcher_profiles', INITIAL_RESEARCHER_PROFILES);
    setLocalStore('funding_opportunities', INITIAL_FUNDING_OPPORTUNITIES);
    setLocalStore('proposals', INITIAL_PROPOSALS);
    setLocalStore('projects', INITIAL_PROJECTS);
    setLocalStore('evaluator_assignments', INITIAL_EVALUATOR_ASSIGNMENTS);
    setLocalStore('evaluations', INITIAL_EVALUATIONS);
    setLocalStore('status_history', INITIAL_STATUS_HISTORY);
    setLocalStore('progress_reports', INITIAL_PROGRESS_REPORTS);
    setLocalStore('notifications', INITIAL_NOTIFICATIONS);
    setLocalStore('audit_logs', INITIAL_AUDIT_LOGS);

    console.info('Database seeding completed successfully.');
  } catch (error) {
    console.warn('Firestore direct write failed, caching seed locally: ', error);
    // Sync fallback to local memory
    setLocalStore('users', INITIAL_USERS);
    setLocalStore('researcher_profiles', INITIAL_RESEARCHER_PROFILES);
    setLocalStore('funding_opportunities', INITIAL_FUNDING_OPPORTUNITIES);
    setLocalStore('proposals', INITIAL_PROPOSALS);
    setLocalStore('projects', INITIAL_PROJECTS);
    setLocalStore('evaluator_assignments', INITIAL_EVALUATOR_ASSIGNMENTS);
    setLocalStore('evaluations', INITIAL_EVALUATIONS);
    setLocalStore('status_history', INITIAL_STATUS_HISTORY);
    setLocalStore('progress_reports', INITIAL_PROGRESS_REPORTS);
    setLocalStore('notifications', INITIAL_NOTIFICATIONS);
    setLocalStore('audit_logs', INITIAL_AUDIT_LOGS);
  }
}

/* =========================================================================
   USER ACCOUNTS
========================================================================= */
export async function getUsers(): Promise<UserAccount[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserAccount));
      setLocalStore('users', items);
      return items;
    }
    return getLocalStore('users', INITIAL_USERS);
  } catch {
    return getLocalStore('users', INITIAL_USERS);
  }
}

export async function getUserById(userId: string): Promise<UserAccount | null> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as UserAccount;
    }
  } catch {
    // fallback
  }
  const local = getLocalStore<UserAccount>('users', INITIAL_USERS);
  return local.find(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase()) || null;
}

export async function saveUserAccount(user: UserAccount): Promise<UserAccount> {
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch {
    // fallback
  }
  const list = getLocalStore<UserAccount>('users', INITIAL_USERS);
  const idx = list.findIndex(u => u.id === user.id);
  if (idx >= 0) list[idx] = user;
  else list.push(user);
  setLocalStore('users', list);
  return user;
}

/* =========================================================================
   RESEARCHER PROFILES
========================================================================= */
export async function getResearcherProfile(userId: string): Promise<ResearcherProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'researcher_profiles', userId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as ResearcherProfile;
    }
  } catch {
    // fallback
  }
  const local = getLocalStore<ResearcherProfile>('researcher_profiles', INITIAL_RESEARCHER_PROFILES);
  return local.find(p => p.user_id === userId) || null;
}

export async function saveResearcherProfile(profile: ResearcherProfile): Promise<ResearcherProfile> {
  try {
    await setDoc(doc(db, 'researcher_profiles', profile.user_id), profile);
  } catch {
    // fallback
  }
  const list = getLocalStore<ResearcherProfile>('researcher_profiles', INITIAL_RESEARCHER_PROFILES);
  const idx = list.findIndex(p => p.user_id === profile.user_id);
  if (idx >= 0) list[idx] = profile;
  else list.push(profile);
  setLocalStore('researcher_profiles', list);
  return profile;
}

/* =========================================================================
   FUNDING OPPORTUNITIES
========================================================================= */
export async function getFundingOpportunities(): Promise<FundingOpportunity[]> {
  try {
    const snap = await getDocs(collection(db, 'funding_opportunities'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as FundingOpportunity));
      setLocalStore('funding_opportunities', items);
      return items;
    }
    return getLocalStore('funding_opportunities', INITIAL_FUNDING_OPPORTUNITIES);
  } catch {
    return getLocalStore('funding_opportunities', INITIAL_FUNDING_OPPORTUNITIES);
  }
}

export async function saveFundingOpportunity(opp: FundingOpportunity): Promise<FundingOpportunity> {
  try {
    await setDoc(doc(db, 'funding_opportunities', opp.id), opp);
  } catch {
    // fallback
  }
  const list = getLocalStore<FundingOpportunity>('funding_opportunities', INITIAL_FUNDING_OPPORTUNITIES);
  const idx = list.findIndex(o => o.id === opp.id);
  if (idx >= 0) list[idx] = opp;
  else list.unshift(opp);
  setLocalStore('funding_opportunities', list);
  return opp;
}

/* =========================================================================
   PROPOSALS
========================================================================= */
export async function getProposals(researcherId?: string): Promise<Proposal[]> {
  try {
    let q;
    if (researcherId) {
      q = query(collection(db, 'proposals'), where('researcher_id', '==', researcherId));
    } else {
      q = collection(db, 'proposals');
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
      setLocalStore('proposals', items);
      return items;
    }
  } catch {
    // fallback
  }
  const local = getLocalStore<Proposal>('proposals', INITIAL_PROPOSALS);
  if (researcherId) {
    return local.filter(p => p.researcher_id === researcherId);
  }
  return local;
}

export async function getProposalById(proposalId: string): Promise<Proposal | null> {
  try {
    const snap = await getDoc(doc(db, 'proposals', proposalId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Proposal;
    }
  } catch {
    // fallback
  }
  const local = getLocalStore<Proposal>('proposals', INITIAL_PROPOSALS);
  return local.find(p => p.id === proposalId || p.tracking_number.toLowerCase() === proposalId.toLowerCase()) || null;
}

export async function generateTrackingNumber(): Promise<string> {
  const proposals = await getProposals();
  const currentYear = new Date().getFullYear();
  const nextSeq = proposals.length + 1;
  const padded = String(nextSeq).padStart(5, '0');
  return `DPMISL-${currentYear}-${padded}`;
}

export async function saveProposal(proposal: Proposal, user: UserAccount): Promise<Proposal> {
  const isNew = !proposal.id;
  const id = proposal.id || `prop-${Date.now()}`;
  const trackingNumber = proposal.tracking_number || (await generateTrackingNumber());
  const now = new Date().toISOString();

  const fullProposal: Proposal = {
    ...proposal,
    id,
    tracking_number: trackingNumber,
    created_at: proposal.created_at || now,
    updated_at: now,
  };

  try {
    await setDoc(doc(db, 'proposals', id), fullProposal);
  } catch {
    // fallback
  }

  const list = getLocalStore<Proposal>('proposals', INITIAL_PROPOSALS);
  const idx = list.findIndex(p => p.id === id);
  if (idx >= 0) list[idx] = fullProposal;
  else list.unshift(fullProposal);
  setLocalStore('proposals', list);

  // Record audit log
  await recordAuditLog({
    user_id: user.id,
    user_name: user.full_name,
    action: isNew ? 'PROPOSAL_CREATED' : 'PROPOSAL_UPDATED',
    module: 'PROPOSAL',
    record_id: id,
    description: `${isNew ? 'Created' : 'Updated'} proposal ${trackingNumber}: ${fullProposal.project_title}`,
  });

  return fullProposal;
}

export async function submitProposal(proposalId: string, user: UserAccount): Promise<Proposal> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) throw new Error('Proposal not found');

  const now = new Date().toISOString();
  const previousStatus = proposal.status;
  const newStatus: ProposalStatus = 'Submitted';

  const updatedProposal: Proposal = {
    ...proposal,
    status: newStatus,
    submission_date: now.split('T')[0],
    submitted_at: now,
    updated_at: now,
  };

  try {
    await updateDoc(doc(db, 'proposals', proposalId), {
      status: newStatus,
      submission_date: updatedProposal.submission_date,
      submitted_at: now,
      updated_at: now,
    });
  } catch {
    // fallback
  }

  const list = getLocalStore<Proposal>('proposals', INITIAL_PROPOSALS);
  const idx = list.findIndex(p => p.id === proposalId);
  if (idx >= 0) list[idx] = updatedProposal;
  setLocalStore('proposals', list);

  // Add Status History
  await addStatusHistory({
    proposal_id: proposalId,
    previous_status: previousStatus,
    new_status: newStatus,
    remarks: 'Proposal officially submitted by researcher for administrative intake and completeness review.',
    changed_by: user.id,
    changed_by_name: user.full_name,
  });

  // Add Notification to Admins
  await createNotification({
    user_id: 'user-admin-1',
    title: `New Proposal Submitted: ${proposal.tracking_number}`,
    message: `${proposal.researcher_name} submitted "${proposal.project_title}". Queued for administrative review.`,
    related_record_id: proposalId,
  });

  // Audit
  await recordAuditLog({
    user_id: user.id,
    user_name: user.full_name,
    action: 'PROPOSAL_SUBMITTED',
    module: 'PROPOSAL',
    record_id: proposalId,
    description: `Submitted proposal ${proposal.tracking_number} for grant evaluation.`,
  });

  return updatedProposal;
}

export async function updateProposalStatus(
  proposalId: string,
  newStatus: ProposalStatus,
  remarks: string,
  user: UserAccount
): Promise<Proposal> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) throw new Error('Proposal not found');

  const previousStatus = proposal.status;
  const now = new Date().toISOString();

  const updated: Proposal = {
    ...proposal,
    status: newStatus,
    admin_remarks: remarks,
    updated_at: now,
  };

  try {
    await updateDoc(doc(db, 'proposals', proposalId), {
      status: newStatus,
      admin_remarks: remarks,
      updated_at: now,
    });
  } catch {
    // fallback
  }

  const list = getLocalStore<Proposal>('proposals', INITIAL_PROPOSALS);
  const idx = list.findIndex(p => p.id === proposalId);
  if (idx >= 0) list[idx] = updated;
  setLocalStore('proposals', list);

  // Status History
  await addStatusHistory({
    proposal_id: proposalId,
    previous_status: previousStatus,
    new_status: newStatus,
    remarks,
    changed_by: user.id,
    changed_by_name: user.full_name,
  });

  // Notify Researcher
  await createNotification({
    user_id: proposal.researcher_id,
    title: `Proposal Status Updated: ${newStatus}`,
    message: `Your proposal ${proposal.tracking_number} is now "${newStatus}". Remarks: ${remarks}`,
    related_record_id: proposalId,
  });

  // If Approved, automatically generate a Project record!
  if (newStatus === 'Approved') {
    await createProjectFromProposal(updated);
  }

  // Audit Log
  await recordAuditLog({
    user_id: user.id,
    user_name: user.full_name,
    action: `STATUS_CHANGE_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
    module: 'REVIEW',
    record_id: proposalId,
    description: `Status changed from ${previousStatus} to ${newStatus}. Remarks: ${remarks}`,
  });

  return updated;
}

/* =========================================================================
   PROJECT MANAGEMENT (Approved Proposals)
========================================================================= */
export async function getProjects(): Promise<Project[]> {
  try {
    const snap = await getDocs(collection(db, 'projects'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
      setLocalStore('projects', items);
      return items;
    }
  } catch {
    // fallback
  }
  return getLocalStore('projects', INITIAL_PROJECTS);
}

export async function createProjectFromProposal(proposal: Proposal): Promise<Project> {
  const existing = (await getProjects()).find(p => p.proposal_id === proposal.id);
  if (existing) return existing;

  const now = new Date().toISOString();
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    proposal_id: proposal.id,
    tracking_number: proposal.tracking_number,
    project_title: proposal.project_title,
    project_leader: proposal.researcher_name,
    researcher_id: proposal.researcher_id,
    institution: proposal.project_information.implementing_institution,
    funding_program: proposal.funding_opportunity_title,
    approved_budget: proposal.budget.total_budget,
    start_date: proposal.project_information.start_date,
    end_date: proposal.project_information.end_date,
    project_status: 'Approved',
    accomplishment_rate: 0,
    monitoring_remarks: 'Project created upon executive proposal approval. Monitoring officer assigned.',
    created_at: now,
    updated_at: now,
  };

  try {
    await setDoc(doc(db, 'projects', newProject.id), newProject);
  } catch {
    // fallback
  }

  const list = getLocalStore<Project>('projects', INITIAL_PROJECTS);
  list.unshift(newProject);
  setLocalStore('projects', list);

  // Notify Project Officers
  await createNotification({
    user_id: 'user-officer-1',
    title: `New Active Project: ${newProject.tracking_number}`,
    message: `Approved project "${newProject.project_title}" is ready for implementation kickoff and monitoring.`,
    related_record_id: newProject.id,
  });

  return newProject;
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  accomplishment_rate: number,
  remarks: string,
  user: UserAccount
): Promise<Project> {
  const list = await getProjects();
  const proj = list.find(p => p.id === projectId);
  if (!proj) throw new Error('Project not found');

  const now = new Date().toISOString();
  const updated: Project = {
    ...proj,
    project_status: status,
    accomplishment_rate,
    monitoring_remarks: remarks,
    updated_at: now,
  };

  try {
    await updateDoc(doc(db, 'projects', projectId), {
      project_status: status,
      accomplishment_rate,
      monitoring_remarks: remarks,
      updated_at: now,
    });
  } catch {
    // fallback
  }

  const idx = list.findIndex(p => p.id === projectId);
  if (idx >= 0) list[idx] = updated;
  setLocalStore('projects', list);

  // Notify Researcher
  await createNotification({
    user_id: proj.researcher_id,
    title: `Project Monitoring Update: ${status}`,
    message: `Project ${proj.tracking_number} status set to "${status}" (${accomplishment_rate}% accomplished).`,
    related_record_id: projectId,
  });

  // Audit
  await recordAuditLog({
    user_id: user.id,
    user_name: user.full_name,
    action: 'PROJECT_STATUS_UPDATE',
    module: 'MONITORING',
    record_id: projectId,
    description: `Project status set to ${status} with ${accomplishment_rate}% accomplishment rate.`,
  });

  return updated;
}

/* =========================================================================
   EVALUATOR ASSIGNMENTS & EVALUATIONS
========================================================================= */
export async function getEvaluatorAssignments(evaluatorId?: string): Promise<EvaluatorAssignment[]> {
  try {
    const snap = await getDocs(collection(db, 'evaluator_assignments'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as EvaluatorAssignment));
      setLocalStore('evaluator_assignments', items);
      if (evaluatorId) return items.filter(a => a.evaluator_id === evaluatorId);
      return items;
    }
  } catch {
    // fallback
  }
  const local = getLocalStore<EvaluatorAssignment>('evaluator_assignments', INITIAL_EVALUATOR_ASSIGNMENTS);
  if (evaluatorId) return local.filter(a => a.evaluator_id === evaluatorId);
  return local;
}

export async function assignEvaluator(
  proposalId: string,
  evaluator: UserAccount,
  adminUser: UserAccount,
  dueDate?: string
): Promise<EvaluatorAssignment> {
  const assignment: EvaluatorAssignment = {
    id: `assign-${Date.now()}`,
    proposal_id: proposalId,
    evaluator_id: evaluator.id,
    evaluator_name: evaluator.full_name,
    evaluator_email: evaluator.email,
    assigned_by: adminUser.full_name,
    assigned_at: new Date().toISOString(),
    assignment_status: 'pending',
    dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  };

  try {
    await setDoc(doc(db, 'evaluator_assignments', assignment.id), assignment);
  } catch {
    // fallback
  }

  const list = getLocalStore<EvaluatorAssignment>('evaluator_assignments', INITIAL_EVALUATOR_ASSIGNMENTS);
  list.unshift(assignment);
  setLocalStore('evaluator_assignments', list);

  // Update proposal status to Under Evaluation if not already
  await updateProposalStatus(
    proposalId,
    'Under Evaluation',
    `Assigned to external scientific evaluator ${evaluator.full_name} for merit review.`,
    adminUser
  );

  // Notify Evaluator
  await createNotification({
    user_id: evaluator.id,
    title: 'New Proposal Assigned for Evaluation',
    message: `You have been assigned to evaluate proposal. Target completion: ${assignment.dueDate}`,
    related_record_id: proposalId,
  });

  return assignment;
}

export async function getEvaluations(proposalId?: string): Promise<Evaluation[]> {
  try {
    const snap = await getDocs(collection(db, 'evaluations'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Evaluation));
      setLocalStore('evaluations', items);
      if (proposalId) return items.filter(e => e.proposal_id === proposalId);
      return items;
    }
  } catch {
    // fallback
  }
  const local = getLocalStore<Evaluation>('evaluations', INITIAL_EVALUATIONS);
  if (proposalId) return local.filter(e => e.proposal_id === proposalId);
  return local;
}

export async function saveEvaluation(evaluation: Evaluation, user: UserAccount): Promise<Evaluation> {
  const id = evaluation.id || `eval-${Date.now()}`;
  const now = new Date().toISOString();

  // Compute overall average score
  const scores = evaluation.scores;
  const values = [
    scores.relevance,
    scores.technical_merit,
    scores.methodology,
    scores.feasibility,
    scores.expected_impact,
    scores.budget_justification,
  ];
  const overall_score = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));

  const fullEval: Evaluation = {
    ...evaluation,
    id,
    overall_score,
    submitted_at: evaluation.status === 'Submitted' ? now : undefined,
    created_at: evaluation.created_at || now,
  };

  try {
    await setDoc(doc(db, 'evaluations', id), fullEval);
  } catch {
    // fallback
  }

  const list = getLocalStore<Evaluation>('evaluations', INITIAL_EVALUATIONS);
  const idx = list.findIndex(e => e.id === id);
  if (idx >= 0) list[idx] = fullEval;
  else list.unshift(fullEval);
  setLocalStore('evaluations', list);

  // If submitted, update assignment status and advance proposal to "For Approval"
  if (evaluation.status === 'Submitted') {
    const assignments = await getEvaluatorAssignments();
    const match = assignments.find(a => a.proposal_id === evaluation.proposal_id && a.evaluator_id === user.id);
    if (match) {
      match.assignment_status = 'completed';
      setLocalStore('evaluator_assignments', assignments);
    }

    // Auto update proposal status to "For Approval"
    await updateProposalStatus(
      evaluation.proposal_id,
      'For Approval',
      `Peer evaluation completed by ${user.full_name} with score ${overall_score}/5.0 (${evaluation.recommendation}). Awaiting Administrator final decision.`,
      user
    );

    // Notify Admins
    await createNotification({
      user_id: 'user-admin-1',
      title: 'Peer Evaluation Submitted',
      message: `${user.full_name} submitted review (${overall_score}/5.0) recommending ${evaluation.recommendation}.`,
      related_record_id: evaluation.proposal_id,
    });
  }

  // Audit
  await recordAuditLog({
    user_id: user.id,
    user_name: user.full_name,
    action: evaluation.status === 'Submitted' ? 'EVALUATION_SUBMITTED' : 'EVALUATION_DRAFT_SAVED',
    module: 'EVALUATION',
    record_id: id,
    description: `${evaluation.status} evaluation with score ${overall_score}/5.0. Recommendation: ${evaluation.recommendation}`,
  });

  return fullEval;
}

/* =========================================================================
   STATUS HISTORY
========================================================================= */
export async function getStatusHistory(proposalId: string): Promise<StatusHistoryItem[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'status_history'), where('proposal_id', '==', proposalId))
    );
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as StatusHistoryItem));
      items.sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());
      return items;
    }
  } catch {
    // fallback
  }
  const local = getLocalStore<StatusHistoryItem>('status_history', INITIAL_STATUS_HISTORY);
  return local
    .filter(h => h.proposal_id === proposalId)
    .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());
}

export async function addStatusHistory(item: Omit<StatusHistoryItem, 'id' | 'changed_at'>): Promise<StatusHistoryItem> {
  const fullItem: StatusHistoryItem = {
    ...item,
    id: `sh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    changed_at: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'status_history', fullItem.id), fullItem);
  } catch {
    // fallback
  }

  const list = getLocalStore<StatusHistoryItem>('status_history', INITIAL_STATUS_HISTORY);
  list.push(fullItem);
  setLocalStore('status_history', list);
  return fullItem;
}

/* =========================================================================
   PROGRESS REPORTS
========================================================================= */
export async function getProgressReports(projectId?: string): Promise<ProgressReport[]> {
  try {
    const snap = await getDocs(collection(db, 'progress_reports'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgressReport));
      setLocalStore('progress_reports', items);
      if (projectId) return items.filter(r => r.project_id === projectId);
      return items;
    }
  } catch {
    // fallback
  }
  const local = getLocalStore<ProgressReport>('progress_reports', INITIAL_PROGRESS_REPORTS);
  if (projectId) return local.filter(r => r.project_id === projectId);
  return local;
}

export async function submitProgressReport(report: ProgressReport, user: UserAccount): Promise<ProgressReport> {
  const id = report.id || `rep-${Date.now()}`;
  const now = new Date().toISOString();

  const fullReport: ProgressReport = {
    ...report,
    id,
    submitted_at: now,
  };

  try {
    await setDoc(doc(db, 'progress_reports', id), fullReport);
  } catch {
    // fallback
  }

  const list = getLocalStore<ProgressReport>('progress_reports', INITIAL_PROGRESS_REPORTS);
  const idx = list.findIndex(r => r.id === id);
  if (idx >= 0) list[idx] = fullReport;
  else list.unshift(fullReport);
  setLocalStore('progress_reports', list);

  // Update accomplishment rate in project
  const projects = await getProjects();
  const proj = projects.find(p => p.id === report.project_id);
  if (proj) {
    proj.accomplishment_rate = report.percentage_completed;
    if (report.percentage_completed >= 100) {
      proj.project_status = 'For Monitoring';
    } else if (proj.project_status === 'Approved') {
      proj.project_status = 'Ongoing';
    }
    setLocalStore('projects', projects);
  }

  // Notify Project Officer
  await createNotification({
    user_id: 'user-officer-1',
    title: `Progress Report Submitted: ${report.project_title || report.project_id}`,
    message: `${user.full_name} submitted report for ${report.reporting_period} (${report.percentage_completed}% complete).`,
    related_record_id: report.project_id,
  });

  // Audit
  await recordAuditLog({
    user_id: user.id,
    user_name: user.full_name,
    action: 'PROGRESS_REPORT_SUBMITTED',
    module: 'MONITORING',
    record_id: id,
    description: `Submitted accomplishment report for period ${report.reporting_period} (${report.percentage_completed}%).`,
  });

  return fullReport;
}

export async function reviewProgressReport(
  reportId: string,
  status: 'reviewed' | 'accepted' | 'for_revision',
  remarks: string,
  officer: UserAccount
): Promise<ProgressReport> {
  const list = await getProgressReports();
  const report = list.find(r => r.id === reportId);
  if (!report) throw new Error('Report not found');

  report.report_status = status;
  report.officer_remarks = remarks;

  try {
    await updateDoc(doc(db, 'progress_reports', reportId), {
      report_status: status,
      officer_remarks: remarks,
    });
  } catch {
    // fallback
  }

  setLocalStore('progress_reports', list);

  // Notify submitter
  await createNotification({
    user_id: report.submitted_by,
    title: `Progress Report ${status.toUpperCase()}`,
    message: `Monitoring officer reviewed your report: ${remarks}`,
    related_record_id: report.project_id,
  });

  // Audit
  await recordAuditLog({
    user_id: officer.id,
    user_name: officer.full_name,
    action: `REPORT_${status.toUpperCase()}`,
    module: 'MONITORING',
    record_id: reportId,
    description: `Reviewed progress report: status changed to ${status}.`,
  });

  return report;
}

/* =========================================================================
   NOTIFICATIONS
========================================================================= */
export async function getNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'notifications'), where('user_id', '==', userId))
    );
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return items;
    }
  } catch {
    // fallback
  }
  const local = getLocalStore<AppNotification>('notifications', INITIAL_NOTIFICATIONS);
  return local
    .filter(n => n.user_id === userId || n.user_id === 'all')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createNotification(notif: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>): Promise<AppNotification> {
  const full: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'notifications', full.id), full);
  } catch {
    // fallback
  }

  const list = getLocalStore<AppNotification>('notifications', INITIAL_NOTIFICATIONS);
  list.unshift(full);
  setLocalStore('notifications', list);
  return full;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { is_read: true });
  } catch {
    // fallback
  }
  const list = getLocalStore<AppNotification>('notifications', INITIAL_NOTIFICATIONS);
  const item = list.find(n => n.id === id);
  if (item) item.is_read = true;
  setLocalStore('notifications', list);
}

/* =========================================================================
   AUDIT LOGS
========================================================================= */
export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const snap = await getDocs(query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100)));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
      setLocalStore('audit_logs', items);
      return items;
    }
  } catch {
    // fallback
  }
  const local = getLocalStore<AuditLog>('audit_logs', INITIAL_AUDIT_LOGS);
  return local.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function recordAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
  const full: AuditLog = {
    ...log,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'audit_logs', full.id), full);
  } catch {
    // fallback
  }

  const list = getLocalStore<AuditLog>('audit_logs', INITIAL_AUDIT_LOGS);
  list.unshift(full);
  setLocalStore('audit_logs', list.slice(0, 200));
  return full;
}
