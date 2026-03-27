import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";

interface Props { completed: boolean; onComplete: () => void; }

export default function PreEmploymentChecksForm({ completed, onComplete }: Props) {
  const [form, setForm] = useState({
    dbsRequired: "", dbsLevel: "", dbsCertNumber: "", dbsIssueDate: "", dbsRenewalDue: "",
    qualVerified: false, qualification: "", awardingBody: "", qualVerificationDate: "",
    profRegCurrent: false, regBody: "", regNumber: "", regExpiry: "",
    healthQuestionnaireCompleted: false, ohClearance: false, adjustmentsRequired: false,
  });
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="rounded-xl border bg-card p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Section 6: Pre-Employment Checks</h3>
        {completed && <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Completed</span>}
      </div>

      {/* Background Checks */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Background Checks</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>DBS Check Required?</Label>
            <Select value={form.dbsRequired} onValueChange={v => set("dbsRequired", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["None", "Basic", "Standard", "Enhanced"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {form.dbsRequired && form.dbsRequired !== "None" && (
            <>
              <div><Label>DBS Level</Label><Input className="mt-1" value={form.dbsLevel} onChange={e => set("dbsLevel", e.target.value)} /></div>
              <div><Label>DBS Certificate Number</Label><Input className="mt-1" value={form.dbsCertNumber} onChange={e => set("dbsCertNumber", e.target.value)} /></div>
              <div><Label>DBS Issue Date</Label><Input type="date" className="mt-1" value={form.dbsIssueDate} onChange={e => set("dbsIssueDate", e.target.value)} /></div>
              <div><Label>DBS Renewal Due</Label><Input type="date" className="mt-1" value={form.dbsRenewalDue} onChange={e => set("dbsRenewalDue", e.target.value)} /></div>
            </>
          )}
        </div>
      </div>

      {/* Professional Qualifications */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Professional Qualifications</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox checked={form.qualVerified} onCheckedChange={v => set("qualVerified", !!v)} id="qualVerified" />
            <Label htmlFor="qualVerified" className="text-sm">Professional qualifications verified?</Label>
          </div>
          {form.qualVerified && (
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Qualification</Label><Input className="mt-1" value={form.qualification} onChange={e => set("qualification", e.target.value)} /></div>
              <div><Label>Awarding Body</Label><Input className="mt-1" value={form.awardingBody} onChange={e => set("awardingBody", e.target.value)} /></div>
              <div><Label>Verification Date</Label><Input type="date" className="mt-1" value={form.qualVerificationDate} onChange={e => set("qualVerificationDate", e.target.value)} /></div>
            </div>
          )}
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-2">
            <Checkbox checked={form.profRegCurrent} onCheckedChange={v => set("profRegCurrent", !!v)} id="profReg" />
            <Label htmlFor="profReg" className="text-sm">Professional registration / license current?</Label>
          </div>
          {form.profRegCurrent && (
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Registration Body</Label><Input className="mt-1" value={form.regBody} onChange={e => set("regBody", e.target.value)} /></div>
              <div><Label>Registration Number</Label><Input className="mt-1" value={form.regNumber} onChange={e => set("regNumber", e.target.value)} /></div>
              <div><Label>Expiry Date</Label><Input type="date" className="mt-1" value={form.regExpiry} onChange={e => set("regExpiry", e.target.value)} /></div>
            </div>
          )}
        </div>
      </div>

      {/* Medical / Occupational Health */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Medical / Occupational Health</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox checked={form.healthQuestionnaireCompleted} onCheckedChange={v => set("healthQuestionnaireCompleted", !!v)} id="healthQ" />
            <Label htmlFor="healthQ" className="text-sm">Pre-employment health questionnaire completed?</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={form.ohClearance} onCheckedChange={v => set("ohClearance", !!v)} id="ohClear" />
            <Label htmlFor="ohClear" className="text-sm">Occupational health clearance obtained?</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={form.adjustmentsRequired} onCheckedChange={v => set("adjustmentsRequired", !!v)} id="adjust" />
            <Label htmlFor="adjust" className="text-sm">Reasonable adjustments required? <span className="text-muted-foreground">(If yes, details in confidential file)</span></Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onComplete}><CheckCircle2 className="h-4 w-4 mr-1" />Mark as Complete</Button>
      </div>
    </div>
  );
}
