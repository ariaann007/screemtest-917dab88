import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertTriangle, UserCheck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem { id: string; label: string; done: boolean; }

interface Props {
  sectionStatuses: { id: string; label: string; done: boolean }[];
  progressPct: number;
  onMarkReady: () => void;
  onMoveToPeople: () => void;
}

const DOC_VERIFICATION: ChecklistItem[] = [
  { id: "rtw", label: "Right to work documents checked and copied", done: false },
  { id: "passport", label: "Passport/ID verified", done: false },
  { id: "address", label: "Proof of address verified", done: false },
  { id: "quals", label: "Qualifications verified (if applicable)", done: false },
  { id: "refs", label: "References received and satisfactory", done: false },
  { id: "dbs", label: "DBS check completed (if required)", done: false },
  { id: "contract", label: "Contract of employment signed", done: false },
  { id: "handbook", label: "Employee handbook issued", done: false },
  { id: "pension", label: "Pension information provided", done: false },
  { id: "bank", label: "Bank details verified", done: false },
];

const SYSTEM_UPDATES: ChecklistItem[] = [
  { id: "hr", label: "Employee added to HR system", done: false },
  { id: "payroll", label: "Payroll notified", done: false },
  { id: "it", label: "IT notified for system access", done: false },
  { id: "facilities", label: "Facilities notified (desk/parking/access)", done: false },
  { id: "manager", label: "Line manager notified of start date", done: false },
  { id: "immigration", label: "Immigration tracking system updated", done: false },
  { id: "calendar", label: "Calendar alerts set for visa expiry (if applicable)", done: false },
];

const FILE_MGMT: ChecklistItem[] = [
  { id: "file", label: "Personnel file created", done: false },
  { id: "docsStored", label: "Documents stored securely", done: false },
  { id: "backup", label: "Digital copies backed up", done: false },
  { id: "access", label: "Access permissions set (restricted access)", done: false },
  { id: "retention", label: "Retention schedule applied (employment + 2 years)", done: false },
];

