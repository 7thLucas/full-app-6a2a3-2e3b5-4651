import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "~/lib/api.client";
import { Settings, Plus, Edit2, Trash2, X, Check } from "lucide-react";

interface Requirement {
  _id: string;
  name: string;
  type: "document" | "score";
  department: string;
  mandatory: boolean;
  renewalInterval: string;
  trackExpiration: boolean;
  passingScore?: number | null;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM = {
  name: "",
  type: "document" as "document" | "score",
  department: "Sales",
  mandatory: true,
  renewalInterval: "annual",
  trackExpiration: true,
  passingScore: 70,
};

export function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const load = useCallback(async () => {
    const res = await apiGet<Requirement[]>("/api/compliance/requirements");
    if (res.success && res.data) setRequirements(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleEdit = (req: Requirement) => {
    setEditId(req._id);
    setForm({
      name: req.name,
      type: req.type,
      department: req.department,
      mandatory: req.mandatory,
      renewalInterval: req.renewalInterval,
      trackExpiration: req.trackExpiration,
      passingScore: req.passingScore ?? 70,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        passingScore: form.type === "score" ? Number(form.passingScore) : null,
      };

      if (editId) {
        await fetch(`/api/compliance/requirements/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/compliance/requirements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...EMPTY_FORM });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this requirement? Existing records will be preserved.")) return;
    await fetch(`/api/compliance/requirements/${id}`, { method: "DELETE" });
    await load();
  };

  const departments = ["All", "Sales", "Compliance/Risk", "All"];
  const uniqueDepts = ["All", ...Array.from(new Set(requirements.map((r) => r.department)))];
  const filtered = departmentFilter === "All" ? requirements : requirements.filter((r) => r.department === departmentFilter);

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-[#0066CC]" />
            <h1 className="text-xl font-bold text-slate-900">Compliance Requirements</h1>
          </div>
          <p className="text-sm text-slate-500">Configure mandatory requirements per department without code changes</p>
        </div>
        <button
          onClick={() => { setEditId(null); setForm({ ...EMPTY_FORM }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0055AA] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Requirement
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900">{editId ? "Edit" : "Add"} Requirement</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  placeholder="e.g., AML Training"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "document" | "score" }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  >
                    <option value="document">Document (PDF)</option>
                    <option value="score">Score (Numeric)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  >
                    <option>Sales</option>
                    <option>Compliance/Risk</option>
                    <option>All</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Renewal Interval</label>
                  <select
                    value={form.renewalInterval}
                    onChange={(e) => setForm((f) => ({ ...f, renewalInterval: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  >
                    <option value="none">None</option>
                    <option value="annual">Annual</option>
                    <option value="biennial">Biennial</option>
                  </select>
                </div>
                {form.type === "score" && (
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Passing Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.passingScore}
                      onChange={(e) => setForm((f) => ({ ...f, passingScore: Number(e.target.value) }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.mandatory}
                    onChange={(e) => setForm((f) => ({ ...f, mandatory: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-[#0066CC]"
                  />
                  <span className="text-sm text-slate-700">Mandatory</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.trackExpiration}
                    onChange={(e) => setForm((f) => ({ ...f, trackExpiration: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-[#0066CC]"
                  />
                  <span className="text-sm text-slate-700">Track Expiration</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex-1 px-4 py-2 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0055AA] disabled:opacity-50"
              >
                {saving ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {uniqueDepts.map((dept) => (
          <button
            key={dept}
            onClick={() => setDepartmentFilter(dept)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              departmentFilter === dept ? "bg-[#0066CC] text-white border-[#0066CC]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Requirements grid */}
      <div className="grid gap-3">
        {filtered.map((req) => (
          <div key={req._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-900 text-sm">{req.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {req.type === "document" ? "PDF Document" : "Numeric Score"}
                </span>
                {req.mandatory && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Mandatory</span>
                )}
              </div>
              <div className="flex gap-4 mt-1 text-xs text-slate-400 flex-wrap">
                <span>Dept: {req.department}</span>
                {req.renewalInterval !== "none" && <span>Renewal: {req.renewalInterval}</span>}
                {req.trackExpiration && <span>Expiration tracked</span>}
                {req.type === "score" && req.passingScore !== null && <span>Pass: {req.passingScore}%</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleEdit(req)}
                className="p-1.5 text-slate-400 hover:text-[#0066CC] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(req._id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
