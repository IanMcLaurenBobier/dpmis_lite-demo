# Security Specification: DPMIS Lite

## 1. Data Invariants
1. Proposals cannot be updated once in terminal status (Approved, Disapproved) unless by an Administrator.
2. Only Proposal owners (researchers) can update drafts or edit proposals returned for correction.
3. Evaluators can only create or update evaluations for proposals assigned to them.
4. Evaluations cannot be modified once submitted.
5. Projects can only be modified by Administrators or Project Officers.
6. Public tracking is restricted to safe fields (title, tracking number, status, history, administrative remarks) without exposing private researcher PII or evaluator comments.
7. Admin accounts include the provisioned admin (`patchypatchpatchy@gmail.com`) and demo admin (`admin@dpmislite.test`).

## 2. The Dirty Dozen Payloads (Security Attack Vectors)
1. **Researcher Self-Approval**: Researcher attempts to PATCH proposal status to 'Approved'.
2. **Evaluator Identity Spoofing**: Evaluator sets evaluator_id to another user's ID.
3. **Cross-Researcher Proposal Tampering**: Researcher A updates Researcher B's draft proposal.
4. **Post-Submission Narrative Modification**: Researcher modifies project title and budget while status is 'Under Evaluation'.
5. **Evaluation Tampering After Submission**: Evaluator modifies their scores after status is 'Submitted'.
6. **Unassigned Proposal Evaluation**: Evaluator submits review for a proposal they were never assigned.
7. **Privilege Escalation on User Profile**: Normal user attempts to change their role to 'admin'.
8. **Malicious Long Payload / DoS**: Writing a 2MB string in project_title.
9. **Orphaned Progress Report**: Submitting a progress report for a non-existent project ID.
10. **Direct Document Deletion**: Unauthorized user attempts to delete proposal audit records.
11. **Anonymous Modification**: Unauthenticated user attempts to write to proposals or projects.
12. **PII Scraping via Blanket List**: Non-admin querying all researcher profiles without constraint.
