
## Plan: Additional Compliance Intelligence Features

### Overview
7 feature areas to implement across multiple files. All demo-data driven (no backend needed yet). Key new pages/components:
- `src/pages/settings/SponsorLicence.tsx` (new sub-page)
- `src/components/compliance/ComplianceScore.tsx`
- `src/components/compliance/LeaverChecklist.tsx`
- Updates to `src/data/demo.ts`, `src/types/index.ts`, `src/pages/Dashboard.tsx`, `src/pages/People.tsx`, `src/pages/Settings.tsx`

---

### 1 — Types Extension (`src/types/index.ts`)
Add new types:
- `SponsorLicence` (licenceNumber, type, rating, issueDate, expiryDate, renewalDate, cosDefinedAvailable, cosUndefinedAvailable, cosUsed)
- `VisaRule` (visaType, maxHoursPerWeek, requiresTermDates, allowsSupplementaryWork, requiresSecondaryEmploymentLetter, termMaxHours)
- `SocGoingRate` (socCode, minAnnualSalary, minHourlySalary)
- Extend `Worker` with: `leaverStatus`, `retentionExpiryDate`, `leaverChecklist` (object with 4 boolean fields), `complianceScore`, `absenceRecords`

---

### 2 — Demo Data (`src/data/demo.ts`)
Add:
- `DEMO_SPONSOR_LICENCE` object for each tenant
- `DEMO_VISA_RULES` array (Student, Graduate, Skilled Worker)
- `DEMO_SOC_GOING_RATES` array (going rate per SOC)
- Mark 2 workers as leavers with `leaverStatus: "leaver"` and `retentionExpiryDate`
- Add checklist states to leaver workers

---

### 3 — Leavers Control (People module)
In `WorkerDetail` panel in `People.tsx`:
- If `worker.leaverStatus === "leaver"`: show read-only banner "This worker record is locked — Leaver"
- Show retention countdown (days remaining of 12-month period)
- Show 4-item checklist with green/yellow/red status:
  - Reporting submitted within 10 days ✓/✗
  - Final payslip uploaded ✓/✗
  - Final attendance record uploaded ✓/✗
  - Last known contact details stored ✓/✗
- Overall RAG indicator (red=0-1 complete, yellow=2-3, green=all 4)
- In People list: show "Leaver" badge, filter option for leavers

---

### 4 — Sponsor Licence Control Centre (Settings)
Add a new "Sponsor Licence" tab to `Settings.tsx` with 3 sub-tabs:
- **Overview**: licence number, type (A-rated/B-rated), rating, issue/expiry/renewal dates; CoS allocation widget (defined/undefined/used/remaining as a visual bar)
- **Documents**: list of licence document categories (sponsor application bundle, approval letters, action plans, compliance visit letters, HO correspondence) with upload placeholders
- **Apply**: button to create a new Licence Application Case (shows confirmation modal)

---

### 5 — Compliance Scoring Engine
New component `src/components/compliance/ComplianceScore.tsx`:
- `LicenceComplianceScore` (0–100%): calculated from % of workers with valid docs + reporting timeliness (simulated) + visa validity
- `WorkerComplianceScore` per worker: doc completeness (25pts), RTW validity (25pts), visa validity (25pts), salary vs SOC going rate (25pts)
- RAG colour: ≥80 green, 60–79 amber, <60 red
- Circular score gauge (CSS-only, no new libs)
- Used in: Dashboard header widget + WorkerDetail panel

---

### 6 — Visa Rules Engine
New `src/components/compliance/VisaRulesAlert.tsx`:
- Checks worker's `visaType` against `DEMO_VISA_RULES`
- Detects breaches: Student >20h during term, Graduate >40h
- Shows inline alert in WorkerDetail + flags in People list
- Reduces compliance score by 20pts if breach

---

### 7 — Salary Compliance
In CoS Wizard (step 5) and WorkerDetail:
- Look up SOC going rate from `DEMO_SOC_GOING_RATES`
- If annual salary < going rate: show red warning "Salary below SOC going rate (£X,XXX required)"
- In CoS wizard: disable "Next" button on step 5 until salary meets threshold (with override for manager role)

---

### 8 — Absence Monitoring
Extend `Worker` with `absenceRecords` array. In WorkerDetail, if any absence spans >10 consecutive working days → show amber alert "Absence exceeds 10 working days — reporting obligation may apply".

---

### 9 — Dashboard Redesign
Replace current 4-stat row with compliance-first layout:
```
[ Licence Health Score ] [ CoS Allocation ] [ Sponsored Workers ] [ Workers at Risk ]
[ Upcoming Expiries    ] [ Reporting Deadlines ] [ Leavers (12mo) ] [ Invoices (secondary) ]
```
- Licence health score = LicenceComplianceScore with colour ring
- CoS allocation = defined+undefined remaining vs used (mini bar)
- Workers at risk = count with compliance score < 60
- Leavers = count of workers marked leaver in last 12 months
- Invoices widget moved to bottom/secondary position

---

### Files to Create/Edit
| File | Action |
|---|---|
| `src/types/index.ts` | Add SponsorLicence, VisaRule, SocGoingRate types; extend Worker |
| `src/data/demo.ts` | Add licence, visa rules, going rates, update workers |
| `src/pages/Dashboard.tsx` | Redesign with compliance-first widgets |
| `src/pages/People.tsx` | Leaver logic, compliance score, visa breach alerts |
| `src/pages/Settings.tsx` | Add Sponsor Licence tab with 3 sub-tabs |
| `src/components/compliance/ComplianceScore.tsx` | New scoring component |
| `src/components/compliance/VisaRulesAlert.tsx` | New visa rules checker |
| `src/components/compliance/LeaverChecklist.tsx` | New leaver checklist component |
| `src/components/sponsorship/CosWizard.tsx` | Salary going rate validation on step 5 |
