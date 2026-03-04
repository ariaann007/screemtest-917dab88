import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ChevronRight, ChevronLeft, FileText, User, Briefcase, PoundSterling, BookOpen, Upload } from "lucide-react";
import { DEMO_COUNTRIES, DEMO_SOC_CODES, DEMO_WORK_LOCATIONS } from "@/data/demo";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "path", label: "Choose Path", icon: FileText },
  { id: "route", label: "Route & Category", icon: BookOpen },
  { id: "personal", label: "Personal Info", icon: User },
  { id: "employment", label: "Employment", icon: Briefcase },
  { id: "salary", label: "Salary & Role", icon: PoundSterling },
  { id: "phd", label: "PhD / STEM", icon: BookOpen },
  { id: "invoice", label: "Invoice", icon: PoundSterling },
];

const ROUTE_OPTIONS = ["Skilled Worker", "Specialist Worker", "Global Business Mobility"];
const CATEGORY_OPTIONS = [
  "Skilled Worker switching immigration category, ISC liable",
  "Skilled Worker switching immigration category, ISC exempt",
  "Skilled Worker extension, ISC exempt",
  "Skilled Worker extension, ISC liable",
  "Skilled Worker change of employment, ISC exempt",
  "Skilled Worker change of employment, ISC liable",
  "Skilled Worker student course complete switching to Skilled Worker",
];
const SALARY_PERIODS = ["hour", "day", "week", "month", "year"];

interface CosWizardProps {
  onComplete: () => void;
}

