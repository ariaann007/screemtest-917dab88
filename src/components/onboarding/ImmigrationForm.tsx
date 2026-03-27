import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Shield, AlertTriangle, CheckCircle2, FileText, Upload, Globe, Calendar,
  ChevronDown, ChevronUp, User, Building2, BookOpen, GraduationCap, Briefcase,
  Clock, Info,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type ImmigrationCategory =
  | ""
  | "british_citizen"
  | "irish_citizen"
  | "settled_status"
  | "student_visa"
  | "graduate_visa"
  | "skilled_worker_company"
  | "skilled_worker_other"
  | "global_talent"
  | "dependent_visa"
  | "other";

export interface ImmigrationRecord {
  // Section 1: Personal Identification
  fullLegalName: string;
  dateOfBirth: string;
  nationalities: string[];
  passportNumbers: string;
  passportExpiry: string;

  // Section 2: Right to Work Status
  immigrationCategory: ImmigrationCategory;

  // Section 3: Universal Compliance
  rtwCheckDate: string;
  rtwDocumentsVerified: string[];
  documentsCopied: "yes" | "no" | "";
  nextCheckDueDate: string;
  hrOfficerName: string;

  // A. British/Irish
  birthCertificateProvided: boolean;
  niNumberForId: string;

  // B. Settled Status
  shareCode: string;
  shareCodeDate: string;
  settlementType: string;
  brpNumber: string;
  brpExpiry: string;

  // C. Student Visa
  visaStartDate: string;
  visaExpiryDate: string;
  sponsoringInstitution: string;
  courseEndDate: string;
  casNumber: string;
  termTimeHoursLimit: string;
  academicTermDatesRecorded: "yes" | "no" | "";

  // D. Graduate Visa
  graduateVisaStartDate: string;
  graduateVisaExpiryDate: string;
  qualifyingInstitution: string;
  qualificationLevel: string;
  completionDate: string;

  // E. Skilled Worker - Company Sponsored
  cosNumber: string;
  cosAssignmentDate: string;
  swVisaStartDate: string;
  swVisaExpiryDate: string;
  jobTitleOnCos: string;
  socCode: string;
  sponsorLicenceNumber: string;
  salaryOnCos: string;
  annualLeaveEntitlement: string;
  unpaidLeaveDays: string;
  sicknessAbsenceDays: string;

  // F. Skilled Worker - Other Sponsor
  primarySponsorName: string;
  primaryJobRole: string;
  primaryHours: string;
  otherCosNumber: string;
  otherVisaExpiry: string;
  supplementaryPermission: string;

  // G. Global Talent
  gtVisaStartDate: string;
  gtVisaExpiryDate: string;
  endorsingBody: string;
  endorsementType: string;

  // H. Dependent Visa
  dependentVisaType: string;
  mainVisaHolderName: string;
  mainVisaHolderRelationship: string;
  depVisaStartDate: string;
  depVisaExpiryDate: string;
  depWorkRestrictions: string;

  // I. Other
  otherVisaType: string;
  otherVisaStartDate: string;
  otherVisaExpiryDate: string;
  otherWorkConditions: string;
  otherSponsorshipRequired: "yes" | "no" | "";
  otherSponsorName: string;

  // Notes
  notes: string;
}

const EMPTY_RECORD: ImmigrationRecord = {
  fullLegalName: "", dateOfBirth: "", nationalities: [], passportNumbers: "", passportExpiry: "",
  immigrationCategory: "",
  rtwCheckDate: "", rtwDocumentsVerified: [], documentsCopied: "", nextCheckDueDate: "", hrOfficerName: "",
  birthCertificateProvided: false, niNumberForId: "",
  shareCode: "", shareCodeDate: "", settlementType: "", brpNumber: "", brpExpiry: "",
  visaStartDate: "", visaExpiryDate: "", sponsoringInstitution: "", courseEndDate: "", casNumber: "",
  termTimeHoursLimit: "20", academicTermDatesRecorded: "",
  graduateVisaStartDate: "", graduateVisaExpiryDate: "", qualifyingInstitution: "", qualificationLevel: "", completionDate: "",
  cosNumber: "", cosAssignmentDate: "", swVisaStartDate: "", swVisaExpiryDate: "",
  jobTitleOnCos: "", socCode: "", sponsorLicenceNumber: "", salaryOnCos: "",
  annualLeaveEntitlement: "", unpaidLeaveDays: "", sicknessAbsenceDays: "",
  primarySponsorName: "", primaryJobRole: "", primaryHours: "", otherCosNumber: "", otherVisaExpiry: "", supplementaryPermission: "",
  gtVisaStartDate: "", gtVisaExpiryDate: "", endorsingBody: "", endorsementType: "",
  dependentVisaType: "", mainVisaHolderName: "", mainVisaHolderRelationship: "", depVisaStartDate: "", depVisaExpiryDate: "", depWorkRestrictions: "",
  otherVisaType: "", otherVisaStartDate: "", otherVisaExpiryDate: "", otherWorkConditions: "", otherSponsorshipRequired: "", otherSponsorName: "",
  notes: "",
};

