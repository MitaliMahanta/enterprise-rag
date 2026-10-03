"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Hash,
  Lightbulb,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import SlackLogo from "@/components/slack-logo";
import AppShell from "@/components/app-shell";

type SlackMessage = {
  id: string;
  text: string;
  channel: string;
  user: string;
  time: string;
  date: string;
  relevance: number;
};

const messages: SlackMessage[] = [
  { id: "m-1", text: "We are blocking on database migration. Any updates?", channel: "#phoenix", user: "Smita", time: "Oct 3, 10:24 AM", date: "Today", relevance: 0.93 },
  { id: "m-2", text: "Can someone review the PR for authentication flow?", channel: "#engineering", user: "Anita", time: "Oct 2, 4:12 PM", date: "Yesterday", relevance: 0.87 },
  { id: "m-3", text: "Security team confirmed the approval is pending.", channel: "#security", user: "Albert", time: "Oct 2, 2:18 PM", date: "Yesterday", relevance: 0.81 },
  { id: "m-4", text: "Deployment to staging completed successfully.", channel: "#platform", user: "Soumya", time: "Oct 1, 11:09 AM", date: "This week", relevance: 0.76 },
  { id: "m-5", text: "Meeting at 3 PM to discuss release plan", channel: "#phoenix", user: "Smita", time: "Sep 30, 3:45 PM", date: "This week", relevance: 0.72 },
  { id: "m-6", text: "The migration retry patch is ready for another CI run.", channel: "#engineering", user: "Karan", time: "Sep 29, 1:32 PM", date: "This week", relevance: 0.69 },
];

const channels = [
  { name: "#phoenix", count: 642, change: 18 },
  { name: "#engineering", count: 488, change: 12 },
  { name: "#platform", count: 312, change: 8 },
  { name: "#security", count: 286, change: -4 },
  { name: "#devops", count: 198, change: 6 },
];

const activity = [
  { day: "Sep 23", messages: 82, mentions: 29 },
  { day: "Sep 25", messages: 96, mentions: 34 },
  { day: "Sep 27", messages: 121, mentions: 41 },
  { day: "Sep 29", messages: 108, mentions: 37 },
  { day: "Oct 1", messages: 126, mentions: 52 },
  { day: "Oct 2", messages: 174, mentions: 76 },
  { day: "Oct 3", messages: 148, mentions: 69 },
];

const distribution = [
  { name: "Engineering", share: 35, color: "#2563eb" },
  { name: "Product", share: 22, color: "#7c3aed" },
  { name: "Platform", share: 18, color: "#ef4444" },
  { name: "Security", share: 12, color: "#f59e0b" },
  { name: "General", share: 8, color: "#10b981" },
  { name: "Others", share: 5, color: "#cbd5e1" },
];

const insights = [
  { title: "Release Risk Discussion", detail: "15 messages across #phoenix and #engineering indicate potential delay due to database migration issues.", date: "Oct 3, 2026", label: "High Priority", icon: ShieldAlert, tone: "bg-amber-50 text-amber-700" },
  { title: "Security Approval Pending", detail: "Security team mentioned pending approval in #security but no follow-up in Jira.", date: "Oct 2, 2026", label: "Needs Attention", icon: Lightbulb, tone: "bg-blue-50 text-blue-700" },
];

const mentions = [
  { user: "Smita", text: "@mitali can you check the latest migration logs?", time: "2 hours ago", img: 12 },
  { user: "Anita", text: "@mitali please review the PR when you get a chance", time: "5 hours ago", img: 47 },
  { user: "Albert", text: "@mitali security approval is pending", time: "1 day ago", img: 68 },
];

const tabs = ["Overview", "Search Messages", "Channel Insights", "Summaries", "Automation", "Settings"] as const;
type SlackTab = (typeof tabs)[number];

