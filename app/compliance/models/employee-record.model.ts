import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export type ComplianceStatus = "compliant" | "pending" | "non_compliant" | "expired";

@modelOptions({
  schemaOptions: {
    collection: "tbl_employee_compliance_records",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class EmployeeComplianceRecord extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  userId!: string;

  @prop({ type: String, required: true, index: true })
  requirementId!: string;

  @prop({ type: String, required: true })
  requirementName!: string;

  @prop({ type: String, required: true })
  department!: string;

  @prop({ type: String, enum: ["compliant", "pending", "non_compliant", "expired"], default: "pending" })
  status!: ComplianceStatus;

  // For document submissions
  @prop({ type: String, default: null })
  documentUrl?: string | null;

  @prop({ type: String, default: null })
  documentName?: string | null;

  // For score submissions
  @prop({ type: Number, default: null })
  score?: number | null;

  // Dates
  @prop({ type: Date, default: null })
  submittedAt?: Date | null;

  @prop({ type: Date, default: null })
  approvedAt?: Date | null;

  @prop({ type: Date, default: null })
  expiresAt?: Date | null;

  // Notes and context
  @prop({ type: String, default: null })
  notes?: string | null;

  @prop({ type: String, default: null })
  rejectionReason?: string | null;

  // Escalation tracking
  @prop({ type: Boolean, default: false })
  escalated!: boolean;

  @prop({ type: String, default: null })
  escalatedTo?: string | null;

  @prop({ type: Date, default: null })
  escalatedAt?: Date | null;
}

export const EmployeeComplianceRecordModel = getModelForClass(EmployeeComplianceRecord);
