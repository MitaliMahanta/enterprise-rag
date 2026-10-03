import { Database, Gauge, ShieldCheck, Target } from "lucide-react";
import Link from "next/link";
import AppShell from "@/components/app-shell";
import MetricCard from "@/components/metric-card";
import PageHeader from "@/components/page-header";

export default function EvaluationPage() {
  return (
    <AppShell>
      <div className="min-h-[calc(100vh-52px)] bg-[linear-gradient(118deg,#fafaff_0%,#f4f5ff_60%,#fbf9ff_100%)] px-4 py-5 sm:px-6 xl:px-7">
        <div className="mx-auto max-w-[1320px]">
          <PageHeader title="Evaluation & Analytics" description="Measure retrieval quality and monitor usage across your RAG workspace." action={<Link href="/assistant/chat" className="rounded-md bg-violet-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-violet-700">Test the assistant</Link>} />
          <div className="mb-4 flex gap-1 border-b border-slate-200" role="tablist" aria-label="Evaluation and analytics views">
            <span role="tab" aria-selected="true" className="border-b-2 border-violet-600 px-4 py-2.5 text-xs font-semibold text-violet-800">Evaluation</span>
            <Link role="tab" aria-selected="false" href="/analytics" className="border-b-2 border-transparent px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800">Analytics</Link>
          </div>
          <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-900"><ShieldCheck size={14} /> Evaluation scores require a test-set runner and judge endpoint, neither of which is configured yet.</div>
          <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            <MetricCard label="Recall@5" value="—" description="not measured" icon={Target} accent="blue" />
            <MetricCard label="Faithfulness" value="—" description="not measured" icon={ShieldCheck} accent="violet" />
            <MetricCard label="Retrieval Latency" value="—" description="no evaluation run" icon={Gauge} accent="orange" />
            <MetricCard label="Test Cases" value="0" description="no run history" icon={Database} accent="green" />
          </div>
          <section className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-5"><h2 className="text-sm font-bold text-slate-900">Evaluation Runs</h2><p className="mt-1 text-[10px] text-slate-500">Retrieval and answer-quality comparisons</p></div>
            <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:px-5"><span>Run</span><span>Dataset</span><span>Recall@5</span><span>Status</span></div>
            <div className="px-5 py-14 text-center"><Target size={23} className="mx-auto text-slate-300" /><p className="mt-3 text-xs font-semibold text-slate-700">No evaluation runs yet</p><p className="mt-1 text-[10px] text-slate-500">Run history will appear here when an evaluation endpoint is available.</p><Link href="/assistant/chat" className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700">Open assistant <span aria-hidden="true">→</span></Link></div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}