export default function CosWizard({ onComplete }: CosWizardProps) {
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<"client" | "assisted" | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    route: "", category: "",
    familyName: "", givenName: "", otherNames: "",
    nationality: "", dob: "", countryOfBirth: "", placeOfBirth: "",
    countryOfResidence: "", passportNumber: "", passportIssue: "", passportExpiry: "",
    placeOfIssue: "", address1: "", address2: "", city: "", county: "", postcode: "", country: "",
    ukIdCard: "", niNumber: "", nationalId: "", employeeNumber: "",
    startDate: "", endDate: "", weeklyHours: "", workLocation: "", otherLocations: [],
    jobTitle: "", socCode: "", jobDescription: "",
    grossSalary: "", salaryPeriod: "year", registrationDetails: "", requiresEta: "",
    hasPhd: "", phdRelevant: "", phdExplanation: "", ecctisRef: "", isStem: "", stemExplanation: "",
    assistedName: "", assistedPhone: "", assistedEmail: "", assistedNotes: "",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // Invoice calc
  const startD = form.startDate ? new Date(form.startDate) : null;
  const endD = form.endDate ? new Date(form.endDate) : null;
  const yearsOfCos = startD && endD
    ? Math.ceil((endD.getTime() - startD.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  const isIscLiable = form.category.includes("ISC liable");
  const isAssisted = path === "assisted";
  const cosFee = 525;
  const iscFee = isIscLiable ? yearsOfCos * 480 : 0;
  const serviceFee = isAssisted ? 600 : 0;
  const total = cosFee + iscFee + serviceFee;

  const totalSteps = path === "assisted" ? 3 : STEPS.length;

  const StepIndicator = () => (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
      {STEPS.slice(0, path === "assisted" ? 3 : STEPS.length).map((s, i) => (
        <div key={s.id} className="flex items-center gap-1 shrink-0">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            i === step ? "bg-primary text-primary-foreground" :
            i < step ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
          )}>
            {i < step ? <CheckCircle2 className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
            {s.label}
          </div>
          {i < (path === "assisted" ? 2 : STEPS.length - 1) && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      ))}
    </div>
  );

  const NavButtons = ({ canNext = true }: { canNext?: boolean }) => (
    <div className="flex items-center justify-between pt-4 border-t mt-6">
      <Button variant="outline" onClick={() => step > 0 ? setStep(s => s - 1) : onComplete()}>
        <ChevronLeft className="h-4 w-4 mr-1" /> {step === 0 ? "Cancel" : "Back"}
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setSaved(true)}>
          {saved ? <><CheckCircle2 className="h-4 w-4 mr-1 text-success" />Saved</> : "Save Draft"}
        </Button>
        <Button onClick={() => {
          if (step < (path === "assisted" ? 2 : STEPS.length - 1)) setStep(s => s + 1);
          else onComplete();
        }} disabled={!canNext}>
          {step < (path === "assisted" ? 2 : STEPS.length - 1) ? <><span>Next</span><ChevronRight className="h-4 w-4 ml-1" /></> : "Submit for Review"}
        </Button>
      </div>
    </div>
  );

  const SearchableSelect = ({ value, onChange, options, placeholder }: {
    value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string;
  }) => {
    const [q, setQ] = useState("");
    const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())).slice(0, 20);
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          <div className="p-2"><Input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} className="h-7 text-xs" /></div>
          {filtered.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  };

  // Step 0: choose path
  if (step === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">New CoS Draft Case</h1>
        <p className="text-muted-foreground text-sm mb-6">Choose how you'd like to prepare the Certificate of Sponsorship pre-draft.</p>
        <StepIndicator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => { setPath("client"); setStep(1); }}
            className={cn(
              "rounded-xl border-2 p-5 text-left hover:border-primary hover:bg-primary/5 transition-colors",
              path === "client" ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Option 1: Client Prepares</h3>
            <p className="text-sm text-muted-foreground">You complete the full CoS pre-draft form. Denizns will review and approve.</p>
            <div className="mt-3 text-xs font-medium text-secondary">£525 CoS fee + ISC</div>
          </button>
          <button
            onClick={() => { setPath("assisted"); setStep(1); }}
            className={cn(
              "rounded-xl border-2 p-5 text-left hover:border-secondary hover:bg-secondary/5 transition-colors",
              path === "assisted" ? "border-secondary bg-secondary/5" : "border-border"
            )}
          >
            <div className="h-9 w-9 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
              <FileText className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="font-semibold mb-1">Option 2: Denizns Prepares</h3>
            <p className="text-sm text-muted-foreground">Provide minimal info and upload the offer letter. Denizns prepares the full draft.</p>
            <div className="mt-3 text-xs font-medium text-secondary">£525 CoS fee + ISC + £600 service fee</div>
          </button>
        </div>
        <div className="flex justify-end pt-6 border-t mt-6">
          <Button variant="outline" onClick={onComplete}><ChevronLeft className="h-4 w-4 mr-1" />Cancel</Button>
        </div>
      </div>
    );
  }

  // Assisted path (Steps 1-2)
  if (path === "assisted") {
    if (step === 1) {
      return (
        <div className="max-w-2xl">
          <h1 className="text-xl font-bold mb-1">CoS Request (Assisted)</h1>
          <StepIndicator />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Candidate Name *</Label><Input value={form.assistedName} onChange={e => update("assistedName", e.target.value)} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={form.assistedPhone} onChange={e => update("assistedPhone", e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={form.assistedEmail} onChange={e => update("assistedEmail", e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Signed Offer Letter *</Label>
              <div className="mt-1 border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground">PDF, DOC up to 10MB</p>
              </div>
            </div>
            <div><Label>Notes (optional)</Label><Textarea value={form.assistedNotes} onChange={e => update("assistedNotes", e.target.value)} className="mt-1" rows={3} /></div>
          </div>
          <NavButtons canNext={!!form.assistedName} />
        </div>
      );
    }
    // step 2 = invoice
    step === 2 && null;
  }

  // Full form path
  if (step === 1) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">Route & Category</h1>
        <StepIndicator />
        <div className="space-y-4">
          <div>
            <Label>Route Type *</Label>
            <Select value={form.route} onValueChange={v => update("route", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select route…" /></SelectTrigger>
              <SelectContent>{ROUTE_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={v => update("category", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select category…" /></SelectTrigger>
              <SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {form.category && (
            <div className={cn("rounded-lg p-3 text-sm", form.category.includes("ISC liable") ? "bg-warning-light text-warning" : "bg-success-light text-success")}>
              {form.category.includes("ISC liable") ? "⚠ ISC liable – Immigration Skills Charge will apply" : "✓ ISC exempt – No Immigration Skills Charge"}
            </div>
          )}
        </div>
        <NavButtons canNext={!!(form.route && form.category)} />
      </div>
    );
  }

  if (step === 2) {
    const countries = DEMO_COUNTRIES.map(c => ({ value: c.name, label: c.name }));
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">Candidate Personal Information</h1>
        <StepIndicator />
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Family Name *</Label><Input value={form.familyName} onChange={e => update("familyName", e.target.value)} className="mt-1" /></div>
            <div><Label>Given Name *</Label><Input value={form.givenName} onChange={e => update("givenName", e.target.value)} className="mt-1" /></div>
            <div><Label>Other Names</Label><Input value={form.otherNames} onChange={e => update("otherNames", e.target.value)} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nationality *</Label><div className="mt-1"><SearchableSelect value={form.nationality} onChange={v => update("nationality", v)} options={countries} placeholder="Select country…" /></div></div>
            <div><Label>Date of Birth *</Label><Input type="date" value={form.dob} onChange={e => update("dob", e.target.value)} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Country of Birth</Label><div className="mt-1"><SearchableSelect value={form.countryOfBirth} onChange={v => update("countryOfBirth", v)} options={countries} placeholder="Select…" /></div></div>
            <div><Label>Place of Birth</Label><Input value={form.placeOfBirth} onChange={e => update("placeOfBirth", e.target.value)} className="mt-1" /></div>
          </div>
          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-3">Passport Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Passport Number *</Label><Input value={form.passportNumber} onChange={e => update("passportNumber", e.target.value)} className="mt-1" /></div>
              <div><Label>Country of Residence</Label><div className="mt-1"><SearchableSelect value={form.countryOfResidence} onChange={v => update("countryOfResidence", v)} options={countries} placeholder="Select…" /></div></div>
              <div><Label>Issue Date</Label><Input type="date" value={form.passportIssue} onChange={e => update("passportIssue", e.target.value)} className="mt-1" /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.passportExpiry} onChange={e => update("passportExpiry", e.target.value)} className="mt-1" /></div>
            </div>
          </div>
          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-3">Current Home Address</p>
            <div className="space-y-2">
              <Input placeholder="Address line 1" value={form.address1} onChange={e => update("address1", e.target.value)} />
              <Input placeholder="Address line 2" value={form.address2} onChange={e => update("address2", e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="City/Town" value={form.city} onChange={e => update("city", e.target.value)} />
                <Input placeholder="County" value={form.county} onChange={e => update("county", e.target.value)} />
                <Input placeholder="Postcode" value={form.postcode} onChange={e => update("postcode", e.target.value)} />
              </div>
              <SearchableSelect value={form.country} onChange={v => update("country", v)} options={countries} placeholder="Country…" />
            </div>
          </div>
          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-3">Identification Numbers (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>NI Number</Label><Input value={form.niNumber} onChange={e => update("niNumber", e.target.value)} className="mt-1" /></div>
              <div><Label>Employee Number</Label><Input value={form.employeeNumber} onChange={e => update("employeeNumber", e.target.value)} className="mt-1" /></div>
            </div>
          </div>
        </div>
        <NavButtons canNext={!!(form.familyName && form.givenName && form.nationality && form.dob)} />
      </div>
    );
  }

  if (step === 3) {
    const locations = DEMO_WORK_LOCATIONS.map(l => ({ value: l.id, label: l.name }));
    const socs = DEMO_SOC_CODES.map(s => ({ value: s.code, label: `${s.code} – ${s.title}` }));
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">Work & Employment Details</h1>
        <StepIndicator />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start Date *</Label><Input type="date" value={form.startDate} onChange={e => update("startDate", e.target.value)} className="mt-1" /></div>
            <div><Label>End Date *</Label><Input type="date" value={form.endDate} onChange={e => update("endDate", e.target.value)} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Weekly Hours *</Label><Input type="number" value={form.weeklyHours} onChange={e => update("weeklyHours", e.target.value)} className="mt-1" /></div>
            <div><Label>Job Title *</Label><Input value={form.jobTitle} onChange={e => update("jobTitle", e.target.value)} className="mt-1" /></div>
          </div>
          <div>
            <Label>Work Location *</Label>
            <div className="mt-1"><SearchableSelect value={form.workLocation} onChange={v => update("workLocation", v)} options={locations} placeholder="Select primary location…" /></div>
          </div>
          <div>
            <Label>SOC Code *</Label>
            <div className="mt-1"><SearchableSelect value={form.socCode} onChange={v => update("socCode", v)} options={socs} placeholder="Search SOC codes…" /></div>
          </div>
          <div>
            <Label>Job Description (max 1000 chars)</Label>
            <Textarea value={form.jobDescription} onChange={e => update("jobDescription", e.target.value.slice(0, 1000))} className="mt-1" rows={4} />
            <p className="text-xs text-muted-foreground mt-1">{form.jobDescription.length}/1000</p>
          </div>
          <div>
            <Label>Going rate route confirmed?</Label>
            <Select value={form.requiresEta} onValueChange={v => update("requiresEta", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <NavButtons canNext={!!(form.startDate && form.endDate && form.jobTitle && form.socCode)} />
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">Salary & Role Requirements</h1>
        <StepIndicator />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Gross Salary *</Label><div className="mt-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span><Input type="number" className="pl-6" value={form.grossSalary} onChange={e => update("grossSalary", e.target.value)} /></div></div>
            <div><Label>Salary Period</Label>
              <Select value={form.salaryPeriod} onValueChange={v => update("salaryPeriod", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{SALARY_PERIODS.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Registration Details Required (optional)</Label><Input value={form.registrationDetails} onChange={e => update("registrationDetails", e.target.value)} className="mt-1" placeholder="e.g. NMC pin" /></div>
          <div>
            <Label>Worker requires ETA certificate?</Label>
            <Select value={form.requiresEta} onValueChange={v => update("requiresEta", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <NavButtons canNext={!!form.grossSalary} />
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">PhD / STEM Details</h1>
        <StepIndicator />
        <div className="space-y-4">
          <div>
            <Label>Does the candidate hold a PhD?</Label>
            <Select value={form.hasPhd} onValueChange={v => update("hasPhd", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
            </Select>
          </div>
          {form.hasPhd === "yes" && (
            <>
              <div>
                <Label>Is the PhD relevant to the role?</Label>
                <Select value={form.phdRelevant} onValueChange={v => update("phdRelevant", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Explanation</Label><Textarea value={form.phdExplanation} onChange={e => update("phdExplanation", e.target.value.slice(0, 1000))} className="mt-1" rows={3} /></div>
              <div><Label>ECCTIS Reference (if overseas PhD)</Label><Input value={form.ecctisRef} onChange={e => update("ecctisRef", e.target.value)} className="mt-1" /></div>
              <div>
                <Label>Is the PhD in a STEM subject?</Label>
                <Select value={form.isStem} onValueChange={v => update("isStem", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                </Select>
              </div>
              {form.isStem === "yes" && (
                <div><Label>STEM Explanation</Label><Textarea value={form.stemExplanation} onChange={e => update("stemExplanation", e.target.value.slice(0, 1000))} className="mt-1" rows={3} /></div>
              )}
            </>
          )}
          {form.hasPhd === "no" && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">No PhD details required. Proceed to the invoice step.</div>
          )}
        </div>
        <NavButtons />
      </div>
    );
  }

  // Invoice step
  if (step === 6 || (path === "assisted" && step === 2)) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">Invoice Summary</h1>
        <p className="text-sm text-muted-foreground mb-4">Review fees before submitting to Denizns</p>
        <StepIndicator />
        <div className="rounded-xl border bg-card overflow-hidden mb-4">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">Fee Breakdown</h3>
          </div>
          <div className="divide-y">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">Certificate of Sponsorship Fee</p>
                <p className="text-xs text-muted-foreground">Fixed statutory fee</p>
              </div>
              <p className="font-bold">£{cosFee.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">Immigration Skills Charge</p>
                <p className="text-xs text-muted-foreground">
                  {isIscLiable ? `£480 × ${yearsOfCos} year${yearsOfCos !== 1 ? "s" : ""}` : "ISC Exempt"}
                </p>
              </div>
              <p className={cn("font-bold", !isIscLiable && "text-success")}>
                {isIscLiable ? `£${iscFee.toLocaleString()}` : "£0"}
              </p>
            </div>
            {isAssisted && (
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">Denizns Service Fee</p>
                  <p className="text-xs text-muted-foreground">Assisted CoS preparation</p>
                </div>
                <p className="font-bold">£{serviceFee.toLocaleString()}</p>
              </div>
            )}
            <div className="flex items-center justify-between p-4 bg-primary/5">
              <p className="font-bold">Total</p>
              <p className="text-xl font-bold text-primary">£{total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-warning-light border border-warning/20 p-3 text-sm text-warning mb-4">
          ⚠ Payment is required before this case will be reviewed by Denizns.
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button className="flex-1" onClick={onComplete}>
            Submit Case & Generate Invoice
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
