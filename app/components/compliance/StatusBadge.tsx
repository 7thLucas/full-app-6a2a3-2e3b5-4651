import { cn } from "~/lib/utils";

type Status = "compliant" | "pending" | "non_compliant" | "expired" | string;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  compliant: {
    label: "Compliant",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  non_compliant: {
    label: "Non-Compliant",
    className: "bg-red-100 text-red-800 border border-red-200",
  },
  expired: {
    label: "Expired",
    className: "bg-red-100 text-red-800 border border-red-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-slate-100 text-slate-700 border border-slate-200" };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-widest",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
