import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface Props { completed: boolean; onComplete: () => void; }

export default function ReferencesForm({ completed, onComplete }: Props) {
  const [refs, setRefs] = useState([
    { type: "professional", name: "", jobTitle: "", company: "", email: "", phone: "", relationship: "", periodFrom: "", periodTo: "" },
    { type: "professional", name: "", jobTitle: "", company: "", email: "", phone: "", relationship: "", periodFrom: "", periodTo: "" },
  ]);

  const update = (idx: number, field: string, value: string) => {
    setRefs(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Section 5: References</h3>
        {completed && <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Completed</span>}
      </div>

      {refs.map((ref, idx) => (
        <div key={idx}>
          <h4 className="font-semibold text-sm mb-3 pb-2 border-b">
            Reference {idx + 1} {idx === 0 && <span className="text-xs font-normal text-muted-foreground">(Most recent employer or current line manager)</span>}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Reference Type</Label>
              <Select value={ref.type} onValueChange={v => update(idx, "type", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Professional", "Academic", "Character"].map(t => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Referee Name</Label><Input className="mt-1" value={ref.name} onChange={e => update(idx, "name", e.target.value)} /></div>
            <div><Label>Job Title / Position</Label><Input className="mt-1" value={ref.jobTitle} onChange={e => update(idx, "jobTitle", e.target.value)} /></div>
            <div><Label>Company / Organisation</Label><Input className="mt-1" value={ref.company} onChange={e => update(idx, "company", e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" className="mt-1" value={ref.email} onChange={e => update(idx, "email", e.target.value)} /></div>
            <div><Label>Phone</Label><Input className="mt-1" value={ref.phone} onChange={e => update(idx, "phone", e.target.value)} /></div>
            <div><Label>Relationship to Applicant</Label><Input className="mt-1" value={ref.relationship} onChange={e => update(idx, "relationship", e.target.value)} /></div>
            <div><Label>Period Known From</Label><Input type="date" className="mt-1" value={ref.periodFrom} onChange={e => update(idx, "periodFrom", e.target.value)} /></div>
            <div><Label>Period Known To</Label><Input type="date" className="mt-1" value={ref.periodTo} onChange={e => update(idx, "periodTo", e.target.value)} /></div>
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button onClick={onComplete}><CheckCircle2 className="h-4 w-4 mr-1" />Mark as Complete</Button>
      </div>
    </div>
  );
}
