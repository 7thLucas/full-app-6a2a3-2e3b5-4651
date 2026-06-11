import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { apiGet, apiPost } from "~/lib/api.client";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Building2,
  FileDown,
  Bell,
} from "lucide-react";

interface DashboardData {
  totalEmployees: number;
  orgCompliancePercent: number;
  pendingReviews: number;
  nonCompliantRecords: number;
  activeEscalations: number;
  expiringIn30: number;
  expiringIn60: number;
  expiringIn90: number;
  departmentSummaries: DeptSummary[];
  topMissing: { name: string; department: string; count: number }[];
}

interface DeptSummary {
  department: string;
  totalEmployees: number;
  avgCompliance: number;
  compliantCount: number;
  pendingCount: number;
  nonCompliantCount: number;
}

interface EmployeeRecord {
  userId: string;
  fullName: string;
  department: string;
  jobTitle: string;
  compliancePercent: number;
  missingItems: string[];
  status: string;
}

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [remindingUserId, setRemindingUserId] = useState<string | null>(null);
  const [reminderSent, setReminderSent] = useState<Set<string>>(new Set());

  const loadDashboard = useCallback(async () => {
    try {
      const [dashRes, empRes] = await Promise.all([
        apiGet<DashboardData>("/api/compliance/admin/dashboard"),
        apiGet<EmployeeRecord[]>("/api/compliance/admin/employees"),
      ]);
      if (dashRes.success && dashRes.data) setDashboard(dashRes.data);
      if (empRes.success && empRes.data) setEmployees(empRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRemind = async (userId: string) => {
    setRemindingUserId(userId);
    try {
      await apiPost(`/api/compliance/admin/remind/${userId}`, {});
      setReminderSent((prev) => new Set([...prev, userId]));
    } finally {
      setRemindingUserId(null);
    }
  };

  const handleExportCSV = () => {
    window.open("/api/compliance/admin/export/csv", "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const d = dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-[#0066CC]" />
            <h1 className="text-xl font-bold text-slate-900">HR Compliance Dashboard</h1>
          </div>
          <p className="text-sm text-slate-500">Organization-wide compliance monitoring and management</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0055AA] transition-colors shadow-sm"
        >
          <FileDown className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Org Compliance"
          value={`${d?.orgCompliancePercent ?? 0}%`}
          subtext={`${d?.totalEmployees ?? 0} total employees`}
          colorClass={
            (d?.orgCompliancePercent ?? 0) === 100
              ? "text-green-600"
              : (d?.orgCompliancePercent ?? 0) >= 70
              ? "text-amber-600"
              : "text-red-600"
          }
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          label="Pending Reviews"
          value={d?.pendingReviews ?? 0}
          subtext="awaiting action"
          colorClass="text-amber-600"
          icon={<Clock className="w-4 h-4" />}
        />
        <MetricCard
          label="Non-Compliant"
          value={d?.nonCompliantRecords ?? 0}
          subtext="records at risk"
          colorClass="text-red-600"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <MetricCard
          label="Active Escalations"
          value={d?.activeEscalations ?? 0}
          subtext="require attention"
          colorClass={d?.activeEscalations ? "text-red-600" : "text-slate-400"}
          icon={<Bell className="w-4 h-4" />}
        />
      </div>

      {/* Expiration windows */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mb-4">Upcoming Expirations</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{d?.expiringIn30 ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Within 30 days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{d?.expiringIn60 ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">31–60 days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-600">{d?.expiringIn90 ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">61–90 days</p>
          </div>
        </div>
      </div>

      {/* Department summaries */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-widest">Department Summary</h2>
          <Building2 className="w-4 h-4 text-slate-400" />
        </div>
        {d?.departmentSummaries && d.departmentSummaries.length > 0 ? (
          <div className="space-y-3">
            {d.departmentSummaries.map((dept) => (
              <Link
                key={dept.department}
                to={`/admin/department/${encodeURIComponent(dept.department)}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-medium text-slate-900 text-sm">{dept.department}</p>
                    <span className={`text-sm font-bold ${dept.avgCompliance === 100 ? "text-green-600" : dept.avgCompliance >= 70 ? "text-amber-600" : "text-red-600"}`}>
                      {dept.avgCompliance}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${dept.avgCompliance === 100 ? "bg-green-500" : dept.avgCompliance >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${dept.avgCompliance}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-1.5 text-xs text-slate-400">
                    <span>{dept.totalEmployees} employees</span>
                    <span className="text-green-600">{dept.compliantCount} compliant</span>
                    {dept.pendingCount > 0 && <span className="text-amber-600">{dept.pendingCount} pending</span>}
                    {dept.nonCompliantCount > 0 && <span className="text-red-600">{dept.nonCompliantCount} at risk</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">No department data yet. Add employee profiles to see department summaries.</p>
        )}
      </div>

      {/* Top missing requirements */}
      {d?.topMissing && d.topMissing.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mb-4">Top Missing Items</h2>
          <div className="space-y-2">
            {d.topMissing.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.department}</p>
                </div>
                <span className="text-sm font-bold text-red-600">{item.count} missing</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0066CC]" />
            <h2 className="text-sm font-semibold text-slate-700">All Employees</h2>
          </div>
          <Link to="/admin/employees" className="text-xs text-[#0066CC] hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Employee</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Department</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Compliance</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No employee profiles yet. Create profiles to track compliance.
                  </td>
                </tr>
              ) : (
                employees.slice(0, 10).map((emp, i) => (
                  <tr key={emp.userId} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{emp.fullName}</p>
                        <p className="text-xs text-slate-400">{emp.jobTitle}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${emp.compliancePercent === 100 ? "bg-green-500" : emp.compliancePercent >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${emp.compliancePercent}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${emp.compliancePercent === 100 ? "text-green-600" : emp.compliancePercent >= 70 ? "text-amber-600" : "text-red-600"}`}>
                          {emp.compliancePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/employee/${emp.userId}`}
                          className="text-xs text-[#0066CC] hover:underline"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleRemind(emp.userId)}
                          disabled={remindingUserId === emp.userId || reminderSent.has(emp.userId)}
                          className="text-xs text-slate-500 hover:text-slate-700 disabled:text-green-600 disabled:cursor-default"
                        >
                          {reminderSent.has(emp.userId) ? "Reminded" : remindingUserId === emp.userId ? "..." : "Remind"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