const IMMIGRATION_CATEGORIES: { value: ImmigrationCategory; label: string; icon: typeof Shield }[] = [
  { value: "british_citizen", label: "British Citizen", icon: Shield },
  { value: "irish_citizen", label: "Irish Citizen", icon: Shield },
  { value: "settled_status", label: "Settled Status (ILR / Pre-settled)", icon: CheckCircle2 },
  { value: "student_visa", label: "Student Visa", icon: GraduationCap },
  { value: "graduate_visa", label: "Graduate Visa (PSW)", icon: BookOpen },
  { value: "skilled_worker_company", label: "Skilled Worker Visa (Company Sponsored)", icon: Briefcase },
  { value: "skilled_worker_other", label: "Skilled Worker Visa (Other Sponsor)", icon: Building2 },
  { value: "global_talent", label: "Global Talent Visa", icon: Globe },
  { value: "dependent_visa", label: "Dependent Visa", icon: User },
  { value: "other", label: "Other (specify)", icon: FileText },
];

const RTW_DOCUMENTS = [
  "UK/Irish Passport",
  "BRP Card",
  "Share Code Check (Online)",
  "Birth Certificate (UK)",
  "Certificate of Registration/Naturalisation",
  "Immigration Status Document",
  "Positive Verification Notice",
  "Application Registration Card",
];

const SETTLEMENT_TYPES = [
  "Indefinite Leave to Remain (ILR)",
  "EU Settled Status",
  "EU Pre-settled Status",
];

const ENDORSING_BODIES = [
  "Tech Nation (Digital Technology)",
  "Royal Society (Sciences)",
  "Royal Academy of Engineering",
  "British Academy (Humanities)",
  "Arts Council England",
];

const DEPENDENT_VISA_TYPES = [
  "Skilled Worker Dependent",
  "Student Dependent",
  "Global Talent Dependent",
  "Family Visa Dependent",
  "Other",
];

// ── Helper Components ──────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children, variant = "default" }: {
  title: string; icon: typeof Shield; children: React.ReactNode; variant?: "default" | "warning" | "info";
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", variant === "warning" && "border-warning/30", variant === "info" && "border-primary/20")}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
          variant === "warning" ? "bg-warning/10" : variant === "info" ? "bg-primary/10" : "bg-muted"
        )}>
          <Icon className={cn("h-4 w-4", variant === "warning" ? "text-warning" : variant === "info" ? "text-primary" : "text-muted-foreground")} />
        </div>
        <h3 className="font-semibold text-sm flex-1 text-left">{title}</h3>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  );
}

