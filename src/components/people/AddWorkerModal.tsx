import { useState } from "react";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEMO_COUNTRIES, DEMO_SOC_CODES, DEMO_WORK_LOCATIONS } from "@/data/demo";
import { useApp } from "@/context/AppContext";
import { Worker } from "@/types";

type NewWorkerForm = {
  givenName: string; familyName: string; nationality: string;
  dateOfBirth: string; email: string; phone: string; niNumber: string;
  passportNumber: string; passportExpiry: string;
  visaType: string; otherVisaType: string; cosReference: string; visaExpiry: string;
  jobTitle: string; socCode: string; salary: string; salaryPeriod: string;
  workLocationId: string; startDate: string; weeklyHours: string;
};

const VISA_TYPES = [
  "Skilled Worker", "Student", "Graduate", "Global Talent",
  "Dependent", "ILR (Indefinite Leave to Remain)", "Specialist Worker", "Other",
];

export default function AddWorkerModal({ onClose, onAdd }: { onClose: () => void; onAdd: (w: Worker) => void }) {
  const { currentTenant } = useApp();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<NewWorkerForm>({
    givenName: "", familyName: "", nationality: "", dateOfBirth: "",
    email: "", phone: "", niNumber: "", passportNumber: "", passportExpiry: "",
    visaType: "Skilled Worker", otherVisaType: "", cosReference: "", visaExpiry: "",
    jobTitle: "", socCode: "", salary: "", salaryPeriod: "year",
    workLocationId: "", startDate: "", weeklyHours: "37.5",
  });

  const set = (k: keyof NewWorkerForm, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canSave = !!(form.givenName && form.familyName && form.nationality && form.dateOfBirth);
  const resolvedVisaType = form.visaType === "Other" ? (form.otherVisaType || "Other") : form.visaType;
  const countries = DEMO_COUNTRIES.map(c => c.name);
  const locations = DEMO_WORK_LOCATIONS.filter(l => l.tenantId === (currentTenant?.id ?? "t1"));

  const handleSave = () => {
    const newWorker: Worker = {
      id: `w_${Date.now()}`,
      tenantId: currentTenant?.id ?? "t1",
      givenName: form.givenName, familyName: form.familyName,
      nationality: form.nationality, dateOfBirth: form.dateOfBirth,
      email: form.email || undefined, phone: form.phone || undefined,
      niNumber: form.niNumber || undefined, passportNumber: form.passportNumber || undefined,
      passportExpiry: form.passportExpiry || undefined,
      visaType: resolvedVisaType || undefined, cosReference: form.cosReference || undefined,
      visaExpiry: form.visaExpiry || undefined,
      jobTitle: form.jobTitle || undefined, socCode: form.socCode || undefined,
      salary: form.salary ? parseFloat(form.salary) : undefined, salaryPeriod: form.salaryPeriod,
      workLocationId: form.workLocationId || undefined,
      startDate: form.startDate || undefined, weeklyHours: form.weeklyHours ? parseFloat(form.weeklyHours) : undefined,
      status: "active", createdAt: new Date().toISOString(),
    };
    onAdd(newWorker);
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-background rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Add Employee</h2>
            <p className="text-xs text-muted-foreground">Create a new employee record</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Personal Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Given Name *</Label><Input value={form.givenName} onChange={e => set("givenName", e.target.value)} className="mt-1" /></div>
              <div><Label>Family Name *</Label><Input value={form.familyName} onChange={e => set("familyName", e.target.value)} className="mt-1" /></div>
              <div>
                <Label>Nationality *</Label>
                <Select value={form.nationality} onValueChange={v => set("nationality", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select country…" /></SelectTrigger>
                  <SelectContent className="max-h-48">{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date of Birth *</Label><Input type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} className="mt-1" /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} className="mt-1" /></div>
              <div><Label>NI Number</Label><Input value={form.niNumber} onChange={e => set("niNumber", e.target.value)} className="mt-1" placeholder="e.g. AB123456C" /></div>
            </div>
          </section>
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Passport</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Passport Number</Label><Input value={form.passportNumber} onChange={e => set("passportNumber", e.target.value)} className="mt-1" /></div>
              <div><Label>Passport Expiry</Label><Input type="date" value={form.passportExpiry} onChange={e => set("passportExpiry", e.target.value)} className="mt-1" /></div>
            </div>
          </section>
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Sponsorship Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Visa Type</Label>
                <Select value={form.visaType} onValueChange={v => set("visaType", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{VISA_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
                {form.visaType === "Other" && <Input className="mt-2" placeholder="Please specify…" value={form.otherVisaType} onChange={e => set("otherVisaType", e.target.value)} />}
                {form.visaType === "Student" && (
                  <p className="text-xs text-warning mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />Student visa — max 20 hrs/week
                  </p>
                )}
              </div>
              <div><Label>CoS Reference</Label><Input value={form.cosReference} onChange={e => set("cosReference", e.target.value)} className="mt-1" placeholder="e.g. C123456789A" /></div>
              <div><Label>Visa Expiry</Label><Input type="date" value={form.visaExpiry} onChange={e => set("visaExpiry", e.target.value)} className="mt-1" /></div>
              <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} className="mt-1" /></div>
            </div>
          </section>
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Employment</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Job Title</Label><Input value={form.jobTitle} onChange={e => set("jobTitle", e.target.value)} className="mt-1" /></div>
              <div>
                <Label>SOC Code</Label>
                <Select value={form.socCode} onValueChange={v => set("socCode", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select SOC…" /></SelectTrigger>
                  <SelectContent className="max-h-48">{DEMO_SOC_CODES.map(s => <SelectItem key={s.code} value={s.code}>{s.code} – {s.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Annual Salary (£)</Label><Input type="number" value={form.salary} onChange={e => set("salary", e.target.value)} className="mt-1" /></div>
              <div><Label>Weekly Hours</Label><Input type="number" value={form.weeklyHours} onChange={e => set("weeklyHours", e.target.value)} className="mt-1" /></div>
              <div className="col-span-2">
                <Label>Work Location</Label>
                <Select value={form.workLocationId} onValueChange={v => set("workLocationId", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select location…" /></SelectTrigger>
                  <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>
        <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {saved
            ? <Button className="ml-auto" disabled><CheckCircle2 className="h-4 w-4 mr-1 text-success" />Employee Added</Button>
            : <Button onClick={handleSave} disabled={!canSave} className="ml-auto">Add Employee</Button>
          }
        </div>
      </div>
    </div>
  );
}
