# Product Overview — ComplianceIQ
## Allied Financial Insurance · Compliance Management Platform

---

## Product Identity

| Field | Value |
|---|---|
| **Working Name** | ComplianceIQ *(final name to be confirmed)* |
| **Client** | Allied Financial Insurance |
| **Category** | Regulatory Compliance Management Platform |
| **Tagline** | Automate employee compliance — from document upload to audit-ready export. |
| **Brand Colors** | #0066CC (primary blue), #00A3E0 (sky accent), white backgrounds |
| **Tone** | Authoritative, clear, compliance-focused — appropriate for a regulated financial institution |

---

## The Problem

Allied Financial Insurance has no automated system to track employee compliance across departments. HR manually chases mandatory document submissions via email and spreadsheets, with no unified view of who has submitted what, what is expiring, or what has been missed. This creates:

- **Regulatory exposure** — AML, Anti-Fraud, and Data Privacy training requirements are not reliably tracked or enforced
- **Missed renewal deadlines** — certifications and annual trainings expire unnoticed
- **Audit risk** — no timestamped records or exportable compliance history
- **Administrative burden** — HR spends significant time on status chasing instead of strategic work
- **Employee confusion** — staff have no clear view of their own compliance obligations or status

---

## The Solution

ComplianceIQ is a web-based compliance management platform that automates the full employee compliance lifecycle across Sales and Compliance/Risk departments. It gives:

- **Employees** a real-time, color-coded personal scorecard showing their exact compliance status and next required actions
- **HR/Admin** a live dashboard with organization-wide metrics, department summaries, escalation controls, and one-click audit exports
- **The organization** a configurable rules engine so HR can define requirements per department, role, and document type — without engineering involvement

---

## Users & Personas

### HR / Admin
- Configure compliance requirements and rules per department, per role, per document
- Monitor organization-wide compliance rate and department summaries
- View top missing items, upcoming expirations (30/60/90-day windows), and active escalations
- Send automated reminders and manually escalate items up the chain
- Export CSV and PDF compliance reports for regulatory audit submissions
- Access full audit logs, timestamped upload history, and historical records

### Employee (Sales or Compliance/Risk)
- View personal compliance scorecard: completed (✅), pending (⏳), non-compliant (❌)
- Upload required documents (PDF) or enter quiz scores (numeric)
- Receive expiration alerts and reminders for upcoming or overdue items
- Full functionality on both mobile and desktop

### Department Manager
- View department-level compliance summary
- See escalation alerts and drill into non-compliant team members

---

## Initial Scope — Departments & Requirements

### Sales Department

| Requirement | Type | Rule Details |
|---|---|---|
| AML Training | PDF upload | Mandatory · Annual renewal |
| Anti-Fraud Training | PDF upload | Mandatory · Annual renewal |
| Data Privacy Training | PDF upload | Mandatory · Annual renewal |
| Sales License | PDF upload | Mandatory · Expiration tracked |
| Signed SOP / Compliance Form | PDF upload | Mandatory |
| Quiz / Assessment Results | Numeric score | Mandatory · Configurable passing threshold |

### Compliance / Risk Department

| Requirement | Type | Rule Details |
|---|---|---|
| AML Training | PDF upload | Mandatory · Annual renewal |
| Anti-Fraud Training | PDF upload | Mandatory · Annual renewal |
| Data Privacy Training | PDF upload | Mandatory · Annual renewal |
| CRCM Certification | PDF upload | Mandatory · Expiration tracked |
| Signed SOP / Compliance Form | PDF upload | Mandatory |
| Quiz / Assessment Results | Numeric score | Mandatory · Configurable passing threshold |

---

## Core Features

### 1. Document Upload & Rules Engine
Each compliance requirement carries independently configurable rules:
- **Mandatory status**: required vs. optional
- **Input type**: PDF file upload or numeric entry (for quiz/assessment scores)
- **Passing score threshold**: set per assessment (e.g., ≥ 80%)
- **Expiration / renewal interval**: annual, bi-annual, custom (days)
- **Escalation procedure**: configurable chain (employee → manager → HR → compliance officer)

### 2. Employee Compliance Scorecard
Auto-generated per employee, showing:
- ✅ **Completed** — submitted, validated, not expired (green)
- ⏳ **Pending** — not yet submitted or approaching expiration (amber)
- ❌ **Non-compliant** — overdue, failed, or expired (red)
- Plain-language explanation and next-action guidance for each item

### 3. HR / Admin Dashboard
- Organization-wide compliance rate (overall %)
- Department-level summaries (Sales vs. Compliance/Risk)
- Top missing items ranked by frequency across employees
- Upcoming expirations by 30/60/90-day window
- Active escalations with drill-down to employee level
- Send reminder and escalate controls per employee or requirement

### 4. Automated Tracking & Alerts
- Expiration alerts fire automatically before renewal deadlines
- Escalation workflows trigger on missed deadlines: employee → manager → HR
- In-app and email notifications for pending and overdue items

### 5. Audit Logs & Historical Records
- Full timestamped audit trail of all uploads, status changes, and administrative actions
- Historical compliance records per employee per requirement (not just current status)
- Immutable log suitable for regulatory review and external audit

### 6. Export & Reporting
- **CSV export**: bulk compliance data for spreadsheet analysis
- **PDF export**: formatted employee-level and department-level compliance reports
- Output designed for external audit submission

### 7. Configuration Console (HR Self-Service)
- Add, edit, or archive compliance requirements per department and role
- Set and modify rules (mandatory flag, input type, score thresholds, renewal intervals)
- Manage escalation chains and notification recipients
- Add new departments or roles without developer involvement

---

## Technical Scope

| Dimension | Detail |
|---|---|
| **Platform** | Responsive web app — mobile-friendly and desktop-ready |
| **Roles** | HR Admin, Employee, Department Manager (role-based access control) |
| **Employee view** | Sees only their own compliance data |
| **HR view** | Full organization visibility with configuration access |
| **Document storage** | Secure file storage with access control per employee/role |
| **Notifications** | In-app alerts + email notifications |
| **Exports** | CSV (bulk data) + PDF (formatted reports) |

---

## Strategic Principles

1. **Configurability over hardcoding** — rules, departments, roles, and thresholds must be editable by HR without engineering
2. **Audit-first design** — every action is logged, timestamped, and exportable
3. **Employee clarity** — each employee must immediately understand their status and their next required action
4. **Escalation that actually executes** — automated chains prevent gaps from falling through; HR can override at any level
5. **Mobile parity** — field employees in Sales need full functionality on mobile, not a degraded view
