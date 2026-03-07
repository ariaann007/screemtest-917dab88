import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ChevronRight, ChevronLeft, FileText, User, Briefcase, PoundSterling, BookOpen, Upload, AlertTriangle, CreditCard, Receipt } from "lucide-react";
import { DEMO_COUNTRIES, DEMO_SOC_CODES, DEMO_WORK_LOCATIONS, DEMO_SOC_GOING_RATES } from "@/data/demo";
import { COUNTRIES } from "@/data/countries";
import { useApp } from "@/context/AppContext";
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
  const { currentUser } = useApp();
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<"client" | "assisted" | null>(null);
  const [saved, setSaved] = useState(false);
  const [salaryOverride, setSalaryOverride] = useState(false);

  const [form, setForm] = useState({
    route: "", category: "",
    familyName: "", givenName: "", otherNames: "", sex: "",
    nationality: "", dob: "", countryOfBirth: "", placeOfBirth: "",
    countryOfResidence: "", passportNumber: "", passportIssue: "", passportExpiry: "",
    passportPlaceOfIssue: "",
    placeOfIssue: "", address1: "", address2: "", city: "", county: "", postcode: "", country: "",
    ukIdCard: "", niNumber: "", nationalId: "", employeeNumber: "",
    startDate: "", endDate: "", weeklyHours: "", workLocation: "", otherLocations: [],
    jobTitle: "", socCode: "", jobDescription: "",
    grossSalary: "", salaryPeriod: "year", registrationDetails: "", requiresEta: "",
    hasPhd: "", phdRelevant: "", phdExplanation: "", ecctisRef: "", isStem: "", stemExplanation: "",
    assistedName: "", assistedPhone: "", assistedEmail: "", assistedNotes: "",
    assistedHours: "", assistedPayRate: "", assistedJobTitle: "", assistedStartDate: "", assistedEndDate: "",
  });
  const [paymentChoice, setPaymentChoice] = useState<"now" | "later" | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

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
    <nav aria-label="Progress" className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 no-scrollbar">
      {STEPS.slice(0, path === "assisted" ? 3 : STEPS.length).map((s, i) => {
        const isCurrent = i === step;
        const isCompleted = i < step;
        const isDisabled = i > step;

        return (
          <div key={s.id} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => isCompleted && setStep(i)}
              disabled={isDisabled || isCurrent}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${s.label}`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isCurrent ? "bg-primary text-primary-foreground shadow-sm scale-105" :
                isCompleted ? "bg-success/10 text-success hover:bg-success/20 cursor-pointer" : 
                "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
              )}
            >
              {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className={cn("h-3.5 w-3.5", isCurrent && "animate-pulse")} />}
              <span>{s.label}</span>
            </button>
            {i < (path === "assisted" ? 2 : (path === "client" ? STEPS.length - 1 : 0)) && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/50 mx-0.5" />
            )}
          </div>
        );
      })}
    </nav>
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

  const SearchableSelect = ({ value, onChange, options, placeholder, id }: {
    value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string; id?: string;
  }) => {
    const [q, setQ] = useState("");
    const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}><SelectValue placeholder={placeholder} /></SelectTrigger>
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
            <p className="text-sm text-muted-foreground">You complete the full CoS pre-draft form. Screem will review and approve.</p>
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
            <h3 className="font-semibold mb-1">Option 2: Screem Caseworker Prepares</h3>
            <p className="text-sm text-muted-foreground">Provide minimal info and upload the offer letter. Screem Caseworker prepares the full draft.</p>
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
          <h1 className="text-xl font-bold mb-1">CoS Request (Screem Caseworker Prepares)</h1>
          <p className="text-sm text-muted-foreground mb-6">Provide the candidate and employment details. Our team will handle the full UKVI pre-draft.</p>
          <StepIndicator />
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="assistedName">Candidate Name *</Label><Input id="assistedName" value={form.assistedName} onChange={e => update("assistedName", e.target.value)} className="mt-1" placeholder="Full name as on passport" /></div>
              <div><Label htmlFor="assistedJobTitle">Job Title *</Label><Input id="assistedJobTitle" value={form.assistedJobTitle} onChange={e => update("assistedJobTitle", e.target.value)} className="mt-1" placeholder="e.g. Senior Care Worker" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="assistedPhone">Phone Number *</Label><Input id="assistedPhone" value={form.assistedPhone} onChange={e => update("assistedPhone", e.target.value)} className="mt-1" /></div>
              <div><Label htmlFor="assistedEmail">Email Address *</Label><Input id="assistedEmail" type="email" value={form.assistedEmail} onChange={e => update("assistedEmail", e.target.value)} className="mt-1" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="assistedHours">Number of Hours *</Label><Input id="assistedHours" type="number" value={form.assistedHours} onChange={e => update("assistedHours", e.target.value)} className="mt-1" placeholder="Weekly hours" /></div>
              <div><Label htmlFor="assistedPayRate">Pay Rate *</Label><div className="mt-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span><Input id="assistedPayRate" type="number" className="pl-6" value={form.assistedPayRate} onChange={e => update("assistedPayRate", e.target.value)} placeholder="0.00" /></div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="assistedStartDate">Start Date of Employment *</Label><Input id="assistedStartDate" type="date" value={form.assistedStartDate} onChange={e => update("assistedStartDate", e.target.value)} className="mt-1" /></div>
              <div><Label htmlFor="assistedEndDate">End Date of Employment *</Label><Input id="assistedEndDate" type="date" value={form.assistedEndDate} onChange={e => update("assistedEndDate", e.target.value)} className="mt-1" /></div>
            </div>

            <div>
              <Label>Signed Offer Letter *</Label>
              <p className="text-xs text-muted-foreground mb-2">Must include job title, hours, and pay rate.</p>
              <div tabIndex={0} role="button" aria-label="Upload offer letter" className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                <p className="text-sm font-medium">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground">PDF, DOC up to 10MB</p>
              </div>
            </div>
            <div><Label htmlFor="assistedNotes">Additional Notes (optional)</Label><Textarea id="assistedNotes" value={form.assistedNotes} onChange={e => update("assistedNotes", e.target.value)} className="mt-1" rows={3} placeholder="Any specific requirements or instructions for the caseworker..." /></div>
          </div>
          <NavButtons canNext={!!(form.assistedName && form.assistedJobTitle && form.assistedPhone && form.assistedEmail && form.assistedHours && form.assistedPayRate && form.assistedStartDate && form.assistedEndDate)} />
        </div>
      );
    }
    // step 2 = invoice (falls through to invoice block below)
  }

  // Full form path
  if (step === 1) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">Route & Category</h1>
        <StepIndicator />
        <div className="space-y-4">
          <div>
            <Label htmlFor="routeType">Route Type *</Label>
            <Select value={form.route} onValueChange={v => update("route", v)}>
              <SelectTrigger id="routeType" className="mt-1"><SelectValue placeholder="Select route…" /></SelectTrigger>
              <SelectContent>{ROUTE_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="categoryType">Category *</Label>
            <Select value={form.category} onValueChange={v => update("category", v)}>
              <SelectTrigger id="categoryType" className="mt-1"><SelectValue placeholder="Select category…" /></SelectTrigger>
              <SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {form.category && (
            <div role="alert" className={cn("rounded-lg p-3 text-sm", form.category.includes("ISC liable") ? "bg-warning-light text-warning" : "bg-success-light text-success")}>
              {form.category.includes("ISC liable") ? "⚠ ISC liable – Immigration Skills Charge will apply" : "✓ ISC exempt – No Immigration Skills Charge"}
            </div>
          )}
        </div>
        <NavButtons canNext={!!(form.route && form.category)} />
      </div>
    );
  }

  if (step === 2) {
    const countries = COUNTRIES.map(c => ({ value: c.name, label: c.name }));
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">Candidate Personal Information</h1>
        <StepIndicator />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><Label htmlFor="familyName">Family Name *</Label><Input id="familyName" value={form.familyName} onChange={e => update("familyName", e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="givenName">Given Name(s) *</Label><Input id="givenName" value={form.givenName} onChange={e => update("givenName", e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="otherNames">Other Names</Label><Input id="otherNames" value={form.otherNames} onChange={e => update("otherNames", e.target.value)} className="mt-1" /></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sex">Sex of Worker *</Label>
              <Select value={form.sex} onValueChange={v => update("sex", v)}>
                <SelectTrigger id="sex" className="mt-1"><SelectValue placeholder="Select sex..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="dob">Date of Birth *</Label><Input id="dob" type="date" value={form.dob} onChange={e => update("dob", e.target.value)} className="mt-1" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nationality">Nationality *</Label>
              <div className="mt-1"><SearchableSelect id="nationality" value={form.nationality} onChange={v => update("nationality", v)} options={countries} placeholder="Search countries..." /></div>
            </div>
            <div>
              <Label htmlFor="countryOfBirth">Country of Birth *</Label>
              <div className="mt-1"><SearchableSelect id="countryOfBirth" value={form.countryOfBirth} onChange={v => update("countryOfBirth", v)} options={countries} placeholder="Search countries..." /></div>
            </div>
          </div>
          <div><Label htmlFor="placeOfBirth">Place of Birth *</Label><Input id="placeOfBirth" value={form.placeOfBirth} onChange={e => update("placeOfBirth", e.target.value)} className="mt-1" /></div>

          <div className="border-t pt-3 mt-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" />Passport Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><Label htmlFor="passportNumber">Passport Number *</Label><Input id="passportNumber" value={form.passportNumber} onChange={e => update("passportNumber", e.target.value)} className="mt-1" /></div>
              <div>
                <Label htmlFor="countryOfResidence">Country of Residence *</Label>
                <div className="mt-1"><SearchableSelect id="countryOfResidence" value={form.countryOfResidence} onChange={v => update("countryOfResidence", v)} options={countries} placeholder="Search countries..." /></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label htmlFor="passportPlaceOfIssue">Place of Issue *</Label><Input id="passportPlaceOfIssue" value={form.passportPlaceOfIssue} onChange={e => update("passportPlaceOfIssue", e.target.value)} className="mt-1" placeholder="e.g. London" /></div>
              <div><Label htmlFor="passportIssue">Issue Date *</Label><Input id="passportIssue" type="date" value={form.passportIssue} onChange={e => update("passportIssue", e.target.value)} className="mt-1" /></div>
              <div><Label htmlFor="passportExpiry">Expiry Date *</Label><Input id="passportExpiry" type="date" value={form.passportExpiry} onChange={e => update("passportExpiry", e.target.value)} className="mt-1" /></div>
            </div>
          </div>

          <div className="border-t pt-3 mt-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><User className="h-4 w-4" />Current Home Address</p>
            <div className="space-y-2">
              <Input id="address1" placeholder="Address line 1 *" value={form.address1} onChange={e => update("address1", e.target.value)} aria-label="Address line 1" />
              <Input id="address2" placeholder="Address line 2" value={form.address2} onChange={e => update("address2", e.target.value)} aria-label="Address line 2" />
              <div className="grid grid-cols-3 gap-2">
                <Input id="city" placeholder="City/Town *" value={form.city} onChange={e => update("city", e.target.value)} aria-label="City" />
                <Input id="county" placeholder="County" value={form.county} onChange={e => update("county", e.target.value)} aria-label="County" />
                <Input id="postcode" placeholder="Postcode *" value={form.postcode} onChange={e => update("postcode", e.target.value)} aria-label="Postcode" />
              </div>
              <SearchableSelect id="homeCountry" value={form.country} onChange={v => update("country", v)} options={countries} placeholder="Country *" />
            </div>
          </div>
          <div className="border-t pt-3 mt-4">
            <p className="text-sm font-semibold mb-3">Identification Numbers (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="niNumber">NI Number</Label><Input id="niNumber" value={form.niNumber} onChange={e => update("niNumber", e.target.value)} className="mt-1" /></div>
              <div><Label htmlFor="employeeNumber">Employee Number</Label><Input id="employeeNumber" value={form.employeeNumber} onChange={e => update("employeeNumber", e.target.value)} className="mt-1" /></div>
            </div>
          </div>
        </div>
        <NavButtons canNext={!!(form.familyName && form.givenName && form.sex && form.dob && form.nationality && form.passportNumber && form.countryOfResidence && form.passportPlaceOfIssue && form.passportIssue && form.passportExpiry && form.address1 && form.city && form.postcode && form.country)} />
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
            <div><Label htmlFor="startDate">Start Date *</Label><Input id="startDate" type="date" value={form.startDate} onChange={e => update("startDate", e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="endDate">End Date *</Label><Input id="endDate" type="date" value={form.endDate} onChange={e => update("endDate", e.target.value)} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="weeklyHours">Weekly Hours *</Label><Input id="weeklyHours" type="number" value={form.weeklyHours} onChange={e => update("weeklyHours", e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="jobTitle">Job Title *</Label><Input id="jobTitle" value={form.jobTitle} onChange={e => update("jobTitle", e.target.value)} className="mt-1" /></div>
          </div>
          <div>
            <Label htmlFor="workLocation">Work Location *</Label>
            <div className="mt-1"><SearchableSelect id="workLocation" value={form.workLocation} onChange={v => update("workLocation", v)} options={locations} placeholder="Select primary location…" /></div>
          </div>
          <div>
            <Label htmlFor="socCode">SOC Code *</Label>
            <div className="mt-1"><SearchableSelect id="socCode" value={form.socCode} onChange={v => update("socCode", v)} options={socs} placeholder="Search SOC codes…" /></div>
          </div>
          <div>
            <Label htmlFor="jobDescription">Job Description (max 1000 chars)</Label>
            <div className="mt-1">
              <Textarea id="jobDescription" value={form.jobDescription} onChange={e => update("jobDescription", e.target.value.slice(0, 1000))} rows={4} />
              <p className="text-xs text-muted-foreground mt-1">{form.jobDescription.length}/1000</p>
            </div>
          </div>
          <div>
            <Label htmlFor="requiresEta">Going rate route confirmed?</Label>
            <Select value={form.requiresEta} onValueChange={v => update("requiresEta", v)}>
              <SelectTrigger id="requiresEta" className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <NavButtons canNext={!!(form.startDate && form.endDate && form.jobTitle && form.socCode)} />
      </div>
    );
  }

  if (step === 4) {
    // Salary going-rate check
    const goingRate = DEMO_SOC_GOING_RATES.find(r => r.socCode === form.socCode);
    const grossNum = parseFloat(form.grossSalary) || 0;
    const annualSalary = form.salaryPeriod === "year" ? grossNum :
      form.salaryPeriod === "month" ? grossNum * 12 :
      form.salaryPeriod === "week" ? grossNum * 52 :
      form.salaryPeriod === "hour" ? grossNum * (parseFloat(form.weeklyHours) || 37.5) * 52 : grossNum;
    const belowGoingRate = goingRate && annualSalary > 0 && annualSalary < goingRate.minAnnualSalary;
    const isManager = currentUser?.role === "denizns_manager" || currentUser?.role === "super_admin";
    const salaryOk = !belowGoingRate || (isManager && salaryOverride);

    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">Salary & Role Requirements</h1>
        <StepIndicator />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="grossSalary">Gross Salary *</Label><div className="mt-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span><Input id="grossSalary" type="number" className="pl-6" value={form.grossSalary} onChange={e => update("grossSalary", e.target.value)} /></div></div>
            <div>
              <Label htmlFor="salaryPeriod">Salary Period</Label>
              <Select value={form.salaryPeriod} onValueChange={v => update("salaryPeriod", v)}>
                <SelectTrigger id="salaryPeriod" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{SALARY_PERIODS.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Going rate feedback */}
          {goingRate && annualSalary > 0 && (
            <div className={cn("rounded-lg p-3 text-sm flex items-start gap-2",
              belowGoingRate ? "bg-destructive/10 border border-destructive/30 text-destructive" : "bg-success/10 border border-success/30 text-success"
            )}>
              {belowGoingRate ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
              <div>
                <p className="font-medium">
                  {belowGoingRate
                    ? `Salary below SOC going rate — £${goingRate.minAnnualSalary.toLocaleString()}/yr required for ${goingRate.title} (${form.socCode})`
                    : `Salary meets SOC going rate for ${goingRate.title} (${form.socCode})`
                  }
                </p>
                {belowGoingRate && annualSalary > 0 && (
                  <p className="text-xs mt-0.5">Entered: £{Math.round(annualSalary).toLocaleString()}/yr · Shortfall: £{(goingRate.minAnnualSalary - Math.round(annualSalary)).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}

          {/* Manager override */}
          {belowGoingRate && isManager && (
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              <input type="checkbox" id="override" checked={salaryOverride} onChange={e => setSalaryOverride(e.target.checked)} className="rounded" />
              <label htmlFor="override" className="cursor-pointer font-medium">Manager override: proceed despite below going rate (will be recorded in audit log)</label>
            </div>
          )}

          <div><Label htmlFor="registrationDetails">Registration Details Required (optional)</Label><Input id="registrationDetails" value={form.registrationDetails} onChange={e => update("registrationDetails", e.target.value)} className="mt-1" placeholder="e.g. NMC pin" /></div>
          <div>
            <Label htmlFor="requiresEtaWorker">Worker requires ETA certificate?</Label>
            <Select value={form.requiresEta} onValueChange={v => update("requiresEta", v)}>
              <SelectTrigger id="requiresEtaWorker" className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <NavButtons canNext={!!(form.grossSalary && salaryOk)} />
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
            <Label htmlFor="hasPhd">Does the candidate hold a PhD?</Label>
            <Select value={form.hasPhd} onValueChange={v => update("hasPhd", v)}>
              <SelectTrigger id="hasPhd" className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
            </Select>
          </div>
          {form.hasPhd === "yes" && (
            <>
              <div>
                <Label htmlFor="phdRelevant">Is the PhD relevant to the role?</Label>
                <Select value={form.phdRelevant} onValueChange={v => update("phdRelevant", v)}>
                  <SelectTrigger id="phdRelevant" className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="phdExplanation">Explanation</Label><Textarea id="phdExplanation" value={form.phdExplanation} onChange={e => update("phdExplanation", e.target.value.slice(0, 1000))} className="mt-1" rows={3} /></div>
              <div><Label htmlFor="ecctisRef">ECCTIS Reference (if overseas PhD)</Label><Input id="ecctisRef" value={form.ecctisRef} onChange={e => update("ecctisRef", e.target.value)} className="mt-1" /></div>
              <div>
                <Label htmlFor="isStem">Is the PhD in a STEM subject?</Label>
                <Select value={form.isStem} onValueChange={v => update("isStem", v)}>
                  <SelectTrigger id="isStem" className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                </Select>
              </div>
              {form.isStem === "yes" && (
                <div><Label htmlFor="stemExplanation">STEM Explanation</Label><Textarea id="stemExplanation" value={form.stemExplanation} onChange={e => update("stemExplanation", e.target.value.slice(0, 1000))} className="mt-1" rows={3} /></div>
              )}
            </>
          )}
          {form.hasPhd === "no" && (
            <div role="status" className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">No PhD details required. Proceed to the invoice step.</div>
          )}
        </div>
        <NavButtons />
      </div>
    );
  }

  // Invoice step
  if (step === 6 || (path === "assisted" && step === 2)) {
    if (paymentConfirmed) {
      return (
        <div className="max-w-2xl text-center py-12">
          <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Request Submitted Successfully!</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            {paymentChoice === "now" 
              ? "Your payment has been processed and your case is now with our caseworkers for review."
              : "Your request has been received. An invoice has been generated and sent to your email. Please ensure payment is made within 30 days."}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={onComplete}>Go to Sponsorship Dashboard</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">Fee Breakdown & Payment</h1>
        <p className="text-sm text-muted-foreground mb-4">Review Home Office charges and choose your payment method.</p>
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
                  <p className="text-sm font-medium">Screem Service Fee</p>
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
        {!paymentChoice ? (
          <div className="space-y-4 mb-6">
            <p className="text-sm font-semibold mb-3">Choose Payment Option</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentChoice("now")}
                className="flex flex-col items-center p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-center group"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <p className="font-bold mb-1 text-sm">Make Payment Now</p>
                <p className="text-xs text-muted-foreground">Secure payment via Stripe</p>
              </button>
              <button
                onClick={() => setPaymentChoice("later")}
                className="flex flex-col items-center p-6 border-2 rounded-xl hover:border-secondary hover:bg-secondary/5 transition-all text-center group"
              >
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Receipt className="h-6 w-6 text-secondary" />
                </div>
                <p className="font-bold mb-1 text-sm">Make Payment in 30 Days</p>
                <p className="text-xs text-muted-foreground">Generate invoice for bank transfer</p>
              </button>
            </div>
          </div>
        ) : paymentChoice === "now" ? (
          <div className="mb-6 p-8 border-2 border-primary/20 rounded-xl bg-primary/5 text-center">
            <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Secure Online Payment</h3>
            <p className="text-sm text-muted-foreground mb-6">Clicking the button below will open our secure Stripe payment portal.</p>
            <Button className="w-full bg-[#635BFF] hover:bg-[#5851E0] text-white py-4 text-base h-auto" onClick={() => setPaymentConfirmed(true)}>
              Pay £{total.toLocaleString()} with Stripe
            </Button>
            <button className="text-xs text-muted-foreground mt-4 hover:underline" onClick={() => setPaymentChoice(null)}>Change payment method</button>
          </div>
        ) : (
          <div className="mb-6 p-8 border-2 border-secondary/20 rounded-xl bg-secondary/5 text-center">
            <Receipt className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Invoice Selection</h3>
            <p className="text-sm text-muted-foreground mb-6">We will generate an invoice for £{total.toLocaleString()} and send it to your registered email address.</p>
            <div className="bg-white/50 p-4 rounded-lg text-left text-sm mb-6 border divide-y">
              <div className="flex justify-between py-1"><span>Due Date:</span><span className="font-medium">In 30 Days</span></div>
              <div className="flex justify-between py-1"><span>Payment Method:</span><span className="font-medium">Bank Transfer</span></div>
            </div>
            <Button variant="secondary" className="w-full py-4 text-base h-auto" onClick={() => setPaymentConfirmed(true)}>
              Confirm & Generate Invoice
            </Button>
            <button className="text-xs text-muted-foreground mt-4 hover:underline" onClick={() => setPaymentChoice(null)}>Change payment method</button>
          </div>
        )}

        <div className="flex gap-3 pt-6 border-t">
          <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Form
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
