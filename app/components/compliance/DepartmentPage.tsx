import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { apiGet, apiPost } from "~/lib/api.client";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { ArrowLeft, Building2, TrendingUp, Users, Bell, ChevronRight } from "lucide-react";

interface DeptEmployee {
  _id: string;
  userId: string;
  fullName: string;
  department: string;
  jobTitle: string;
  compliancePercent: number;
  missingItems: string[];
}

interface DeptSummary {
  department: string;
  totalEmployees: number;
  avgCompliance: number;
  compliantCount: number;
  pendingCount: number;
  nonCompliantCount: number;
}

interface DeptData {
  summary: DeptSummary;
  employees: DeptEmployee[];
}

export function DepartmentPage({ department }: { department: string }) {
  const [data, setData] = useState<DeptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const res = await fetch(`/api/compliance/admin/department/${encodeURIComponent(department)}`);
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  }, [department]);

  useEffect(() => { load(); }, [load]);

  const handleRemind = async (userId: string) => {
    await apiPost(`/api/compliance/admin/remind/${userId}`, {});
    setRemindedIds((p) => new Set([...p, userId]));
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin" /></div>;

  const summary = data?.summary;
  const employees = data?.employees ?? [];
  const pctColor = (summary?.avgCompliance ?? 0) === 100 ? "text-green-600" : (summary?.avgCompliance ?? 0) >= 70 ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/dashboard" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0066CC]" />
            <h1 className="text-xl font-bold text-slate-900">{department}</h1>
          </div>
          <p className="text-sm text-slate-500">Department compliance summary</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Avg Compliance" value={`${summary?.avgCompliance ?? 0}%`} colorClass={pctColor} icon={<TrendingUp className="w-4 h-4" />} />
        <MetricCard label="Total Employees" value={summary?.totalEmployees ?? 0} colorClass="text-slate-900" icon={<Users className="w-4 h-4" />} />
        <MetricCard label="Compliant" value={summary?.compliantCount ?? 0} colorClass="text-green-600" />
        <MetricCard label="At Risk" value={(summary?.pendingCount ?? 0) + (summary?.nonCompliantCount ?? 0)} colorClass="text-red-600" />
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">Department Compliance</span>
          <span className={`text-sm font-bold ${pctColor}`}>{summary?.avgCompliance ?? 0}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${(summary?.avgCompliance ?? 0) === 100 ? "bg-green-500" : (summary?.avgCompliance ?? 0) >= 70 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${summary?.avgCompliance ?? 0}%` }}
          />
        </div>
      </div>

      {/* Employee table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">Employees</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Compliance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Missing Items</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">No employees in this department.</td>
                </tr>
              ) : (
                employees.map((emp, i) => {
                  const status = emp.compliancePercent === 100 ? "compliant" : emp.compliancePercent >= 50 ? "pending" : "non_compliant";
                  return (
                    <tr key={emp.userId} className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition-colors`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{emp.fullName}</p>
                        <p className="text-xs text-slate-400">{emp.jobTitle}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${status === "compliant" ? "bg-green-500" : status === "pending" ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${emp.compliancePercent}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${status === "compliant" ? "text-green-600" : status === "pending" ? "text-amber-600" : "text-red-600"}`}>
                            {emp.compliancePercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {emp.missingItems.slice(0, 2).join(", ")}
                        {emp.missingItems.length > 2 && ` +${emp.missingItems.length - 2}`}
                        {emp.missingItems.length === 0 && <span className="text-green-600">None</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link to={`/admin/employee/${emp.userId}`} className="text-xs text-[#0066CC] hover:underline flex items-center gap-0.5">
                            View <ChevronRight className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => handleRemind(emp.userId)}
                            disabled={remindedIds.has(emp.userId)}
                            className="text-xs text-slate-500 hover:text-slate-700 disabled:text-green-600"
                          >
                            {remindedIds.has(emp.userId) ? "Reminded" : "Remind"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
