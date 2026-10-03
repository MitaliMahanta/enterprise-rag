"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FilePlus2,
  Link2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { SiJira } from "react-icons/si";
import AppShell from "@/components/app-shell";

type IssueStatus = "Open" | "Blocked" | "In Progress" | "Done";
type IssuePriority = "High" | "Medium" | "Low";

type JiraIssue = {
  key: string;
  summary: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: string;
  updated: string;
  project: string;
  type: string;
};

const initialIssues: JiraIssue[] = [
  { key: "PHX-142", summary: "Database migration timeout", status: "Blocked", priority: "High", assignee: "Rohit", updated: "2 hours ago", project: "Phoenix", type: "Bug" },
  { key: "PHX-138", summary: "Security approval pending", status: "Open", priority: "High", assignee: "Priya", updated: "5 hours ago", project: "Phoenix", type: "Task" },
  { key: "PHX-121", summary: "Auth validation not implemented", status: "Open", priority: "High", assignee: "Amit", updated: "1 day ago", project: "Phoenix", type: "Bug" },
  { key: "PHX-119", summary: "Payment service CI failures", status: "In Progress", priority: "High", assignee: "Angel", updated: "1 day ago", project: "Phoenix", type: "Bug" },
  { key: "PHX-104", summary: "Update infrastructure configuration", status: "Open", priority: "Medium", assignee: "Karan", updated: "2 days ago", project: "Phoenix", type: "Task" },
];

const tabs = ["Overview", "Search & Query", "Create Issue", "Project Insights", "Automation", "Settings"] as const;
type JiraTab = (typeof tabs)[number];

const projects = [
  { name: "Phoenix", detail: "Payment platform", key: "P", count: 46, color: "bg-violet-600" },
  { name: "Platform", detail: "Core infrastructure", key: "P", count: 32, color: "bg-blue-600" },
  { name: "Mobile", detail: "Mobile applications", key: "M", count: 28, color: "bg-emerald-600" },
  { name: "Infrastructure", detail: "DevOps and services", key: "I", count: 22, color: "bg-amber-500" },
];

const statusCounts = [
  { label: "Open", count: 32, color: "bg-emerald-500", share: "25%" },
  { label: "In Progress", count: 18, color: "bg-blue-500", share: "14%" },
  { label: "Blocked", count: 12, color: "bg-red-500", share: "9%" },
  { label: "Done", count: 54, color: "bg-violet-600", share: "42%" },
  { label: "To Do", count: 12, color: "bg-slate-300", share: "9%" },
];

const issueTrend = [
  { day: "Sep 23", created: 13, resolved: 7 },
  { day: "Sep 25", created: 16, resolved: 8 },
  { day: "Sep 27", created: 19, resolved: 8 },
  { day: "Sep 29", created: 22, resolved: 8 },
  { day: "Oct 1", created: 24, resolved: 15 },
  { day: "Oct 3", created: 32, resolved: 11 },
  { day: "Oct 6", created: 27, resolved: 14 },
];

const recentActivity = [
  { issue: "PHX-142", text: "Status changed from In Progress to Blocked", user: "Rohit", time: "2 hours ago", icon: ShieldAlert, tone: "bg-red-50 text-red-600" },
  { issue: "PHX-138", text: "Comment added: Waiting for security approval", user: "Priya", time: "5 hours ago", icon: Activity, tone: "bg-blue-50 text-blue-600" },
  { issue: "PHX-121", text: "Assigned to Amit", user: "System", time: "1 day ago", icon: CheckCircle2, tone: "bg-violet-50 text-violet-700" },
  { issue: "PHX-119", text: "Status changed from Open to In Progress", user: "Angel", time: "1 day ago", icon: Clock3, tone: "bg-blue-50 text-blue-600" },
  { issue: "PHX-104", text: "New issue created", user: "Karan", time: "2 days ago", icon: Plus, tone: "bg-emerald-50 text-emerald-600" },
];

const automationRules = [
  { id: "risk-alert", title: "Notify channel on high-risk issues", detail: "Post a Slack update when a high-priority issue is blocked.", active: true },
  { id: "stale-issues", title: "Flag stale Phoenix issues", detail: "Highlight issues with no updates for more than 5 days.", active: true },
  { id: "release-summary", title: "Weekly release summary", detail: "Prepare an issue digest for the project team.", active: false },
];

