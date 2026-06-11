import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export type ComplianceRole = "employee" | "manager" | "hr_admin" | "compliance_officer";

@modelOptions({
  schemaOptions: {
    collection: "tbl_employee_profiles",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class EmployeeProfile extends CommonTypegooseEntity {
  @prop({ type: String, required: true, unique: true, index: true })
  userId!: string;

  @prop({ type: String, required: true })
  fullName!: string;

  @prop({ type: String, required: true })
  department!: string;

  @prop({ type: String, default: "Employee" })
  jobTitle!: string;

  @prop({ type: String, enum: ["employee", "manager", "hr_admin", "compliance_officer"], default: "employee" })
  complianceRole!: ComplianceRole;

  @prop({ type: String, default: null })
  managerId?: string | null;

  @prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const EmployeeProfileModel = getModelForClass(EmployeeProfile);
