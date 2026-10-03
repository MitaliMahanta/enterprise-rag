"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  FileCode2,
  Folder,
  GitPullRequest,
  Link2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import AppShell from "@/components/app-shell";

type Repository = {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updated: string;
};

const repositories: Repository[] = [
  { name: "phoenix-payment-service", description: "Payment service for Phoenix platform", language: "Python", stars: 128, forks: 34, updated: "2 hours ago" },
  { name: "auth-service", description: "Authentication and authorization", language: "TypeScript", stars: 86, forks: 21, updated: "1 day ago" },
  { name: "frontend", description: "Web interface for Phoenix", language: "React", stars: 64, forks: 18, updated: "2 days ago" },
  { name: "data-pipeline", description: "ETL and data processing", language: "Python", stars: 42, forks: 12, updated: "3 days ago" },
  { name: "infra", description: "Infrastructure as code", language: "Terraform", stars: 38, forks: 9, updated: "5 days ago" },
  { name: "docs", description: "Project documentation", language: "Markdown", stars: 21, forks: 4, updated: "1 week ago" },
];

const pullRequests = [
  { id: "#821", title: "Fix migration timeout error", repository: "phoenix-payment-service", author: "Smita", status: "CI Failing", updated: "2 hours ago" },
  { id: "#817", title: "Add authentication middleware", repository: "auth-service", author: "Anita", status: "Open", updated: "5 hours ago" },
  { id: "#812", title: "Refactor payment service", repository: "phoenix-payment-service", author: "Albert", status: "In Review", updated: "1 day ago" },
  { id: "#809", title: "Update dependencies", repository: "frontend", author: "Soumya", status: "Merged", updated: "1 day ago" },
  { id: "#805", title: "Improve error handling", repository: "data-pipeline", author: "Karan", status: "Open", updated: "3 days ago" },
];

const issues = [
  { id: "#342", title: "CI pipeline failing on main", priority: "High", label: "ci/cd", updated: "2 hours ago" },
  { id: "#318", title: "Database connection timeout", priority: "High", label: "backend", updated: "1 day ago" },
  { id: "#301", title: "Add monitoring for payments", priority: "Medium", label: "enhancement", updated: "2 days ago" },
  { id: "#287", title: "Update README", priority: "Low", label: "documentation", updated: "3 days ago" },
  { id: "#276", title: "Optimize query performance", priority: "Medium", label: "performance", updated: "4 days ago" },
];

const activityValues = Array.from({ length: 112 }, (_, index) => (index * 17 + index % 11 * 7) % 10);
const commitTrend = [12, 18, 22, 19, 27, 31, 25, 42, 33, 41, 36];
const tabs = ["Overview", "Repositories", "Pull Requests", "Code Search", "Issues", "CI/CD", "Settings"] as const;
type GitHubTab = (typeof tabs)[number];

