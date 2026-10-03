import type { LucideIcon } from "lucide-react";

export default function ConnectorCard({
  name,
  description,
  icon: Icon,
  href,
}: {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <a href={href} className="flex items-start gap-4 border-b border-slate-200 py-5 last:border-0 hover:bg-slate-50">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
        <Icon size={19} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-900">{name}</span>
        <span className="mt-1 block text-sm text-slate-500">{description}</span>
        <span className="mt-2 inline-block text-xs font-medium text-amber-700">Not configured</span>
      </span>
    </a>
  );
}