export default function SlackPage() {
  const [activeTab, setActiveTab] = useState<SlackTab>("Overview");
  const [channelFilter, setChannelFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Last 30 days");
  const [userFilter, setUserFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const filteredMessages = messages.filter((message) => {
    const matchesQuery = !query || `${message.text} ${message.channel} ${message.user}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery
      && (channelFilter === "All" || channelFilter === message.channel)
      && (userFilter === "All" || userFilter === message.user)
      && (dateFilter === "Last 30 days" || message.date === dateFilter);
  });

  function notify(message: string) {
    setNotice(message);
  }

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-44px)] bg-[linear-gradient(118deg,#fafaff_0%,#f4f5ff_60%,#fbf9ff_100%)] px-3 py-3 sm:px-4 xl:px-5">
        <div className="mx-auto max-w-[1540px]">
          <header className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white"><SlackLogo size={25} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-[28px]">Slack Connector</h1><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" /> connected</span></div><p className="mt-1 text-sm text-slate-600">Search conversations, get insights, and take actions in Slack using natural language.</p></div></div>
            <div className="flex items-center gap-2"><label className="sr-only" htmlFor="slack-workspace">Workspace</label><select id="slack-workspace" className="h-9 max-w-[150px] rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"><option>Acme Workspace</option><option>Phoenix Team</option></select><button type="button" onClick={() => notify("Demo sync complete. Slack data is simulated.")} className="inline-flex h-9 items-center gap-2 rounded-md bg-violet-600 px-3.5 text-xs font-semibold text-white hover:bg-violet-700"><RefreshCw size={14} /> Sync Now</button><Link href="/settings" aria-label="Connector settings" title="Connector settings" className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"><Settings2 size={16} /></Link><button type="button" aria-label="More Slack options" title="More options" onClick={() => notify("Slack connector options are part of this demo.")} className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-violet-200"><MoreHorizontal size={17} /></button></div>
          </header>

          <nav className="mb-2 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Slack connector views">
            {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${activeTab === tab ? "border-violet-600 text-violet-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{tab}</button>)}
          </nav>
          {notice && <div role="status" className="mb-2 flex items-center justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{notice}<button type="button" aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={14} /></button></div>}

          {activeTab === "Overview" && (
            <>
              <div className="mb-2 grid grid-cols-2 gap-2 xl:grid-cols-5">
                <Metric label="Total Messages" value="2,184" detail="18% vs last week" icon={MessageSquare} trend="up" />
                <Metric label="Active Channels" value="12" detail="2 vs last week" icon={Hash} trend="up" />
                <Metric label="Relevant Discussions" value="42" detail="12% this week" icon={Sparkles} trend="up" />
                <Metric label="Open Follow-ups" value="6" detail="2 vs last week" icon={Bell} trend="down" />
                <Metric label="Avg. Response Time" value="18m" detail="35% faster" icon={Clock3} trend="up" />
              </div>

              <div className="grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1.9fr)_minmax(295px,0.9fr)]">
                <main className="min-w-0 space-y-2.5">
                  <ConversationTable messages={filteredMessages} channel={channelFilter} setChannel={setChannelFilter} date={dateFilter} setDate={setDateFilter} user={userFilter} setUser={setUserFilter} query={query} setQuery={setQuery} />
                  <div className="grid gap-2.5 md:grid-cols-[minmax(0,1.25fr)_minmax(250px,0.9fr)]"><ChannelActivity /><MessageDistribution /></div>
                  <div className="grid gap-2.5 md:grid-cols-2"><AIInsights /><RecentMentions /></div>
                </main>
                <aside className="min-w-0 space-y-2.5">
                  <ConnectionDetails onReconnect={() => notify("Demo connection is ready. Configure live OAuth in Settings.")} />
                  <TopChannels />
                  <SuggestedActions onAction={(action) => notify(`${action} is simulated in this demo.`)} />
                </aside>
              </div>
            </>
          )}

          {activeTab === "Search Messages" && <ConversationTable messages={filteredMessages} channel={channelFilter} setChannel={setChannelFilter} date={dateFilter} setDate={setDateFilter} user={userFilter} setUser={setUserFilter} query={query} setQuery={setQuery} expanded />}
          {activeTab === "Channel Insights" && <div className="grid gap-2.5 lg:grid-cols-2"><ChannelActivity /><MessageDistribution /><div className="lg:col-span-2"><TopChannels /></div></div>}
          {activeTab === "Summaries" && <AIInsights expanded />}
          {activeTab === "Automation" && <AutomationPanel />}
          {activeTab === "Settings" && <div className="max-w-2xl"><ConnectionDetails onReconnect={() => notify("Demo connection is ready. Configure live OAuth in Settings.")} /></div>}
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, detail, icon: Icon, trend }: { label: string; value: string; detail: string; icon: LucideIcon; trend: "up" | "down" }) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  return <section className="flex min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:px-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700"><Icon size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-[10px] text-slate-500">{label}</p><p className="text-base font-bold leading-5 text-slate-900">{value}</p><p className="mt-0.5 flex items-center gap-1 text-[9px] font-medium text-emerald-600"><TrendIcon size={10} />{detail}</p></div></section>;
}

function ConversationTable({ messages: rows, channel, setChannel, date, setDate, user, setUser, query, setQuery, expanded = false }: { messages: SlackMessage[]; channel: string; setChannel: (value: string) => void; date: string; setDate: (value: string) => void; user: string; setUser: (value: string) => void; query: string; setQuery: (value: string) => void; expanded?: boolean }) {
  return <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-2.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] sm:p-3"><div className="mb-1.5 flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-slate-900">{expanded ? "Search Messages" : "Recent Conversations"} ({rows.length})</h2><button type="button" className="text-[10px] font-semibold text-violet-700">View all</button></div><div className="flex flex-wrap items-center gap-1 lg:flex-nowrap"><FilterSelect label="Channel" value={channel} onChange={setChannel} options={["All", ...channels.map((item) => item.name)]} /><FilterSelect label="Date" value={date} onChange={setDate} options={["Last 30 days", "Today", "Yesterday", "This week"]} /><FilterSelect label="User" value={user} onChange={setUser} options={["All", ...Array.from(new Set(messages.map((item) => item.user)))]} /><label className="flex h-7 min-w-[120px] flex-1 items-center gap-1.5 rounded-md border border-slate-200 px-2 focus-within:border-violet-300"><Search size={12} className="shrink-0 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages, threads, or ask a question..." className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-slate-400" /><button type="button" aria-label="Search Slack messages" onClick={() => setQuery(query.trim())} className="flex size-6 shrink-0 items-center justify-center rounded bg-violet-600 text-white"><Search size={12} /></button></label></div><div className="mt-2 overflow-x-auto rounded-md border border-slate-200"><table className="w-full min-w-[660px] border-collapse text-left"><thead className="bg-slate-50"><tr>{["", "Message", "Channel", "User", "Time", "Relevance"].map((label, index) => <th key={`${label}-${index}`} className="whitespace-nowrap border-b border-slate-200 px-2 py-2 text-[9px] font-bold text-slate-700">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.length ? (expanded ? rows.concat(rows) : rows).map((message, index) => <tr key={`${message.id}-${index}`} className="hover:bg-violet-50/40"><td className="whitespace-nowrap px-2 py-1.5"><SlackLogo size={14} /></td><td className="max-w-[310px] px-2 py-1.5 text-[11px] text-slate-800"><span className="block truncate">{message.text}</span></td><td className="whitespace-nowrap px-2 py-1.5 text-[10px] font-medium text-slate-700">{message.channel}</td><td className="whitespace-nowrap px-2 py-1.5"><span className="inline-flex items-center gap-1.5 text-[10px] text-slate-700"><Avatar name={message.user} />{message.user}</span></td><td className="whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-500">{message.time}</td><td className="px-2 py-1.5"><span className="flex items-center gap-1.5"><span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-violet-600" style={{ width: `${message.relevance * 100}%` }} /></span><span className="text-[9px] text-slate-500">{message.relevance.toFixed(2)}</span></span></td></tr>) : <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">No sample messages match your filters.</td></tr>}</tbody></table></div></section>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const width = label === "Channel" ? "w-[105px]" : label === "Date" ? "w-[125px]" : "w-[92px]";
  return <label className="relative shrink-0"><span className="sr-only">Filter by {label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className={`h-7 ${width} appearance-none rounded-md border border-slate-200 bg-white py-1 pl-2 pr-5 text-[9px] font-medium text-slate-600 outline-none focus:border-violet-300`}>{options.map((option) => <option key={option} value={option}>{label}: {option}</option>)}</select><span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400">⌄</span></label>;
}

function Avatar({ name, image }: { name: string; image?: number }) {
  const portraits: Record<string, number> = { Smita: 12, Anita: 47, Albert: 68, Soumya: 32, Karan: 21 };
  const portrait = image ?? portraits[name] ?? 15;
  return <span role="img" aria-label={name} className="size-5 shrink-0 rounded-full border border-white bg-slate-200 bg-cover bg-center shadow-sm" style={{ backgroundImage: `url(https://i.pravatar.cc/48?img=${portrait})` }} />;
}

function ConnectionDetails({ onReconnect }: { onReconnect: () => void }) {
  const rows = [["Workspace", "Acme Workspace"], ["Auth Method", "OAuth 2.0 (demo)"], ["Connected By", "Mitali"], ["Last Sync", "Today, 10:12 AM"], ["Sync Status", "Success · 5 minutes ago"]];
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-slate-900">Connection Details</h2><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">connected</span></div><dl className="mt-1 divide-y divide-slate-100">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-2 py-1.5 text-[10px]"><dt className="text-slate-500">{label}</dt><dd className="flex min-w-0 items-center gap-1 truncate font-medium text-slate-700">{label === "Workspace" && <SlackLogo size={12} />}{label === "Sync Status" && <CheckCircle2 size={11} className="text-emerald-600" />}{value}</dd></div>)}</dl><button type="button" onClick={onReconnect} className="mt-2 flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 text-[10px] font-semibold text-slate-700 hover:border-violet-200 hover:bg-violet-50"><RefreshCw size={12} /> Reconnect</button></section>;
}

function TopChannels() {
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Top Channels</h2><button type="button" className="text-[10px] font-semibold text-violet-700">View all</button></div><ul className="mt-1 divide-y divide-slate-100">{channels.map((channel) => <li key={channel.name} className="flex items-center gap-2 py-1.5"><span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700"><Hash size={14} /></span><span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold text-slate-800">{channel.name}</span><span className="block text-[9px] text-slate-500">{channel.count} messages</span></span><span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold ${channel.change < 0 ? "text-red-600" : "text-emerald-600"}`}>{channel.change < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}{Math.abs(channel.change)}%</span></li>)}</ul></section>;
}

function SuggestedActions({ onAction }: { onAction: (action: string) => void }) {
  const actions = [{ title: "Summarize channel discussion", detail: "Get AI summary of #phoenix channel", icon: FileText }, { title: "Create Jira issue", detail: "Track identified blocker", icon: ArrowRight }, { title: "Notify relevant stakeholders", detail: "Share summary with team", icon: Users }, { title: "Schedule follow-up", detail: "Set reminder for pending items", icon: CalendarClock }];
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><h2 className="text-sm font-bold text-slate-900">Suggested Actions</h2><div className="mt-1 space-y-1">{actions.map(({ title, detail, icon: Icon }) => <button key={title} type="button" onClick={() => onAction(title)} className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5 text-left hover:border-violet-200 hover:bg-violet-50"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700"><Icon size={14} /></span><span><span className="block text-[10px] font-semibold text-slate-800">{title}</span><span className="block text-[9px] text-slate-500">{detail}</span></span></button>)}</div></section>;
}

function ChannelActivity() {
  const messagePoints = activity.map((item, index) => `${12 + index * 38},${104 - item.messages * 0.45}`).join(" ");
  const mentionPoints = activity.map((item, index) => `${12 + index * 38},${104 - item.mentions * 0.75}`).join(" ");
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><div className="flex items-center justify-between gap-2"><div><h2 className="text-sm font-bold text-slate-900">Channel Activity</h2><p className="text-[9px] text-slate-500">Messages and mentions · sample trend</p></div><span className="rounded-md border border-slate-200 px-2 py-1 text-[9px] text-slate-600">Last 14 days</span></div><svg viewBox="0 0 260 120" className="mt-1 h-[110px] w-full" role="img" aria-label="Sample Slack message and mention activity"><path d="M12 104 H250 M12 78 H250 M12 52 H250 M12 26 H250" stroke="#e2e8f0" strokeWidth="1" /><polyline points={messagePoints} fill="none" stroke="#6d3cff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><polyline points={mentionPoints} fill="none" stroke="#1685ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{activity.map((item, index) => <circle key={item.day} cx={12 + index * 38} cy={104 - item.messages * 0.45} r="2.3" fill="#6d3cff" />)}</svg><div className="flex justify-between text-[8px] text-slate-500">{activity.map((item) => <span key={item.day}>{item.day}</span>)}</div><div className="mt-1.5 flex justify-center gap-4 text-[9px] text-slate-500"><span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-violet-600" />Messages</span><span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-blue-500" />Mentions</span></div></section>;
}

function MessageDistribution() {
  const stops: string[] = [];
  let start = 0;
  for (const item of distribution) {
    stops.push(`${item.color} ${start}% ${start + item.share}%`);
    start += item.share;
  }
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><h2 className="text-sm font-bold text-slate-900">Message Distribution</h2><div className="mt-2 flex items-center justify-center gap-3"><div className="relative size-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops.join(",")})` }}><div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white"><span className="text-base font-bold text-slate-900">2,184</span><span className="text-[9px] text-slate-500">Total messages</span></div></div><ul className="min-w-0 space-y-1">{distribution.map((item) => <li key={item.name} className="grid grid-cols-[8px_minmax(55px,1fr)_28px] items-center gap-1.5 text-[9px]"><span className="size-2 rounded-sm" style={{ background: item.color }} /><span className="truncate text-slate-600">{item.name}</span><span className="text-right text-slate-500">{item.share}%</span></li>)}</ul></div></section>;
}

function AIInsights({ expanded = false }: { expanded?: boolean }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><div className="mb-1.5 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">AI-Powered Insights</h2><button type="button" className="text-[10px] font-semibold text-violet-700">View all</button></div><div className="divide-y divide-slate-100">{(expanded ? insights.concat(insights) : insights).map(({ title, detail, date, label, icon: Icon, tone }, index) => <article key={`${title}-${index}`} className="flex items-start gap-2.5 py-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600"><Icon size={15} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-[10px] font-bold text-slate-800">{title}</h3><span className="text-[9px] text-slate-500">{date}</span></div><p className="mt-0.5 text-[9px] leading-4 text-slate-600">{detail}</p><span className={`mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${tone}`}>{label}</span></div></article>)}</div></section>;
}

function RecentMentions() {
  return <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><div className="mb-1.5 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Recent Mentions</h2><button type="button" className="text-[10px] font-semibold text-violet-700">View all</button></div><ul className="divide-y divide-slate-100">{mentions.map((mention) => <li key={`${mention.user}-${mention.time}`} className="flex items-center gap-2 py-2"><Avatar name={mention.user} image={mention.img} /><div className="min-w-0 flex-1"><p className="truncate text-[9px] text-slate-600"><strong className="font-semibold text-slate-800">{mention.user}</strong> mentioned you</p><p className="truncate text-[9px] text-slate-500">{mention.text}</p></div><span className="shrink-0 text-[9px] text-slate-500">{mention.time}</span></li>)}</ul></section>;
}

function AutomationPanel() {
  const [active, setActive] = useState(["mention", "release"]);
  const rules = [{ id: "mention", title: "Follow up on release blockers", detail: "Summarize new blocker discussions every weekday." }, { id: "release", title: "Weekly channel digest", detail: "Prepare a digest for #phoenix and #engineering." }, { id: "security", title: "Security approval reminders", detail: "Remind owners about pending approvals." }];
  return <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(31,41,55,0.03)]"><h2 className="text-base font-bold text-slate-900">Automation Rules</h2><p className="mt-1 text-xs text-slate-500">Demo rules are visual only and do not post messages to Slack.</p><ul className="mt-3 divide-y divide-slate-100">{rules.map((rule) => { const enabled = active.includes(rule.id); return <li key={rule.id} className="flex items-center justify-between gap-4 py-3"><div><h3 className="text-sm font-semibold text-slate-800">{rule.title}</h3><p className="mt-1 text-xs text-slate-500">{rule.detail}</p></div><button type="button" role="switch" aria-checked={enabled} onClick={() => setActive((current) => enabled ? current.filter((id) => id !== rule.id) : [...current, rule.id])} className={`relative h-6 w-11 shrink-0 rounded-full ${enabled ? "bg-violet-600" : "bg-slate-300"}`}><span className={`absolute top-1 size-4 rounded-full bg-white ${enabled ? "left-6" : "left-1"}`} /></button></li>; })}</ul></section>;
}