import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Plus, X, Briefcase, MapPin, Clock, Users, ChevronRight,
  CheckCircle2, FileText, ArrowLeft, Search, Upload, MessageSquare,
  XCircle, Paperclip,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type ContractType = "full_time" | "part_time" | "contract" | "bank";
type VacancyStatus = "open" | "closed" | "draft";
type ApplicationStatus = "new" | "shortlisted" | "interview" | "offered" | "rejected";

interface Vacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  contractType: ContractType;
  salaryFrom: number;
  salaryTo: number;
  description: string;
  requirements: string;
  status: VacancyStatus;
  createdAt: string;
  applicationCount: number;
}

interface Application {
  id: string;
  vacancyId: string;
  givenName: string;
  familyName: string;
  email: string;
  phone: string;
  nationality: string;
  rightToWork: string;
  coverLetter: string;
  cvFileName?: string;
  cvFileSize?: number;
  linkedIn?: string;
  status: ApplicationStatus;
  submittedAt: string;
  interviewNotes?: string;
  rejectionReason?: string;
}

// ── Demo Data ──────────────────────────────────────────────────────────────────
const INITIAL_VACANCIES: Vacancy[] = [
  {
    id: "v1", title: "Senior Care Worker", department: "Residential Care",
    location: "Birmingham", contractType: "full_time",
    salaryFrom: 26000, salaryTo: 29000,
    description: "We are looking for an experienced Senior Care Worker to join our residential team. You will support residents with daily living activities, lead a small team of care assistants, and ensure compliance with CQC standards.",
    requirements: "NVQ Level 3 in Health & Social Care or equivalent. Minimum 2 years experience in a care setting. Strong communication and leadership skills.",
    status: "open", createdAt: "2026-02-10T09:00:00Z", applicationCount: 4,
  },
  {
    id: "v2", title: "Registered Nurse (RGN)", department: "Nursing",
    location: "Manchester", contractType: "full_time",
    salaryFrom: 35000, salaryTo: 42000,
    description: "An exciting opportunity for a Registered General Nurse to join our growing nursing team. You will deliver clinical care, manage medication administration, and liaise with multidisciplinary teams.",
    requirements: "Active NMC PIN. Minimum 1 year post-qualifying experience. Experience in elderly or residential care preferred.",
    status: "open", createdAt: "2026-02-15T09:00:00Z", applicationCount: 3,
  },
  {
    id: "v3", title: "Care Assistant", department: "Residential Care",
    location: "Leeds", contractType: "part_time",
    salaryFrom: 20000, salaryTo: 22000,
    description: "We are recruiting compassionate Care Assistants to provide personal care and support to residents in our care home. No experience necessary — full training provided.",
    requirements: "Caring nature and good communication skills. Willingness to work flexible hours including weekends. DBS check required.",
    status: "open", createdAt: "2026-02-20T09:00:00Z", applicationCount: 2,
  },
];

