# Design Guidelines — ComplianceIQ

## Color Palette
- Primary: #0066CC (trust blue) — headers, primary buttons, active states
- Accent: #00A3E0 (sky blue) — highlights, secondary actions, progress indicators
- Status Green: #22C55E — compliant, complete items
- Status Amber: #F59E0B — pending, approaching expiration
- Status Red: #EF4444 — non-compliant, overdue, failed
- Background: #FFFFFF white
- Surface: #F8FAFC (slate-50) — cards, panels
- Border: #E2E8F0 (slate-200)
- Text primary: #0F172A (slate-900)
- Text secondary: #64748B (slate-500)

## Typography
- Headlines: Bold, tight leading (font-bold, leading-tight)
- Body: Regular weight, relaxed leading for readability
- Labels/badges: Uppercase tracking-widest, xs/sm size
- Data: Tabular, compact — compliance data is dense

## Key Components
- **Status badges**: Pill-shaped, color-coded: green (Compliant), amber (Pending), red (Non-Compliant)
- **Scorecard cards**: White cards with left border in status color, icon, requirement name, status badge, expiration date
- **Metric cards**: Large bold number, small label, subtle shadow, rounded-2xl
- **Data tables**: Clean, zebra-striped, sortable, with action buttons per row
- **Dashboard panels**: Card grid at top (metrics), table/list below (detail)
- **Upload zones**: Dashed border, clear file type indication, progress state

## Layout Principles
- Mobile-first responsive (full functionality on small screens)
- Dashboard: metric cards row → department summary → tables
- Employee view: scorecard prominently at top, pending actions list below
- HR view: global metrics → department drill-down → individual employee
- Consistent 1.5rem/2rem padding on content containers
- Use color sparingly — white/slate base, color only for status and primary actions

## Elevation
- Cards: shadow-sm (subtle lift)
- Modals/drawers: shadow-xl
- Active/focused: ring-2 ring-blue-500