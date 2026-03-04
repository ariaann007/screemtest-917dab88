// Core types for Denizns Compliance platform

export type UserRole =
  | "client_ao"
  | "client_hr"
  | "denizns_caseworker"
  | "denizns_manager"
  | "super_admin";

export type CaseStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "awaiting_client"
  | "approved"
  | "filed"
  | "closed"
  | "cancelled";

export type CaseType =
  | "cos_draft"
  | "migrant_reporting"
  | "business_reporting"
  | "support_request";

export type Priority = "low" | "medium" | "high" | "urgent";

export type InvoiceStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export type DocumentStatus = "present" | "missing" | "expired" | "expiring_soon";

export interface Tenant {
  id: string;
  name: string;
  sponsorLicenceNumber: string;
  address: string;
  city: string;
  postcode: string;
  logoUrl?: string;
  primaryColor?: string;
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string | null; // null = Denizns internal
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Worker {
  id: string;
  tenantId: string;
  familyName: string;
  givenName: string;
  otherNames?: string;
  nationality: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  niNumber?: string;
  employeeNumber?: string;
  passportNumber?: string;
  passportExpiry?: string;
  visaType?: string;
  cosReference?: string;
  visaExpiry?: string;
  brpExpiry?: string;
  jobTitle?: string;
  socCode?: string;
  salary?: number;
  salaryPeriod?: string;
  workLocationId?: string;
  startDate?: string;
  endDate?: string;
  weeklyHours?: number;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

export interface WorkLocation {
  id: string;
  tenantId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  postcode: string;
  isPrimary: boolean;
}

export interface SOCCode {
  id: string;
  code: string;
  title: string;
  description?: string;
  skillLevel?: string;
}

export interface Country {
  id: string;
  code: string;
  name: string;
}

export interface Case {
  id: string;
  tenantId: string;
  caseNumber: string;
  type: CaseType;
  status: CaseStatus;
  title: string;
  description?: string;
  workerId?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  slaDeadline?: string;
  isOverdue: boolean;
  priority: Priority;
  invoiceId?: string;
  templateId?: string;
  answers?: Record<string, unknown>;
  tags?: string[];
}

export interface CaseComment {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  tenantId: string;
  entityId: string; // workerId or caseId
  entityType: "worker" | "case";
  category: string;
  name: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isRequired: boolean;
  expiryDate?: string;
  status: DocumentStatus;
  uploadedBy?: string;
  uploadedAt?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  caseId?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  paymentLink?: string;
  paidAt?: string;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: "cos_fee" | "isc" | "service_fee" | "other";
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "info" | "warning" | "error" | "success";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  tenantId: string;
  caseId?: string;
  workerId?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  status: "pending" | "in_progress" | "done" | "cancelled";
  priority: Priority;
  createdAt: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  version: number;
  type: CaseType;
  status: "draft" | "published" | "retired";
  sections: FormSection[];
  createdAt: string;
  publishedAt?: string;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
  condition?: FormCondition;
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "date" | "number" | "yesno" | "file" | "address";
  required: boolean;
  options?: string[];
  dataSource?: "countries" | "soc_codes" | "work_locations";
  maxLength?: number;
  condition?: FormCondition;
  placeholder?: string;
  helpText?: string;
}

export interface FormCondition {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains";
  value: unknown;
}
