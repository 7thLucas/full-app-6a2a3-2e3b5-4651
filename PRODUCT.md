# ComplianceIQ — Allied Financial Insurance

## Product Purpose
A web-based compliance management platform that automates employee compliance tracking across Sales and Compliance/Risk departments. Employees upload mandatory documents and quiz scores; the system validates against configurable rules and generates real-time compliance scorecards. HR/Admin has a live dashboard with escalation controls and audit exports.

## Users
- **HR / Admin**: Configure rules per department/role/document, monitor org-wide metrics, view department summaries, send reminders, escalate non-compliance, export CSV/PDF reports, access full audit logs
- **Employee (Sales or Compliance/Risk)**: View personal compliance scorecard (color-coded: green=complete, amber=pending, red=non-compliant), upload PDFs or enter quiz scores, see expiration alerts and next actions
- **Department Manager**: View department compliance summary and escalations

## Compliance Requirements — Sales Dept
- AML Training (PDF, mandatory, annual renewal)
- Anti-Fraud Training (PDF, mandatory, annual renewal)
- Data Privacy Training (PDF, mandatory, annual renewal)
- Sales License (PDF, mandatory, expiration tracked)
- Signed SOP Form (PDF, mandatory)
- Quiz/Assessment Score (numeric, mandatory, configurable passing threshold)

## Compliance Requirements — Compliance/Risk Dept
- AML Training (PDF, mandatory, annual renewal)
- Anti-Fraud Training (PDF, mandatory, annual renewal)
- Data Privacy Training (PDF, mandatory, annual renewal)
- CRCM Certification (PDF, mandatory, expiration tracked)
- Signed SOP Form (PDF, mandatory)
- Quiz/Assessment Score (numeric, mandatory, configurable passing threshold)

## Core Features
1. Document upload (PDF) and numeric score entry with per-requirement configurable rules: mandatory flag, file type, passing threshold, expiration interval, escalation chain
2. Auto-generated employee compliance scorecard: color-coded completed/pending/non-compliant with explanations and next-action guidance
3. HR Admin dashboard: org-wide compliance %, department summaries, top missing items, 30/60/90-day expiration windows, active escalations, send-reminder and escalate controls
4. Automated alerts: expiration warnings, escalation chains (employee → manager → HR → compliance officer)
5. Audit logs: immutable timestamped trail of all uploads, status changes, admin actions
6. Historical records per employee per requirement
7. CSV and PDF export for audit submission
8. HR configuration console: add/edit requirements, rules, departments, roles without code changes

## Brand
- Company: Allied Financial Insurance
- App name: ComplianceIQ
- Tone: Authoritative, clear, compliance-focused — appropriate for a regulated financial institution

## Strategic Principles
1. Configurability — rules editable by HR without engineering
2. Audit-first — every action logged, timestamped, exportable
3. Employee clarity — immediate status + next action visible
4. Escalation that executes — automated chains with HR override
5. Mobile parity — full functionality on mobile for Sales field staff