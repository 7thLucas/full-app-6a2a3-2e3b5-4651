import { useState, useEffect, useCallback } from "react";
import { apiGet } from "~/lib/api.client";
import { FileText, Download, Clock } from "lucide-react";

interface AuditLog {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  targetUserId?: string | null;
  requirementId?: string | null;
  action: string;
  metadata: Record<string, any>;
  timestamp: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  document_uploaded: { label: "Document Uploaded", color: "text-blue-700 bg-blue-50 border-blue-200" },
  score_submitted: { label: "Score Submitted", color: "text-purple-700 bg-purple-50 border-purple-200" },
  status_changed: { label: "Status Changed", color: "text-amber-700 bg-amber-50 border-amber-200" },
  reminder_sent: { label: "Reminder Sent", color: "text-cyan-700 bg-cyan-50 border-cyan-200" },
  escalated: { label: "Escalated", color: "text-orange-700 bg-orange-50 border-orange-200" },
  record_approved: { label: "Approved", color: "text-green-700 bg-green-50 border-green-200" },
  record_rejected: { label: "Rejected", color: "text-red-700 bg-red-50 border-red-200" },
  requirement_created: { label: "Requirement Created", color: "text-teal-700 bg-teal-50 border-teal-200" },
  requirement_updated: { label: "Requirement Updated", color: "text-teal-700 bg-teal-50 border-teal-200" },
  export_csv: { label: "Export CSV", color: "text-slate-700 bg-slate-50 border-slate-200" },
  export_pdf: { label: "Export PDF", color: "text-slate-700 bg-slate-50 border-slate-200" },
};

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatMetadata(action: string, metadata: Record<string, any>) {
  const parts: string[] = [];
  if (metadata.requirementName) parts.push(`Requirement: ${metadata.requirementName}`);
  if (metadata.documentName) parts.push(`File: ${metadata.documentName}`);
  if (metadata.score !== undefined) parts.push(`Score: ${metadata.score}% (${metadata.status})`);
  if (metadata.targetName) parts.push(`Target: ${metadata.targetName}`);
  if (metadata.escalatedTo) parts.push(`Escalated to: ${metadata.escalatedTo}`);
  if (metadata.name) parts.push(`Name: ${metadata.name}`);
  if (metadata.recordCount !== undefined) parts.push(`Records: ${metadata.recordCount}`);
  return parts.join(" • ") || JSON.stringify(metadata);
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("All");
  const PAGE_SIZE = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/compliance/admin/audit-logs?limit=${PAGE_SIZE}&skip=${page * PAGE_SIZE}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = actionFilter === "All" ? logs : logs.filter((l) => l.action === actionFilter);
  const actions = ["All", ...Array.from(new Set(logs.map((l) => l.action)))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-[#0066CC]" />
            <h1 className="text-xl font-bold text-slate-900">Audit Logs</h1>
          </div>
          <p className="text-sm text-slate-500">Immutable record of all compliance actions — {total} total entries</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => setActionFilter(action)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              actionFilter === action
                ? "bg-[#0066CC] text-white border-[#0066CC]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {ACTION_LABELS[action]?.label ?? action}
          </button>
        ))}
      </div>

      {/* Log table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No audit log entries yet.</p>
            <p className="text-sm mt-1">Actions will be logged here as users interact with the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const actionConfig = ACTION_LABELS[log.action] ?? { label: log.action, color: "text-slate-700 bg-slate-50 border-slate-200" };
                  return (
                    <tr key={log._id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 text-xs">{log.userName}</p>
                        <p className="text-xs text-slate-400">{log.userEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${actionConfig.color}`}>
                          {actionConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatMetadata(log.action, log.metadata)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * PAGE_SIZE >= total}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
