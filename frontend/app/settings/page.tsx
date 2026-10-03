import { Database, KeyRound, Settings, Shield } from "lucide-react";
import AppShell from "@/components/app-shell";
import PageHeader from "@/components/page-header";

const settings = [
  { title: "Workspace", description: "Pulse AI workspace", detail: "Local development configuration", icon: Settings },
  { title: "Security", description: "Authentication and access control", detail: "No authentication provider configured", icon: Shield },
  { title: "Infrastructure", description: "AI and data services", detail: "FastAPI · Qdrant · Ollama", icon: Database },
  { title: "API configuration", description: "Frontend service endpoint", detail: "NEXT_PUBLIC_API_BASE_URL (defaults to http://localhost:8000)", icon: KeyRound },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <PageHeader title="Settings" description="Workspace configuration and service status." />
        <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
          {settings.map(({ title, description, detail, icon: Icon }) => (
            <section key={title} className="flex items-start gap-4 p-5 sm:p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700"><Icon size={18} /></span>
              <div className="min-w-0"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-600">{description}</p><p className="mt-2 break-words text-xs text-slate-500">{detail}</p></div>
            </section>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Settings are informational in this version; no credentials or preferences are stored in the browser.</p>
      </div>
    </AppShell>
  );
}