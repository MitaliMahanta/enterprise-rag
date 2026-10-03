"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUp,
  BarChart3,
  Bot,
  BrainCircuit,
  FileText,
  GitBranch,
  Mic,
  Paperclip,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { SiFastapi, SiGithub, SiJira, SiOllama, SiQdrant } from "react-icons/si";
import type { IconType } from "react-icons";
import SlackLogo from "@/components/slack-logo";
import AppShell from "@/components/app-shell";
import MetricCard from "@/components/metric-card";
import { askAssistant, getDocuments, getHealth, type ChatResponse, type KnowledgeDocument } from "@/lib/api";

const suggestedPrompts: { label: string; icon: LucideIcon; href?: string; question?: string }[] = [
  { label: "Search knowledge", icon: Search, question: "What information is available in my indexed documents?" },
  { label: "Run an agent", icon: Bot, href: "/agents" },
  { label: "Summarize a document", icon: FileText, question: "Summarize the key findings in my indexed documents." },
  { label: "Check Jira issues", icon: GitBranch, href: "/connectors/jira" },
  { label: "Analyze data", icon: BarChart3, href: "/analytics" },
  { label: "Compare information", icon: BrainCircuit, question: "Compare the main approaches described in my indexed documents." },
];
const connectorItems = [
  { name: "Jira", href: "/connectors/jira", icon: SiJira, color: "bg-blue-50 text-blue-700" },
  { name: "GitHub", href: "/connectors/github", icon: SiGithub, color: "bg-slate-100 text-slate-800" },
  { name: "Slack", href: "/connectors/slack", icon: SlackLogo, color: "bg-white" },
];

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [documentError, setDocumentError] = useState(false);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [recentQuery, setRecentQuery] = useState<{ question: string; sources: number; latency: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    getDocuments()
      .then((loadedDocuments) => {
        if (mounted) setDocuments(loadedDocuments);
      })
      .catch(() => {
        if (mounted) setDocumentError(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    getHealth()
      .then((health) => {
        if (mounted) setApiHealthy(health.status === "ok");
      })
      .catch(() => {
        if (mounted) setApiHealthy(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function refreshHealth() {
    setCheckingHealth(true);
    try {
      const health = await getHealth();
      setApiHealthy(health.status === "ok");
    } catch {
      setApiHealthy(false);
    } finally {
      setCheckingHealth(false);
    }
  }

  async function submitQuestion(event?: FormEvent<HTMLFormElement>, prompt = question) {
    event?.preventDefault();
    const cleanQuestion = prompt.trim();
    if (!cleanQuestion || loading) return;

    setQuestion(cleanQuestion);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await askAssistant(cleanQuestion);
      setResult(response);
      setRecentQuery({
        question: cleanQuestion,
        sources: response.sources.length,
        latency: response.metadata.total_latency_ms,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reach the AI service.");
    } finally {
      setLoading(false);
    }
  }

  const chunkCount = documents.reduce((total, document) => total + document.chunks, 0);
    const documentTrends = getDailyDocumentTrends(documents);
  
    const documentChartValues = documentTrends.map((day) => day.documents);
    const chunkChartValues = documentTrends.map((day) => day.chunks);

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-44px)] bg-[linear-gradient(118deg,#fafaff_0%,#f4f5ff_60%,#fbf9ff_100%)] xl:min-h-[calc(100vh-52px)] 2xl:min-h-[calc(100vh-60px)]">
        <div className="mx-auto grid max-w-[1540px] gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-3 lg:px-3 xl:grid-cols-[minmax(0,1fr)_285px] xl:gap-4 xl:px-4 xl:py-4 2xl:grid-cols-[minmax(0,1fr)_310px] 2xl:gap-4 2xl:py-5">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-[22px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[26px] lg:text-[30px] 2xl:text-[32px]">Good morning, Mitali <span aria-hidden="true">👋</span></h1>
                <p className="mt-0.5 text-xs text-slate-500 lg:text-sm">Your Pulse AI workspace is ready.</p>
              </div>
              <div className="hidden text-right lg:block"><p className="text-[11px] font-semibold text-slate-700">Friday, October 2, 2026</p><p className="mt-1 text-[10px] text-slate-500">Search · Build · Automate · Analyze</p></div>
            </div>

            <section className="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-[0_5px_20px_rgba(53,45,125,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 sm:px-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white lg:size-9"><Sparkles size={16} className="lg:size-[18px]" /></span>
                  <div><h2 className="text-xs font-bold text-slate-900 lg:text-sm">Ask Pulse AI</h2><p className="mt-0.5 text-[10px] text-slate-500 lg:text-xs">Search your knowledge, run agents, and get insights from enterprise data.</p></div>
                </div>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-medium text-slate-600 lg:px-2.5 lg:py-1.5 lg:text-[11px]">llama3.2:3b <span className="text-slate-400">via Ollama</span></span>
              </div>

              <form onSubmit={(event) => void submitQuestion(event)} className="p-2.5 sm:p-3">
                <label htmlFor="question" className="sr-only">Ask a question</label>
                <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white p-1 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 xl:p-1.5">
                  <input id="question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask anything about your enterprise..." className="h-8 min-w-0 flex-1 bg-transparent px-2 text-xs outline-none placeholder:text-slate-400 sm:h-9 lg:h-10 lg:px-3 lg:text-sm" disabled={loading} />
                  <Link href="/knowledge" aria-label="Attach a document" title="Open document upload" className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-violet-50 hover:text-violet-700"><Paperclip size={16} /></Link>
                  <button type="button" aria-label="Voice input unavailable" title="Voice input is not configured" disabled className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 disabled:cursor-not-allowed"><Mic size={16} /></button>
                  <button type="submit" disabled={!question.trim() || loading} aria-label="Send question" className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-600 text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300 lg:size-10"><ArrowUp size={15} className="lg:size-5" /></button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {suggestedPrompts.map(({ label, icon: Icon, href, question: prompt }) => href ? (
                    <Link key={label} href={href} className="inline-flex items-center gap-1 rounded-full border border-transparent bg-[#f4f3ff] px-2 py-1 text-[9px] font-medium text-slate-600 hover:border-violet-200 hover:text-violet-800 lg:gap-1.5 lg:px-2.5 lg:py-1.5 lg:text-[11px]"><Icon size={11} className="text-violet-600 lg:size-3.5" /> {label}</Link>
                  ) : (
                    <button key={label} type="button" onClick={() => void submitQuestion(undefined, prompt)} disabled={loading} className="inline-flex items-center gap-1 rounded-full border border-transparent bg-[#f4f3ff] px-2 py-1 text-[9px] font-medium text-slate-600 hover:border-violet-200 hover:text-violet-800 disabled:opacity-50 lg:gap-1.5 lg:px-2.5 lg:py-1.5 lg:text-[11px]"><Icon size={11} className="text-violet-600 lg:size-3.5" /> {label}</button>
                  ))}
                </div>
              </form>
            </section>

            {loading && <div className="mt-4 rounded-md border border-violet-100 bg-white px-4 py-3 text-sm text-slate-500" role="status">Searching your knowledge base...</div>}
            {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}. Confirm that the FastAPI service is running and `NEXT_PUBLIC_API_BASE_URL` is correct.</div>}

            {result && (
              <article className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"><div className="flex items-center gap-2"><Sparkles size={16} className="text-violet-700" /><h2 className="text-sm font-bold">Pulse AI</h2><span className="text-xs text-slate-400">· {result.retrieval_method}</span></div><span className="text-xs text-slate-500">{Math.round(result.metadata.total_latency_ms)} ms</span></div>
                <div className="px-4 py-4"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{result.answer}</p></div>
                <div className="border-t border-slate-100 px-4 py-4"><div className="mb-2 flex items-center justify-between"><h3 className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">Sources</h3><span className="text-[10px] text-slate-400">{result.sources.length} retrieved</span></div><ul className="grid gap-2 sm:grid-cols-2">{result.sources.map((source, index) => <li key={`${source.source}-${source.chunk_id}-${index}`} className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5"><FileText size={14} className="shrink-0 text-violet-700" /><span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-700">{source.source}</span><span className="mt-0.5 block text-[10px] text-slate-500">Chunk {source.chunk_id} · {source.retrieval_method} · {source.score.toFixed(3)}</span></span></li>)}</ul></div>
              </article>
            )}

            <div className="mt-2.5 grid grid-cols-2 gap-2 lg:grid-cols-4">
              <MetricCard label="Documents" value={documentError ? "—" : String(documents.length)} description="indexed knowledge sources" icon={FileText} accent="blue" chartValues={documentChartValues} chartLabel="Documents indexed per day over the last week" />
              <MetricCard label="Chunks" value={documentError ? "—" : chunkCount.toLocaleString()} description="searchable knowledge units" icon={BrainCircuit} accent="violet" chartValues={chunkChartValues} chartLabel="Chunks indexed per day over the last week" />
              <MetricCard label="Agents" value="0" description="ready to configure" icon={Bot} accent="orange" />
              <MetricCard label="System" value={apiHealthy === null ? "Checking" : apiHealthy ? "Healthy" : "Offline"} description={apiHealthy ? "FastAPI health check passed" : "API service status"} icon={Activity} accent="green" />
            </div>

            <div className="mt-2.5 grid gap-3 lg:grid-cols-2">
              <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-3.5">
                <div className="flex items-start justify-between gap-3"><div><h2 className="text-xs font-bold lg:text-sm">AI Infrastructure</h2><p className="mt-0.5 text-[9px] text-slate-500 lg:text-[11px]">Local development environment</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-semibold lg:text-[10px] ${apiHealthy ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{apiHealthy ? "API Connected" : "Checking services"}</span></div>
                <div className="mt-2 divide-y divide-slate-100"><ServiceLine icon={SiFastapi} iconTone="bg-emerald-50 text-[#009688]" name="FastAPI" detail="Application API" state={apiHealthy ? "Connected" : apiHealthy === false ? "Unavailable" : "Checking"} /><ServiceLine icon={SiQdrant} iconTone="bg-rose-50 text-rose-700" name="Qdrant" detail="Vector database" state="Connected" /><ServiceLine icon={SiOllama} iconTone="bg-slate-100 text-slate-800" name="Ollama" detail="Local LLM runtime" state="Connected" /><ServiceLine icon={GitBranch} iconTone="bg-blue-50 text-blue-700" name="Hybrid Retrieval" detail="Dense + BM25" state="Active" /><ServiceLine icon={ShieldCheck} iconTone="bg-slate-100 text-slate-600" name="Reranker" detail="Cross encoder" state="Active" /></div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-3.5">
                <div className="flex items-start justify-between gap-3"><div><h2 className="text-xs font-bold lg:text-sm">Knowledge Sources</h2><p className="mt-0.5 text-[9px] text-slate-500 lg:text-[11px]">Enterprise knowledge base</p></div><Link href="/knowledge" className="rounded-md bg-violet-600 px-2.5 py-1.5 text-[9px] font-semibold text-white hover:bg-violet-700 lg:text-[11px]"><Upload size={11} className="mr-1 inline lg:size-[13px]" />Upload</Link></div>
                {documentError ? <p className="mt-3 rounded-md bg-amber-50 p-3 text-[10px] text-amber-800 lg:text-xs">Document registry unavailable. Check the FastAPI service.</p> : documents.length ? <><ul className="mt-2 divide-y divide-slate-100">{documents.slice(0, 4).map((document) => <li key={document.document_id} className="flex items-center gap-2 py-2 lg:py-2.5"><FileText size={14} className="shrink-0 text-violet-600 lg:size-4" /><span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-slate-700 lg:text-xs">{document.filename}</span><span className="shrink-0 text-[9px] text-slate-500 lg:text-[10px]">{document.chunks} chunks · Indexed</span></li>)}</ul><div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2 text-[9px] text-slate-500 lg:text-[10px]"><span>{documents.length} indexed {documents.length === 1 ? "source" : "sources"}</span><Link href="/knowledge" className="font-semibold text-violet-700">View all documents →</Link></div></> : <div className="mt-3 rounded-md border border-dashed border-slate-200 px-3 py-5 text-center"><p className="text-[10px] font-medium text-slate-700 lg:text-xs">No indexed documents yet</p><Link href="/knowledge" className="mt-1 inline-block text-[9px] font-semibold text-violet-700 lg:text-[10px]">Add a PDF</Link></div>}
              </section>
            </div>

            <section className="mt-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-3.5">
              <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Activity size={14} className="text-violet-700 lg:size-4" /><h2 className="text-xs font-bold lg:text-sm">Recent Activity</h2></div><Link href="/knowledge" className="text-[9px] font-semibold text-violet-700 lg:text-[11px]">View all →</Link></div>
              <div className="mt-1 divide-y divide-slate-100">
                <ActivityRow icon={FileText} title="Document indexed" detail={documents[0]?.filename ?? (documentError ? "Document registry unavailable" : "No indexed documents yet")} metadata={documents[0] ? `${documents[0].chunks} chunks created` : "Upload a PDF to start"} timestamp={formatActivityTime(documents[0]?.created_at)} status={documents[0]?.status ?? "Waiting"} tone={documents[0] ? "success" : "neutral"} />
                <ActivityRow icon={Activity} title="System check" detail="FastAPI health endpoint" metadata={apiHealthy ? "Service responding normally" : apiHealthy === false ? "Service unavailable" : "Checking service"} timestamp={apiHealthy ? "Now" : "—"} status={apiHealthy ? "Healthy" : apiHealthy === false ? "Offline" : "Checking"} tone={apiHealthy ? "success" : "warning"} />
                <ActivityRow icon={GitBranch} title="Connector setup" detail="Jira · GitHub · Slack" metadata="Integration credentials not configured" timestamp="Not connected" status="Setup needed" tone="warning" />
                <ActivityRow icon={Sparkles} title="Chat query" detail={recentQuery?.question ?? "No chat queries yet"} metadata={recentQuery ? `${recentQuery.sources} sources used · ${Math.round(recentQuery.latency)} ms` : "Ask Pulse AI to start a grounded search"} timestamp={recentQuery ? "Just now" : "Ready"} status={recentQuery ? "Answered" : "Ready"} tone={recentQuery ? "success" : "neutral"} />
              </div>
            </section>
          </div>

          <aside className="space-y-3">
            <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] xl:p-4 2xl:p-4">
              <div className="flex items-center justify-between gap-1"><h2 className="whitespace-nowrap text-xs font-bold xl:text-sm">Connected Systems</h2><Link href="/settings" className="shrink-0 rounded-md border border-violet-200 px-2 py-1 text-[10px] font-semibold text-violet-700 xl:text-[11px]">Manage</Link></div>
              <div className="mt-1 divide-y divide-slate-100">{connectorItems.map((connector) => {
                const Icon = connector.icon;
                return <Link key={connector.name} href={connector.href} className="flex items-center gap-3 py-3 xl:py-3.5"><span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${connector.color} xl:size-10`}><Icon size={18} className="xl:size-5" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800 xl:text-[13px]">{connector.name}</span><span className="mt-0.5 block text-[11px] text-amber-700 xl:text-xs">Not configured</span></span><span className="size-2 shrink-0 rounded-full bg-amber-500" /></Link>;
              })}</div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] xl:p-4 2xl:p-4">
              <h2 className="text-sm font-bold xl:text-base">Quick Actions</h2>
              <div className="mt-2 space-y-1.5"><QuickAction href="/knowledge" icon={Upload} label="Upload Document" /><QuickAction href="/agents" icon={Bot} label="Create Agent" /><QuickAction href="/analytics" icon={BarChart3} label="View Analytics" /><button type="button" onClick={() => void refreshHealth()} disabled={checkingHealth} className="flex w-full items-center gap-2.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:border-violet-200 hover:bg-violet-50 disabled:opacity-60 xl:text-[13px]"><span className="flex size-7 items-center justify-center rounded bg-violet-50 text-violet-700"><ShieldCheck size={15} /></span>{checkingHealth ? "Checking health..." : "Check System Health"}</button></div>
            </section>

            <section className="overflow-hidden rounded-lg border border-violet-100 bg-[linear-gradient(145deg,#f1edff_0%,#faf9ff_100%)] p-3.5 text-center">
              <div aria-hidden="true" className="relative mx-auto mb-2 h-[82px] w-[124px]">
                <div className="absolute left-2 top-5 h-12 w-[82px] rotate-[-9deg] rounded-lg border border-violet-100 bg-white/80 shadow-sm" />
                <div className="absolute left-5 top-2 h-14 w-[86px] rotate-[5deg] rounded-lg border border-violet-100 bg-white shadow" />
                <div className="absolute left-8 top-4 flex h-12 w-[82px] rotate-[-3deg] flex-col justify-center gap-2 rounded-lg border border-violet-100 bg-white px-3 shadow-md"><span className="h-1.5 w-12 rounded-full bg-violet-100" /><span className="h-1.5 w-16 rounded-full bg-indigo-100" /><span className="h-1.5 w-10 rounded-full bg-violet-100" /></div>
                <Sparkles size={17} className="absolute right-0 top-5 text-violet-500" />
              </div>
              <h2 className="text-center text-sm font-bold xl:text-base">Build AI Agents</h2>
              <p className="mt-1 text-center text-[11px] leading-4 text-slate-600 xl:text-xs">Connect research, planning, and specialist agents into one workflow.</p>
              <Link href="/agents" className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md border border-violet-300 bg-white px-2 py-2 text-[10px] font-semibold text-violet-700 hover:bg-violet-50 xl:text-[11px]">Get started <span aria-hidden="true">→</span></Link>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function getDailyDocumentTrends(documents: KnowledgeDocument[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const indexedToday = documents.filter((document) => document.created_at && new Date(document.created_at).toDateString() === date.toDateString());
    return {
      documents: indexedToday.length,
      chunks: indexedToday.reduce((total, document) => total + document.chunks, 0),
    };
  });
}

function ServiceLine({ icon: Icon, iconTone, name, detail, state }: { icon: LucideIcon | IconType; iconTone: string; name: string; detail: string; state: string }) {
  const healthy = state === "Connected" || state === "Active";
  return <div className="flex items-center gap-2 py-1 lg:py-1.5"><span className={`flex size-5.5 shrink-0 items-center justify-center rounded-md ${iconTone} lg:size-6`}><Icon size={12} className="lg:size-3.5" /></span><span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold text-slate-800 lg:text-xs">{name}</span><span className="hidden text-[8px] text-slate-500 sm:block lg:text-[10px]">{detail}</span></span><span className={`max-w-[100px] text-right text-[9px] leading-3.5 lg:text-[10px] ${healthy ? "text-emerald-600" : state === "Unavailable" ? "text-red-600" : "text-slate-500"}`}>{healthy && <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" />}{state}</span></div>;
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return <Link href={href} className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 xl:text-[13px]"><span className="flex size-8 items-center justify-center rounded bg-violet-50 text-violet-700"><Icon size={16} /></span>{label}</Link>;
}

function ActivityRow({
  icon: Icon,
  title,
  detail,
  metadata,
  timestamp,
  status,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  metadata: string;
  timestamp: string;
  status: string;
  tone: "success" | "warning" | "neutral";
}) {
  const statusClasses = tone === "success"
    ? "bg-emerald-50 text-emerald-700"
    : tone === "warning"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";

  return <div className="grid grid-cols-[16px_minmax(0,1fr)_58px] items-center gap-1 py-1 text-[8px] leading-3 sm:grid-cols-[16px_minmax(72px,0.8fr)_minmax(80px,1.2fr)_60px] sm:gap-2 md:grid-cols-[16px_minmax(72px,0.8fr)_minmax(80px,1.2fr)_minmax(80px,1fr)_60px] lg:grid-cols-[16px_minmax(70px,0.75fr)_minmax(80px,1.1fr)_minmax(80px,1fr)_48px_60px] lg:py-1.5 lg:text-[10px]"><Icon size={12} className="text-violet-700 lg:size-3.5" /><span className="truncate font-medium text-slate-700">{title}</span><span className="hidden truncate text-slate-500 sm:block">{detail}</span><span className="hidden truncate text-slate-500 md:block">{metadata}</span><span className="hidden text-slate-400 lg:block">{timestamp}</span><span className={`min-w-0 rounded-full px-1.5 py-0.5 text-center text-[7px] font-medium lg:px-1.5 lg:py-1 lg:text-[9px] ${statusClasses}`}>{status}</span></div>;
}

function formatActivityTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}