import type { LucideIcon } from "lucide-react";

export default function ServiceRow({
  name,
  description,
  icon: Icon,
  status,
}: {
  name: string;
  description: string;
  icon: LucideIcon;
  status: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0">
      <span className="flex size-9 items-center justify-center rounded-md bg-slate-50 text-slate-600">
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-800">{name}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
      <span className="text-xs text-slate-500">{status}</span>
    </div>
  );
}