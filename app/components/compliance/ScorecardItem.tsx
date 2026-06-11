import { cn } from "~/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { FileText, Hash, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

interface ScorecardItemProps {
  requirementId: string;
  name: string;
  type: "document" | "score";
  mandatory: boolean;
  status: string;
  documentUrl?: string | null;
  documentName?: string | null;
  score?: number | null;
  passingScore?: number | null;
  submittedAt?: string | Date | null;
  expiresAt?: string | Date | null;
  daysUntilExpiry?: number | null;
  trackExpiration: boolean;
  renewalInterval?: string;
  escalated?: boolean;
  rejectionReason?: string | null;
  onUpload?: (requirementId: string, file: File) => Promise<void>;
  onScoreSubmit?: (requirementId: string, score: number) => Promise<void>;
  uploading?: boolean;
}

const STATUS_BORDER: Record<string, string> = {
  compliant: "border-l-[#22C55E]",
  pending: "border-l-[#F59E0B]",
  non_compliant: "border-l-[#EF4444]",
  expired: "border-l-[#EF4444]",
};

export function ScorecardItem({
  requirementId,
  name,
  type,
  mandatory,
  status,
  documentUrl,
  documentName,
  score,
  passingScore,
  submittedAt,
  expiresAt,
  daysUntilExpiry,
  trackExpiration,
  renewalInterval,
  escalated,
  rejectionReason,
  onUpload,
  onScoreSubmit,
  uploading,
}: ScorecardItemProps) {
  const [scoreInput, setScoreInput] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [localUploading, setLocalUploading] = useState(false);

  const borderClass = STATUS_BORDER[status] ?? "border-l-slate-300";

  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    setLocalUploading(true);
    try {
      await onUpload(requirementId, file);
      setShowUpload(false);
    } finally {
      setLocalUploading(false);
    }
  };

  const handleScoreSubmit = async () => {
    const val = Number(scoreInput);
    if (isNaN(val) || val < 0 || val > 100) return;
    if (!onScoreSubmit) return;
    await onScoreSubmit(requirementId, val);
    setShowScoreInput(false);
    setScoreInput("");
  };

  const getNextAction = () => {
    if (status === "compliant" && trackExpiration && daysUntilExpiry !== null && daysUntilExpiry !== undefined) {
      if (daysUntilExpiry <= 30) return `Renewal due in ${daysUntilExpiry} days`;
      return null;
    }
    if (status === "pending" && !submittedAt) {
      return type === "document" ? "Upload required PDF document" : `Submit your assessment score (passing: ${passingScore ?? 70}%)`;
    }
    if (status === "non_compliant" && type === "score") {
      return `Score ${score ?? 0}% is below the ${passingScore ?? 70}% passing threshold. Retake required.`;
    }
    if (status === "expired") {
      return "Document has expired. Please upload a new copy.";
    }
    return null;
  };

  const nextAction = getNextAction();

  return (
    <div className={cn("bg-white rounded-xl border border-l-4 border-slate-200 shadow-sm p-4", borderClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {type === "document" ? (
              <FileText className="w-5 h-5 text-slate-400" />
            ) : (
              <Hash className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-900 text-sm">{name}</p>
              {mandatory && (
                <span className="text-xs text-slate-400 uppercase tracking-widest">Required</span>
              )}
              {escalated && (
                <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Escalated
                </span>
              )}
            </div>

            {/* Status details */}
            <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
              {score !== null && score !== undefined && type === "score" && (
                <span>Score: <strong className={score >= (passingScore ?? 70) ? "text-green-600" : "text-red-600"}>{score}%</strong> (pass: {passingScore ?? 70}%)</span>
              )}
              {documentName && type === "document" && (
                <span className="truncate max-w-[200px]">{documentName}</span>
              )}
              {submittedAt && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Submitted {formatDate(submittedAt)}
                </span>
              )}
              {expiresAt && status === "compliant" && (
                <span className={cn("flex items-center gap-1", daysUntilExpiry !== null && daysUntilExpiry !== undefined && daysUntilExpiry <= 30 ? "text-amber-600" : "")}>
                  <Clock className="w-3 h-3" />
                  Expires {formatDate(expiresAt)}
                  {daysUntilExpiry !== null && daysUntilExpiry !== undefined && daysUntilExpiry <= 90 && ` (${daysUntilExpiry}d)`}
                </span>
              )}
              {renewalInterval && renewalInterval !== "none" && (
                <span>Renewal: {renewalInterval}</span>
              )}
            </div>

            {/* Next action */}
            {nextAction && (
              <p className={cn("mt-2 text-xs font-medium px-2 py-1 rounded", status === "compliant" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>
                {nextAction}
              </p>
            )}

            {/* Rejection reason */}
            {rejectionReason && (
              <p className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                Rejected: {rejectionReason}
              </p>
            )}

            {/* Upload / Score input */}
            {onUpload && type === "document" && (status !== "compliant" || (trackExpiration && daysUntilExpiry !== null && daysUntilExpiry !== undefined && daysUntilExpiry <= 30)) && (
              <div className="mt-3">
                {!showUpload ? (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="text-xs font-medium text-[#0066CC] hover:underline"
                  >
                    {status === "compliant" ? "Replace document" : "Upload document"}
                  </button>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 flex flex-col items-center gap-2">
                    <p className="text-xs text-slate-500">PDF files only, max 20MB</p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={localUploading || uploading}
                      />
                      <span className="inline-block bg-[#0066CC] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#0055AA] transition-colors">
                        {localUploading || uploading ? "Uploading..." : "Choose PDF"}
                      </span>
                    </label>
                    <button onClick={() => setShowUpload(false)} className="text-xs text-slate-400 hover:text-slate-600">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {onScoreSubmit && type === "score" && status !== "compliant" && (
              <div className="mt-3">
                {!showScoreInput ? (
                  <button
                    onClick={() => setShowScoreInput(true)}
                    className="text-xs font-medium text-[#0066CC] hover:underline"
                  >
                    {status === "non_compliant" ? "Resubmit score" : "Submit score"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      placeholder={`Score (pass: ${passingScore ?? 70}%)`}
                      className="border border-slate-300 rounded-lg px-2 py-1 text-xs w-36 focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                    />
                    <button
                      onClick={handleScoreSubmit}
                      className="bg-[#0066CC] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#0055AA] transition-colors"
                    >
                      Submit
                    </button>
                    <button onClick={() => setShowScoreInput(false)} className="text-xs text-slate-400 hover:text-slate-600">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}
