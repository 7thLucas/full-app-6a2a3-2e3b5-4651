import { useState, useEffect, useCallback } from "react";
import { useAuth } from "~/modules/authentication";
import { ScorecardItem } from "./ScorecardItem";
import { MetricCard } from "./MetricCard";
import { apiGet, apiPost } from "~/lib/api.client";
import { ClipboardList, Shield, AlertCircle, TrendingUp } from "lucide-react";

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

interface ScorecardData {
  scorecard: ScorecardEntry[];
  compliancePercent: number;
  profile: {
    fullName: string;
    department: string;
    jobTitle: string;
    complianceRole: string;
  };
}

export function ScorecardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadScorecard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet<ScorecardData>("/api/compliance/scorecard/me");
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to load scorecard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScorecard();
  }, [loadScorecard]);

  const handleUpload = async (requirementId: string, file: File) => {
    setUploadingId(requirementId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/compliance/submit/document/${requirementId}`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Upload failed");
      setSuccessMessage("Document uploaded successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadScorecard();
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
      setTimeout(() => setError(null), 5000);
    } finally {
      setUploadingId(null);
    }
  };

  const handleScoreSubmit = async (requirementId: string, score: number) => {
    try {
      const res = await apiPost(`/api/compliance/submit/score/${requirementId}`, { score });
      if (!res.success) throw new Error((res as any).error ?? "Score submission failed");
      setSuccessMessage("Score submitted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadScorecard();
    } catch (err: any) {
      setError(err.message ?? "Score submission failed");
      setTimeout(() => setError(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const profile = data?.profile;
  const scorecard = data?.scorecard ?? [];
  const pct = data?.compliancePercent ?? 0;

  const compliant = scorecard.filter((s) => s.status === "compliant").length;
  const pending = scorecard.filter((s) => s.status === "pending").length;
  const nonCompliant = scorecard.filter((s) => s.status === "non_compliant" || s.status === "expired").length;
  const expiringCount = scorecard.filter((s) => s.daysUntilExpiry !== null && s.daysUntilExpiry !== undefined && s.daysUntilExpiry <= 30).length;

  const pctColor = pct === 100 ? "text-green-600" : pct >= 70 ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="w-5 h-5 text-[#0066CC]" />
          <h1 className="text-xl font-bold text-slate-900">My Compliance Scorecard</h1>
        </div>
        <p className="text-sm text-slate-500">
          {profile?.fullName ?? user?.username} &middot; {profile?.department ?? "—"} &middot; {profile?.jobTitle ?? "Employee"}
        </p>
      </div>

      {/* Success / Error banners */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Overall Compliance"
          value={`${pct}%`}
          subtext={pct === 100 ? "Fully compliant" : `${scorecard.filter((s) => s.mandatory && s.status !== "compliant").length} items outstanding`}
          colorClass={pctColor}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          label="Compliant"
          value={compliant}
          subtext="items met"
          colorClass="text-green-600"
        />
        <MetricCard
          label="Pending"
          value={pending}
          subtext="awaiting submission"
          colorClass="text-amber-600"
        />
        <MetricCard
          label="Non-Compliant"
          value={nonCompliant}
          subtext={expiringCount > 0 ? `+${expiringCount} expiring soon` : "items at risk"}
          colorClass="text-red-600"
        />
      </div>

      {/* Overall status bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">Compliance Progress</span>
          <span className={`text-sm font-bold ${pctColor}`}>{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${pct === 100 ? "bg-green-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct < 100 && (
          <p className="mt-2 text-xs text-slate-400">
            Complete all required items to achieve 100% compliance.
          </p>
        )}
      </div>

      {/* Scorecard items */}
      {scorecard.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No compliance requirements found for your department.</p>
          <p className="text-sm">Contact your HR administrator if this seems incorrect.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mb-3">
            {profile?.department ?? "Your"} Compliance Requirements
          </h2>
          <div className="space-y-3">
            {scorecard.map((item) => (
              <ScorecardItem
                key={item.requirementId}
                {...item}
                onUpload={handleUpload}
                onScoreSubmit={handleScoreSubmit}
                uploading={uploadingId === item.requirementId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
