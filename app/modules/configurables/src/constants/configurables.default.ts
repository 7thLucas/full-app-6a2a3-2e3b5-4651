/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TStatusColors = {
  compliant: string;
  pending: string;
  nonCompliant: string;
};

export type TExpirationWindowDays = {
  warning30: number;
  warning60: number;
  warning90: number;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  companyName: string;
  brandColor: TBrandColor;
  statusColors?: TStatusColors;
  reminderEmailEnabled?: boolean;
  expirationWindowDays?: TExpirationWindowDays;
  footerText?: string;
  loginWelcomeMessage?: string;
  departments?: string[];
  enableEmployeeSelfRegistration?: boolean;
  csvExportEnabled?: boolean;
  pdfExportEnabled?: boolean;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "ComplianceIQ",
  logoUrl: "FILL_LOGO_URL_HERE",
  companyName: "Allied Financial Insurance",
  brandColor: {
    primary: "#0066CC",
    secondary: "#00A3E0",
    accent: "#00A3E0",
  },
  statusColors: {
    compliant: "#22C55E",
    pending: "#F59E0B",
    nonCompliant: "#EF4444",
  },
  reminderEmailEnabled: true,
  expirationWindowDays: {
    warning30: 30,
    warning60: 60,
    warning90: 90,
  },
  footerText: "© Allied Financial Insurance. All rights reserved. ComplianceIQ is a regulated compliance tracking system.",
  loginWelcomeMessage: "Welcome to ComplianceIQ — Allied Financial Insurance Compliance Management Platform",
  departments: ["Sales", "Compliance/Risk"],
  enableEmployeeSelfRegistration: false,
  csvExportEnabled: true,
  pdfExportEnabled: true,
};
