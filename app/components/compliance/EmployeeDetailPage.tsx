import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { apiGet, apiPost } from "~/lib/api.client";
import { ScorecardItem } from "./ScorecardItem";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { ArrowLeft, Bell, AlertTriangle, TrendingUp, User } from "lucide-react";

interface ScorecardEntry {
  requirementId: string;
  name: string;
  type: "document" | "score";
  mandatory: boolean;
  status: string;
  documentUrl?: string | null;
  documentName?: string | null;
  score?: number | null;
  passingScore?: number | null;
  submittedAt?: string | null;
  expiresAt?: string | null;
  daysUntilExpiry?: number | null;
  trackExpiration: boolean;
  renewalInterval?: string;
  escalated?: boolean;
  rejectionReason?: string | null;
}

interface EmployeeData {
  scorecard: ScorecardEntry[];
  compliancePercent: number;
  profile: {
    userId: string;
    fullName: string;
    department: string;
    jobTitle: string;
    complianceRole: string;
  };
}

interface Props {
  userId: string;
}

export function EmployeeDetailPage({ userId }: Props) {
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminding, setReminding] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiGet<EmployeeData>(`/api/compliance/scorecard/${userId}`);
      if (res.success && res.data) setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleRemind = async () => {
    setReminding(true);
    try {
      await apiPost(`/api/compliance/admin/remind/${userId}`, {});
      setReminderSent(true);
    } finally {
      setReminding(false);
    }
  };

  const handleEscalate = async (recordId: string) => {
    await apiPost(`/api/compliance/admin/escalate/${recordId}`, { escalateTo: "hr" });
    await load();
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin" /></div>;

  if (!data) return (
    <div className="text-center py-16 text-slate-400">
      <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Employee not found or no profile created.</p>
      <Link to="/admin/employees" className="text-[#0066CC] text-sm hover:underline mt-2 block">Back to employees</Link>
    </div>
  );

  const { profile, scorecard, compliancePercent } = data;
  const compliant = scorecard.filter((s) => s.status === "compliant").length;
  const nonCompliant = scorecard.filter((s) => s.status === "non_compliant" || s.status === "expired").length;
  const pctColor = compliancePercent === 100 ? "text-green-600" : compliancePercent >= 70 ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/employees" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{profile.fullName}</h1>
          <p className="text-sm text-slate-500">{profile.jobTitle} &middot; {profile.department}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRemind}
            disabled={reminding || reminderSent}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:text-green-600 disabled:border-green-200"
          >
            <Bell className="w-4 h-4" />
            {reminderSent ? "Reminder Sent" : reminding ? "Sending..." : "Send Reminder"}
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Compliance" value={`${compliancePercent}%`} colorClass={pctColor} icon={<TrendingUp className="w-4 h-4" />} />
        <MetricCard label="Status" value={<StatusBadge status={compliancePercent === 100 ? "compliant" : compliancePercent >= 50 ? "pending" : "non_compliant"} />} colorClass="text-slate-900" />
        <MetricCard label="Compliant Items" value={compliant} colorClass="text-green-600" />
        <MetricCard label="At Risk" value={nonCompliant} colorClass={nonCompliant > 0 ? "text-red-600" : "text-slate-400"} />
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">Compliance Progress</span>
          <span className={`text-sm font-bold ${pctColor}`}>{compliancePercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${compliancePercent === 100 ? "bg-green-500" : compliancePercent >= 70 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${compliancePercent}%` }}
          />
        </div>
      </div>

      {/* Scorecard */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mb-3">Compliance Requirements</h2>
        <div className="space-y-3">
          {scorecard.map((item) => (
            <div key={item.requirementId} className="relative">
              <ScorecardItem {...item} />
              {(item.status === "non_compliant" || item.status === "expired" || item.status === "pending") && !item.escalated && (
                <button
                  onClick={() => handleEscalate(item.requirementId)}
                  className="absolute top-3 right-16 flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full hover:bg-amber-100 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Escalate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
