import { cn } from "~/lib/utils";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number | ReactNode;
  subtext?: string;
  icon?: ReactNode;
  colorClass?: string;
  className?: string;
}

export function MetricCard({ label, value, subtext, icon, colorClass = "text-[#0066CC]", className }: MetricCardProps) {
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{label}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <p className={cn("text-3xl font-bold leading-tight", colorClass)}>{value}</p>
      {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}