const INITIAL_APPLICATIONS: Application[] = [
  // Senior Care Worker (v1)
  {
    id: "a1", vacancyId: "v1", givenName: "Priya", familyName: "Sharma",
    email: "priya.sharma@email.com", phone: "07712 345678", nationality: "Indian",
    rightToWork: "yes_visa", coverLetter: "I have over 4 years of experience working in residential care settings and hold an NVQ Level 3. I am passionate about delivering person-centred care and have previously led a team of 5 care assistants during night shifts. I am currently on a Skilled Worker visa and am fully eligible to work in the UK.",
    cvFileName: "Priya_Sharma_CV.pdf", cvFileSize: 245000,
    linkedIn: "https://linkedin.com/in/priya-sharma",
    status: "shortlisted", submittedAt: "2026-02-12T10:30:00Z",
    interviewNotes: "Strong candidate — good communication and experience managing a small team. References verified. Invited to second interview.",
  },
  {
    id: "a2", vacancyId: "v1", givenName: "James", familyName: "Okafor",
    email: "james.okafor@email.com", phone: "07891 234567", nationality: "British",
    rightToWork: "yes_unrestricted", coverLetter: "Born and raised in Birmingham, I have worked in care since leaving college. I have my NVQ Level 3 and completed a leadership course last year. I am eager to take on a senior role.",
    cvFileName: "James_Okafor_CV.docx", cvFileSize: 189000,
    status: "interview", submittedAt: "2026-02-13T14:00:00Z",
    interviewNotes: "Interview held on 20 Feb. Performed well on scenario-based questions. Awaiting second interview slot confirmation.",
  },
  {
    id: "a3", vacancyId: "v1", givenName: "Amina", familyName: "Hassan",
    email: "amina.hassan@email.com", phone: "07765 432100", nationality: "Somali",
    rightToWork: "requires_sponsorship", coverLetter: "I am a dedicated care professional with 3 years of experience. I require sponsorship to work in the UK.",
    cvFileName: "Amina_Hassan_CV.pdf", cvFileSize: 210000,
    status: "rejected", submittedAt: "2026-02-14T09:15:00Z",
    rejectionReason: "Candidate requires Skilled Worker visa sponsorship which is not available for this role at this time. Will keep on file for future sponsored positions.",
  },
  {
    id: "a4", vacancyId: "v1", givenName: "Tom", familyName: "Hutchins",
    email: "tom.hutchins@email.com", phone: "07923 001122", nationality: "British",
    rightToWork: "yes_unrestricted", coverLetter: "I am looking to step into my first senior role. I have 18 months of care experience and am currently completing my NVQ Level 3.",
    cvFileName: "Tom_Hutchins_CV.pdf", cvFileSize: 165000,
    status: "new", submittedAt: "2026-02-18T16:45:00Z",
  },
  // Registered Nurse (v2)
  {
    id: "a5", vacancyId: "v2", givenName: "Lakshmi", familyName: "Nair",
    email: "lakshmi.nair@email.com", phone: "07400 112233", nationality: "Indian",
    rightToWork: "yes_visa", coverLetter: "I am a qualified RGN registered with the NMC (PIN 12A3456B) with 3 years of post-qualifying experience in elderly care settings in the UK. I am reliable, compassionate, and skilled in medication management and wound care.",
    cvFileName: "Lakshmi_Nair_CV.pdf", cvFileSize: 310000,
    linkedIn: "https://linkedin.com/in/lakshmi-nair-rn",
    status: "offered", submittedAt: "2026-02-17T11:00:00Z",
    interviewNotes: "Excellent candidate. NMC PIN verified. Strong clinical knowledge. Referenced checked. Verbal offer made on 25 Feb — awaiting written acceptance.",
  },
  {
    id: "a6", vacancyId: "v2", givenName: "David", familyName: "Owusu",
    email: "david.owusu@email.com", phone: "07388 556677", nationality: "Ghanaian",
    rightToWork: "yes_unrestricted", coverLetter: "British citizen with NMC registration and 2 years' experience in a Manchester nursing home. Passionate about improving standards of care for elderly residents.",
    cvFileName: "David_Owusu_CV.docx", cvFileSize: 198000,
    status: "shortlisted", submittedAt: "2026-02-19T08:30:00Z",
    interviewNotes: "Good application. NMC PIN confirmed active. Invited for interview — first available date 5 March.",
  },
  {
    id: "a7", vacancyId: "v2", givenName: "Sarah", familyName: "Connelly",
    email: "sarah.connelly@email.com", phone: "07511 998877", nationality: "British",
    rightToWork: "yes_unrestricted", coverLetter: "Newly qualified RGN looking for my first permanent position in elderly care. I completed my training at Manchester University and have 6 months' experience from placements.",
    cvFileName: "Sarah_Connelly_CV.pdf", cvFileSize: 174000,
    status: "new", submittedAt: "2026-02-22T13:20:00Z",
  },
  // Care Assistant (v3)
  {
    id: "a8", vacancyId: "v3", givenName: "Maria", familyName: "Kowalski",
    email: "maria.kowalski@email.com", phone: "07633 445566", nationality: "Polish",
    rightToWork: "yes_unrestricted", coverLetter: "I have been living in the UK for 5 years and have volunteered at a local care home. I am kind, patient, and eager to start a career in care.",
    cvFileName: "Maria_Kowalski_CV.pdf", cvFileSize: 145000,
    status: "interview", submittedAt: "2026-02-23T10:00:00Z",
    interviewNotes: "Warm personality. No formal care experience but strong volunteering background. Interview scheduled for 3 March.",
  },
  {
    id: "a9", vacancyId: "v3", givenName: "Kevin", familyName: "Brown",
    email: "kevin.brown@email.com", phone: "07744 667788", nationality: "British",
    rightToWork: "yes_unrestricted", coverLetter: "Looking for a part-time role to complement my studies. I have always wanted to work in care and believe I have the empathy and dedication to thrive in this role.",
    cvFileName: "Kevin_Brown_CV.docx", cvFileSize: 132000,
    status: "new", submittedAt: "2026-02-24T15:10:00Z",
  },
];

