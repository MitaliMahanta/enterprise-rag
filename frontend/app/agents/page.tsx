"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  GitBranch,
  ListTodo,
  Plus,
  Play,
  Search,
  Settings2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SiGithub, SiJira } from "react-icons/si";
import SlackLogo from "@/components/slack-logo";
import AppShell from "@/components/app-shell";

type AgentStatus = "Preview" | "Needs connector" | "Needs runtime";
type AgentIcon = ComponentType<{ size?: number; className?: string }>;
type Agent = {
  name: string;
  description: string;
  icon: AgentIcon;
  tone: string;
  status: AgentStatus;
  sampleStatus: "Active" | "Inactive";
  href: string;
};

const agents: Agent[] = [
  { name: "Orchestrator Agent", description: "Plan and coordinate tasks", icon: Bot, tone: "bg-violet-50 text-violet-700", status: "Preview", sampleStatus: "Active", href: "/assistant/chat" },
  { name: "Jira Agent", description: "Search and manage project issues", icon: SiJira, tone: "bg-blue-50 text-blue-700", status: "Needs connector", sampleStatus: "Active", href: "/connectors/jira" },
  { name: "GitHub Agent", description: "Analyze code and pull requests", icon: SiGithub, tone: "bg-slate-100 text-slate-900", status: "Needs connector", sampleStatus: "Active", href: "/connectors/github" },
  { name: "Slack Agent", description: "Search and summarize conversations", icon: SlackLogo, tone: "bg-white", status: "Needs connector", sampleStatus: "Active", href: "/connectors/slack" },
  { name: "Knowledge Agent", description: "Retrieve internal documents", icon: FileText, tone: "bg-violet-50 text-violet-700", status: "Preview", sampleStatus: "Active", href: "/knowledge" },
  { name: "Analysis Agent", description: "Generate insights and reports", icon: BarChart3, tone: "bg-indigo-50 text-indigo-700", status: "Preview", sampleStatus: "Active", href: "/analytics" },
  { name: "Action Agent", description: "Prepare approved actions", icon: Zap, tone: "bg-orange-50 text-orange-700", status: "Needs runtime", sampleStatus: "Active", href: "/settings" },
  { name: "Planner Agent", description: "Break down complex tasks", icon: BrainCircuit, tone: "bg-violet-50 text-violet-700", status: "Preview", sampleStatus: "Inactive", href: "/assistant/chat" },
];

const tabs = ["Overview", "Agent Library", "Orchestrations", "Running Tasks", "Logs"] as const;
type AgentTab = (typeof tabs)[number];

