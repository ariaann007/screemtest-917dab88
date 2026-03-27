import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";

interface Props { completed: boolean; onComplete: () => void; }

const MANDATORY_TRAINING = [
  { id: "hs", label: "Health & Safety induction" },
  { id: "fire", label: "Fire safety" },
  { id: "gdpr", label: "Data protection / GDPR" },
  { id: "edi", label: "Equality & diversity" },
  { id: "safeguarding", label: "Safeguarding (if applicable)" },
  { id: "roleSpecific", label: "Role-specific training" },
];

const SYSTEMS_ACCESS = [
  { id: "it", label: "IT equipment issued (laptop/desktop/phone)" },
  { id: "email", label: "Email account created" },
  { id: "system", label: "System access granted" },
  { id: "building", label: "Building access card/fob issued" },
  { id: "parking", label: "Parking permit (if applicable)" },
];

export default function TrainingInductionForm({ completed, onComplete }: Props) {
  const [training, setTraining] = useState<Record<string, { done: boolean; date: string; details: string }>>(
    Object.fromEntries(MANDATORY_TRAINING.map(t => [t.id, { done: false, date: "", details: "" }]))
  );
  const [systems, setSystems] = useState<Record<string, boolean>>(
    Object.fromEntries(SYSTEMS_ACCESS.map(s => [s.id, false]))
  );
  const [systemDetails, setSystemDetails] = useState("");

  const toggleTraining = (id: string) => setTraining(p => ({ ...p, [id]: { ...p[id], done: !p[id].done } }));
  const setTrainingDate = (id: string, date: string) => setTraining(p => ({ ...p, [id]: { ...p[id], date } }));
  const setTrainingDetails = (id: string, details: string) => setTraining(p => ({ ...p, [id]: { ...p[id], details } }));

  return (
    <div className="rounded-xl border bg-card p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Section 7: Training & Induction</h3>
        {completed && <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Completed</span>}
      </div>

      {/* Mandatory Training */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Mandatory Training Completed</h4>
        <div className="space-y-3">
          {MANDATORY_TRAINING.map(t => (
            <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/10">
              <Checkbox checked={training[t.id].done} onCheckedChange={() => toggleTraining(t.id)} id={`train-${t.id}`} />
              <Label htmlFor={`train-${t.id}`} className="text-sm font-medium flex-1">{t.label}</Label>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Date:</Label>
                <Input type="date" className="h-8 w-36 text-xs" value={training[t.id].date} onChange={e => setTrainingDate(t.id, e.target.value)} />
              </div>
              {t.id === "roleSpecific" && (
                <Input className="h-8 w-48 text-xs" placeholder="Specify training…" value={training[t.id].details} onChange={e => setTrainingDetails(t.id, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Systems Access */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Systems Access</h4>
        <div className="space-y-3">
          {SYSTEMS_ACCESS.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/10">
              <Checkbox checked={systems[s.id]} onCheckedChange={() => setSystems(p => ({ ...p, [s.id]: !p[s.id] }))} id={`sys-${s.id}`} />
              <Label htmlFor={`sys-${s.id}`} className="text-sm font-medium flex-1">{s.label}</Label>
              {s.id === "system" && systems[s.id] && (
                <Input className="h-8 w-64 text-xs" placeholder="Specify systems…" value={systemDetails} onChange={e => setSystemDetails(e.target.value)} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onComplete}><CheckCircle2 className="h-4 w-4 mr-1" />Mark as Complete</Button>
      </div>
    </div>
  );
}