const CONTRACT_LABELS: Record<ContractType, string> = {
  full_time: "Full Time", part_time: "Part Time", contract: "Contract", bank: "Bank / Relief",
};

const APP_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New", shortlisted: "Shortlisted", interview: "Interview", offered: "Offered", rejected: "Rejected",
};

const APP_STATUS_COLORS: Record<ApplicationStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  shortlisted: "bg-warning/10 text-warning border-warning/20",
  interview: "bg-secondary/10 text-secondary border-secondary/20",
  offered: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Add Vacancy Modal ──────────────────────────────────────────────────────────
function AddVacancyModal({ onClose, onAdd }: { onClose: () => void; onAdd: (v: Vacancy) => void }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: "", department: "", location: "", contractType: "full_time" as ContractType,
    salaryFrom: "", salaryTo: "", description: "", requirements: "", status: "open" as VacancyStatus,
  });
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canSave = !!(form.title && form.department && form.location && form.description);

  const handleSave = () => {
    onAdd({
      id: `v_${Date.now()}`,
      title: form.title, department: form.department, location: form.location,
      contractType: form.contractType,
      salaryFrom: parseFloat(form.salaryFrom) || 0,
      salaryTo: parseFloat(form.salaryTo) || 0,
      description: form.description, requirements: form.requirements,
      status: form.status, createdAt: new Date().toISOString(), applicationCount: 0,
    });
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-background rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Post New Vacancy</h2>
            <p className="text-xs text-muted-foreground">Create a new job listing</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Role Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Job Title *</Label><Input className="mt-1" value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Senior Care Worker" /></div>
              <div><Label>Department *</Label><Input className="mt-1" value={form.department} onChange={e => set("department", e.target.value)} placeholder="e.g. Residential Care" /></div>
              <div><Label>Location *</Label><Input className="mt-1" value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Birmingham" /></div>
              <div>
                <Label>Contract Type</Label>
                <Select value={form.contractType} onValueChange={v => set("contractType", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTRACT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v as VacancyStatus)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Salary From (£)</Label><Input type="number" className="mt-1" value={form.salaryFrom} onChange={e => set("salaryFrom", e.target.value)} /></div>
              <div><Label>Salary To (£)</Label><Input type="number" className="mt-1" value={form.salaryTo} onChange={e => set("salaryTo", e.target.value)} /></div>
            </div>
          </section>
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Job Description</h3>
            <div className="space-y-3">
              <div><Label>Description *</Label><Textarea className="mt-1 min-h-[100px]" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the role and responsibilities…" /></div>
              <div><Label>Requirements</Label><Textarea className="mt-1 min-h-[80px]" value={form.requirements} onChange={e => set("requirements", e.target.value)} placeholder="Qualifications, experience, skills required…" /></div>
            </div>
          </section>
        </div>
        <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {saved
            ? <Button className="ml-auto" disabled><CheckCircle2 className="h-4 w-4 mr-1" />Vacancy Posted</Button>
            : <Button onClick={handleSave} disabled={!canSave} className="ml-auto">Post Vacancy</Button>}
        </div>
      </div>
    </div>
  );
}

