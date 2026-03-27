import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Plus, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviousRole {
  id: string; jobTitle: string; employer: string; startDate: string; endDate: string;
  employmentType: string; reasonForLeaving: string; responsibilities: string;
  hasGap: boolean; gapFrom: string; gapTo: string; gapReason: string;
}

interface Props { completed: boolean; onComplete: () => void; }

const emptyRole = (): PreviousRole => ({
  id: `role_${Date.now()}`, jobTitle: "", employer: "", startDate: "", endDate: "",
  employmentType: "", reasonForLeaving: "", responsibilities: "",
  hasGap: false, gapFrom: "", gapTo: "", gapReason: "",
});

export default function EmploymentHistoryForm({ completed, onComplete }: Props) {
  const [roles, setRoles] = useState<PreviousRole[]>([emptyRole()]);
  const [hasGaps, setHasGaps] = useState("");
  const [gapSummary, setGapSummary] = useState<{ from: string; to: string; duration: string; reason: string }[]>([]);

  const updateRole = (id: string, field: string, value: string | boolean) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addRole = () => setRoles(prev => [...prev, emptyRole()]);
  const removeRole = (id: string) => setRoles(prev => prev.filter(r => r.id !== id));

  return (
    <div className="rounded-xl border bg-card p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Section 4: Employment History</h3>
        {completed && <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Completed</span>}
      </div>
      <p className="text-xs text-muted-foreground -mt-3">Previous roles will be filled by employee during onboarding.</p>

      {roles.map((role, idx) => (
        <div key={role.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm pb-2 border-b flex-1">Previous Employment {idx + 1}</h4>
            {roles.length > 1 && (
              <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => removeRole(role.id)}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />Remove
              </Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Job Title</Label><Input className="mt-1" value={role.jobTitle} onChange={e => updateRole(role.id, "jobTitle", e.target.value)} /></div>
            <div><Label>Employer Name</Label><Input className="mt-1" value={role.employer} onChange={e => updateRole(role.id, "employer", e.target.value)} /></div>
            <div>
              <Label>Employment Type</Label>
              <Select value={role.employmentType} onValueChange={v => updateRole(role.id, "employmentType", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {["Full-time", "Part-time", "Casual", "Contract"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Start Date</Label><Input type="date" className="mt-1" value={role.startDate} onChange={e => updateRole(role.id, "startDate", e.target.value)} /></div>
            <div><Label>End Date</Label><Input type="date" className="mt-1" value={role.endDate} onChange={e => updateRole(role.id, "endDate", e.target.value)} /></div>
            <div><Label>Reason for Leaving</Label><Input className="mt-1" value={role.reasonForLeaving} onChange={e => updateRole(role.id, "reasonForLeaving", e.target.value)} /></div>
            <div className="col-span-3">
              <Label>Job Description / Key Responsibilities</Label>
              <Textarea className="mt-1" rows={3} value={role.responsibilities} onChange={e => updateRole(role.id, "responsibilities", e.target.value)} />
            </div>
          </div>

          {/* Gap detection */}
          <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Gap identified between employments?</Label>
              <div className="flex gap-2">
                <button onClick={() => updateRole(role.id, "hasGap", false)}
                  className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", !role.hasGap ? "bg-success/10 text-success border-success/20" : "border-border text-muted-foreground")}>
                  No continuous employment
                </button>
                <button onClick={() => updateRole(role.id, "hasGap", true)}
                  className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", role.hasGap ? "bg-warning/10 text-warning border-warning/20" : "border-border text-muted-foreground")}>
                  Yes — Gap exists
                </button>
              </div>
            </div>
            {role.hasGap && (
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs">Gap From</Label><Input type="date" className="mt-1 h-8 text-xs" value={role.gapFrom} onChange={e => updateRole(role.id, "gapFrom", e.target.value)} /></div>
                <div><Label className="text-xs">Gap To</Label><Input type="date" className="mt-1 h-8 text-xs" value={role.gapTo} onChange={e => updateRole(role.id, "gapTo", e.target.value)} /></div>
                <div><Label className="text-xs">Reason for Gap</Label><Input className="mt-1 h-8 text-xs" value={role.gapReason} onChange={e => updateRole(role.id, "gapReason", e.target.value)} /></div>
              </div>
            )}
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addRole} className="w-full">
        <Plus className="h-4 w-4 mr-1" />Add Another Employment Record
      </Button>

      {/* Employment Gap Summary */}
      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Employment Gap Summary
        </h4>
        <p className="text-xs text-muted-foreground">Any gaps longer than 1 month in the last 5 years?</p>
        <div className="flex gap-2">
          <button onClick={() => setHasGaps("no")}
            className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium", hasGaps === "no" ? "bg-success/10 text-success border-success/20" : "border-border text-muted-foreground")}>
            No
          </button>
          <button onClick={() => setHasGaps("yes")}
            className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium", hasGaps === "yes" ? "bg-warning/10 text-warning border-warning/20" : "border-border text-muted-foreground")}>
            Yes — Explain below
          </button>
        </div>
        {hasGaps === "yes" && (
          <p className="text-xs text-muted-foreground italic">
            Acceptable reasons: Travel, education, caring responsibilities, illness, redundancy/job search, career break, self-employment (provide details in employment records above).
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onComplete}><CheckCircle2 className="h-4 w-4 mr-1" />Mark as Complete</Button>
      </div>
    </div>
  );
}
