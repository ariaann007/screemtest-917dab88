import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface Props {
  initialData?: { firstName?: string; lastName?: string; email?: string; phone?: string; nationality?: string };
  completed: boolean;
  onComplete: () => void;
}

export default function PersonalDetailsForm({ initialData, completed, onComplete }: Props) {
  const [form, setForm] = useState({
    title: "", firstName: initialData?.firstName || "", middleName: "", lastName: initialData?.lastName || "",
    preferredName: "", dateOfBirth: "", nationality: initialData?.nationality || "", niNumber: "",
    gender: "", pronouns: "", maritalStatus: "",
    personalEmail: initialData?.email || "", workEmail: "", mobile: initialData?.phone || "", phone: "",
    street: "", city: "", county: "", postcode: "", country: "United Kingdom",
    nokName: "", nokRelationship: "", nokDaytime: "", nokAfterHours: "", nokAddress: "", nokType: "primary",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="rounded-xl border bg-card p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Section 1: Personal Details</h3>
        {completed && <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Completed</span>}
      </div>

      {/* Basic Information */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Basic Information</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Title</Label>
            <Select value={form.title} onValueChange={v => set("title", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["Mr", "Mrs", "Ms", "Dr", "Mx", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>First Name *</Label><Input className="mt-1" value={form.firstName} onChange={e => set("firstName", e.target.value)} /></div>
          <div><Label>Middle Name(s)</Label><Input className="mt-1" value={form.middleName} onChange={e => set("middleName", e.target.value)} /></div>
          <div><Label>Last Name *</Label><Input className="mt-1" value={form.lastName} onChange={e => set("lastName", e.target.value)} /></div>
          <div><Label>Preferred Name</Label><Input className="mt-1" value={form.preferredName} onChange={e => set("preferredName", e.target.value)} placeholder="If different from legal name" /></div>
          <div><Label>Date of Birth *</Label><Input type="date" className="mt-1" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} /></div>
          <div><Label>Nationality * <span className="text-xs text-muted-foreground">(allow multiple)</span></Label><Input className="mt-1" value={form.nationality} onChange={e => set("nationality", e.target.value)} /></div>
          <div><Label>NI Number *</Label><Input className="mt-1" value={form.niNumber} onChange={e => set("niNumber", e.target.value)} placeholder="e.g. AB 12 34 56 C" /></div>
          <div>
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={v => set("gender", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["Male", "Female", "Non-binary", "Other", "Prefer not to say"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Pronouns <span className="text-xs text-muted-foreground">(optional)</span></Label><Input className="mt-1" value={form.pronouns} onChange={e => set("pronouns", e.target.value)} placeholder="e.g. she/her, he/him, they/them" /></div>
          <div>
            <Label>Marital Status</Label>
            <Select value={form.maritalStatus} onValueChange={v => set("maritalStatus", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["Single", "Married", "Civil Partnership", "Divorced", "Widowed", "Prefer not to say"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Contact Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Personal Email *</Label><Input type="email" className="mt-1" value={form.personalEmail} onChange={e => set("personalEmail", e.target.value)} /></div>
          <div><Label>Work Email <span className="text-xs text-muted-foreground">(auto-generated or assigned)</span></Label><Input type="email" className="mt-1" value={form.workEmail} onChange={e => set("workEmail", e.target.value)} /></div>
          <div><Label>Mobile Number *</Label><Input className="mt-1" value={form.mobile} onChange={e => set("mobile", e.target.value)} /></div>
          <div><Label>Phone Number <span className="text-xs text-muted-foreground">(landline/alternative)</span></Label><Input className="mt-1" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Address *</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label>Street Address</Label><Input className="mt-1" value={form.street} onChange={e => set("street", e.target.value)} /></div>
          <div><Label>City / Town</Label><Input className="mt-1" value={form.city} onChange={e => set("city", e.target.value)} /></div>
          <div><Label>County</Label><Input className="mt-1" value={form.county} onChange={e => set("county", e.target.value)} /></div>
          <div><Label>Postcode</Label><Input className="mt-1" value={form.postcode} onChange={e => set("postcode", e.target.value)} /></div>
          <div><Label>Country</Label><Input className="mt-1" value={form.country} onChange={e => set("country", e.target.value)} /></div>
        </div>
      </div>

      {/* Emergency Contact / Next of Kin */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Emergency Contact / Next of Kin</h4>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Name *</Label><Input className="mt-1" value={form.nokName} onChange={e => set("nokName", e.target.value)} /></div>
          <div><Label>Relationship *</Label><Input className="mt-1" value={form.nokRelationship} onChange={e => set("nokRelationship", e.target.value)} placeholder="e.g. Spouse, Parent" /></div>
          <div><Label>Daytime Number *</Label><Input className="mt-1" value={form.nokDaytime} onChange={e => set("nokDaytime", e.target.value)} /></div>
          <div><Label>After Hours Number</Label><Input className="mt-1" value={form.nokAfterHours} onChange={e => set("nokAfterHours", e.target.value)} /></div>
          <div className="col-span-2"><Label>Address</Label><Textarea className="mt-1" rows={2} value={form.nokAddress} onChange={e => set("nokAddress", e.target.value)} /></div>
          <div>
            <Label>Contact Type</Label>
            <Select value={form.nokType} onValueChange={v => set("nokType", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary Emergency Contact</SelectItem>
                <SelectItem value="secondary">Secondary Contact</SelectItem>
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
