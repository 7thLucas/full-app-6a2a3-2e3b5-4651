import { createLogger } from "~/lib/logger";
import { JudgmentConfigModel } from "./src/models/config.model";
import { normalizeGeneratedConfigPayload, validateConfigPayload } from "./src/lib/judgment.utils";

const logger = createLogger("JudgmentSeed");

/**
 * Standard output envelope shared by every seeded compliance config. The judgment
 * engine + frontend drawer rely on this exact shape.
 */
const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string" },
    evidenceSubmissionId: { type: "string" },
    criterionId: { type: "string" },
    verdict: { type: "string", enum: ["pass", "partial", "fail", "risk", "ready", "not_ready"] },
    score: { type: "number", minimum: 0, maximum: 100 },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
    reason: { type: "string" },
    fixSuggestion: { type: "string" },
    requiresHumanReview: { type: "boolean" },
    provider: { type: "string" },
    model: { type: "string" },
    resultData: {
      type: "object",
      properties: {
        complianceStatus: { type: "string", enum: ["Compliant", "Non-Compliant"] },
        missingItems: { type: "array", items: { type: "string" } },
        auditTrail: { type: "array", items: { type: "object" } },
      },
    },
  },
  required: [
    "id",
    "evidenceSubmissionId",
    "criterionId",
    "verdict",
    "score",
    "confidence",
    "severity",
    "reason",
    "fixSuggestion",
    "requiresHumanReview",
  ],
} as const;

const STANDARD_LABELS = {
  unitLabel: "Department",
  workerLabel: "Employee",
  managerLabel: "HR / Compliance Officer",
};

const STANDARD_DASHBOARD = {
  title: "Allied Financial Compliance Dashboard",
  company: "Allied Financial Insurance",
};

/**
 * Builds the input schema for a compliance submission.
 *
 * Employees only ever provide: their identity (name / email / department), a free-text
 * evidence note, and a single uploaded certificate/form file. There is intentionally
 * NO numeric quiz-score input field — any score threshold lives inside the criteria
 * `passCriteria` text so the AI evaluator infers it from the uploaded evidence.
 */
function buildInputSchema(fileKey: string, fileTitle: string, fileDescription: string) {
  return {
    type: "object",
    properties: {
      employeeName: {
        type: "string",
        title: "Employee Name",
        description: "Full name of the employee submitting this form.",
      },
      employeeEmail: {
        type: "string",
        title: "Employee Email",
        description: "Work email address of the submitting employee.",
      },
      department: {
        type: "string",
        title: "Department",
        description: "Department the employee belongs to.",
      },
      evidenceText: {
        type: "string",
        title: "Evidence / Notes",
        description: "Supporting notes, observations, or evidence related to this submission.",
      },
      [fileKey]: {
        type: "string",
        title: fileTitle,
        description: fileDescription,
        "x-ui": { widget: "file" },
      },
    },
    required: ["employeeName", "employeeEmail", "department", "evidenceText", fileKey],
  };
}

type SeedConfig = Record<string, any>;