function ComplianceAlert({ children, variant = "warning" }: { children: React.ReactNode; variant?: "warning" | "info" | "success" }) {
  const colors = {
    warning: "bg-warning/10 border-warning/30 text-warning",
    info: "bg-primary/10 border-primary/30 text-primary",
    success: "bg-success/10 border-success/30 text-success",
  };
  const icons = { warning: AlertTriangle, info: Info, success: CheckCircle2 };
  const Ic = icons[variant];
  return (
    <div className={cn("flex items-start gap-2 rounded-lg border p-3 text-sm", colors[variant])}>
      <Ic className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
interface ImmigrationFormProps {
  initialData?: Partial<ImmigrationRecord>;
  readOnly?: boolean;
  onSave?: (data: ImmigrationRecord) => void;
}

export default function ImmigrationForm({ initialData, readOnly = false, onSave }: ImmigrationFormProps) {
  const [data, setData] = useState<ImmigrationRecord>({ ...EMPTY_RECORD, ...initialData });
  const [saved, setSaved] = useState(false);

  const set = (key: keyof ImmigrationRecord, value: any) => {
    if (readOnly) return;
    setData(prev => ({ ...prev, [key]: value }));
  };

  const toggleDoc = (doc: string) => {
    if (readOnly) return;
    setData(prev => ({
      ...prev,
      rtwDocumentsVerified: prev.rtwDocumentsVerified.includes(doc)
        ? prev.rtwDocumentsVerified.filter(d => d !== doc)
        : [...prev.rtwDocumentsVerified, doc],
    }));
  };

  const handleSave = () => {
    onSave?.(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cat = data.immigrationCategory;

  return (
    <div className="space-y-5">
      {/* Immigration Status Selection */}
      <SectionCard title="Immigration Status" icon={Globe} variant="info">
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Immigration Status Category *</Label>
            <Select value={data.immigrationCategory} onValueChange={v => set("immigrationCategory", v as ImmigrationCategory)} disabled={readOnly}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select immigration status…" /></SelectTrigger>
              <SelectContent>
                {IMMIGRATION_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {cat && (
            <ComplianceAlert variant="info">
              {cat === "british_citizen" || cat === "irish_citizen"
                ? "No visa restrictions apply. A valid passport or birth certificate + NI number is required for verification."
                : cat === "settled_status"
                ? "Verify share code online. EU Pre-settled status holders must apply for full settled status before expiry."
                : cat === "student_visa"
                ? "⚠ Maximum 20 hours/week during term time. Full-time permitted during vacations only. Track academic calendar."
                : cat === "graduate_visa"
                ? "No work restrictions — can work unlimited hours in any role. Visa valid for 2 or 3 years."
                : cat === "skilled_worker_company"
                ? "Full sponsorship duties apply. Report changes to Home Office within 10 working days."
                : cat === "skilled_worker_other"
                ? "⚠ Maximum 20 hours/week supplementary employment unless Home Office approved."
                : cat === "global_talent"
                ? "No sponsor duties — unrestricted employment. Standard right to work checks apply."
                : cat === "dependent_visa"
                ? "Most dependants can work unrestricted. Verify visa conditions — some categories have restrictions."
                : "Enter visa details and any work conditions or restrictions that apply."
              }
            </ComplianceAlert>
          )}
        </div>
      </SectionCard>

      {/* Personal Identification — always shown */}
      <SectionCard title="Personal Identification" icon={User}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Full Legal Name (as per passport) *</Label>
            <Input className="mt-1" value={data.fullLegalName} onChange={e => set("fullLegalName", e.target.value)} readOnly={readOnly} placeholder="As shown on passport" />
          </div>
          <div>
            <Label>Date of Birth *</Label>
            <Input type="date" className="mt-1" value={data.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} readOnly={readOnly} />
          </div>
          <div>
            <Label>Nationality/Nationalities *</Label>
            <Input className="mt-1" value={data.nationalities.join(", ")} onChange={e => set("nationalities", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} readOnly={readOnly} placeholder="e.g. British, Indian" />
          </div>
          {cat !== "settled_status" && (
            <>
              <div>
                <Label>Passport Number(s)</Label>
                <Input className="mt-1" value={data.passportNumbers} onChange={e => set("passportNumbers", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Passport Expiry Date</Label>
                <Input type="date" className="mt-1" value={data.passportExpiry} onChange={e => set("passportExpiry", e.target.value)} readOnly={readOnly} />
              </div>
            </>
          )}
        </div>
      </SectionCard>

      {/* Universal Compliance Fields — always shown when category selected */}
      {cat && (
        <SectionCard title="Right to Work Compliance" icon={Shield} variant="warning">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date of RTW Check *</Label>
                <Input type="date" className="mt-1" value={data.rtwCheckDate} onChange={e => set("rtwCheckDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>HR Officer Who Conducted Check *</Label>
                <Input className="mt-1" value={data.hrOfficerName} onChange={e => set("hrOfficerName", e.target.value)} readOnly={readOnly} placeholder="Officer name" />
              </div>
              <div>
                <Label>Next Check Due Date</Label>
                <Input type="date" className="mt-1" value={data.nextCheckDueDate} onChange={e => set("nextCheckDueDate", e.target.value)} readOnly={readOnly} />
                <p className="text-[10px] text-muted-foreground mt-1">Auto-calculated based on status if left blank</p>
              </div>
              <div>
                <Label>Copy of Documents Stored?</Label>
                <Select value={data.documentsCopied} onValueChange={v => set("documentsCopied", v)} disabled={readOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Right to Work Documents Verified</Label>
              <div className="grid grid-cols-2 gap-2">
                {RTW_DOCUMENTS.map(doc => (
                  <label key={doc} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/30 rounded-lg p-1.5 transition-colors">
                    <Checkbox
                      checked={data.rtwDocumentsVerified.includes(doc)}
                      onCheckedChange={() => toggleDoc(doc)}
                      disabled={readOnly}
                    />
                    <span>{doc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Category-Specific Sections ── */}

      {/* A. British/Irish */}
      {(cat === "british_citizen" || cat === "irish_citizen") && (
        <SectionCard title={cat === "british_citizen" ? "British Citizen Details" : "Irish Citizen Details"} icon={Shield}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={data.birthCertificateProvided} onCheckedChange={v => set("birthCertificateProvided", !!v)} disabled={readOnly} />
                  <span>Birth Certificate provided (alternative to passport)</span>
                </label>
              </div>
              {data.birthCertificateProvided && (
                <div className="col-span-2">
                  <Label>National Insurance Number (if using birth certificate for ID)</Label>
                  <Input className="mt-1" value={data.niNumberForId} onChange={e => set("niNumberForId", e.target.value)} readOnly={readOnly} placeholder="AB 12 34 56 C" />
                </div>
              )}
            </div>
            <ComplianceAlert variant="success">
              No renewal or follow-up checks required unless using passport for ID purposes (check passport expiry).
            </ComplianceAlert>
          </div>
        </SectionCard>
      )}

      {/* B. Settled Status */}
      {cat === "settled_status" && (
        <SectionCard title="Settled Status Details" icon={CheckCircle2}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Share Code *</Label>
                <Input className="mt-1" value={data.shareCode} onChange={e => set("shareCode", e.target.value)} readOnly={readOnly} placeholder="9-character share code" />
              </div>
              <div>
                <Label>Date Share Code Generated *</Label>
                <Input type="date" className="mt-1" value={data.shareCodeDate} onChange={e => set("shareCodeDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Settlement Type *</Label>
                <Select value={data.settlementType} onValueChange={v => set("settlementType", v)} disabled={readOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    {SETTLEMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>BRP Number (if applicable)</Label>
                <Input className="mt-1" value={data.brpNumber} onChange={e => set("brpNumber", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>BRP Expiry Date</Label>
                <Input type="date" className="mt-1" value={data.brpExpiry} onChange={e => set("brpExpiry", e.target.value)} readOnly={readOnly} />
              </div>
            </div>
            {data.settlementType === "EU Pre-settled Status" && (
              <ComplianceAlert variant="warning">
                EU Pre-settled Status expires after max 5 years. Track expiry date and remind employee to apply for full settled status before expiry.
              </ComplianceAlert>
            )}
          </div>
        </SectionCard>
      )}

      {/* C. Student Visa */}
      {cat === "student_visa" && (
        <SectionCard title="Student Visa Details" icon={GraduationCap} variant="warning">
          <div className="space-y-4">
            <ComplianceAlert variant="warning">
              <strong>Critical:</strong> Student visa holders are limited to 20 hours/week during term time (inclusive of all employment). Full-time only during vacations. DO NOT sponsor for Skilled Worker visa while on student status.
            </ComplianceAlert>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Visa Start Date *</Label>
                <Input type="date" className="mt-1" value={data.visaStartDate} onChange={e => set("visaStartDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Visa Expiry Date *</Label>
                <Input type="date" className="mt-1" value={data.visaExpiryDate} onChange={e => set("visaExpiryDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Sponsoring Institution *</Label>
                <Input className="mt-1" value={data.sponsoringInstitution} onChange={e => set("sponsoringInstitution", e.target.value)} readOnly={readOnly} placeholder="University / College name" />
              </div>
              <div>
                <Label>Course End Date *</Label>
                <Input type="date" className="mt-1" value={data.courseEndDate} onChange={e => set("courseEndDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>CAS Number</Label>
                <Input className="mt-1" value={data.casNumber} onChange={e => set("casNumber", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Term-time Hours Limit</Label>
                <Input type="number" className="mt-1" value={data.termTimeHoursLimit} onChange={e => set("termTimeHoursLimit", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Academic Term Dates Recorded?</Label>
                <Select value={data.academicTermDatesRecorded} onValueChange={v => set("academicTermDatesRecorded", v)} disabled={readOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-3">
              <p className="font-semibold">Documents to Retain:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Current visa vignette / BRP</li>
                <li>Confirmation of enrolment letter (updated annually)</li>
                <li>Academic calendar</li>
              </ul>
            </div>
          </div>
        </SectionCard>
      )}

      {/* D. Graduate Visa */}
      {cat === "graduate_visa" && (
        <SectionCard title="Graduate Visa (PSW) Details" icon={BookOpen}>
          <div className="space-y-4">
            <ComplianceAlert variant="success">
              No work restrictions — can work unlimited hours in any role. Can be sponsored for Skilled Worker visa before expiry.
            </ComplianceAlert>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Graduate Visa Start Date *</Label>
                <Input type="date" className="mt-1" value={data.graduateVisaStartDate} onChange={e => set("graduateVisaStartDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Graduate Visa Expiry Date *</Label>
                <Input type="date" className="mt-1" value={data.graduateVisaExpiryDate} onChange={e => set("graduateVisaExpiryDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Qualifying Institution *</Label>
                <Input className="mt-1" value={data.qualifyingInstitution} onChange={e => set("qualifyingInstitution", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Qualification Level *</Label>
                <Select value={data.qualificationLevel} onValueChange={v => set("qualificationLevel", v)} disabled={readOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select level…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD / Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Completion Date</Label>
                <Input type="date" className="mt-1" value={data.completionDate} onChange={e => set("completionDate", e.target.value)} readOnly={readOnly} />
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-3">
              <p className="font-semibold">Documents to Retain:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Graduate visa BRP</li>
                <li>Degree certificate or completion letter</li>
              </ul>
            </div>
          </div>
        </SectionCard>
      )}

      {/* E. Skilled Worker - Company Sponsored */}
      {cat === "skilled_worker_company" && (
        <SectionCard title="Skilled Worker — Company Sponsored" icon={Briefcase} variant="warning">
          <div className="space-y-4">
            <ComplianceAlert variant="warning">
              <strong>Sponsor Duties:</strong> Report to Home Office within 10 working days for: salary changes (&gt;10% reduction), job role changes, absences &gt;10 consecutive working days, resignation/termination, or changes in employment circumstances.
            </ComplianceAlert>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CoS Number *</Label>
                <Input className="mt-1" value={data.cosNumber} onChange={e => set("cosNumber", e.target.value)} readOnly={readOnly} placeholder="Certificate of Sponsorship number" />
              </div>
              <div>
                <Label>CoS Assignment Date *</Label>
                <Input type="date" className="mt-1" value={data.cosAssignmentDate} onChange={e => set("cosAssignmentDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Visa Start Date *</Label>
                <Input type="date" className="mt-1" value={data.swVisaStartDate} onChange={e => set("swVisaStartDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Visa Expiry Date *</Label>
                <Input type="date" className="mt-1" value={data.swVisaExpiryDate} onChange={e => set("swVisaExpiryDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Job Title (as per CoS) *</Label>
                <Input className="mt-1" value={data.jobTitleOnCos} onChange={e => set("jobTitleOnCos", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>SOC Code *</Label>
                <Input className="mt-1" value={data.socCode} onChange={e => set("socCode", e.target.value)} readOnly={readOnly} placeholder="e.g. 6145" />
              </div>
              <div>
                <Label>Sponsor Licence Number</Label>
                <Input className="mt-1" value={data.sponsorLicenceNumber} onChange={e => set("sponsorLicenceNumber", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Salary (as stated on CoS) *</Label>
                <Input className="mt-1" value={data.salaryOnCos} onChange={e => set("salaryOnCos", e.target.value)} readOnly={readOnly} placeholder="£" />
              </div>
              <div>
                <Label>Annual Leave Entitlement</Label>
                <Input className="mt-1" value={data.annualLeaveEntitlement} onChange={e => set("annualLeaveEntitlement", e.target.value)} readOnly={readOnly} placeholder="Days" />
              </div>
            </div>

            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground pt-2 border-t">Absence Tracking</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Unpaid Leave Taken (days)</Label>
                <Input type="number" className="mt-1" value={data.unpaidLeaveDays} onChange={e => set("unpaidLeaveDays", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Sickness Absence (days)</Label>
                <Input type="number" className="mt-1" value={data.sicknessAbsenceDays} onChange={e => set("sicknessAbsenceDays", e.target.value)} readOnly={readOnly} />
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-3">
              <p className="font-semibold">Home Office Reporting Triggers:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Employee does not start on expected date</li>
                <li>Absent without permission for &gt;10 working days</li>
                <li>Significant change in job role, salary, or working pattern</li>
                <li>Employee is dismissed or resigns</li>
                <li>Suspicion of fraudulent documents or visa breach</li>
                <li>Change in employee contact details</li>
              </ul>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-3">
              <p className="font-semibold">Documents to Retain:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Copy of CoS</li>
                <li>Visa approval letter</li>
                <li>BRP card copy</li>
                <li>Employment contract matching CoS details</li>
                <li>Evidence of ongoing compliance (salary slips, P60s)</li>
              </ul>
            </div>
          </div>
        </SectionCard>
      )}

      {/* F. Skilled Worker - Other Sponsor */}
      {cat === "skilled_worker_other" && (
        <SectionCard title="Skilled Worker — Other Sponsor (Concurrent Employment)" icon={Building2} variant="warning">
          <div className="space-y-4">
            <ComplianceAlert variant="warning">
              <strong>Critical:</strong> Do NOT assign more than 20 hours/week without primary sponsor's knowledge or Home Office approval. Verify they are meeting conditions of their primary sponsored role.
            </ComplianceAlert>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Primary Sponsor Name *</Label>
                <Input className="mt-1" value={data.primarySponsorName} onChange={e => set("primarySponsorName", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Primary Job Role &amp; Hours *</Label>
                <Input className="mt-1" value={data.primaryJobRole} onChange={e => set("primaryJobRole", e.target.value)} readOnly={readOnly} placeholder="Role title and weekly hours" />
              </div>
              <div>
                <Label>CoS Number (if known)</Label>
                <Input className="mt-1" value={data.otherCosNumber} onChange={e => set("otherCosNumber", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Visa Expiry Date *</Label>
                <Input type="date" className="mt-1" value={data.otherVisaExpiry} onChange={e => set("otherVisaExpiry", e.target.value)} readOnly={readOnly} />
              </div>
              <div className="col-span-2">
                <Label>Permission for Supplementary Employment</Label>
                <Select value={data.supplementaryPermission} onValueChange={v => set("supplementaryPermission", v)} disabled={readOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic_20h">Automatic (up to 20 hours/week)</SelectItem>
                    <SelectItem value="ho_approved">Approved by Home Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-3">
              <p className="font-semibold">Documents to Retain:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Copy of BRP showing visa validity</li>
                <li>Written confirmation from employee about their primary sponsor and hours worked there</li>
              </ul>
            </div>
          </div>
        </SectionCard>
      )}

      {/* G. Global Talent */}
      {cat === "global_talent" && (
        <SectionCard title="Global Talent Visa Details" icon={Globe}>
          <div className="space-y-4">
            <ComplianceAlert variant="success">
              No sponsor duties — they are not tied to your organisation. Can work any hours, any role. Standard right to work checks apply.
            </ComplianceAlert>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Visa Start Date *</Label>
                <Input type="date" className="mt-1" value={data.gtVisaStartDate} onChange={e => set("gtVisaStartDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Visa Expiry Date *</Label>
                <Input type="date" className="mt-1" value={data.gtVisaExpiryDate} onChange={e => set("gtVisaExpiryDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Endorsing Body *</Label>
                <Select value={data.endorsingBody} onValueChange={v => set("endorsingBody", v)} disabled={readOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select body…" /></SelectTrigger>
                  <SelectContent>
                    {ENDORSING_BODIES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Endorsement Type *</Label>
                <Select value={data.endorsementType} onValueChange={v => set("endorsementType", v)} disabled={readOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exceptional_talent">Exceptional Talent</SelectItem>
                    <SelectItem value="exceptional_promise">Exceptional Promise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* H. Dependent Visa */}
      {cat === "dependent_visa" && (
        <SectionCard title="Dependent Visa Details" icon={User}>
          <div className="space-y-4">
            <ComplianceAlert variant="info">
              Most dependent visa holders can work unrestricted. Exceptions: Student dependants on courses &lt;9 months (NO work rights) and Visitor dependants (NO work rights). Verify conditions.
            </ComplianceAlert>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dependent Visa Type *</Label>
                <Select value={data.dependentVisaType} onValueChange={v => set("dependentVisaType", v)} disabled={readOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    {DEPENDENT_VISA_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Main Visa Holder Name *</Label>
                <Input className="mt-1" value={data.mainVisaHolderName} onChange={e => set("mainVisaHolderName", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Relationship to Main Holder *</Label>
                <Input className="mt-1" value={data.mainVisaHolderRelationship} onChange={e => set("mainVisaHolderRelationship", e.target.value)} readOnly={readOnly} placeholder="Spouse / Partner / Child" />
              </div>
              <div>
                <Label>Visa Start Date *</Label>
                <Input type="date" className="mt-1" value={data.depVisaStartDate} onChange={e => set("depVisaStartDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Visa Expiry Date *</Label>
                <Input type="date" className="mt-1" value={data.depVisaExpiryDate} onChange={e => set("depVisaExpiryDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div className="col-span-2">
                <Label>Work Restrictions / Conditions</Label>
                <Textarea className="mt-1" value={data.depWorkRestrictions} onChange={e => set("depWorkRestrictions", e.target.value)} readOnly={readOnly} placeholder="Detail any work restrictions that apply…" />
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* I. Other */}
      {cat === "other" && (
        <SectionCard title="Other Visa Category" icon={FileText}>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Examples: High Potential Individual (HPI), Youth Mobility Scheme, UK Ancestry, Tier 1 Investor/Entrepreneur (legacy), Family visa routes</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Visa Type *</Label>
                <Input className="mt-1" value={data.otherVisaType} onChange={e => set("otherVisaType", e.target.value)} readOnly={readOnly} placeholder="Specify the visa type" />
              </div>
              <div>
                <Label>Visa Start Date</Label>
                <Input type="date" className="mt-1" value={data.otherVisaStartDate} onChange={e => set("otherVisaStartDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div>
                <Label>Visa Expiry Date</Label>
                <Input type="date" className="mt-1" value={data.otherVisaExpiryDate} onChange={e => set("otherVisaExpiryDate", e.target.value)} readOnly={readOnly} />
              </div>
              <div className="col-span-2">
                <Label>Work Conditions / Restrictions</Label>
                <Textarea className="mt-1" value={data.otherWorkConditions} onChange={e => set("otherWorkConditions", e.target.value)} readOnly={readOnly} placeholder="Detail any limitations…" />
              </div>
              <div>
                <Label>Sponsorship Required?</Label>
                <Select value={data.otherSponsorshipRequired} onValueChange={v => set("otherSponsorshipRequired", v)} disabled={readOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {data.otherSponsorshipRequired === "yes" && (
                <div>
                  <Label>Sponsor Name</Label>
                  <Input className="mt-1" value={data.otherSponsorName} onChange={e => set("otherSponsorName", e.target.value)} readOnly={readOnly} />
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Notes */}
      {cat && (
        <SectionCard title="Additional Notes" icon={FileText}>
          <Textarea
            value={data.notes}
            onChange={e => set("notes", e.target.value)}
            readOnly={readOnly}
            placeholder="Any special circumstances, additional information, or follow-up actions…"
            className="min-h-[80px]"
          />
        </SectionCard>
      )}

      {/* Document Retention Policy */}
      {cat && (
        <div className="rounded-xl border bg-muted/30 p-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Clock className="h-4 w-4" /> Document Retention &amp; Compliance Reminders</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Keep copies of RTW documents for duration of employment + 2 years</li>
            <li>• Store securely (GDPR compliant) with access controls</li>
            <li>• Conduct follow-up checks before visa expiry dates</li>
            <li>• Set automated reminders: 90 days, 60 days, 30 days before visa expiry</li>
            {(cat === "skilled_worker_company") && <li>• Report to Home Office any changes in circumstances within 10 working days</li>}
            {cat === "student_visa" && <li>• Monitor working hours during academic term time — max 20 hours/week</li>}
            {cat === "skilled_worker_other" && <li>• Verify employee is not exceeding 20 hours/week supplementary employment</li>}
            <li>• Maintain accurate HR records accessible for UKVI inspection</li>
            <li>• Annual audit of all immigration records</li>
          </ul>
        </div>
      )}

      {/* Save Button */}
      {!readOnly && (
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-sm text-success flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Immigration details saved</span>
          )}
          <Button onClick={handleSave} className="shadow-lg shadow-primary/20" disabled={!cat}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Save Immigration Details
          </Button>
        </div>
      )}
    </div>
  );
}