export default function JiraPage() {
  const [activeTab, setActiveTab] = useState<JiraTab>("Overview");
  const [issues, setIssues] = useState(initialIssues);
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("Phoenix");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedIssue, setSelectedIssue] = useState<JiraIssue | null>(null);
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [newPriority, setNewPriority] = useState<IssuePriority>("Medium");
  const [notice, setNotice] = useState("");
  const [activeAutomations, setActiveAutomations] = useState(["risk-alert", "stale-issues"]);

  const filteredIssues = issues.filter((issue) => {
    const matchesQuery = !query || [issue.key, issue.summary, issue.assignee].some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery
      && (projectFilter === "All" || issue.project === projectFilter)
      && (statusFilter === "All" || issue.status === statusFilter)
      && (priorityFilter === "All" || issue.priority === priorityFilter)
      && (assigneeFilter === "All" || issue.assignee === assigneeFilter)
      && (typeFilter === "All" || issue.type === typeFilter);
  });

  function createIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanSummary = summary.trim();
    if (!cleanSummary) return;
    const key = `PHX-${200 + issues.length}`;
    const issue: JiraIssue = { key, summary: cleanSummary, status: "Open", priority: newPriority, assignee: "Mitali", updated: "Just now", project: "Phoenix", type: "Task" };
    setIssues((current) => [issue, ...current]);
    setSummary("");
    setDescription("");
    setNotice(`Demo issue ${key} created.`);
    setActiveTab("Overview");
  }

  function notify(message: string) {
    setNotice(message);
  }

  function toggleAutomation(id: string) {
    setActiveAutomations((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-44px)] bg-[linear-gradient(118deg,#fafaff_0%,#f4f5ff_60%,#fbf9ff_100%)] px-3 py-3 sm:px-4 xl:px-5">
        <div className="mx-auto max-w-[1540px]">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600"><SiJira size={22} /></span>
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-[28px]">Jira Connector</h1><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" /> connected</span></div><p className="mt-1 text-sm text-slate-600">Search, create, and manage Jira issues using natural language.</p></div>
            </div>
            <div className="flex items-center gap-2"><button type="button" onClick={() => notify("Demo sync complete. Jira data is simulated.")} className="inline-flex h-9 items-center gap-2 rounded-md bg-violet-600 px-3.5 text-xs font-semibold text-white hover:bg-violet-700"><RefreshCw size={14} /> Sync Now</button><Link href="/settings" aria-label="Connector settings" title="Connector settings" className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"><Settings2 size={16} /></Link><button type="button" aria-label="More Jira options" title="More options" onClick={() => notify("Jira connector options are part of this demo.")} className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-violet-200"><MoreHorizontal size={17} /></button></div>
          </header>

          <nav className="mb-3 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Jira connector views">
            {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${activeTab === tab ? "border-violet-600 text-violet-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{tab}</button>)}
          </nav>

          {notice && <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={14} /></button></div>}

          {activeTab === "Overview" && (
            <>
              <div className="mb-3 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
                <Metric label="Total Issues" value="128" detail="12% vs last week" icon={FilePlus2} trend="up" />
                <Metric label="Open Issues" value="32" detail="5% vs last week" icon={CheckCircle2} trend="down" />
                <Metric label="High Priority" value="8" detail="2% vs last week" icon={ShieldAlert} trend="down" />
                <Metric label="In Progress" value="18" detail="3% vs last week" icon={Activity} trend="up" />
              </div>

              <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.9fr)_minmax(310px,0.9fr)]">
                <main className="min-w-0 space-y-3">
                  <IssueBoard
                    issues={filteredIssues}
                    query={query}
                    setQuery={setQuery}
                    projectFilter={projectFilter}
                    setProjectFilter={setProjectFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    priorityFilter={priorityFilter}
                    setPriorityFilter={setPriorityFilter}
                    assigneeFilter={assigneeFilter}
                    setAssigneeFilter={setAssigneeFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    onSelect={setSelectedIssue}
                  />
                  {selectedIssue && <IssueDetails issue={selectedIssue} onClose={() => setSelectedIssue(null)} />}
                  <div className="grid gap-3 md:grid-cols-2"><StatusDistribution /><IssuesOverTime /></div>
                  <RecentActivity />
                </main>

                <aside className="min-w-0 space-y-3">
                  <ConnectionDetails onReconnect={() => notify("Demo connection is ready. Configure live OAuth in Settings.")} />
                  <ProjectList />
                  <SuggestedActions onCreate={() => setActiveTab("Create Issue")} onNotify={() => notify("Demo notification queued for #phoenix.")} onUpdate={() => notify("Demo status update prepared for PHX-142.")} />
                </aside>
              </div>
            </>
          )}

          {activeTab === "Search & Query" && <IssueBoard issues={filteredIssues} query={query} setQuery={setQuery} projectFilter={projectFilter} setProjectFilter={setProjectFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter} assigneeFilter={assigneeFilter} setAssigneeFilter={setAssigneeFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} onSelect={setSelectedIssue} />}

          {activeTab === "Create Issue" && <CreateIssueForm summary={summary} setSummary={setSummary} description={description} setDescription={setDescription} priority={newPriority} setPriority={setNewPriority} onSubmit={createIssue} />}

          {activeTab === "Project Insights" && <div className="grid gap-3 lg:grid-cols-2"><StatusDistribution /><IssuesOverTime /><div className="lg:col-span-2"><RecentActivity /></div></div>}

          {activeTab === "Automation" && <AutomationPanel activeIds={activeAutomations} onToggle={toggleAutomation} />}

          {activeTab === "Settings" && <div className="grid gap-3 lg:grid-cols-2"><ConnectionDetails onReconnect={() => notify("Demo connection is ready. Configure live OAuth in Settings.")} /><div className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="text-base font-bold text-slate-900">Connector permissions</h2><p className="mt-1 text-sm text-slate-500">Manage OAuth and workspace access in your application settings.</p><Link href="/settings" className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-violet-200 hover:bg-violet-50"><Settings2 size={14} /> Open settings <ArrowUpRight size={13} /></Link></div></div>}
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, detail, icon: Icon, trend }: { label: string; value: string; detail: string; icon: LucideIcon; trend: "up" | "down" }) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  return <section className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:px-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700"><Icon size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs text-slate-500">{label}</p><p className="text-xl font-bold leading-6 text-slate-900">{value}</p><p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-emerald-600"><TrendIcon size={12} />{detail}</p></div><MoreHorizontal size={16} className="shrink-0 text-slate-400" /></section>;
}

type IssueBoardProps = {
  issues: JiraIssue[];
  query: string;
  setQuery: (value: string) => void;
  projectFilter: string;
  setProjectFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  onSelect: (issue: JiraIssue) => void;
};

function IssueBoard({ issues, query, setQuery, projectFilter, setProjectFilter, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, assigneeFilter, setAssigneeFilter, typeFilter, setTypeFilter, onSelect }: IssueBoardProps) {
  return <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-2.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-3">
    <div className="mb-1.5 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><h2 className="text-sm font-bold text-slate-900">Issues</h2><span className="text-[10px] text-slate-500">Phoenix · {issues.length} sample</span></div></div>
    <div className="flex flex-wrap items-center gap-1 lg:flex-nowrap">
      <FilterSelect label="Project" value={projectFilter} onChange={setProjectFilter} options={["All", ...projects.map((project) => project.name)]} />
      <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All", "Open", "In Progress", "Blocked", "Done"]} />
      <FilterSelect label="Priority" value={priorityFilter} onChange={setPriorityFilter} options={["All", "High", "Medium", "Low"]} />
      <FilterSelect label="Assignee" value={assigneeFilter} onChange={setAssigneeFilter} options={["All", ...Array.from(new Set(initialIssues.map((issue) => issue.assignee)))]} />
      <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={["All", "Bug", "Task", "Story"]} />
      <div className="flex h-7 min-w-[95px] flex-1 items-center gap-1 rounded-md border border-slate-200 px-2 focus-within:border-violet-300"><Search size={12} className="shrink-0 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search issues..." className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-slate-400" /><button type="button" aria-label="Search Jira issues" title="Search issues" onClick={() => setQuery(query.trim())} className="flex size-6 shrink-0 items-center justify-center rounded bg-violet-600 text-white"><Search size={12} /></button></div>
    </div>
    <div className="mt-2 overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full min-w-[730px] border-collapse text-left">
        <thead className="bg-slate-50"><tr>{["Key", "Summary", "Status", "Priority", "Assignee", "Updated", ""].map((label, index) => <th key={`${label}-${index}`} className="whitespace-nowrap border-b border-slate-200 px-2 py-2 text-[10px] font-bold text-slate-700">{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {issues.length ? issues.map((issue) => <tr key={issue.key} className="hover:bg-violet-50/40"><td className="whitespace-nowrap px-2 py-1.5"><button type="button" onClick={() => onSelect(issue)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"><SiJira size={13} />{issue.key}</button></td><td className="max-w-[260px] px-2 py-1.5 text-[11px] text-slate-800"><span className="block truncate">{issue.summary}</span></td><td className="px-2 py-1.5"><StatusPill status={issue.status} /></td><td className="px-2 py-1.5"><PriorityPill priority={issue.priority} /></td><td className="whitespace-nowrap px-2 py-1.5"><span className="inline-flex items-center gap-1 text-[11px] text-slate-700"><Avatar name={issue.assignee} />{issue.assignee}</span></td><td className="whitespace-nowrap px-2 py-1.5 text-[11px] text-slate-500">{issue.updated}</td><td className="px-2 py-1.5"><button type="button" aria-label={`Open ${issue.key} details`} onClick={() => onSelect(issue)} className="flex size-6 items-center justify-center rounded text-violet-700 hover:bg-violet-50"><MoreHorizontal size={14} /></button></td></tr>) : <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No demo issues match these filters.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  const width = label === "Project" ? "w-[96px]" : label === "Assignee" ? "w-[92px]" : label === "Type" ? "w-[72px]" : "w-[82px]";
  return <label className="relative shrink-0"><span className="sr-only">Filter by {label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className={`h-7 ${width} appearance-none rounded-md border border-slate-200 bg-white py-1 pl-1.5 pr-4 text-[9px] font-medium text-slate-600 outline-none hover:border-violet-200 focus:border-violet-300`}>{options.map((option) => <option key={option} value={option}>{label}: {option}</option>)}</select><span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400">⌄</span></label>;
}

function StatusPill({ status }: { status: IssueStatus }) {
  const style = status === "Blocked" ? "bg-red-50 text-red-700" : status === "In Progress" ? "bg-blue-50 text-blue-700" : status === "Done" ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${style}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}

function PriorityPill({ priority }: { priority: IssuePriority }) {
  const style = priority === "High" ? "bg-red-50 text-red-700" : priority === "Medium" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${style}`}><span className="size-1.5 rounded-full bg-current" />{priority}</span>;
}

function Avatar({ name }: { name: string }) {
  const portraits: Record<string, number> = { Rohit: 12, Priya: 47, Amit: 68, Angel: 32, Karan: 21, Mitali: 44 };
  const portrait = portraits[name] ?? 15;
  return <span role="img" aria-label={name} className="size-5 shrink-0 rounded-full border border-white bg-slate-200 bg-cover bg-center shadow-sm" style={{ backgroundImage: `url(https://i.pravatar.cc/48?img=${portrait})` }} />;
}

function IssueDetails({ issue, onClose }: { issue: JiraIssue; onClose: () => void }) {
  return <section className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-semibold text-blue-700">{issue.key} · {issue.type}</p><h3 className="mt-1 text-sm font-bold text-slate-900">{issue.summary}</h3><p className="mt-2 text-xs text-slate-600">Assigned to {issue.assignee} · Updated {issue.updated}</p></div><button type="button" onClick={onClose} aria-label="Close issue details" className="flex size-7 items-center justify-center rounded text-slate-500 hover:bg-white"><X size={14} /></button></div></section>;
}

function ConnectionDetails({ onReconnect }: { onReconnect: () => void }) {
  const detailRows = [["Workspace", "acme.atlassian.net"], ["Auth method", "OAuth 2.0 (demo)"], ["Connected by", "Mitali"], ["Last sync", "Today, 10:24 AM"], ["Sync status", "Simulated"]];
  return <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-slate-900">Connection Details</h2><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">connected</span></div><dl className="mt-2 divide-y divide-slate-100">{detailRows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-2 py-2 text-[11px]"><dt className="text-slate-500">{label}</dt><dd className="flex min-w-0 items-center gap-1 truncate font-medium text-slate-700">{label === "Sync status" && <CheckCircle2 size={12} className="text-emerald-600" />}{value}{label === "Workspace" && <ExternalLink size={11} className="shrink-0 text-slate-400" />}</dd></div>)}</dl><button type="button" onClick={onReconnect} className="mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-violet-200 hover:bg-violet-50"><RefreshCw size={13} /> Reconnect</button></section>;
}

function ProjectList() {
  return <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Projects ({projects.length})</h2><button type="button" className="text-[10px] font-semibold text-violet-700">View all</button></div><ul className="mt-2 divide-y divide-slate-100">{projects.map((project) => <li key={project.name} className="flex items-center gap-2.5 py-2"><span className={`flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white ${project.color}`}>{project.key}</span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800">{project.name}</span><span className="block text-[10px] text-slate-500">{project.detail}</span></span><span className="text-xs font-semibold text-slate-600">{project.count}</span></li>)}</ul></section>;
}

function SuggestedActions({ onCreate, onNotify, onUpdate }: { onCreate: () => void; onNotify: () => void; onUpdate: () => void }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4"><h2 className="text-sm font-bold text-slate-900">Suggested Actions</h2><div className="mt-2 space-y-1.5"><ActionButton icon={Plus} title="Create follow-up issue" detail="Track the security approval task" onClick={onCreate} /><ActionButton icon={FilePlus2} title="Add comment to PHX-142" detail="Include the latest findings" onClick={() => onUpdate()} /><ActionButton icon={ArrowRight} title="Update issue status" detail="Move PHX-142 to In Progress" onClick={onUpdate} /><Link href="/connectors/github" className="flex items-center gap-2.5 rounded-md border border-slate-200 px-2.5 py-2 hover:border-violet-200 hover:bg-violet-50"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700"><Link2 size={15} /></span><span><span className="block text-[11px] font-semibold text-slate-800">Link related GitHub PR</span><span className="block text-[10px] text-slate-500">Connect PR #821 to PHX-142</span></span></Link><ActionButton icon={Activity} title="Notify Slack channel" detail="Share status update in #phoenix" onClick={onNotify} /></div></section>;
}

function ActionButton({ icon: Icon, title, detail, onClick }: { icon: LucideIcon; title: string; detail: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-2.5 rounded-md border border-slate-200 px-2.5 py-2 text-left transition hover:border-violet-200 hover:bg-violet-50"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700"><Icon size={15} /></span><span><span className="block text-[11px] font-semibold text-slate-800">{title}</span><span className="block text-[10px] text-slate-500">{detail}</span></span></button>;
}

function StatusDistribution() {
  return <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4"><h2 className="text-sm font-bold text-slate-900">Issue Status Distribution</h2><div className="mt-3 flex items-center justify-center gap-5"><div aria-label="Issue status chart: 128 total issues" className="relative size-32 shrink-0 rounded-full" style={{ background: "conic-gradient(#10b981 0 25%, #3b82f6 25% 39%, #ef4444 39% 48%, #7c3aed 48% 90%, #cbd5e1 90% 100%)" }}><div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white"><span className="text-lg font-bold text-slate-900">128</span><span className="text-[10px] text-slate-500">Total issues</span></div></div><ul className="min-w-0 space-y-1.5">{statusCounts.map((item) => <li key={item.label} className="grid grid-cols-[8px_minmax(64px,1fr)_24px_34px] items-center gap-1.5 text-[10px]"><span className={`size-2 rounded-sm ${item.color}`} /><span className="truncate text-slate-600">{item.label}</span><span className="text-right font-semibold text-slate-800">{item.count}</span><span className="text-right text-slate-500">{item.share}</span></li>)}</ul></div></section>;
}

function IssuesOverTime() {
  return <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4"><div className="flex items-center justify-between gap-2"><div><h2 className="text-sm font-bold text-slate-900">Issues Over Time</h2><p className="text-[10px] text-slate-500">Created and resolved · last 14 days</p></div><span className="rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-600">Last 14 days</span></div><div className="relative mt-3 h-32 border-b border-l border-slate-200 bg-[linear-gradient(to_bottom,transparent_24%,#e2e8f0_25%,transparent_26%,transparent_49%,#e2e8f0_50%,transparent_51%,transparent_74%,#e2e8f0_75%,transparent_76%)]"><div className="absolute inset-0 grid grid-cols-7 items-end gap-2 px-2">{issueTrend.map((point) => <div key={point.day} className="flex h-full items-end justify-center gap-1"><span className="w-2.5 rounded-t bg-violet-600" style={{ height: `${point.created * 2.4}px` }} /><span className="w-2.5 rounded-t bg-blue-400" style={{ height: `${point.resolved * 2.4}px` }} /></div>)}</div></div><div className="mt-1 grid grid-cols-7 text-center text-[9px] text-slate-500">{issueTrend.map((point) => <span key={point.day}>{point.day}</span>)}</div><div className="mt-2 flex justify-center gap-4 text-[10px] text-slate-500"><span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-violet-600" />Created</span><span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-blue-400" />Resolved</span></div></section>;
}

function RecentActivity() {
  return <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Recent Activity</h2><span className="text-[10px] font-semibold text-violet-700">View all</span></div><ul className="divide-y divide-slate-100">{recentActivity.map((activity) => { const Icon = activity.icon; return <li key={`${activity.issue}-${activity.time}`} className="flex items-center gap-2.5 py-2"><span className={`flex size-7 shrink-0 items-center justify-center rounded-md ${activity.tone}`}><Icon size={14} /></span><span className="w-16 shrink-0 text-[10px] font-semibold text-blue-700">{activity.issue}</span><span className="min-w-0 flex-1 truncate text-[11px] text-slate-600">{activity.text}</span><span className="hidden shrink-0 text-[10px] text-slate-600 sm:inline">{activity.user}</span><span className="shrink-0 text-[10px] text-slate-400">{activity.time}</span></li>; })}</ul></section>;
}

function CreateIssueForm({ summary, setSummary, description, setDescription, priority, setPriority, onSubmit }: { summary: string; setSummary: (value: string) => void; description: string; setDescription: (value: string) => void; priority: IssuePriority; setPriority: (value: IssuePriority) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-5"><div className="mb-4 flex items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-md bg-violet-50 text-violet-700"><FilePlus2 size={17} /></span><div><h2 className="text-base font-bold text-slate-900">Create Issue</h2><p className="text-xs text-slate-500">Create a sample issue in the Phoenix demo project.</p></div></div><form onSubmit={onSubmit} className="space-y-3"><label className="block text-xs font-semibold text-slate-700">Project<select defaultValue="Phoenix" className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal"><option>Phoenix</option><option>Platform</option><option>Mobile</option><option>Infrastructure</option></select></label><label className="block text-xs font-semibold text-slate-700">Summary<input required value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Briefly describe the issue" className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-violet-300" /></label><label className="block text-xs font-semibold text-slate-700">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Add context and acceptance criteria" className="mt-1.5 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-violet-300" /></label><label className="block text-xs font-semibold text-slate-700">Priority<select value={priority} onChange={(event) => setPriority(event.target.value as IssuePriority)} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal"><option>High</option><option>Medium</option><option>Low</option></select></label><button type="submit" className="inline-flex h-9 items-center gap-2 rounded-md bg-violet-600 px-3.5 text-xs font-semibold text-white hover:bg-violet-700"><Plus size={14} /> Create demo issue</button></form></section>;
}

function AutomationPanel({ activeIds, onToggle }: { activeIds: string[]; onToggle: (id: string) => void }) {
  return <section className="max-w-4xl rounded-lg border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-5"><div className="mb-4"><h2 className="text-base font-bold text-slate-900">Automation Rules</h2><p className="mt-1 text-xs text-slate-500">Preview automation behavior. Rules do not run against a live Jira workspace.</p></div><div className="divide-y divide-slate-100">{automationRules.map((rule) => { const active = activeIds.includes(rule.id); return <div key={rule.id} className="flex items-center justify-between gap-4 py-3"><div><h3 className="text-sm font-semibold text-slate-800">{rule.title}</h3><p className="mt-1 text-xs text-slate-500">{rule.detail}</p></div><button type="button" role="switch" aria-checked={active} onClick={() => onToggle(rule.id)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${active ? "bg-violet-600" : "bg-slate-300"}`}><span className={`absolute top-1 size-4 rounded-full bg-white transition ${active ? "left-6" : "left-1"}`} /></button></div>; })}</div></section>;
}