export default function DeclarationReviewForm({ sectionStatuses, progressPct, onMarkReady, onMoveToPeople }: Props) {
  const [declarations, setDeclarations] = useState({
    privacyNotice: false, immigrationAccuracy: false, ongoingObligations: false, gdprConsent: false,
  });
  const [employeeSignature, setEmployeeSignature] = useState({ name: "", date: "" });
  const [hrSignature, setHrSignature] = useState({ name: "", date: "" });

  const [docChecks, setDocChecks] = useState(DOC_VERIFICATION);
  const [sysChecks, setSysChecks] = useState(SYSTEM_UPDATES);
  const [fileChecks, setFileChecks] = useState(FILE_MGMT);
  const [processedBy, setProcessedBy] = useState({ name: "", date: "" });

  const toggleItem = (list: ChecklistItem[], setList: (v: ChecklistItem[]) => void, id: string) => {
    setList(list.map(i => i.id === id ? { ...i, done: !i.done } : i));
  };

  const allDeclarations = Object.values(declarations).every(Boolean);
  const allComplete = progressPct === 100;

  return (
    <div className="space-y-6">
      {/* Section Review */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-lg">Review & Approve</h3>
        <p className="text-sm text-muted-foreground">Review all onboarding sections before moving this candidate to People.</p>
        <div className="space-y-2">
          {sectionStatuses.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border">
              {s.done ? <CheckCircle2 className="h-5 w-5 text-success shrink-0" /> : <AlertTriangle className="h-5 w-5 text-warning shrink-0" />}
              <span className="text-sm font-medium flex-1">{s.label}</span>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", s.done ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                {s.done ? "Complete" : "Incomplete"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Declaration */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2"><Shield className="h-5 w-5" />Data Protection & Employee Declaration</h3>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm border-b pb-2">Privacy Notice</h4>
          <div className="flex items-start gap-2">
            <Checkbox checked={declarations.privacyNotice} onCheckedChange={() => setDeclarations(p => ({ ...p, privacyNotice: !p.privacyNotice }))} id="privacy" />
            <Label htmlFor="privacy" className="text-sm leading-relaxed">
              I confirm that I have been provided with and understand the company's privacy notice explaining how my personal data will be processed and stored.
            </Label>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm border-b pb-2">Immigration Status Accuracy</h4>
          <div className="flex items-start gap-2">
            <Checkbox checked={declarations.immigrationAccuracy} onCheckedChange={() => setDeclarations(p => ({ ...p, immigrationAccuracy: !p.immigrationAccuracy }))} id="immAcc" />
            <Label htmlFor="immAcc" className="text-sm leading-relaxed">
              I declare that the information I have provided about my immigration status and right to work in the UK is accurate and complete. I understand that providing false information may result in dismissal, I must inform HR immediately if my immigration status changes, and failure to maintain valid right to work may result in termination.
            </Label>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm border-b pb-2">Ongoing Obligations (for visa holders)</h4>
          <div className="flex items-start gap-2">
            <Checkbox checked={declarations.ongoingObligations} onCheckedChange={() => setDeclarations(p => ({ ...p, ongoingObligations: !p.ongoingObligations }))} id="ongoing" />
            <Label htmlFor="ongoing" className="text-sm leading-relaxed">
              I understand and agree to: inform HR immediately of any visa status changes, provide updated documents at least 1 month before visa expiry, comply with any work restrictions on my visa, keep the company informed of my current contact details, and comply with sponsor reporting requirements (if applicable).
            </Label>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm border-b pb-2">GDPR Consent</h4>
          <div className="flex items-start gap-2">
            <Checkbox checked={declarations.gdprConsent} onCheckedChange={() => setDeclarations(p => ({ ...p, gdprConsent: !p.gdprConsent }))} id="gdpr" />
            <Label htmlFor="gdpr" className="text-sm leading-relaxed">
              I consent to the company processing my personal data including sensitive data (immigration status, health information) for the purposes of employment administration, legal and regulatory compliance, health and safety, and payroll and benefits administration. I understand I have the right to access, correct, and request deletion of my personal data.
            </Label>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Employee Signature</h4>
            <div><Label className="text-xs">Print Name</Label><Input className="mt-1" value={employeeSignature.name} onChange={e => setEmployeeSignature(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label className="text-xs">Date</Label><Input type="date" className="mt-1" value={employeeSignature.date} onChange={e => setEmployeeSignature(p => ({ ...p, date: e.target.value }))} /></div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">HR Officer Signature</h4>
            <div><Label className="text-xs">Print Name</Label><Input className="mt-1" value={hrSignature.name} onChange={e => setHrSignature(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label className="text-xs">Date</Label><Input type="date" className="mt-1" value={hrSignature.date} onChange={e => setHrSignature(p => ({ ...p, date: e.target.value }))} /></div>
          </div>
        </div>
      </div>

      {/* HR Internal Checklist */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-lg">Internal Use Only — HR Checklist</h3>

        <div>
          <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Document Verification Completed</h4>
          <div className="space-y-2">
            {docChecks.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
                <Checkbox checked={item.done} onCheckedChange={() => toggleItem(docChecks, setDocChecks, item.id)} id={`doc-${item.id}`} />
                <Label htmlFor={`doc-${item.id}`} className="text-sm">{item.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3 pb-2 border-b">System Updates</h4>
          <div className="space-y-2">
            {sysChecks.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
                <Checkbox checked={item.done} onCheckedChange={() => toggleItem(sysChecks, setSysChecks, item.id)} id={`sys-${item.id}`} />
                <Label htmlFor={`sys-${item.id}`} className="text-sm">{item.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3 pb-2 border-b">File Management</h4>
          <div className="space-y-2">
            {fileChecks.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
                <Checkbox checked={item.done} onCheckedChange={() => toggleItem(fileChecks, setFileChecks, item.id)} id={`file-${item.id}`} />
                <Label htmlFor={`file-${item.id}`} className="text-sm">{item.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div><Label className="text-xs">Processed by</Label><Input className="mt-1" value={processedBy.name} onChange={e => setProcessedBy(p => ({ ...p, name: e.target.value }))} /></div>
          <div><Label className="text-xs">Date</Label><Input type="date" className="mt-1" value={processedBy.date} onChange={e => setProcessedBy(p => ({ ...p, date: e.target.value }))} /></div>
        </div>
      </div>

      {/* Actions */}
      {allComplete ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-success/30 bg-success/5 p-4">
            <p className="text-sm text-success font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              All onboarding sections are complete. This candidate is ready to be moved to People.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onMarkReady}>Mark Ready to Start</Button>
            <Button onClick={onMoveToPeople}><UserCheck className="h-4 w-4 mr-1" />Move to People</Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <p className="text-sm text-warning font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Some sections are still incomplete. Complete all sections before moving to People.
          </p>
        </div>
      )}
    </div>
  );
}
