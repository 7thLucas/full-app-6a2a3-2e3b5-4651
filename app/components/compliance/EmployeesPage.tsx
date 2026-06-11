import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { apiGet, apiPost } from "~/lib/api.client";
import { StatusBadge } from "./StatusBadge";
import { Users, Search, FileDown, UserPlus, X, ChevronRight } from "lucide-react";

interface Employee {
  _id: string;
  userId: string;
  fullName: string;
  department: string;
  jobTitle: string;
  complianceRole: string;
  compliancePercent: number;
  missingItems: string[];
  status: string;
}

interface UserRecord {
  _id: string;
  username: string;
  email: string;
  role: string;
  profile: Employee | null;
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [profileForm, setProfileForm] = useState({ fullName: "", department: "Sales", jobTitle: "", complianceRole: "employee" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [empRes, userRes] = await Promise.all([
        apiGet<Employee[]>("/api/compliance/admin/employees"),
        apiGet<UserRecord[]>("/api/compliance/admin/users"),
      ]);
      if (empRes.success && empRes.data) setEmployees(empRes.data);
      if (userRes.success && userRes.data) setUsers(userRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const departments = ["All", ...Array.from(new Set(employees.map((e) => e.department)))];

  const filtered = employees.filter((e) => {
    const matchSearch = !search || e.fullName.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = departmentFilter === "All" || e.department === departmentFilter;
    const matchStatus = statusFilter === "All" || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleSaveProfile = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      await apiPost(`/api/compliance/admin/users/${selectedUserId}/profile`, profileForm);
      setShowAddProfile(false);
      setProfileForm({ fullName: "", department: "Sales", jobTitle: "", complianceRole: "employee" });
      setSelectedUserId("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const usersWithoutProfile = users.filter((u) => !u.profile);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#0066CC]" />
            <h1 className="text-xl font-bold text-slate-900">Employees</h1>
          </div>
          <p className="text-sm text-slate-500">{employees.length} employees tracked</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open("/api/compliance/admin/export/csv", "_blank")}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddProfile(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0055AA] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Profile
          </button>
        </div>
      </div>

      {/* Add profile modal */}
      {showAddProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900">Add Employee Profile</h2>
              <button onClick={() => setShowAddProfile(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">User Account</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    const u = users.find((u) => u._id === e.target.value);
                    if (u) setProfileForm((p) => ({ ...p, fullName: u.username }));
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                >
                  <option value="">Select user...</option>
                  {usersWithoutProfile.map((u) => (
                    <option key={u._id} value={u._id}>{u.username} ({u.email})</option>
                  ))}
                  {users.filter((u) => u.profile).map((u) => (
                    <option key={u._id} value={u._id}>{u.username} — update existing</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Full Name</label>
                <input
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Department</label>
                <select
                  value={profileForm.department}
                  onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                >
                  <option>Sales</option>
                  <option>Compliance/Risk</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Job Title</label>
                <input
                  value={profileForm.jobTitle}
                  onChange={(e) => setProfileForm((p) => ({ ...p, jobTitle: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  placeholder="Sales Associate"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Compliance Role</label>
                <select
                  value={profileForm.complianceRole}
                  onChange={(e) => setProfileForm((p) => ({ ...p, complianceRole: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr_admin">HR Admin</option>
                  <option value="compliance_officer">Compliance Officer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddProfile(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving || !selectedUserId || !profileForm.fullName}
                className="flex-1 px-4 py-2 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0055AA] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
        >
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
        >
          <option value="All">All Status</option>
          <option value="compliant">Compliant</option>
          <option value="pending">Pending</option>
          <option value="non_compliant">Non-Compliant</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Compliance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Missing</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No employees match your filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((emp, i) => (
                  <tr key={emp.userId} className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition-colors`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{emp.fullName}</p>
                      <p className="text-xs text-slate-400">{emp.jobTitle}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5">
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
                    <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                    <td className="px-4 py-3">
                      {emp.missingItems.length > 0 ? (
                        <div className="text-xs text-slate-500">
                          {emp.missingItems.slice(0, 2).join(", ")}
                          {emp.missingItems.length > 2 && ` +${emp.missingItems.length - 2} more`}
                        </div>
                      ) : (
                        <span className="text-xs text-green-600">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/employee/${emp.userId}`}
                        className="flex items-center gap-1 text-xs text-[#0066CC] hover:underline"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
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