const metrics: { label: string; value: string; detail: string; icon: LucideIcon; tone: string }[] = [
  { label: "Total Agents", value: String(agents.length), detail: "7 active in demo", icon: Bot, tone: "bg-violet-50 text-violet-700" },
  { label: "Active Tasks", value: "3", detail: "50% vs last week", icon: Play, tone: "bg-emerald-50 text-emerald-700" },
  { label: "Avg. Execution Time", value: "32.4s", detail: "28% faster", icon: Clock3, tone: "bg-blue-50 text-blue-700" },
  { label: "Success Rate", value: "94%", detail: "6% vs last week", icon: Activity, tone: "bg-violet-50 text-violet-700" },
];

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<AgentTab>("Overview");

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-44px)] bg-[linear-gradient(118deg,#fafaff_0%,#f4f5ff_60%,#fbf9ff_100%)] px-3 py-3 sm:px-4 xl:min-h-[calc(100vh-52px)] xl:px-4 xl:py-4 2xl:min-h-[calc(100vh-60px)] 2xl:py-5">
        <div className="mx-auto max-w-[1540px]">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-[30px]">Multi-Agent System</h1><p className="mt-1 text-sm text-slate-600">Create, configure, and coordinate specialized engineering agents.</p></div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setActiveTab("Agent Library")} className="inline-flex h-10 items-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"><Plus size={16} /> Create Agent</button>
              <Link href="/settings" aria-label="Agent settings" title="Agent settings" className="flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"><Settings2 size={17} /></Link>
            </div>
          </header>

          {/* <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"><Activity size={14} className="shrink-0" /><span><strong>Demo data</strong> · Sample task activity and metrics; integrations are not connected.</span></div> */}

          <nav className="mb-3 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Agent workspace views">
            {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${activeTab === tab ? "border-violet-600 text-violet-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{tab}</button>)}
          </nav>

          {activeTab === "Overview" && <Overview onOpenLibrary={() => setActiveTab("Agent Library")} onOpenOrchestrations={() => setActiveTab("Orchestrations")} />}
          {activeTab === "Agent Library" && <AgentLibrary />}
          {activeTab === "Orchestrations" && <Orchestrations />}
          {activeTab === "Running Tasks" && <EmptyState icon={ListTodo} title="No running tasks" detail="Tasks will appear here when an agent runtime is connected and an orchestration is launched." actionLabel="View orchestration" onAction={() => setActiveTab("Orchestrations")} />}
          {activeTab === "Logs" && <EmptyState icon={Activity} title="No execution logs" detail="Run history and agent events will be available after execution is configured." actionLabel="View agent library" onAction={() => setActiveTab("Agent Library")} />}
        </div>
      </div>
    </AppShell>
  );
}

function Overview({ onOpenLibrary, onOpenOrchestrations }: { onOpenLibrary: () => void; onOpenOrchestrations: () => void }) {
  const [activeOutputTab, setActiveOutputTab] = useState("Summary");
  const [copied, setCopied] = useState(false);
  const outputSections: Record<string, string> = {
    Summary: "The Phoenix release is at risk due to multiple blockers across Jira, GitHub, Slack, and internal documentation. Database migration is blocked, security approval is still pending, and authentication requirements are incomplete.",
    Findings: "PHX-142 reports repeated migration timeouts. PR #821 contains a proposed fix, but CI is still failing. The engineering handbook requires an authentication validation path that is not present in the latest code.",
    Risks: "Release readiness is blocked by the migration timeout and unresolved security approval. Incomplete authentication checks and unfinished cluster configuration add implementation and deployment risk.",
    Recommendations: "Resolve PHX-142 and rerun migration CI. Record security approval in Jira, add the missing authentication validation, and complete the new cluster environment configuration before release review.",
    Sources: "Jira · PHX-142 Database migration timeout\nGitHub · PR #821 Fix migration script\nSlack · #phoenix Migration timeout discussion\nDocument · Engineering Handbook, section 2.1",
  };
  const outputTabs = Object.keys(outputSections);
  const traceEntries = [
    { time: "10:24:01", name: "Orchestrator Agent", detail: "Received query and planned execution", icon: Bot, status: "done" },
    { time: "10:24:03", name: "Jira Agent", detail: "Fetched 8 related issues", icon: SiJira, status: "done" },
    { time: "10:24:05", name: "GitHub Agent", detail: "Analyzed 12 pull requests", icon: SiGithub, status: "done" },
    { time: "10:24:08", name: "Slack Agent", detail: "Retrieved 45 relevant messages", icon: SlackLogo, status: "done" },
    { time: "10:24:12", name: "Knowledge Agent", detail: "Retrieved 6 documents", icon: FileText, status: "done" },
    { time: "10:24:18", name: "Analysis Agent", detail: "Correlated findings across sources", icon: BarChart3, status: "done" },
    { time: "10:24:25", name: "Report Agent", detail: "Generating structured investigation report", icon: FileText, status: "running" },
    { time: "10:24:30", name: "Action Agent", detail: "Waiting for report completion", icon: Zap, status: "queued" },
  ] as const;
  const taskRows = [
    { id: "T-1024", name: "Phoenix Release Risk Investigation", status: "Running", progress: 60, started: "10:24 AM" },
    { id: "T-1023", name: "Security Approval Analysis", status: "Completed", progress: 100, started: "9:18 AM" },
    { id: "T-1022", name: "Onboarding Documentation", status: "Completed", progress: 100, started: "Oct 5, 4:12 PM" },
    { id: "T-1021", name: "Dependency Impact Analysis", status: "Failed", progress: 0, started: "Oct 5, 2:34 PM" },
  ] as const;

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(outputSections[activeOutputTab]);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => <section key={label} className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:px-4"><span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${tone}`}><Icon size={19} /></span><div className="min-w-0"><p className="truncate text-xs text-slate-500">{label}</p><p className="text-xl font-bold leading-6 text-slate-900">{value}</p><p className="truncate text-[11px] text-emerald-600">{detail}</p></div></section>)}
      </div>

      <div className="mt-3 grid min-w-0 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2"><div><h2 className="text-base font-bold text-slate-900">Available Agents</h2><p className="mt-0.5 text-xs text-slate-500">Specialists participating in this demo workflow</p></div><button type="button" onClick={onOpenLibrary} className="shrink-0 text-xs font-semibold text-violet-700 hover:text-violet-900">Agent library <ArrowUpRight size={14} className="ml-0.5 inline" /></button></div>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {agents.map((agent) => <AgentCard key={agent.name} agent={agent} />)}
          </div>
        </section>

        <section className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4">
          <div className="flex items-center justify-between gap-2"><h2 className="text-base font-bold text-slate-900">Current Task</h2><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" /> Running</span></div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">Phoenix Release Risk Investigation</h3><p className="mt-1 text-xs leading-5 text-slate-500">Investigating risks across Jira, GitHub, Slack, and documentation</p>
          <div className="mt-4 flex items-center gap-2"><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-violet-100"><div className="h-full w-3/5 rounded-full bg-violet-600" /></div><span className="shrink-0 text-[11px] text-slate-600">3 of 5 steps</span></div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[11px]"><dt className="text-slate-500">Started at</dt><dd className="text-right font-medium text-slate-700">Today, 10:24 AM</dd><dt className="text-slate-500">Estimated time</dt><dd className="text-right font-medium text-slate-700">45 seconds</dd><dt className="text-slate-500">Triggered by</dt><dd className="text-right font-medium text-slate-700">Mitali</dd><dt className="text-slate-500">Task ID</dt><dd className="text-right font-medium text-slate-700">task_9823e1f2</dd></dl>
        </section>
      </div>

      <div className="mt-3 grid min-w-0 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4">
          <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-md bg-violet-50 text-violet-700"><GitBranch size={17} /></span><div><h2 className="text-base font-bold text-slate-900">Agent Orchestration Flow</h2><p className="text-[11px] text-slate-500">Phoenix investigation · sample execution</p></div></div><button type="button" onClick={onOpenOrchestrations} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:border-violet-200">View details <ArrowUpRight size={13} /></button></div>
          <div className="mt-3 rounded-md bg-slate-50/80 p-3 sm:p-4">
            <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)]">
              <div className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-white p-2.5"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700"><Search size={16} /></span><span className="min-w-0"><span className="block text-xs font-semibold text-slate-800">User Query</span><span className="block truncate text-[11px] text-slate-500">Why is the Phoenix release at risk?</span></span></div>
              <ArrowRight size={17} className="mx-auto hidden text-violet-500 sm:block" />
              <div className="flex min-w-0 items-center gap-2 rounded-md border border-violet-200 bg-white p-2.5"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-600 text-white"><Bot size={16} /></span><span className="min-w-0"><span className="block text-xs font-semibold text-slate-800">Orchestrator Agent</span><span className="block truncate text-[11px] text-slate-500">Plan, route, and coordinate</span></span><span className="size-2 shrink-0 rounded-full bg-emerald-500" /></div>
            </div>
            <div className="mx-auto h-5 w-px bg-violet-300" />
            <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-4"><FlowNode icon={SiJira} label="Jira Agent" detail="Fetch issues" /><FlowNode icon={SiGithub} label="GitHub Agent" detail="Analyze code" /><FlowNode icon={SlackLogo} label="Slack Agent" detail="Summarize discussions" /><FlowNode icon={FileText} label="Knowledge Agent" detail="Retrieve documents" /></div>
            <div className="mx-auto flex h-7 items-center justify-center"><ArrowRight size={15} className="rotate-90 text-violet-500" /></div>
            <div className="grid gap-2 sm:grid-cols-2"><FlowNode icon={BarChart3} label="Analysis Agent" detail="Correlate findings across sources" /><FlowNode icon={FileText} label="Report Agent" detail="Generate structured investigation report" /></div>
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4">
          <div className="flex items-center justify-between gap-2"><h2 className="text-base font-bold text-slate-900">Agent Execution Trace</h2><button type="button" onClick={onOpenOrchestrations} className="text-[11px] font-semibold text-violet-700">View all</button></div>
          <ol className="mt-2 divide-y divide-slate-100">
            {traceEntries.map(({ time, name, detail, icon: Icon, status }) => <li key={time} className="flex items-center gap-2.5 py-2"><span className={`flex size-7 shrink-0 items-center justify-center rounded-md ${status === "done" ? "bg-violet-50 text-violet-700" : status === "running" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}><Icon size={15} /></span><span className="w-[54px] shrink-0 text-[10px] text-slate-500">{time}</span><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-slate-800">{name}</span><span className="block truncate text-[10px] text-slate-500">{detail}</span></span>{status === "done" ? <CheckCircle2 size={14} className="shrink-0 text-emerald-600" /> : status === "running" ? <span className="size-2 shrink-0 animate-pulse rounded-full bg-blue-500" /> : <span className="size-2 shrink-0 rounded-full border-2 border-slate-300" />}</li>)}
          </ol>
        </section>
      </div>

      <div className="mt-3 grid min-w-0 gap-3 lg:grid-cols-2">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4"><div className="flex items-center justify-between gap-2"><h2 className="text-base font-bold text-slate-900">Running Tasks</h2><button type="button" onClick={onOpenOrchestrations} className="text-[11px] font-semibold text-violet-700">View all</button></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-[11px]"><thead className="border-y border-slate-100 text-[10px] font-semibold text-slate-500"><tr><th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Task name</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Progress</th><th className="py-2">Started</th></tr></thead><tbody className="divide-y divide-slate-100">{taskRows.map((task) => <tr key={task.id}><td className="whitespace-nowrap py-2 pr-3 text-slate-500">{task.id}</td><td className="max-w-[190px] truncate py-2 pr-3 font-medium text-slate-800">{task.name}</td><td className="py-2 pr-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${task.status === "Running" ? "bg-emerald-50 text-emerald-700" : task.status === "Failed" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"}`}>{task.status}</span></td><td className="py-2 pr-3"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${task.status === "Failed" ? "bg-red-500" : "bg-violet-600"}`} style={{ width: `${task.progress}%` }} /></div><span className="text-[10px] text-slate-500">{task.progress}%</span></div></td><td className="whitespace-nowrap py-2 text-slate-500">{task.started}</td></tr>)}</tbody></table></div></section>
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4"><div className="flex items-center justify-between gap-2"><h2 className="text-base font-bold text-slate-900">Generated Output <span className="text-xs font-medium text-slate-400">(Preview)</span></h2><button type="button" onClick={() => void copyOutput()} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"><Copy size={13} />{copied ? "Copied" : "Copy"}</button></div><div className="mt-2 flex gap-1 overflow-x-auto border-b border-slate-100">{outputTabs.map((tab) => <button key={tab} type="button" onClick={() => { setActiveOutputTab(tab); setCopied(false); }} className={`shrink-0 border-b-2 px-2.5 py-2 text-[10px] font-semibold ${activeOutputTab === tab ? "border-violet-600 text-violet-800" : "border-transparent text-slate-500"}`}>{tab}</button>)}</div><div className="mt-3 min-h-[105px] rounded-md border border-slate-200 bg-slate-50/70 p-3"><h3 className="text-xs font-bold text-slate-900">{activeOutputTab === "Summary" ? "Executive Summary" : activeOutputTab}</h3><p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-5 text-slate-600">{outputSections[activeOutputTab]}</p></div></section>
      </div>
    </>
  );
}

function AgentLibrary() {
  return <section><div className="mb-4"><h2 className="text-base font-bold text-slate-900">Agent Library</h2><p className="mt-1 text-sm text-slate-500">Choose a specialist to open its workspace or configure its integration.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{agents.map((agent) => <AgentCard key={agent.name} agent={agent} expanded />)}</div></section>;
}

function Orchestrations() {
  return <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-5"><div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-md bg-violet-50 text-violet-700"><GitBranch size={16} /></span><div><h2 className="text-sm font-bold text-slate-900">Knowledge Investigation</h2><p className="mt-0.5 text-[10px] text-slate-500">Preview workflow · orchestration runtime not configured</p></div></div><div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{agents.filter((agent) => agent.status === "Preview").map((agent, index) => <div key={agent.name} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3"><span className="flex size-7 shrink-0 items-center justify-center rounded bg-white text-violet-700"><agent.icon size={15} /></span><span className="min-w-0"><span className="block text-[10px] font-semibold text-slate-800">{index + 1}. {agent.name}</span><span className="block truncate text-[9px] text-slate-500">{agent.description}</span></span></div>)}</div><p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-900">Execution will be available after an agent runtime is configured.</p></section>;
}

function AgentCard({ agent, expanded = false }: { agent: Agent; expanded?: boolean }) {
  const Icon = agent.icon;
  const isActive = agent.sampleStatus === "Active";
  const statusTone = isActive ? "text-emerald-700" : "text-slate-500";
  const actionLabel = agent.status === "Preview" ? "Open workspace" : agent.status === "Needs connector" ? "Configure connector" : "Configure runtime";

  return <article className={`flex min-w-0 flex-col rounded-md border border-slate-200 bg-white p-3 transition hover:border-violet-200 ${expanded ? "shadow-[0_2px_8px_rgba(31,41,55,0.03)]" : ""}`}>
    <div className="flex min-w-0 items-center gap-2.5"><span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${agent.tone}`}><Icon size={18} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-slate-900">{agent.name}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{agent.description}</span></span><span className={`size-2 shrink-0 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} /></div>
    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5"><span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${statusTone}`}><span className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />{agent.sampleStatus}</span><Link href={agent.href} className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-violet-700 hover:text-violet-900">{actionLabel}<ArrowUpRight size={12} /></Link></div>
  </article>;
}

function FlowNode({ icon: Icon, label, detail }: { icon: AgentIcon; label: string; detail: string }) {
  return <div className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-white p-2.5"><span className="flex size-7 shrink-0 items-center justify-center rounded bg-violet-50 text-violet-700"><Icon size={15} /></span><span className="min-w-0"><span className="block truncate text-[11px] font-semibold text-slate-800">{label}</span><span className="block truncate text-[10px] text-slate-500">{detail}</span></span></div>;
}

function EmptyState({ icon: Icon, title, detail, actionLabel, onAction }: { icon: LucideIcon; title: string; detail: string; actionLabel: string; onAction: () => void }) {
  return <section className="flex min-h-[330px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-12 text-center shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><span className="flex size-10 items-center justify-center rounded-md bg-violet-50 text-violet-700"><Icon size={19} /></span><h2 className="mt-3 text-base font-bold text-slate-900">{title}</h2><p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{detail}</p><button type="button" onClick={onAction} className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 hover:border-violet-200 hover:bg-violet-50">{actionLabel}<ArrowRight size={13} /></button></section>;
}