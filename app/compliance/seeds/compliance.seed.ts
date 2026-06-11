import { createLogger } from "~/lib/logger";
import { ComplianceRequirementModel } from "../models/requirement.model";

const logger = createLogger("ComplianceSeed");

const SALES_REQUIREMENTS = [
  {
    name: "AML Training",
    type: "document" as const,
    department: "Sales",
    mandatory: true,
    renewalInterval: "annual" as const,
    trackExpiration: true,
    acceptedFileTypes: ["application/pdf"],
    escalationChain: ["employee", "manager", "hr", "compliance_officer"],
    sortOrder: 1,
  },
  {
    name: "Anti-Fraud Training",
    type: "document" as const,
    department: "Sales",
    mandatory: true,
    renewalInterval: "annual" as const,
    trackExpiration: true,
    acceptedFileTypes: ["application/pdf"],
    escalationChain: ["employee", "manager", "hr", "compliance_officer"],
    sortOrder: 2,
  },
  {
    name: "Data Privacy Training",
    type: "document" as const,
    department: "Sales",
    mandatory: true,
    renewalInterval: "annual" as const,
    trackExpiration: true,
    acceptedFileTypes: ["application/pdf"],
    escalationChain: ["employee", "manager", "hr", "compliance_officer"],
    sortOrder: 3,
  },
  {
    name: "Sales License",
    type: "document" as const,
    department: "Sales",
    mandatory: true,
    renewalInterval: "annual" as const,
    trackExpiration: true,
    acceptedFileTypes: ["application/pdf"],
    escalationChain: ["employee", "manager", "hr", "compliance_officer"],
    sortOrder: 4,
  },
  {
    name: "Signed SOP Form",
    type: "document" as const,
    department: "Sales",
    mandatory: true,
    renewalInterval: "none" as const,
    trackExpiration: false,
    acceptedFileTypes: ["application/pdf"],
    escalationChain: ["employee", "manager", "hr"],
    sortOrder: 5,
  },
  {
    name: "Quiz/Assessment Score",
    type: "score" as const,
    department: "Sales",
    mandatory: true,
    renewalInterval: "annual" as const,
    trackExpiration: false,
    passingScore: 70,
    escalationChain: ["employee", "manager", "hr"],
    sortOrder: 6,
  },
];

const COMPLIANCE_RISK_REQUIREMENTS = [
  {
    name: "AML Training",
    type: "document" as const,
    department: "Compliance/Risk",
    mandatory: true,
    renewalInterval: "annual" as const,
    trackExpiration: true,
    acceptedFileTypes: ["application/pdf"],
    escalationChain: ["employee", "manager", "hr", "compliance_officer"],
    sortOrder: 1,
  },
  {
    name: "Anti-Fraud Training",
    type: "document" as const,
    department: "Compliance/Risk",
    mandatory: true,
    renewalInterval: "annual" as const,
    trackExpiration: true,
    acceptedFileTypes: ["application/pdf"],
    escalationChain: ["employee", "manager", "hr", "compliance_officer"],
    sortOrder: 2,
  },
  {
    name: "Data Privacy Training",
    type: "document" as const,
    department: "Compliance/Risk",
    mandatory: true,
    renewalInterval: "annual" as const,
    trackExpiration: true,
    acceptedFileTypes: ["application/pdf"],
    escalationChain: ["employee", "manager", "hr", "compliance_officer"],
    sortOrder: 3,
  },
  {
    name: "CRCM Certification",
    type: "document" as const,
    department: "Compliance/Risk",
    mandatory: true,
    renewalInterval: "biennial" as const,
    trackExpiration: true,
    acceptedFileTypes: ["application/pdf"],
    escalationChain: ["employee", "manager", "hr", "compliance_officer"],
    sortOrder: 4,
  },
  {
    name: "Signed SOP Form",
    type: "document" as const,
    department: "Compliance/Risk",
    mandatory: true,
    renewalInterval: "none" as const,
    trackExpiration: false,
    acceptedFileTypes: ["application/pdf"],
    escalationChain: ["employee", "manager", "hr"],
    sortOrder: 5,
  },
  {
    name: "Quiz/Assessment Score",
    type: "score" as const,
    department: "Compliance/Risk",
    mandatory: true,
    renewalInterval: "annual" as const,
    trackExpiration: false,
    passingScore: 75,
    escalationChain: ["employee", "manager", "hr"],
    sortOrder: 6,
  },
];

export async function seedComplianceRequirements(): Promise<void> {
  try {
    const existingCount = await ComplianceRequirementModel.countDocuments({});
    if (existingCount > 0) {
      logger.info("Compliance requirements already seeded, skipping.");
      return;
    }

    await ComplianceRequirementModel.insertMany([
      ...SALES_REQUIREMENTS,
      ...COMPLIANCE_RISK_REQUIREMENTS,
    ]);

    logger.info(`✅ Seeded ${SALES_REQUIREMENTS.length + COMPLIANCE_RISK_REQUIREMENTS.length} compliance requirements.`);
  } catch (error) {
    logger.error("❌ Failed to seed compliance requirements:", error);
  }
}
