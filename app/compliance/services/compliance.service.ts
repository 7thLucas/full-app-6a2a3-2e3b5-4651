import { ComplianceRequirementModel } from "../models/requirement.model";
import { EmployeeComplianceRecordModel } from "../models/employee-record.model";
import { ComplianceAuditLogModel } from "../models/compliance-audit-log.model";
import { EmployeeProfileModel } from "../models/employee-profile.model";

export async function getRequirementsForDepartment(department: string) {
  return ComplianceRequirementModel.find({
    isActive: true,
    $or: [{ department }, { department: "All" }],
  }).sort({ sortOrder: 1 });
}

export async function getAllRequirements() {
  return ComplianceRequirementModel.find({ isActive: true }).sort({ department: 1, sortOrder: 1 });
}

export async function getEmployeeScorecard(userId: string, department: string) {
  const requirements = await getRequirementsForDepartment(department);
  const records = await EmployeeComplianceRecordModel.find({ userId });

  const recordMap = new Map(records.map((r) => [r.requirementId, r]));

  const now = new Date();

  return requirements.map((req) => {
    const record = recordMap.get(req.id?.toString() ?? "");
    let status: string = "pending";
    let expiresAt: Date | null = null;
    let daysUntilExpiry: number | null = null;

    if (record) {
      // Check if expired
      if (record.expiresAt && record.expiresAt < now) {
        status = "expired";
      } else {
        status = record.status;
      }
      expiresAt = record.expiresAt ?? null;
      if (expiresAt) {
        daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    return {
      requirementId: req.id?.toString() ?? "",
      name: req.name,
      type: req.type,
      mandatory: req.mandatory,
      status,
      documentUrl: record?.documentUrl ?? null,
      documentName: record?.documentName ?? null,
      score: record?.score ?? null,
      submittedAt: record?.submittedAt ?? null,
      expiresAt,
      daysUntilExpiry,
      trackExpiration: req.trackExpiration,
      renewalInterval: req.renewalInterval,
      passingScore: req.passingScore ?? null,
      escalated: record?.escalated ?? false,
      notes: record?.notes ?? null,
      rejectionReason: record?.rejectionReason ?? null,
    };
  });
}

export async function computeCompliancePercentage(userId: string, department: string) {
  const scorecard = await getEmployeeScorecard(userId, department);
  const mandatory = scorecard.filter((s) => s.mandatory);
  if (mandatory.length === 0) return 100;
  const compliant = mandatory.filter((s) => s.status === "compliant");
  return Math.round((compliant.length / mandatory.length) * 100);
}

export async function getDepartmentSummary(department: string) {
  const profiles = await EmployeeProfileModel.find({ department, isActive: true });
  if (profiles.length === 0) {
    return { department, totalEmployees: 0, avgCompliance: 0, compliantCount: 0, pendingCount: 0, nonCompliantCount: 0 };
  }

  let totalPercentage = 0;
  let compliantCount = 0;
  let pendingCount = 0;
  let nonCompliantCount = 0;

  for (const profile of profiles) {
    const pct = await computeCompliancePercentage(profile.userId, department);
    totalPercentage += pct;
    if (pct === 100) compliantCount++;
    else if (pct >= 50) pendingCount++;
    else nonCompliantCount++;
  }

  return {
    department,
    totalEmployees: profiles.length,
    avgCompliance: Math.round(totalPercentage / profiles.length),
    compliantCount,
    pendingCount,
    nonCompliantCount,
  };
}

export async function getOrgWideDashboard() {
  const profiles = await EmployeeProfileModel.find({ isActive: true });
  const requirements = await getAllRequirements();

  const now = new Date();
  const expiring30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiring60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const expiring90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Expiring records
  const expiringIn30 = await EmployeeComplianceRecordModel.countDocuments({
    status: "compliant",
    expiresAt: { $gte: now, $lt: expiring30 },
  });
  const expiringIn60 = await EmployeeComplianceRecordModel.countDocuments({
    status: "compliant",
    expiresAt: { $gte: expiring30, $lt: expiring60 },
  });
  const expiringIn90 = await EmployeeComplianceRecordModel.countDocuments({
    status: "compliant",
    expiresAt: { $gte: expiring60, $lt: expiring90 },
  });

  // Active escalations
  const activeEscalations = await EmployeeComplianceRecordModel.countDocuments({ escalated: true });

  // Pending reviews (submitted but not yet approved/rejected)
  const pendingReviews = await EmployeeComplianceRecordModel.countDocuments({ status: "pending", submittedAt: { $ne: null } });

  // Non-compliant records
  const nonCompliantRecords = await EmployeeComplianceRecordModel.countDocuments({ status: { $in: ["non_compliant", "expired"] } });

  // Department summaries
  const departments = [...new Set(profiles.map((p) => p.department))];
  const departmentSummaries = await Promise.all(departments.map((d) => getDepartmentSummary(d)));

  // Top missing requirements
  const missingByReq: Record<string, { name: string; department: string; count: number }> = {};
  for (const req of requirements) {
    const submitted = await EmployeeComplianceRecordModel.countDocuments({
      requirementId: req.id?.toString(),
      status: { $in: ["compliant", "pending"] },
    });
    const deptProfiles = await EmployeeProfileModel.countDocuments({ department: req.department === "All" ? undefined : req.department, isActive: true });
    const missing = Math.max(0, deptProfiles - submitted);
    if (missing > 0) {
      missingByReq[req.id?.toString() ?? ""] = { name: req.name, department: req.department, count: missing };
    }
  }
  const topMissing = Object.values(missingByReq).sort((a, b) => b.count - a.count).slice(0, 5);

  // Overall compliance
  let totalPct = 0;
  for (const profile of profiles) {
    totalPct += await computeCompliancePercentage(profile.userId, profile.department);
  }
  const orgCompliancePercent = profiles.length > 0 ? Math.round(totalPct / profiles.length) : 0;

  return {
    totalEmployees: profiles.length,
    orgCompliancePercent,
    pendingReviews,
    nonCompliantRecords,
    activeEscalations,
    expiringIn30,
    expiringIn60,
    expiringIn90,
    departmentSummaries,
    topMissing,
  };
}

export async function submitDocument(
  userId: string,
  requirementId: string,
  documentUrl: string,
  documentName: string,
  userEmail: string,
  userName: string,
) {
  const req = await ComplianceRequirementModel.findById(requirementId);
  if (!req) throw new Error("Requirement not found");

  let expiresAt: Date | null = null;
  if (req.trackExpiration && req.renewalInterval === "annual") {
    expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else if (req.trackExpiration && req.renewalInterval === "biennial") {
    expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);
  }

  // Upsert the record
  const existing = await EmployeeComplianceRecordModel.findOne({ userId, requirementId });
  if (existing) {
    existing.documentUrl = documentUrl;
    existing.documentName = documentName;
    existing.status = "compliant";
    existing.submittedAt = new Date();
    existing.expiresAt = expiresAt;
    existing.rejectionReason = null;
    await existing.save();
  } else {
    await EmployeeComplianceRecordModel.create({
      userId,
      requirementId,
      requirementName: req.name,
      department: req.department,
      status: "compliant",
      documentUrl,
      documentName,
      submittedAt: new Date(),
      expiresAt,
    });
  }

  await ComplianceAuditLogModel.create({
    userId,
    userEmail,
    userName,
    requirementId,
    action: "document_uploaded",
    metadata: { requirementName: req.name, documentName },
    timestamp: new Date(),
  });
}

export async function submitScore(
  userId: string,
  requirementId: string,
  score: number,
  userEmail: string,
  userName: string,
) {
  const req = await ComplianceRequirementModel.findById(requirementId);
  if (!req) throw new Error("Requirement not found");

  const passingScore = req.passingScore ?? 70;
  const status = score >= passingScore ? "compliant" : "non_compliant";

  const existing = await EmployeeComplianceRecordModel.findOne({ userId, requirementId });
  if (existing) {
    existing.score = score;
    existing.status = status;
    existing.submittedAt = new Date();
    await existing.save();
  } else {
    await EmployeeComplianceRecordModel.create({
      userId,
      requirementId,
      requirementName: req.name,
      department: req.department,
      status,
      score,
      submittedAt: new Date(),
    });
  }

  await ComplianceAuditLogModel.create({
    userId,
    userEmail,
    userName,
    requirementId,
    action: "score_submitted",
    metadata: { requirementName: req.name, score, status },
    timestamp: new Date(),
  });
}

export async function escalateRecord(
  recordId: string,
  escalatedTo: string,
  actorUserId: string,
  actorEmail: string,
  actorName: string,
) {
  const record = await EmployeeComplianceRecordModel.findById(recordId);
  if (!record) throw new Error("Record not found");

  record.escalated = true;
  record.escalatedTo = escalatedTo;
  record.escalatedAt = new Date();
  await record.save();

  await ComplianceAuditLogModel.create({
    userId: actorUserId,
    userEmail: actorEmail,
    userName: actorName,
    targetUserId: record.userId,
    requirementId: record.requirementId,
    action: "escalated",
    metadata: { escalatedTo, requirementName: record.requirementName },
    timestamp: new Date(),
  });

  return record;
}

export async function getAuditLogs(limit = 100, skip = 0, userId?: string) {
  const query = userId ? { $or: [{ userId }, { targetUserId: userId }] } : {};
  return ComplianceAuditLogModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit);
}

export async function getEmployeesWithCompliance() {
  const profiles = await EmployeeProfileModel.find({ isActive: true }).lean();

  const results = await Promise.all(
    profiles.map(async (profile) => {
      const pct = await computeCompliancePercentage(profile.userId, profile.department);
      const scorecard = await getEmployeeScorecard(profile.userId, profile.department);
      const missing = scorecard.filter((s) => s.mandatory && s.status !== "compliant").map((s) => s.name);
      return {
        ...profile,
        compliancePercent: pct,
        missingItems: missing,
        status: pct === 100 ? "compliant" : pct >= 50 ? "pending" : "non_compliant",
      };
    })
  );

  return results;
}