export default function GitHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<GitHubTab>("Overview");
  const [repositoryQuery, setRepositoryQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [codeQuery, setCodeQuery] = useState("");
  const [branch, setBranch] = useState("main");
  const [notice, setNotice] = useState("");

  const filteredRepositories = repositories.filter((repository) => {
    const matchesQuery = !repositoryQuery || `${repository.name} ${repository.description}`.toLowerCase().includes(repositoryQuery.toLowerCase());
    return matchesQuery && (languageFilter === "All" || repository.language === languageFilter);
  });

  function notify(message: string) {
    setNotice(message);
  }

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-44px)] bg-[linear-gradient(118deg,#fafaff_0%,#f4f5ff_60%,#fbf9ff_100%)] px-3 py-3 sm:px-4 xl:px-5">
        <div className="mx-auto max-w-[1540px]">
          <header className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-900"><SiGithub size={22} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-[28px]">GitHub Connector</h1><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" /> connected</span></div><p className="mt-1 text-sm text-slate-600">Search repositories, analyze code, and create pull requests using natural language.</p></div></div>
            <div className="flex items-center gap-2"><label className="sr-only" htmlFor="github-branch">Branch</label><select id="github-branch" value={branch} onChange={(event) => setBranch(event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"><option>main</option><option>develop</option><option>release/phoenix</option></select><button type="button" onClick={() => notify("Demo sync complete. Repository data is simulated.")} className="inline-flex h-9 items-center gap-2 rounded-md bg-violet-600 px-3.5 text-xs font-semibold text-white hover:bg-violet-700"><RefreshCw size={14} /> Sync Now</button><Link href="/settings" aria-label="Connector settings" title="Connector settings" className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"><Settings2 size={16} /></Link><button type="button" aria-label="More GitHub options" title="More options" onClick={() => notify("GitHub connector options are part of this demo.")} className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-violet-200"><MoreHorizontal size={17} /></button></div>
          </header>

          <nav className="mb-2 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="GitHub connector views">
            {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${activeTab === tab ? "border-violet-600 text-violet-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{tab}</button>)}
          </nav>
          {notice && <div role="status" className="mb-2 flex items-center justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{notice}<button type="button" aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={14} /></button></div>}

          {activeTab === "Overview" && (
            <>
              <div className="mb-2 grid grid-cols-2 gap-2 xl:grid-cols-4">
                <Metric label="Repositories" value="6" detail="1 vs last week" icon={Folder} trend="up" />
                <Metric label="Pull Requests" value="12" detail="3 this week" icon={GitPullRequest} trend="up" />
                <Metric label="Open Issues" value="8" detail="2 this week" icon={CircleDot} trend="down" />
                <Metric label="CI Failures" value="3" detail="1 this week" icon={ShieldAlert} trend="up" warning />
              </div>

              <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.9fr)_minmax(310px,0.9fr)]">
                <main className="min-w-0 space-y-2.5">
                  <RepositoryTable repositories={filteredRepositories} query={repositoryQuery} setQuery={setRepositoryQuery} language={languageFilter} setLanguage={setLanguageFilter} onSelect={(name) => notify(`Opened demo repository: ${name}`)} />
                  <div className="grid gap-2.5 md:grid-cols-2"><ContributionActivity /><CommitsChart /></div>
                  <div className="grid gap-2.5 md:grid-cols-2"><PullRequestList /><OpenIssueList /></div>
                </main>
                <aside className="min-w-0 space-y-2.5">
                  <ConnectionDetails onReconnect={() => notify("Demo connection is ready. Configure live credentials in Settings.")} />
                  <TopRepositories onSelect={(name) => notify(`Opened demo repository: ${name}`)} />
                  <SuggestedActions onAction={(action) => {
                    if (action === "Create pull request") setActiveTab("Pull Requests");
                    else if (action === "Summarize repository") setActiveTab("Code Search");
                    else if (action === "Link to Jira issue") router.push("/connectors/jira");
                    else notify(`${action} is simulated in this demo.`);
                  }} />
                </aside>
              </div>
            </>
          )}

          {activeTab === "Repositories" && <RepositoryTable repositories={filteredRepositories} query={repositoryQuery} setQuery={setRepositoryQuery} language={languageFilter} setLanguage={setLanguageFilter} onSelect={(name) => notify(`Opened demo repository: ${name}`)} />}
          {activeTab === "Pull Requests" && <PullRequestList expanded />}
          {activeTab === "Issues" && <OpenIssueList expanded />}
          {activeTab === "Code Search" && <CodeSearch query={codeQuery} setQuery={setCodeQuery} />}
          {activeTab === "CI/CD" && <PipelineStatus />}
          {activeTab === "Settings" && <div className="max-w-2xl"><ConnectionDetails onReconnect={() => notify("Demo connection is ready. Configure live credentials in Settings.")} /></div>}
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, detail, icon: Icon, trend, warning = false }: { label: string; value: string; detail: string; icon: LucideIcon; trend: "up" | "down"; warning?: boolean }) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  return <section className="flex min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:px-3.5"><span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${warning ? "bg-red-50 text-red-600" : "bg-violet-50 text-violet-700"}`}><Icon size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-[11px] text-slate-500">{label}</p><p className="text-lg font-bold leading-5 text-slate-900">{value}</p><p className={`mt-0.5 flex items-center gap-1 text-[10px] font-medium ${warning ? "text-red-600" : "text-emerald-600"}`}><TrendIcon size={11} />{detail}</p></div><MoreHorizontal size={14} className="shrink-0 text-slate-400" /></section>;
}

function RepositoryTable({ repositories: rows, query, setQuery, language, setLanguage, onSelect }: { repositories: Repository[]; query: string; setQuery: (value: string) => void; language: string; setLanguage: (value: string) => void; onSelect: (name: string) => void }) {
  return <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-2.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-3">
    <div className="mb-1.5 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><h2 className="text-sm font-bold text-slate-900">Repositories ({rows.length})</h2><span className="text-[10px] text-slate-500">Organization: acme</span></div><button type="button" className="text-[10px] font-semibold text-violet-700">View all</button></div>
    <div className="flex flex-wrap items-center gap-1 lg:flex-nowrap"><FilterSelect label="Organization" value="acme" options={["acme", "phoenix"]} onChange={() => undefined} /><FilterSelect label="Repository" value="All" options={["All", ...repositories.map((repository) => repository.name)]} onChange={() => undefined} /><FilterSelect label="Language" value={language} options={["All", ...Array.from(new Set(repositories.map((repository) => repository.language)))]} onChange={setLanguage} /><FilterSelect label="Sort" value="Last Updated" options={["Last Updated", "Stars", "Name"]} onChange={() => undefined} /><label className="flex h-7 min-w-[100px] flex-1 items-center gap-1 rounded-md border border-slate-200 px-2 focus-within:border-violet-300"><Search size={12} className="shrink-0 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search repositories..." className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-slate-400" /><button type="button" aria-label="Search repositories" onClick={() => setQuery(query.trim())} className="flex size-6 shrink-0 items-center justify-center rounded bg-violet-600 text-white"><Search size={12} /></button></label></div>
    <div className="mt-2 overflow-x-auto rounded-md border border-slate-200"><table className="w-full min-w-[650px] border-collapse text-left"><thead className="bg-slate-50"><tr>{["Name", "Description", "Language", "Stars", "Forks", "Last Updated", ""].map((column, index) => <th key={`${column}-${index}`} className="whitespace-nowrap border-b border-slate-200 px-2 py-2 text-[10px] font-bold text-slate-700">{column}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.length ? rows.map((repository) => <tr key={repository.name} className="hover:bg-violet-50/40"><td className="whitespace-nowrap px-2 py-1.5"><button type="button" onClick={() => onSelect(repository.name)} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 hover:underline"><SiGithub size={13} />{repository.name}</button></td><td className="max-w-[250px] px-2 py-1.5 text-[11px] text-slate-600"><span className="block truncate">{repository.description}</span></td><td className="whitespace-nowrap px-2 py-1.5"><LanguageLabel language={repository.language} /></td><td className="px-2 py-1.5 text-[11px] text-slate-700">{repository.stars}</td><td className="px-2 py-1.5 text-[11px] text-slate-700">{repository.forks}</td><td className="whitespace-nowrap px-2 py-1.5 text-[11px] text-slate-500">{repository.updated}</td><td className="px-2 py-1.5"><button type="button" aria-label={`More about ${repository.name}`} onClick={() => onSelect(repository.name)} className="flex size-6 items-center justify-center rounded text-violet-700 hover:bg-violet-50"><MoreHorizontal size={14} /></button></td></tr>) : <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No demo repositories match your filters.</td></tr>}</tbody></table></div>
  </section>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const width = label === "Organization" ? "w-[96px]" : label === "Repository" ? "w-[100px]" : label === "Language" ? "w-[92px]" : "w-[112px]";
  return <label className="relative shrink-0"><span className="sr-only">Filter by {label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className={`h-7 ${width} appearance-none rounded-md border border-slate-200 bg-white py-1 pl-1.5 pr-4 text-[9px] font-medium text-slate-600 outline-none hover:border-violet-200 focus:border-violet-300`}>{options.map((option) => <option key={option} value={option}>{label}: {option}</option>)}</select><span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400">⌄</span></label>;
}

function LanguageLabel({ language }: { language: string }) {
  const color = language === "Python" ? "bg-blue-500" : language === "TypeScript" ? "bg-emerald-500" : language === "React" ? "bg-amber-400" : language === "Terraform" ? "bg-violet-600" : "bg-slate-400";
  return <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-600"><span className={`size-2 rounded-full ${color}`} />{language}</span>;
}

function ConnectionDetails({ onReconnect }: { onReconnect: () => void }) {
  const rows = [["Account", "mitalimahanta (acme)"], ["Auth Method", "Personal Access Token (demo)"], ["Scope", "repo, read:org, workflow"], ["Connected On", "Today, 10:12 AM"], ["Sync Status", "Success · 5 minutes ago"]];
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-slate-900">Connection Details</h2><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">connected</span></div><dl className="mt-1 divide-y divide-slate-100">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-2 py-1.5 text-[10px]"><dt className="text-slate-500">{label}</dt><dd className="flex min-w-0 items-center gap-1 truncate font-medium text-slate-700">{label === "Account" && <SiGithub size={12} />}{label === "Sync Status" && <CheckCircle2 size={11} className="text-emerald-600" />}{value}</dd></div>)}</dl><button type="button" onClick={onReconnect} className="mt-2 flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 text-[10px] font-semibold text-slate-700 hover:border-violet-200 hover:bg-violet-50"><RefreshCw size={12} /> Reconnect</button></section>;
}

function TopRepositories({ onSelect }: { onSelect: (name: string) => void }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Top Repositories</h2><button type="button" className="text-[10px] font-semibold text-violet-700">View all</button></div><ul className="mt-1 divide-y divide-slate-100">{repositories.slice(0, 5).map((repository) => <li key={repository.name} className="flex items-center gap-2 py-1.5"><button type="button" onClick={() => onSelect(repository.name)} className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-800"><SiGithub size={14} /></button><button type="button" onClick={() => onSelect(repository.name)} className="min-w-0 flex-1 text-left"><span className="block truncate text-[10px] font-semibold text-blue-700">{repository.name}</span><span className="block text-[9px] text-slate-500">{repository.language}</span></button><span className="text-[10px] font-semibold text-amber-600">★ {repository.stars}</span></li>)}</ul></section>;
}

function SuggestedActions({ onAction }: { onAction: (action: string) => void }) {
  const actions = [
    { title: "Create pull request", detail: "Implement suggested changes", icon: GitPullRequest },
    { title: "Run code analysis", detail: "Check for security issues", icon: Activity },
    { title: "Create GitHub issue", detail: "Track identified problem", icon: ShieldAlert },
    { title: "Link to Jira issue", detail: "Create cross-reference", icon: Link2 },
    { title: "Summarize repository", detail: "Get key insights about this repo", icon: FileCode2 },
  ];
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><h2 className="text-sm font-bold text-slate-900">Suggested Actions</h2><div className="mt-1 space-y-1">{actions.map(({ title, detail, icon: Icon }) => <button key={title} type="button" onClick={() => onAction(title)} className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5 text-left hover:border-violet-200 hover:bg-violet-50"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700"><Icon size={14} /></span><span><span className="block text-[10px] font-semibold text-slate-800">{title}</span><span className="block text-[9px] text-slate-500">{detail}</span></span></button>)}</div></section>;
}

function ContributionActivity() {
  const monthLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><h2 className="text-sm font-bold text-slate-900">Contribution Activity</h2><div className="mt-1 flex justify-between pl-6 text-[9px] text-slate-400">{monthLabels.map((month) => <span key={month}>{month}</span>)}</div><div className="mt-1 flex gap-1.5"><div className="flex flex-col justify-between py-0.5 text-[8px] text-slate-400"><span>Mon</span><span>Wed</span><span>Fri</span></div><div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]" aria-label="Sample GitHub contribution heatmap">{activityValues.map((value, index) => <span key={index} title={`${value} sample contributions`} className={`size-2.5 rounded-[2px] ${value < 2 ? "bg-slate-100" : value < 4 ? "bg-emerald-100" : value < 6 ? "bg-emerald-300" : value < 8 ? "bg-emerald-500" : "bg-emerald-700"}`} />)}</div></div><div className="mt-2 flex items-center justify-end gap-1 text-[8px] text-slate-500">Less <span className="size-2 rounded-[2px] bg-slate-100" /><span className="size-2 rounded-[2px] bg-emerald-100" /><span className="size-2 rounded-[2px] bg-emerald-300" /><span className="size-2 rounded-[2px] bg-emerald-500" /><span className="size-2 rounded-[2px] bg-emerald-700" /> More</div></section>;
}

function CommitsChart() {
  const points = commitTrend.map((value, index) => `${12 + index * 23},${106 - value * 2}`).join(" ");
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><div className="flex items-center justify-between gap-2"><div><h2 className="text-sm font-bold text-slate-900">Commits Over Time</h2><p className="text-[9px] text-slate-500">Last 14 days · sample activity</p></div><span className="rounded-md border border-slate-200 px-2 py-1 text-[9px] text-slate-600">Last 14 days</span></div><div className="mt-1"><svg viewBox="0 0 260 120" className="h-[105px] w-full" role="img" aria-label="Sample commits per day trend"><path d="M12 104 H250 M12 78 H250 M12 52 H250 M12 26 H250" stroke="#e2e8f0" strokeWidth="1" /><polygon points={`12,106 ${points} 242,106`} fill="url(#commitFill)" opacity=".18" /><defs><linearGradient id="commitFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#6d3cff" /><stop offset="1" stopColor="#6d3cff" stopOpacity="0" /></linearGradient></defs><polyline points={points} fill="none" stroke="#6d3cff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{commitTrend.map((value, index) => <circle key={index} cx={12 + index * 23} cy={106 - value * 2} r="2.5" fill="#6d3cff" />)}</svg><div className="flex justify-between px-1 text-[8px] text-slate-500"><span>Sep 23</span><span>Sep 26</span><span>Sep 29</span><span>Oct 2</span><span>Oct 5</span><span>Oct 6</span></div></div></section>;
}

function PullRequestList({ expanded = false }: { expanded?: boolean }) {
  return <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><div className="mb-1.5 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Recent Pull Requests</h2><button type="button" className="text-[10px] font-semibold text-violet-700">View all</button></div><div className="overflow-x-auto"><table className="w-full min-w-[480px] border-collapse text-left text-[9px]"><thead className="bg-slate-50 text-slate-600"><tr>{["#", "Title", "Repository", "Author", "Status", "Updated"].map((name) => <th key={name} className="border-b border-slate-200 px-1.5 py-1.5 font-bold">{name}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{(expanded ? pullRequests.concat(pullRequests.slice(0, 2)) : pullRequests).map((pr) => <tr key={pr.id} className="hover:bg-violet-50/40"><td className="whitespace-nowrap px-1.5 py-1.5 font-semibold text-violet-700">{pr.id}</td><td className="max-w-[125px] truncate px-1.5 py-1.5 text-slate-700">{pr.title}</td><td className="max-w-[120px] truncate px-1.5 py-1.5 text-slate-500">{pr.repository}</td><td className="whitespace-nowrap px-1.5 py-1.5 text-slate-600">{pr.author}</td><td className="whitespace-nowrap px-1.5 py-1.5"><Pill value={pr.status} /></td><td className="whitespace-nowrap px-1.5 py-1.5 text-slate-500">{pr.updated}</td></tr>)}</tbody></table></div></section>;
}

function OpenIssueList({ expanded = false }: { expanded?: boolean }) {
  return <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><div className="mb-1.5 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Open Issues</h2><button type="button" className="text-[10px] font-semibold text-violet-700">View all</button></div><div className="overflow-x-auto"><table className="w-full min-w-[420px] border-collapse text-left text-[9px]"><thead className="bg-slate-50 text-slate-600"><tr>{["#", "Title", "Priority", "Labels", "Updated"].map((name) => <th key={name} className="border-b border-slate-200 px-1.5 py-1.5 font-bold">{name}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{(expanded ? issues.concat(issues.slice(0, 2)) : issues).map((issue) => <tr key={issue.id} className="hover:bg-violet-50/40"><td className="whitespace-nowrap px-1.5 py-1.5 font-semibold text-violet-700">{issue.id}</td><td className="max-w-[130px] truncate px-1.5 py-1.5 text-slate-700">{issue.title}</td><td className="whitespace-nowrap px-1.5 py-1.5"><Pill value={issue.priority} /></td><td className="px-1.5 py-1.5"><span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">{issue.label}</span></td><td className="whitespace-nowrap px-1.5 py-1.5 text-slate-500">{issue.updated}</td></tr>)}</tbody></table></div></section>;
}

function Pill({ value }: { value: string }) {
  const tone = value === "CI Failing" || value === "High" ? "bg-red-50 text-red-700" : value === "Merged" || value === "Open" ? "bg-emerald-50 text-emerald-700" : value === "In Review" || value === "Medium" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700";
  return <span className={`rounded-full px-1.5 py-0.5 font-semibold ${tone}`}>{value}</span>;
}

function CodeSearch({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  const results = [
    { file: "src/payments/migration.py", repository: "phoenix-payment-service", detail: "Migration retry and timeout handling" },
    { file: "src/auth/middleware.ts", repository: "auth-service", detail: "Authentication validation middleware" },
    { file: "src/jobs/reconcile.py", repository: "data-pipeline", detail: "Scheduled payment reconciliation" },
  ].filter((result) => !query || `${result.file} ${result.repository} ${result.detail}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4"><h2 className="text-base font-bold text-slate-900">Search Code</h2><p className="mt-1 text-xs text-slate-500">Find files and symbols across the demo organization.</p><label className="mt-3 flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3"><Search size={14} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search code, files, or repositories..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label><ul className="mt-3 divide-y divide-slate-100">{results.map((result) => <li key={result.file} className="flex items-center gap-3 py-3"><span className="flex size-8 items-center justify-center rounded-md bg-violet-50 text-violet-700"><FileCode2 size={15} /></span><span><span className="block text-xs font-semibold text-blue-700">{result.file}</span><span className="mt-0.5 block text-[10px] text-slate-500">{result.repository} · {result.detail}</span></span><ExternalLink size={13} className="ml-auto text-slate-400" /></li>)}</ul></section>;
}

function PipelineStatus() {
  const checks = [{ name: "Build and test", branch: "main", commit: "a31e9c2", status: "Success", time: "12 minutes ago" }, { name: "Security scan", branch: "main", commit: "a31e9c2", status: "Failed", time: "18 minutes ago" }, { name: "Deploy preview", branch: "develop", commit: "910bd44", status: "Success", time: "1 hour ago" }];
  return <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-4"><h2 className="text-base font-bold text-slate-900">CI/CD Runs</h2><p className="mt-1 text-xs text-slate-500">Sample workflow activity for the acme organization.</p><ul className="mt-3 divide-y divide-slate-100">{checks.map((check) => <li key={check.name} className="flex items-center gap-3 py-3"><span className={`flex size-8 items-center justify-center rounded-md ${check.status === "Success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{check.status === "Success" ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}</span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800">{check.name}</span><span className="mt-0.5 block text-[10px] text-slate-500">{check.branch} · {check.commit} · {check.time}</span></span><Pill value={check.status} /></li>)}</ul></section>;
}