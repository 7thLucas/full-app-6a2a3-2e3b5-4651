import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export type RequirementType = "document" | "score";
export type RenewalInterval = "annual" | "biennial" | "none";

@modelOptions({
  schemaOptions: {
    collection: "tbl_compliance_requirements",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class ComplianceRequirement extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, required: true, enum: ["document", "score"] })
  type!: RequirementType;

  @prop({ type: String, required: true })
  department!: string; // "Sales" | "Compliance/Risk" | "All"

  @prop({ type: Boolean, default: true })
  mandatory!: boolean;

  @prop({ type: String, enum: ["annual", "biennial", "none"], default: "none" })
  renewalInterval!: RenewalInterval;

  @prop({ type: Boolean, default: false })
  trackExpiration!: boolean;

  // For score type: minimum passing score
  @prop({ type: Number, default: null })
  passingScore?: number | null;

  // For document type: accepted file types
  @prop({ type: [String], default: ["application/pdf"] })
  acceptedFileTypes!: string[];

  // Escalation chain roles (in order)
  @prop({ type: [String], default: ["employee", "manager", "hr", "compliance_officer"] })
  escalationChain!: string[];

  @prop({ type: Boolean, default: true })
  isActive!: boolean;

  @prop({ type: Number, default: 0 })
  sortOrder!: number;
}

export const ComplianceRequirementModel = getModelForClass(ComplianceRequirement);
