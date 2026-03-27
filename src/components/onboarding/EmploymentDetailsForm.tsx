import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface Props {
  initialJobTitle?: string;
  completed: boolean;
  onComplete: () => void;
}

export default function EmploymentDetailsForm({ initialJobTitle, completed, onComplete }: Props) {
  const [form, setForm] = useState({
    jobTitle: initialJobTitle || "", department: "", employeeCode: `EMP-${Date.now().toString().slice(-6)}`,
    startDate: "", employmentType: "", contractedHours: "", workingPattern: "",
    location: "", lineManager: "", probationLength: "", probationEndDate: "",
    salary: "", paymentFrequency: "",
    accountName: "", sortCode: "", accountNumber: "", buildingSociety: "",
    contractType: "", contractEndDate: "", noticePeriodEmployee: "", noticePeriodEmployer: "",
    pensionScheme: "",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="rounded-xl border bg-card p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Section 2: Employment Details</h3>
        {completed && <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Completed</span>}
      </div>
      <p className="text-xs text-muted-foreground -mt-3">Current role will be filled by manager. Previous employment will be filled by employee.</p>

      {/* Current Employment */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Current Employment</h4>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Job Title *</Label><Input className="mt-1" value={form.jobTitle} onChange={e => set("jobTitle", e.target.value)} /></div>
          <div><Label>Department *</Label><Input className="mt-1" value={form.department} onChange={e => set("department", e.target.value)} /></div>
          <div><Label>Employee Code/ID</Label><Input className="mt-1" value={form.employeeCode} readOnly disabled /></div>
          <div><Label>Start Date *</Label><Input type="date" className="mt-1" value={form.startDate} onChange={e => set("startDate", e.target.value)} /></div>
          <div>
            <Label>Employment Type *</Label>
            <Select value={form.employmentType} onValueChange={v => set("employmentType", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["Full-time", "Part-time", "Casual", "Fixed-term"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Contracted Hours/Week *</Label><Input type="number" className="mt-1" value={form.contractedHours} onChange={e => set("contractedHours", e.target.value)} /></div>
          <div>
            <Label>Working Pattern</Label>
            <Select value={form.workingPattern} onValueChange={v => set("workingPattern", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["Mon-Fri 9-5", "Shift Pattern", "Flexible", "Rota Based", "Other"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Location / Site *</Label><Input className="mt-1" value={form.location} onChange={e => set("location", e.target.value)} /></div>
          <div><Label>Line Manager *</Label><Input className="mt-1" value={form.lineManager} onChange={e => set("lineManager", e.target.value)} /></div>
          <div>
            <Label>Probation Length</Label>
            <Select value={form.probationLength} onValueChange={v => set("probationLength", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["3 months", "6 months", "9 months", "12 months", "None"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Probation End Date</Label><Input type="date" className="mt-1" value={form.probationEndDate} onChange={e => set("probationEndDate", e.target.value)} placeholder="Auto-calculate" /></div>
          <div><Label>Salary / Hourly Rate *</Label><Input className="mt-1" value={form.salary} onChange={e => set("salary", e.target.value)} placeholder="e.g. £28,000 or £14.50/hr" /></div>
          <div>
            <Label>Payment Frequency</Label>
            <Select value={form.paymentFrequency} onValueChange={v => set("paymentFrequency", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["Monthly", "Weekly", "Fortnightly"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Bank Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Account Name</Label><Input className="mt-1" value={form.accountName} onChange={e => set("accountName", e.target.value)} /></div>
          <div><Label>Sort Code</Label><Input className="mt-1" value={form.sortCode} onChange={e => set("sortCode", e.target.value)} placeholder="e.g. 12-34-56" /></div>
          <div><Label>Account Number</Label><Input className="mt-1" value={form.accountNumber} onChange={e => set("accountNumber", e.target.value)} /></div>
          <div><Label>Building Society Roll Number</Label><Input className="mt-1" value={form.buildingSociety} onChange={e => set("buildingSociety", e.target.value)} placeholder="If applicable" /></div>
        </div>
      </div>

      {/* Contract Details */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Contract Details</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Contract Type</Label>
            <Select value={form.contractType} onValueChange={v => set("contractType", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["Permanent", "Fixed-term", "Temporary", "Apprentice", "Intern"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {form.contractType === "Fixed-term" && (
            <div><Label>Contract End Date</Label><Input type="date" className="mt-1" value={form.contractEndDate} onChange={e => set("contractEndDate", e.target.value)} /></div>
          )}
          <div><Label>Notice Period (Employee)</Label><Input className="mt-1" value={form.noticePeriodEmployee} onChange={e => set("noticePeriodEmployee", e.target.value)} placeholder="e.g. 1 month" /></div>
          <div><Label>Notice Period (Employer)</Label><Input className="mt-1" value={form.noticePeriodEmployer} onChange={e => set("noticePeriodEmployer", e.target.value)} placeholder="e.g. 1 month" /></div>
          <div>
            <Label>Pension Scheme</Label>
            <Select value={form.pensionScheme} onValueChange={v => set("pensionScheme", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["Auto-enrolment", "Opted out", "Other"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onComplete}><CheckCircle2 className="h-4 w-4 mr-1" />Mark as Complete</Button>
      </div>
    </div>
  );
}