// ── Application Form Modal ─────────────────────────────────────────────────────
function ApplyModal({ vacancy, onClose, onSubmit }: { vacancy: Vacancy; onClose: () => void; onSubmit: (a: Application) => void }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    givenName: "", familyName: "", email: "", phone: "", nationality: "",
    rightToWork: "", coverLetter: "", linkedIn: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canSave = !!(form.givenName && form.familyName && form.email && form.rightToWork);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ["application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (allowed.includes(file.type) || file.name.match(/\.(pdf|doc|docx)$/i)) {
        setCvFile(file);
      }
    }
  };

  const handleSubmit = () => {
    onSubmit({
      id: `a_${Date.now()}`,
      vacancyId: vacancy.id,
      givenName: form.givenName, familyName: form.familyName,
      email: form.email, phone: form.phone, nationality: form.nationality,
      rightToWork: form.rightToWork, coverLetter: form.coverLetter,
      linkedIn: form.linkedIn || undefined,
      cvFileName: cvFile?.name,
      cvFileSize: cvFile?.size,
      status: "new", submittedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-xl bg-background rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Apply for {vacancy.title}</h2>
            <p className="text-xs text-muted-foreground">{vacancy.location} · {CONTRACT_LABELS[vacancy.contractType]}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Personal Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Given Name *</Label><Input className="mt-1" value={form.givenName} onChange={e => set("givenName", e.target.value)} /></div>
              <div><Label>Family Name *</Label><Input className="mt-1" value={form.familyName} onChange={e => set("familyName", e.target.value)} /></div>
              <div><Label>Email *</Label><Input type="email" className="mt-1" value={form.email} onChange={e => set("email", e.target.value)} /></div>
              <div><Label>Phone</Label><Input className="mt-1" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
              <div><Label>Nationality</Label><Input className="mt-1" value={form.nationality} onChange={e => set("nationality", e.target.value)} /></div>
              <div>
                <Label>Right to Work in UK *</Label>
                <Select value={form.rightToWork} onValueChange={v => set("rightToWork", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes_unrestricted">Yes — Unrestricted</SelectItem>
                    <SelectItem value="yes_visa">Yes — Visa / Limited Leave</SelectItem>
                    <SelectItem value="requires_sponsorship">Requires Sponsorship</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Application</h3>
            <div className="space-y-3">
              <div><Label>Cover Letter / Supporting Statement</Label><Textarea className="mt-1 min-h-[120px]" value={form.coverLetter} onChange={e => set("coverLetter", e.target.value)} placeholder="Tell us why you're a great fit for this role…" /></div>
              <div><Label>LinkedIn Profile URL</Label><Input className="mt-1" value={form.linkedIn} onChange={e => set("linkedIn", e.target.value)} placeholder="https://linkedin.com/in/…" /></div>

              {/* CV Upload */}
              <div>
                <Label>CV / Resume</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {cvFile ? (
                  <div className="mt-1 flex items-center gap-2 border rounded-lg p-3 bg-primary/5 border-primary/20">
                    <Paperclip className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cvFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(cvFile.size)}</p>
                    </div>
                    <button
                      onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="h-6 w-6 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 w-full flex items-center gap-2 border border-dashed rounded-lg p-3 text-sm text-muted-foreground hover:bg-muted/30 hover:border-primary/40 transition-all"
                  >
                    <Upload className="h-4 w-4 shrink-0" />
                    <span>Click to upload CV — PDF, DOC, or DOCX</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
        <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {saved
            ? <Button className="ml-auto" disabled><CheckCircle2 className="h-4 w-4 mr-1" />Application Submitted!</Button>
            : <Button onClick={handleSubmit} disabled={!canSave} className="ml-auto">Submit Application</Button>}
        </div>
      </div>
    </div>
  );
}

// ── Application Detail Modal ───────────────────────────────────────────────────
function ApplicationDetail({ app, onClose, onUpdate }: {
  app: Application;
  onClose: () => void;
  onUpdate: (id: string, changes: Partial<Application>) => void;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(app.status);
  const [interviewNotes, setInterviewNotes] = useState(app.interviewNotes || "");
  const [rejectionReason, setRejectionReason] = useState(app.rejectionReason || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate(app.id, { status, interviewNotes, rejectionReason });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-background rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold">{app.givenName} {app.familyName}</h2>
            <p className="text-xs text-muted-foreground">Applied {new Date(app.submittedAt).toLocaleDateString("en-GB")}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", APP_STATUS_COLORS[app.status])}>
              {APP_STATUS_LABELS[app.status]}
            </span>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{app.email}</p></div>
            <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{app.phone || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Nationality</p><p className="font-medium">{app.nationality || "—"}</p></div>
            <div>
              <p className="text-xs text-muted-foreground">Right to Work</p>
              <p className="font-medium">
                {app.rightToWork === "yes_unrestricted" ? "Yes — Unrestricted"
                  : app.rightToWork === "yes_visa" ? "Yes — Visa"
                  : app.rightToWork === "requires_sponsorship" ? "Requires Sponsorship"
                  : "No"}
              </p>
            </div>
          </div>

          {/* CV */}
          {app.cvFileName && (
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{app.cvFileName}</p>
                {app.cvFileSize && <p className="text-xs text-muted-foreground">{formatFileSize(app.cvFileSize)}</p>}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {app.coverLetter && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Cover Letter</p>
              <p className="text-sm bg-muted/40 rounded-lg p-3 leading-relaxed">{app.coverLetter}</p>
            </div>
          )}

          {/* LinkedIn */}
          {app.linkedIn && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">LinkedIn</p>
              <a href={app.linkedIn} target="_blank" rel="noreferrer" className="text-sm text-primary underline">{app.linkedIn}</a>
            </div>
          )}

          {/* Update Status */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Pipeline Stage</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(APP_STATUS_LABELS) as ApplicationStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border font-medium transition-all",
                    status === s ? APP_STATUS_COLORS[s] : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {APP_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Interview Notes */}
          <div>
            <Label className="flex items-center gap-1.5 mb-1">
              <MessageSquare className="h-3.5 w-3.5" />
              Interview Notes
            </Label>
            <Textarea
              className="min-h-[90px] text-sm"
              value={interviewNotes}
              onChange={e => setInterviewNotes(e.target.value)}
              placeholder="Add notes from interviews, phone screens, or assessments…"
            />
          </div>

          {/* Rejection Reason — shown when rejected */}
          {(status === "rejected" || rejectionReason) && (
            <div>
              <Label className="flex items-center gap-1.5 mb-1 text-destructive">
                <XCircle className="h-3.5 w-3.5" />
                Rejection Reason
              </Label>
              <Textarea
                className="min-h-[70px] text-sm border-destructive/30 focus-visible:ring-destructive/30"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Briefly note why this candidate was not progressed…"
              />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {saved
            ? <Button disabled><CheckCircle2 className="h-4 w-4 mr-1" />Saved</Button>
            : <Button onClick={handleSave}>Save Changes</Button>}
        </div>
      </div>
    </div>
  );
}

// ── Vacancy Detail View ────────────────────────────────────────────────────────
function VacancyDetail({ vacancy, applications, onBack, onApply, onUpdateApp }: {
  vacancy: Vacancy;
  applications: Application[];
  onBack: () => void;
  onApply: () => void;
  onUpdateApp: (id: string, changes: Partial<Application>) => void;
}) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appFilter, setAppFilter] = useState<ApplicationStatus | "all">("all");

  const filteredApps = appFilter === "all" ? applications : applications.filter(a => a.status === appFilter);

  // When an app is updated, re-sync the selected app reference
  const handleUpdate = (id: string, changes: Partial<Application>) => {
    onUpdateApp(id, changes);
    setSelectedApp(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to vacancies
      </button>

      {/* Vacancy Header */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">{vacancy.title}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{vacancy.location}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{CONTRACT_LABELS[vacancy.contractType]}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{vacancy.department}</span>
              {vacancy.salaryFrom > 0 && (
                <span>£{vacancy.salaryFrom.toLocaleString()} – £{vacancy.salaryTo.toLocaleString()} / year</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border",
              vacancy.status === "open" ? "bg-success/10 text-success border-success/20"
              : vacancy.status === "draft" ? "bg-muted text-muted-foreground border-border"
              : "bg-destructive/10 text-destructive border-destructive/20"
            )}>
              {vacancy.status.charAt(0).toUpperCase() + vacancy.status.slice(1)}
            </span>
            {vacancy.status === "open" && (
              <Button size="sm" onClick={onApply}>Apply Now</Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">Job Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{vacancy.description}</p>
          </div>
          {vacancy.requirements && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Requirements</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{vacancy.requirements}</p>
            </div>
          )}
        </div>
      </div>

      {/* Applications Panel */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Applications
            <span className="text-xs bg-muted rounded-full px-2 py-0.5">{applications.length}</span>
          </h3>
          {/* Pipeline filter */}
          <div className="flex gap-1 flex-wrap">
            {(["all", ...Object.keys(APP_STATUS_LABELS)] as const).map(s => {
              const count = s === "all" ? applications.length : applications.filter(a => a.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setAppFilter(s as ApplicationStatus | "all")}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border font-medium transition-all",
                    appFilter === s
                      ? s === "all" ? "bg-foreground text-background border-foreground" : APP_STATUS_COLORS[s as ApplicationStatus]
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {s === "all" ? "All" : APP_STATUS_LABELS[s as ApplicationStatus]} {count > 0 && <span className="ml-0.5 opacity-70">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {applications.length === 0 ? "No applications yet." : "No applications in this stage."}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredApps.map(app => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors text-left group"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {app.givenName[0]}{app.familyName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{app.givenName} {app.familyName}</p>
                    {app.cvFileName && <span title="CV attached"><Paperclip className="h-3 w-3 text-muted-foreground shrink-0" /></span>}
                    {app.interviewNotes && <span title="Has interview notes"><MessageSquare className="h-3 w-3 text-muted-foreground shrink-0" /></span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{app.email} · Applied {new Date(app.submittedAt).toLocaleDateString("en-GB")}</p>
                </div>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border shrink-0", APP_STATUS_COLORS[app.status])}>
                  {APP_STATUS_LABELS[app.status]}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedApp && (
        <ApplicationDetail
          app={{ ...selectedApp, ...applications.find(a => a.id === selectedApp.id) }}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RecruitmentPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>(INITIAL_VACANCIES);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [showAddVacancy, setShowAddVacancy] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VacancyStatus | "all">("all");

  const filtered = vacancies.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase()) ||
      v.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddVacancy = (v: Vacancy) => setVacancies(prev => [v, ...prev]);

  const handleSubmitApplication = (app: Application) => {
    setApplications(prev => [app, ...prev]);
    setVacancies(prev => prev.map(v => v.id === app.vacancyId ? { ...v, applicationCount: v.applicationCount + 1 } : v));
  };

  const handleUpdateApp = (appId: string, changes: Partial<Application>) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, ...changes } : a));
  };

  const vacancyApplications = selectedVacancy
    ? applications.filter(a => a.vacancyId === selectedVacancy.id)
    : [];

  if (selectedVacancy) {
    return (
      <div className="space-y-6 animate-fade-in">
        <VacancyDetail
          vacancy={selectedVacancy}
          applications={vacancyApplications}
          onBack={() => setSelectedVacancy(null)}
          onApply={() => setShowApply(true)}
          onUpdateApp={handleUpdateApp}
        />
        {showApply && (
          <ApplyModal
            vacancy={selectedVacancy}
            onClose={() => setShowApply(false)}
            onSubmit={handleSubmitApplication}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruitment</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage vacancies and candidate applications</p>
        </div>
        <Button onClick={() => setShowAddVacancy(true)}>
          <Plus className="h-4 w-4 mr-1" /> Post Vacancy
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Open Vacancies</p>
          <p className="text-2xl font-bold">{vacancies.filter(v => v.status === "open").length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Applications</p>
          <p className="text-2xl font-bold">{applications.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">In Pipeline</p>
          <p className="text-2xl font-bold">{applications.filter(a => a.status === "shortlisted" || a.status === "interview" || a.status === "offered").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search vacancies…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {(["all", "open", "draft", "closed"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium transition-all",
                statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Vacancy list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No vacancies found</p>
            <p className="text-sm mt-1">Post your first vacancy to get started</p>
          </div>
        )}
        {filtered.map(v => {
          const appCount = applications.filter(a => a.vacancyId === v.id).length;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVacancy(v)}
              className="w-full rounded-xl border bg-card p-5 text-left hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base">{v.title}</h3>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border",
                      v.status === "open" ? "bg-success/10 text-success border-success/20"
                      : v.status === "draft" ? "bg-muted text-muted-foreground border-border"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                      {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{v.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{CONTRACT_LABELS[v.contractType]}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{v.department}</span>
                    {v.salaryFrom > 0 && <span>£{v.salaryFrom.toLocaleString()} – £{v.salaryTo.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold">{appCount}</p>
                    <p className="text-xs text-muted-foreground">applicant{appCount !== 1 ? "s" : ""}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              {v.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{v.description}</p>
              )}
            </button>
          );
        })}
      </div>

      {showAddVacancy && (
        <AddVacancyModal onClose={() => setShowAddVacancy(false)} onAdd={handleAddVacancy} />
      )}
    </div>
  );
}