const SEED_CONFIGS: SeedConfig[] = [
  {
    pluginId: "aml_training_compliance",
    name: "AML Training Compliance Submission",
    rules:
      "Review the submitted AML training certificate. Verify that the certificate is in PDF format. Reject submissions with missing or invalid certificates.",
    inputSchema: buildInputSchema(
      "aml_certificate",
      "AML Training Certificate",
      "PDF certificate of completion for Anti-Money Laundering training.",
    ),
    outputSchema: OUTPUT_SCHEMA,
    criteria: [
      {
        id: "criterion_aml_cert_format",
        category: "Documentation",
        name: "AML Certificate Format",
        passCriteria: "Certificate is uploaded in PDF format.",
        severity: "high",
        weight: 100,
        autoFailIfMissing: true,
      },
    ],
    variables: {
      labels: STANDARD_LABELS,
      actions: { defaultTaskDueHours: 720 },
      dashboard: { ...STANDARD_DASHBOARD, title: "AML Training Compliance Dashboard" },
      targetDepartment: "All",
      configType: "SOP",
      dueDate: "2050-02-20",
      description:
        "Review the submitted AML training certificate. Verify that it is in PDF format.",
    },
  },
  {
    pluginId: "anti_fraud_training_compliance",
    name: "Anti-Fraud Training Compliance Submission",
    rules:
      "Review the submitted Anti-Fraud training certificate. Verify that the certificate is in PDF format. Reject submissions with missing or invalid certificates.",
    inputSchema: buildInputSchema(
      "anti_fraud_certificate",
      "Anti-Fraud Training Certificate",
      "PDF certificate of completion for Anti-Fraud training.",
    ),
    outputSchema: OUTPUT_SCHEMA,
    criteria: [
      {
        id: "criterion_fraud_cert_format",
        category: "Documentation",
        name: "Anti-Fraud Certificate Format",
        passCriteria: "Certificate is uploaded in PDF format.",
        severity: "high",
        weight: 100,
        autoFailIfMissing: true,
      },
    ],
    variables: {
      labels: STANDARD_LABELS,
      actions: { defaultTaskDueHours: 720 },
      dashboard: { ...STANDARD_DASHBOARD, title: "Anti-Fraud Training Compliance Dashboard" },
      targetDepartment: "All",
      configType: "SOP",
      dueDate: "2050-02-20",
      description:
        "Review the submitted Anti-Fraud training certificate. Verify that it is in PDF format.",
    },
  },
  {
    pluginId: "data_privacy_training_compliance",
    name: "Data Privacy Training Compliance Submission",
    rules:
      "Review the submitted Data Privacy training certificate. Verify that the certificate is in PDF format. Reject submissions with missing or invalid certificates.",
    inputSchema: buildInputSchema(
      "data_privacy_certificate",
      "Data Privacy Training Certificate",
      "PDF certificate of completion for Data Privacy training.",
    ),
    outputSchema: OUTPUT_SCHEMA,
    criteria: [
      {
        id: "criterion_privacy_cert_format",
        category: "Documentation",
        name: "Data Privacy Certificate Format",
        passCriteria: "Certificate is uploaded in PDF format.",
        severity: "high",
        weight: 100,
        autoFailIfMissing: true,
      },
    ],
    variables: {
      labels: STANDARD_LABELS,
      actions: { defaultTaskDueHours: 720 },
      dashboard: { ...STANDARD_DASHBOARD, title: "Data Privacy Training Compliance Dashboard" },
      targetDepartment: "All",
      configType: "SOP",
      dueDate: "2050-02-20",
      description:
        "Review the submitted Data Privacy training certificate. Verify that it is in PDF format.",
    },
  },
  {
    pluginId: "sales_product_license_compliance",
    name: "Sales Product License Compliance Submission",
    rules:
      "Review the submitted Sales Product License (e.g., Life Insurance License) certificate. Verify that the license is in PDF format and track the expiration date. Ensure the license is valid and has not expired. Reject submissions with missing licenses, invalid formats, or expired licenses.",
    inputSchema: buildInputSchema(
      "product_license",
      "Sales Product License",
      "PDF copy of the Sales Product License (e.g., Life Insurance License), including its expiration date.",
    ),
    outputSchema: OUTPUT_SCHEMA,
    criteria: [
      {
        id: "criterion_license_format",
        category: "Documentation",
        name: "License Certificate Format",
        passCriteria: "License is uploaded in PDF format.",
        severity: "high",
        weight: 20,
        autoFailIfMissing: true,
      },
      {
        id: "criterion_license_validity",
        category: "Compliance",
        name: "License Validity",
        passCriteria: "License expiration date is after the submission date.",
        severity: "critical",
        weight: 80,
        autoFailIfMissing: true,
      },
    ],
    variables: {
      labels: STANDARD_LABELS,
      actions: { defaultTaskDueHours: 2160 },
      dashboard: { ...STANDARD_DASHBOARD, title: "Sales Product License Compliance Dashboard" },
      targetDepartment: "All",
      configType: "SOP",
      dueDate: "2050-02-20",
      description:
        "Review the submitted Sales Product License certificate. Verify PDF format and that the license has not expired.",
    },
  },
  {
    pluginId: "sop_acknowledgment_compliance",
    name: "SOP Acknowledgment Compliance Submission",
    rules:
      "Review the submitted signed SOP acknowledgment form. Verify that the document is in PDF format and contains a valid signature. Confirm that the employee has acknowledged understanding of the compliance rules and SOPs. Reject submissions with missing signatures, invalid formats, or unsigned documents.",
    inputSchema: buildInputSchema(
      "signed_sop_form",
      "Signed SOP Acknowledgment Form",
      "PDF of the signed Allied Financial Insurance SOP acknowledgment form, including the employee signature and date.",
    ),
    outputSchema: OUTPUT_SCHEMA,
    criteria: [
      {
        id: "criterion_sop_format",
        category: "Documentation",
        name: "SOP Form Format",
        passCriteria: "Form is uploaded in PDF format.",
        severity: "high",
        weight: 20,
        autoFailIfMissing: true,
      },
      {
        id: "criterion_sop_signature",
        category: "Compliance",
        name: "SOP Form Signature",
        passCriteria: "Form contains a valid signature from the employee.",
        severity: "critical",
        weight: 80,
        autoFailIfMissing: true,
      },
    ],
    variables: {
      labels: STANDARD_LABELS,
      actions: { defaultTaskDueHours: 168 },
      dashboard: { ...STANDARD_DASHBOARD, title: "SOP Acknowledgment Compliance Dashboard" },
      targetDepartment: "All",
      configType: "SOP",
      dueDate: "2050-02-20",
      description:
        "Review the submitted signed SOP acknowledgment form. Verify PDF format and a valid employee signature.",
    },
  },
];

/**
 * Seeds the canonical Allied Financial compliance configs. Idempotent via upsert on
 * `pluginId`, so it is safe to run on every startup — existing records are refreshed
 * rather than duplicated.
 */
export async function seedJudgmentConfigs() {
  let seededCount = 0;

  for (const config of SEED_CONFIGS) {
    const normalized = normalizeGeneratedConfigPayload(config);
    validateConfigPayload(normalized);

    await JudgmentConfigModel.findOneAndUpdate(
      { pluginId: normalized.pluginId },
      { $set: normalized },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    seededCount += 1;
    logger.info("Seeded judgment config", { pluginId: normalized.pluginId });
  }

  logger.info("Judgment config seeding completed", { seededCount });
}

export default seedJudgmentConfigs;
