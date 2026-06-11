import { Router, type Request, type Response } from "express";
import multer from "multer";
import { requireAuth, requireAdmin } from "~/modules/authentication/authentication.middleware";
import { uploadFile } from "~/modules/uploader/src/services/uploader.service";
import {
  getRequirementsForDepartment,
  getAllRequirements,
  getEmployeeScorecard,
  computeCompliancePercentage,
  getDepartmentSummary,
  getOrgWideDashboard,
  submitDocument,
  submitScore,
  escalateRecord,
  getAuditLogs,
  getEmployeesWithCompliance,
} from "../services/compliance.service";
import { ComplianceRequirementModel } from "../models/requirement.model";
import { EmployeeProfileModel } from "../models/employee-profile.model";
import { EmployeeComplianceRecordModel } from "../models/employee-record.model";
import { ComplianceAuditLogModel } from "../models/compliance-audit-log.model";
import { UserModel } from "~/modules/authentication/authentication.model";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── Profile Routes ─────────────────────────────────────────────────

// GET /api/compliance/profile/me
router.get("/compliance/profile/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    let profile = await EmployeeProfileModel.findOne({ userId });
    if (!profile) {
      // Auto-create a profile for authenticated users
      const user = await UserModel.findById(userId);
      profile = await EmployeeProfileModel.create({
        userId,
        fullName: user?.username ?? "Unknown",
        department: "Sales",
        jobTitle: "Employee",
        complianceRole: (req as any).user?.role === "admin" ? "hr_admin" : "employee",
      });
    }
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/compliance/profile/me
router.put("/compliance/profile/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { fullName, department, jobTitle } = req.body;
    const profile = await EmployeeProfileModel.findOneAndUpdate(
      { userId },
      { fullName, department, jobTitle },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Requirements Routes ─────────────────────────────────────────────

// GET /api/compliance/requirements
router.get("/compliance/requirements", requireAuth, async (req: Request, res: Response) => {
  try {
    const { department } = req.query;
    const requirements = department
      ? await getRequirementsForDepartment(department as string)
      : await getAllRequirements();
    res.json({ success: true, data: requirements });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/compliance/requirements — HR Admin only
router.post("/compliance/requirements", requireAdmin, async (req: Request, res: Response) => {
  try {
    const actorUser = (req as any).user;
    const requirement = await ComplianceRequirementModel.create(req.body);
    await ComplianceAuditLogModel.create({
      userId: actorUser.id,
      userEmail: actorUser.email,
      userName: actorUser.username,
      action: "requirement_created",
      metadata: { requirementId: requirement._id, name: requirement.name },
      timestamp: new Date(),
    });
    res.json({ success: true, data: requirement });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/compliance/requirements/:id — HR Admin only
router.put("/compliance/requirements/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const actorUser = (req as any).user;
    const requirement = await ComplianceRequirementModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!requirement) {
      res.status(404).json({ success: false, error: "Requirement not found" });
      return;
    }
    await ComplianceAuditLogModel.create({
      userId: actorUser.id,
      userEmail: actorUser.email,
      userName: actorUser.username,
      action: "requirement_updated",
      metadata: { requirementId: requirement._id, name: requirement.name },
      timestamp: new Date(),
    });
    res.json({ success: true, data: requirement });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/compliance/requirements/:id — HR Admin only
router.delete("/compliance/requirements/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const requirement = await ComplianceRequirementModel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    res.json({ success: true, data: requirement });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Scorecard Routes ───────────────────────────────────────────────

// GET /api/compliance/scorecard/me
router.get("/compliance/scorecard/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    let profile = await EmployeeProfileModel.findOne({ userId });
    if (!profile) {
      const user = await UserModel.findById(userId);
      profile = await EmployeeProfileModel.create({
        userId,
        fullName: user?.username ?? "Unknown",
        department: "Sales",
        jobTitle: "Employee",
        complianceRole: (req as any).user?.role === "admin" ? "hr_admin" : "employee",
      });
    }
    const scorecard = await getEmployeeScorecard(userId, profile.department);
    const compliancePercent = await computeCompliancePercentage(userId, profile.department);
    res.json({ success: true, data: { scorecard, compliancePercent, profile } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/compliance/scorecard/:userId — for managers/admins
router.get("/compliance/scorecard/:userId", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId);
    const profile = await EmployeeProfileModel.findOne({ userId });
    if (!profile) {
      res.status(404).json({ success: false, error: "Employee profile not found" });
      return;
    }
    const scorecard = await getEmployeeScorecard(userId, profile.department);
    const compliancePercent = await computeCompliancePercentage(userId, profile.department);
    res.json({ success: true, data: { scorecard, compliancePercent, profile } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Submission Routes ──────────────────────────────────────────────

// POST /api/compliance/submit/document/:requirementId
router.post(
  "/compliance/submit/document/:requirementId",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const actorUser = (req as any).user;
      const requirementId = String(req.params.requirementId);

      if (!req.file) {
        res.status(400).json({ success: false, error: "No file uploaded" });
        return;
      }

      // Upload to storage
      const uploadResult = await uploadFile({
        file: {
          buffer: req.file.buffer,
          fieldname: req.file.fieldname,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
        },
        keyspace: process.env._KEYSPACE ?? "",
      });

      if (!uploadResult?.data?.url) {
        res.status(500).json({ success: false, error: "File upload failed" });
        return;
      }

      await submitDocument(
        actorUser.id,
        requirementId,
        uploadResult.data.url,
        req.file.originalname,
        actorUser.email,
        actorUser.username,
      );

      res.json({ success: true, message: "Document submitted successfully" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// POST /api/compliance/submit/score/:requirementId
router.post("/compliance/submit/score/:requirementId", requireAuth, async (req: Request, res: Response) => {
  try {
    const actorUser = (req as any).user;
    const requirementId = String(req.params.requirementId);
    const { score } = req.body;

    if (score === undefined || score === null) {
      res.status(400).json({ success: false, error: "Score is required" });
      return;
    }

    await submitScore(actorUser.id, requirementId, Number(score), actorUser.email, actorUser.username);

    res.json({ success: true, message: "Score submitted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Admin Dashboard Routes ─────────────────────────────────────────

// GET /api/compliance/admin/dashboard
router.get("/compliance/admin/dashboard", requireAuth, async (req: Request, res: Response) => {
  try {
    const dashboard = await getOrgWideDashboard();
    res.json({ success: true, data: dashboard });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/compliance/admin/employees
router.get("/compliance/admin/employees", requireAuth, async (req: Request, res: Response) => {
  try {
    const employees = await getEmployeesWithCompliance();
    res.json({ success: true, data: employees });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/compliance/admin/department/:department
router.get("/compliance/admin/department/:department", requireAuth, async (req: Request, res: Response) => {
  try {
    const department = String(req.params.department);
    const summary = await getDepartmentSummary(decodeURIComponent(department));
    const profiles = await EmployeeProfileModel.find({ department: decodeURIComponent(department), isActive: true });
    const employeesWithScores = await Promise.all(
      profiles.map(async (profile) => {
        const pct = await computeCompliancePercentage(profile.userId, profile.department);
        const scorecard = await getEmployeeScorecard(profile.userId, profile.department);
        const missing = scorecard.filter((s) => s.mandatory && s.status !== "compliant").map((s) => s.name);
        return { ...profile.toObject(), compliancePercent: pct, missingItems: missing };
      })
    );
    res.json({ success: true, data: { summary, employees: employeesWithScores } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/compliance/admin/escalate/:recordId
router.post("/compliance/admin/escalate/:recordId", requireAuth, async (req: Request, res: Response) => {
  try {
    const actorUser = (req as any).user;
    const recordId = String(req.params.recordId);
    const { escalateTo } = req.body;
    const record = await escalateRecord(recordId, escalateTo ?? "hr", actorUser.id, actorUser.email, actorUser.username);
    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/compliance/admin/remind/:userId
router.post("/compliance/admin/remind/:userId", requireAuth, async (req: Request, res: Response) => {
  try {
    const actorUser = (req as any).user;
    const userId = String(req.params.userId);
    const targetProfile = await EmployeeProfileModel.findOne({ userId });

    await ComplianceAuditLogModel.create({
      userId: actorUser.id,
      userEmail: actorUser.email,
      userName: actorUser.username,
      targetUserId: userId,
      action: "reminder_sent",
      metadata: { targetName: targetProfile?.fullName ?? userId },
      timestamp: new Date(),
    });

    res.json({ success: true, message: "Reminder recorded" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/compliance/admin/audit-logs
router.get("/compliance/admin/audit-logs", requireAuth, async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit ?? 100);
    const skip = Number(req.query.skip ?? 0);
    const userId = req.query.userId as string | undefined;
    const logs = await getAuditLogs(limit, skip, userId);
    const total = await ComplianceAuditLogModel.countDocuments(userId ? { $or: [{ userId }, { targetUserId: userId }] } : {});
    res.json({ success: true, data: logs, total });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/compliance/admin/export/csv
router.get("/compliance/admin/export/csv", requireAuth, async (req: Request, res: Response) => {
  try {
    const actorUser = (req as any).user;
    const employees = await getEmployeesWithCompliance();
    const requirements = await getAllRequirements();

    const header = ["Employee Name", "Department", "Job Title", "Compliance %", "Status", ...requirements.map((r) => r.name)].join(",");

    const rows = await Promise.all(
      employees.map(async (emp) => {
        const scorecard = await getEmployeeScorecard(emp.userId, emp.department);
        const reqStatus = requirements.map((req) => {
          const item = scorecard.find((s) => s.requirementId === req.id?.toString());
          return item ? item.status : "pending";
        });
        return [
          `"${emp.fullName}"`,
          `"${emp.department}"`,
          `"${emp.jobTitle}"`,
          emp.compliancePercent,
          emp.status,
          ...reqStatus.map((s) => `"${s}"`),
        ].join(",");
      })
    );

    const csv = [header, ...rows].join("\n");

    await ComplianceAuditLogModel.create({
      userId: actorUser.id,
      userEmail: actorUser.email,
      userName: actorUser.username,
      action: "export_csv",
      metadata: { recordCount: employees.length },
      timestamp: new Date(),
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="compliance-export-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/compliance/admin/expiring
router.get("/compliance/admin/expiring", requireAuth, async (req: Request, res: Response) => {
  try {
    const days = Number(req.query.days ?? 90);
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const expiringRecords = await EmployeeComplianceRecordModel.find({
      status: "compliant",
      expiresAt: { $gte: now, $lt: cutoff },
    }).sort({ expiresAt: 1 });

    const enriched = await Promise.all(
      expiringRecords.map(async (rec) => {
        const profile = await EmployeeProfileModel.findOne({ userId: rec.userId });
        const daysLeft = Math.floor(((rec.expiresAt as Date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...rec.toObject(),
          employeeName: profile?.fullName ?? rec.userId,
          department: profile?.department ?? rec.department,
          daysLeft,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/compliance/admin/escalations
router.get("/compliance/admin/escalations", requireAuth, async (req: Request, res: Response) => {
  try {
    const escalated = await EmployeeComplianceRecordModel.find({ escalated: true }).sort({ escalatedAt: -1 });
    const enriched = await Promise.all(
      escalated.map(async (rec) => {
        const profile = await EmployeeProfileModel.findOne({ userId: rec.userId });
        return {
          ...rec.toObject(),
          employeeName: profile?.fullName ?? rec.userId,
          department: profile?.department ?? rec.department,
        };
      })
    );
    res.json({ success: true, data: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Employee Profile Management (Admin) ───────────────────────────

// GET /api/compliance/admin/users
router.get("/compliance/admin/users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find({}).select("-password_hash").lean();
    const profiles = await EmployeeProfileModel.find({}).lean();
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const enriched = users.map((u) => ({
      ...u,
      profile: profileMap.get(u._id.toString()) ?? null,
    }));
    res.json({ success: true, data: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/compliance/admin/users/:userId/profile
router.post("/compliance/admin/users/:userId/profile", requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId);
    const { fullName, department, jobTitle, complianceRole } = req.body;
    const profile = await EmployeeProfileModel.findOneAndUpdate(
      { userId },
      { userId, fullName, department, jobTitle, complianceRole },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
