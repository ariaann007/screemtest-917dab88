// Onboarding module types

export type WorkerType =
  | "uk_irish"
  | "ilr_settled"
  | "non_sponsored_visa"
  | "student_visa"
  | "sponsored_worker"
  | "custom";

export type OnboardingStatus =
  | "new"
  | "in_progress"
  | "waiting_documents"
  | "compliance_review"
  | "ready_to_start"
  | "completed"
  | "on_hold";

export type CheckStatus =
  | "not_started"
  | "pending"
  | "received"
  | "under_review"
  | "approved"
  | "rejected"
  | "waived";

export type ReferenceStatus =
  | "pending"
  | "requested"
  | "received"
  | "verified"
  | "rejected";

export type EligibilityDecision =
  | "eligible"
  | "eligible_with_conditions"
  | "not_eligible"
  | "pending";

export type ComplianceDecision =
  | "cleared"
  | "cleared_with_conditions"
  | "not_cleared"
  | "pending";

export type ReferenceType =
  | "employment"
  | "character"
  | "academic"
  | "professional";

export interface OnboardingDocument {
  id: string;
  name: string;
  category: string;
  mandatory: boolean;
  uploadedAt?: string;
  uploadedBy?: string;
  expiryDate?: string;
  issueDate?: string;
  verificationStatus: "pending" | "verified" | "rejected" | "not_uploaded";
  verifiedBy?: string;
  notes?: string;
  reminderDate?: string;
  fileName?: string;
  fileSize?: number;
}

export interface OnboardingCheck {
  id: string;
  name: string;
  category: string;
  status: CheckStatus;
  mandatory: boolean;
  dueDate?: string;
  assignedTo?: string;
  notes?: string;
  evidenceUploaded: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface OnboardingReference {
  id: string;
  type: ReferenceType;
  refereeName: string;
  refereeTitle?: string;
  refereeOrganisation?: string;
  refereeEmail?: string;
  refereePhone?: string;
  requestDate?: string;
  responseDate?: string;
  status: ReferenceStatus;
  notes?: string;
  fileName?: string;
}

export interface OnboardingActivityLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  module: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
}

export interface OnboardingCase {
  id: string;
  tenantId: string;
  // Candidate details (carried over from Recruitment)
  givenName: string;
  familyName: string;
  email: string;
  phone?: string;
  nationality?: string;
  avatarUrl?: string;
  // Role details
  appliedRole: string;
  department: string;
  location: string;
  salaryOffered?: number;
  employmentType?: string;
  shiftPattern?: string;
  startDate?: string;
  // Sponsorship
  requiresSponsorship: boolean;
  workerType?: WorkerType;
  visaType?: string;
  cosReference?: string;
  rightToWork?: string;
  // Source
  recruitmentApplicationId?: string;
  vacancyTitle?: string;
  // Status
  status: OnboardingStatus;
  onboardingProgress: number; // 0–100
  currentStage: string;
  // Eligibility
  eligibilityDecision: EligibilityDecision;
  eligibilityNotes?: string;
  workRestrictions?: string;
  salaryThresholdMet?: boolean;
  // Compliance
  complianceDecision: ComplianceDecision;
  complianceNotes?: string;
  // Contract
  offerAccepted?: boolean;
  contractUploaded?: boolean;
  contractSigned?: boolean;
  handbookAcknowledged?: boolean;
  policyAcknowledged?: boolean;
  confidentialityAgreed?: boolean;
  // Collections
  documents: OnboardingDocument[];
  checks: OnboardingCheck[];
  references: OnboardingReference[];
  activityLog: OnboardingActivityLog[];
  // Meta
  assignedTo?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  movedToPeopleAt?: string;
  workerId?: string; // set when moved to People
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  description?: string;
  applicableTo: WorkerType[];
  departments?: string[];
  requiredDocuments: { name: string; category: string; mandatory: boolean }[];
  requiredChecks: { name: string; category: string; mandatory: boolean }[];
  referencesRequired: number;
  createdAt: string;
}
