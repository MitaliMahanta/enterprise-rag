"use client";

import { useEffect, useState } from "react";
import { Activity, BarChart3, Clock3, FileText, MessageSquare } from "lucide-react";
import AppShell from "@/components/app-shell";
import MetricCard from "@/components/metric-card";
import PageHeader from "@/components/page-header";
import { getChatHistory, getHealth, type ChatHistoryEntry } from "@/lib/api";

export default function AnalyticsPage() {
  const [history, setHistory] = useState<ChatHistoryEntry[]>([]);
  const [apiStatus, setApiStatus] = useState("Checking");

  useEffect(() => {
    let mounted = true;
    const timer = window.setTimeout(() => {
      if (mounted) setHistory(getChatHistory());
    }, 0);
    getHealth()
      .then((health) => {
        if (mounted) setApiStatus(health.status === "ok" ? "Healthy" : "Unavailable");
      })
      .catch(() => {
        if (mounted) setApiStatus("Unavailable");
      });

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  const averageLatency = history.length
    ? `${(history.reduce((total, entry) => total + entry.answer_latency_ms, 0) / history.length / 1000).toFixed(1)}s`
    : "—";
  const citedDocuments = new Map<string, number>();
  history.forEach((entry) => entry.sources.forEach((source) => citedDocuments.set(source.source, (citedDocuments.get(source.source) ?? 0) + 1)));
  const mostCited = [...citedDocuments.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5);
  const dailyQuestions = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toDateString();
    return {
      label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
      count: history.filter((entry) => new Date(entry.created_at).toDateString() === key).length,
    };
  });
  const maxDailyQuestions = Math.max(1, ...dailyQuestions.map((day) => day.count));
  const documentCount = new Set(history.flatMap((entry) => entry.sources.map((source) => source.source))).size;

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-52px)] bg-[linear-gradient(118deg,#fafaff_0%,#f4f5ff_60%,#fbf9ff_100%)] px-4 py-5 sm:px-6 xl:px-7">
        <div className="mx-auto max-w-[1320px]">
          <PageHeader title="Analytics" description="Monitor AI usage, answer latency, and knowledge sources across this browser session." />
          <div className="mb-4 flex items-center gap-2 rounded-md border border-violet-100 bg-violet-50 px-3 py-2 text-[10px] text-violet-900"><BarChart3 size={14} /> Analytics are calculated from actual assistant responses stored in this browser.</div>
          <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            <MetricCard label="Total Questions" value={String(history.length)} description="answered in this browser" icon={MessageSquare} accent="violet" />
            <MetricCard label="Avg. Response Time" value={averageLatency} description="across completed queries" icon={Clock3} accent="blue" />
            <MetricCard label="Documents Used" value={String(documentCount)} description="unique cited sources" icon={FileText} accent="orange" />
            <MetricCard label="System Health" value={apiStatus} description="FastAPI health endpoint" icon={Activity} accent="green" />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between"><div><h2 className="text-sm font-bold text-slate-900">Usage Over Time</h2><p className="mt-1 text-[10px] text-slate-500">Questions answered · last 7 days</p></div><span className="rounded-md bg-violet-50 px-2 py-1 text-[9px] font-semibold text-violet-700">7 days</span></div>
              {history.length ? (
                <div className="mt-5 flex h-44 items-end gap-2 border-b border-l border-slate-200 px-3 pb-0 sm:gap-4">
                  {dailyQuestions.map((day) => <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[9px] text-slate-500">{day.count}</span><div className="w-full max-w-10 rounded-t-sm bg-violet-500" style={{ height: `${Math.max(8, day.count / maxDailyQuestions * 72)}%` }} /><span className="-mb-5 text-[9px] text-slate-400">{day.label}</span></div>)}
                </div>
              ) : (
                <div className="mt-5 flex h-44 items-center justify-center border border-dashed border-slate-200 bg-slate-50 px-4 text-center"><div><MessageSquare size={20} className="mx-auto text-slate-300" /><p className="mt-2 text-xs font-medium text-slate-700">No questions recorded yet</p><p className="mt-1 text-[10px] text-slate-500">Ask Pulse AI to start the usage chart.</p></div></div>
              )}
              <div className="mt-7 flex justify-between text-[9px] text-slate-400"><span>7 days ago</span><span>Today</span></div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div><h2 className="text-sm font-bold text-slate-900">Top Sources</h2><p className="mt-1 text-[10px] text-slate-500">Documents cited in recent answers</p></div>
              {mostCited.length ? (
                <ul className="mt-5 space-y-4">{mostCited.map(([source, count]) => <li key={source}><div className="mb-1.5 flex items-center justify-between gap-3"><span className="truncate text-xs font-medium text-slate-700">{source}</span><span className="shrink-0 text-[10px] text-slate-500">{count} citations</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(8, count / mostCited[0][1] * 100)}%` }} /></div></li>)}</ul>
              ) : (
                <div className="mt-5 flex h-44 items-center justify-center border border-dashed border-slate-200 bg-slate-50 px-4 text-center"><div><FileText size={20} className="mx-auto text-slate-300" /><p className="mt-2 text-xs font-medium text-slate-700">No citation data yet</p><p className="mt-1 text-[10px] text-slate-500">Sources appear here after the assistant answers.</p></div></div>
              )}
            </section>
          </div>

          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-900">Recent Questions</h2><p className="mt-1 text-[10px] text-slate-500">Latest assistant activity</p></div><a href="/assistant/chat" className="text-[10px] font-semibold text-violet-700 hover:text-violet-900">Open chat →</a></div>
            {history.length ? <div className="mt-3 divide-y divide-slate-100">{history.slice(-5).reverse().map((entry, index) => <div key={`${entry.created_at}-${index}`} className="grid gap-1 py-2 text-[10px] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4"><span className="truncate font-medium text-slate-700">{entry.question}</span><span className="text-slate-500">{entry.sources.length} sources · {Math.round(entry.answer_latency_ms)} ms</span><time className="text-slate-400">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(entry.created_at))}</time></div>)}</div> : <p className="mt-4 border-t border-slate-100 py-5 text-center text-xs text-slate-500">No local chat history yet. Responses will be listed here.</p>}
          </section>
        </div>
      </div>
    </AppShell>
  );
}