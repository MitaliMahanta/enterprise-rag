import type { LucideIcon } from "lucide-react";

const accentClasses = {
  blue: "bg-blue-50 text-blue-700",
  violet: "bg-violet-50 text-violet-700",
  orange: "bg-orange-50 text-orange-700",
  green: "bg-emerald-50 text-emerald-700",
} as const;

const chartClasses = {
  blue: "bg-blue-300",
  violet: "bg-violet-300",
  orange: "bg-orange-300",
  green: "bg-emerald-300",
} as const;

export default function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  accent = "violet",
  chartValues,
  chartLabel,
}: {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  accent?: keyof typeof accentClasses;
  chartValues?: number[];
  chartLabel?: string;
}) {
  const maximum = Math.max(1, ...(chartValues ?? []));

  return (
    <div className="relative min-h-[96px] border border-slate-200 bg-white px-3 py-2.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:px-3.5 lg:min-h-[104px] lg:px-3 lg:py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-md ${accentClasses[accent]} lg:size-8`}><Icon size={15} className="lg:size-4" /></span>
        <p className="min-w-0 truncate text-xs text-slate-500 lg:text-sm">{label}</p>
      </div>
      <p className="mt-1 text-xl font-bold leading-6 text-slate-950 lg:text-2xl">{value}</p>
      {description && <p className={`mt-0.5 min-h-8 text-[9px] leading-4 text-slate-500 lg:text-[10px] ${chartValues?.length ? "max-w-[calc(100%-58px)]" : ""}`}>{description}</p>}
      {chartValues && chartValues.length > 0 && (
        <div role="img" aria-label={chartLabel ?? `${label} trend`} className="absolute bottom-5 right-2 flex h-8 w-12 items-end gap-[3px] lg:bottom-5 lg:right-3 lg:h-9 lg:w-[58px]">
          {chartValues.map((point, index) => <span key={`${index}-${point}`} className={`flex-1 rounded-t-sm ${chartClasses[accent]}`} style={{ height: `${Math.max(8, (point / maximum) * 100)}%` }} />)}
        </div>
      )}
    </div>
  );
}