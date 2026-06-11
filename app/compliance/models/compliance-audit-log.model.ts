import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_compliance_audit_logs",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class ComplianceAuditLog extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  userId!: string;

  @prop({ type: String, required: true })
  userEmail!: string;

  @prop({ type: String, required: true })
  userName!: string;

  @prop({ type: String, default: null })
  targetUserId?: string | null;

  @prop({ type: String, default: null })
  requirementId?: string | null;

  @prop({ type: String, required: true })
  action!: string;
  // e.g. "document_uploaded", "score_submitted", "status_changed",
  //      "reminder_sent", "escalated", "record_approved", "record_rejected",
  //      "requirement_created", "requirement_updated", "export_csv", "export_pdf"

  @prop({ type: Object, default: {} })
  metadata!: Record<string, any>;

  @prop({ type: Date, required: true, default: Date.now })
  timestamp!: Date;
}

export const ComplianceAuditLogModel = getModelForClass(ComplianceAuditLog);
