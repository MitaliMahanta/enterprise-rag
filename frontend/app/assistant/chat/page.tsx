"use client";

import type { ComponentType, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  BarChart3,
  BookOpen,
  ExternalLink,
  FileText,
  GitBranch,
  Lightbulb,
  Mic,
  Paperclip,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import { SiGithub, SiJira } from "react-icons/si";
import SlackLogo from "@/components/slack-logo";
import AppShell from "@/components/app-shell";
import { askAssistant, getDocuments, type ChatResponse, type KnowledgeDocument } from "@/lib/api";

type Turn = {
  id: number;
  question: string;
  response?: ChatResponse;
  error?: string;
  pending: boolean;
  demo?: boolean;
};

const demoFindings = [
  { heading: "Database migration is blocked", detail: "Jira issue PHX-142 is timing out, and migration CI is still failing." },
  { heading: "Security approval is pending", detail: "The security team is waiting on approval, but no Jira task tracks it." },
  { heading: "Authentication requirements are incomplete", detail: "The handbook validation path is missing from the latest code." },
  { heading: "Infrastructure setup is incomplete", detail: "Environment configuration for the new cluster is still in progress." },
];

const demoTurn: Turn = {
  id: 0,
  question: "Why is the Phoenix release at risk?",
  pending: false,
  demo: true,
  response: {
    question: "Why is the Phoenix release at risk?",
    retrieval_method: "Hybrid retrieval",
    hybrid_candidates: 18,
    reranked_count: 4,
    answer: "The Phoenix release is at risk for four reasons:\n1. Migration is blocked: PHX-142 is timing out and CI is failing.\n2. Security approval is pending, with no linked Jira task.\n3. Required authentication validation is missing from the latest code.\n4. New cluster environment setup remains incomplete.",
    sources: [
      { source: "PHX-142 · Database migration timeout", chunk_id: 142, score: 0.96, retrieval_method: "Jira" },
      { source: "PR #821 · Fix migration script", chunk_id: 821, score: 0.93, retrieval_method: "GitHub" },
      { source: "#phoenix · Migration timeout discussion", chunk_id: 1024, score: 0.9, retrieval_method: "Slack" },
      { source: "Engineering Handbook · Authentication requirements", chunk_id: 21, score: 0.87, retrieval_method: "Document" },
    ],
    metadata: { total_latency_ms: 1042, retrieval_pipeline_latency_ms: 214, llm_latency_ms: 828 },
  },
};

const sourceLinks: { label: string; href: string; icon: ComponentType<{ size?: number; className?: string }>; tone: string }[] = [
  { label: "Jira", href: "/connectors/jira", icon: SiJira, tone: "text-blue-600" },
  { label: "GitHub", href: "/connectors/github", icon: SiGithub, tone: "text-slate-900" },
  { label: "Slack", href: "/connectors/slack", icon: SlackLogo, tone: "text-rose-600" },
  { label: "Documents", href: "/knowledge", icon: FileText, tone: "text-violet-700" },
];

const suggestedQuestions = [
  { label: "Summarize my indexed documents", icon: FileText },
  { label: "What are the key findings?", icon: Lightbulb },
  { label: "Compare the main approaches", icon: GitBranch },
];

const suggestedActions = [
  "Summarize the key findings in my indexed documents.",
  "What topics appear across multiple documents?",
  "Compare the main approaches described in my documents.",
];

const relatedQuestions = [
  "Summarize open blockers for Phoenix",
  "Show related GitHub PRs",
  "What is the security approval status?",
];

export default function AssistantChatPage() {
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([demoTurn]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    getDocuments()
      .then((loadedDocuments) => {
        if (mounted) setDocuments(loadedDocuments);
      })
      .catch(() => {
        if (mounted) setDocuments([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function sendQuestion(event?: FormEvent<HTMLFormElement>, prompt = draft) {
    event?.preventDefault();
    const question = prompt.trim();
    if (!question || sending) return;

    const id = turns.reduce((maxId, turn) => Math.max(maxId, turn.id), 0) + 1;
    setDraft("");
    setSending(true);
    setTurns((current) => [...current.filter((turn) => !turn.demo), { id, question, pending: true }]);
    try {
      const response = await askAssistant(question);
      setTurns((current) => current.map((turn) => turn.id === id ? { ...turn, response, pending: false } : turn));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to reach the AI service.";
      setTurns((current) => current.map((turn) => turn.id === id ? { ...turn, error: message, pending: false } : turn));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  const latestResponse = [...turns].reverse().find((turn) => turn.response)?.response;
  const chunkCount = documents.reduce((total, document) => total + document.chunks, 0);

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-44px)] bg-[linear-gradient(118deg,#fafaff_0%,#f4f5ff_60%,#fbf9ff_100%)] lg:h-[calc(100dvh-44px)] lg:overflow-hidden xl:min-h-[calc(100vh-52px)] xl:h-[calc(100dvh-52px)] 2xl:min-h-[calc(100vh-60px)] 2xl:h-[calc(100dvh-60px)]">
        <div className="mx-auto flex min-h-[calc(100vh-44px)] max-w-[1540px] flex-col px-3 py-2 sm:px-4 lg:h-full lg:min-h-0 xl:min-h-[calc(100vh-52px)] xl:px-4 xl:py-3 2xl:min-h-[calc(100vh-60px)] 2xl:py-4">
          <header className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-[28px]">Chat with Pulse AI</h1>
              <p className="mt-1 text-sm text-slate-600">Ask complex questions and get answers with citations from your knowledge base.</p>
            </div>
            <Link href="/knowledge" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm hover:border-violet-200 hover:bg-violet-50">
              <Search size={15} /> Browse sources
            </Link>
          </header>

          <nav className="mb-1.5 flex flex-wrap gap-2 border-b border-slate-200/80 pb-1.5" aria-label="Source connections">
            {sourceLinks.map(({ label, href, icon: Icon, tone }) => (
              <Link key={label} href={href} className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50">
                <Icon size={16} className={tone} /> {label}
              </Link>
            ))}
          </nav>

          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_225px] xl:gap-4 xl:grid-cols-[minmax(0,1fr)_245px] 2xl:grid-cols-[minmax(0,1fr)_265px]">
            <section className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white/90 shadow-[0_4px_18px_rgba(53,45,125,0.05)] lg:min-h-0">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-1.5 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-md bg-violet-600 text-white"><Sparkles size={16} /></span>
                  <div><h2 className="text-sm font-bold text-slate-900 sm:text-base">Pulse AI</h2><p className="mt-0.5 text-xs text-slate-500">Grounded answers with source citations</p></div>
                </div>
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800">{turns.some((turn) => turn.demo) ? "Demo data" : "RAG assistant"}</span>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5" aria-live="polite">
                {turns.length === 0 ? (
                  <div className="mx-auto flex min-h-[330px] max-w-2xl flex-col justify-center py-7">
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700"><Sparkles size={17} /></span>
                      <div><p className="text-sm font-bold text-slate-900">Ready when you are</p><p className="mt-2 max-w-xl text-base leading-7 text-slate-700">Ask a question about your indexed knowledge. Responses include the source passages used by the retrieval pipeline.</p></div>
                    </div>
                    <div className="mt-7 grid gap-2 sm:grid-cols-3">
                      {suggestedQuestions.map(({ label, icon: Icon }) => (
                        <button key={label} type="button" onClick={() => void sendQuestion(undefined, label)} disabled={sending} className="flex min-h-16 items-start gap-2 rounded-md border border-slate-200 bg-white p-3.5 text-left text-sm font-medium leading-5 text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50">
                          <Icon size={15} className="mt-0.5 shrink-0 text-violet-700" />{label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : turns.map((turn) => (
                  <article key={turn.id} className="space-y-3">
                    <div className="ml-auto max-w-[88%] rounded-lg bg-[#e9eaff] px-4 py-2.5 text-sm leading-6 text-slate-800">{turn.question}</div>
                    <div className="flex items-start gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-600 text-white"><Sparkles size={15} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-slate-900">Pulse AI</p><span className="text-xs text-slate-400">{turn.demo ? "Demo response" : "RAG assistant"}</span></div>
                        {turn.pending ? (
                          <p className="mt-3 text-sm text-slate-500" role="status">Searching your knowledge base...</p>
                        ) : turn.error ? (
                          <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{turn.error}. Check that FastAPI is running.</p>
                        ) : turn.response ? (
                          <>
                            {turn.demo ? (
                              <div className="mt-2 text-xs leading-4 text-slate-700">
                                <p>The Phoenix release is at risk due to issues across Jira, GitHub, Slack, and internal documentation. Here are the key findings:</p>
                                <ol className="mt-2 list-decimal space-y-1 pl-5">
                                  {demoFindings.map(({ heading, detail }) => <li key={heading}><strong className="font-semibold text-slate-900">{heading}.</strong><span className="mt-0.5 block font-normal text-slate-700">{detail}</span></li>)}
                                </ol>
                              </div>
                            ) : <p className="mt-2 whitespace-pre-wrap text-[13px] leading-5 text-slate-700">{turn.response.answer}</p>}
                            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2.5">
                              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-slate-800">Key evidence</h3><span className="text-xs text-slate-500">{turn.response.sources.length} sources · {Math.round(turn.response.metadata.total_latency_ms)} ms</span></div>
                              {turn.response.sources.length ? (
                                <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                                  {turn.response.sources.map((source, index) => (
                                    <li key={`${source.source}-${source.chunk_id}-${index}`} className="flex min-w-0 items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                                      <CitationIcon method={source.retrieval_method} size={15} />
                                      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{source.source}</span><span className="mt-1 block truncate text-[10px] text-slate-500">Chunk {source.chunk_id} · {source.retrieval_method} · {source.score.toFixed(2)}</span></span>
                                      <Link href="/knowledge" aria-label={`Browse knowledge for ${source.source}`} title="Browse knowledge sources" className="shrink-0 text-slate-400 hover:text-violet-700"><ExternalLink size={14} /></Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="text-xs text-slate-500">No source passages were returned.</p>}
                            </div>
                            {turn.demo && <div className="mt-1"><h3 className="mb-1 text-xs font-bold text-slate-800">Related Questions</h3><div className="flex flex-wrap gap-1">{relatedQuestions.map((relatedQuestion) => <button key={relatedQuestion} type="button" onClick={() => void sendQuestion(undefined, relatedQuestion)} disabled={sending} className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-medium text-violet-800 transition hover:bg-violet-100 disabled:opacity-50">{relatedQuestion}</button>)}</div></div>}
                            <div className="mt-2 flex items-center justify-end gap-1 text-slate-400">
                              <button type="button" aria-label="Mark answer helpful" title="Helpful" className="flex size-7 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-700"><ThumbsUp size={14} /></button>
                              <button type="button" aria-label="Mark answer not helpful" title="Not helpful" className="flex size-7 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-700"><ThumbsDown size={14} /></button>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <form onSubmit={(event) => void sendQuestion(event)} className="border-t border-slate-100 bg-white p-1.5 sm:px-3 sm:py-1.5">
                <label htmlFor="chat-question" className="sr-only">Ask a follow-up question</label>
                <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white p-1 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100">
                  <input ref={inputRef} id="chat-question" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask a follow-up question..." disabled={sending} className="h-8 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400" />
                  <Link href="/knowledge" aria-label="Browse documents" title="Browse documents" className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-violet-50 hover:text-violet-700"><Paperclip size={16} /></Link>
                  <button type="button" aria-label="Voice input unavailable" title="Voice input is not configured" disabled className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 disabled:cursor-not-allowed"><Mic size={16} /></button>
                  <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message" className="flex size-9 shrink-0 items-center justify-center rounded-md bg-violet-600 text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"><ArrowUp size={17} /></button>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {sourceLinks.map(({ label, href, icon: Icon, tone }) => <Link key={label} href={href} className="inline-flex h-6 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 hover:border-violet-200 hover:text-violet-800"><Icon size={13} className={tone} />{label}</Link>)}
                </div>
              </form>
            </section>

            <aside className="min-w-0 space-y-3 lg:overflow-y-auto lg:pr-0.5">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(31,41,55,0.03)] xl:p-4">
                <div className="flex items-center justify-between gap-2"><h2 className="text-base font-bold text-slate-900">Sources ({latestResponse?.sources.length ?? documents.length})</h2><Link href="/knowledge" className="text-xs font-semibold text-violet-700 hover:text-violet-900">View all</Link></div>
                {latestResponse?.sources.length ? (
                  <ul className="mt-2 divide-y divide-slate-100">
                    {latestResponse.sources.slice(0, 4).map((source, index) => <li key={`${source.source}-${source.chunk_id}-${index}`} className="flex items-start gap-2 py-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-50"><CitationIcon method={source.retrieval_method} size={15} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{source.source}</span><span className="mt-1 block text-[11px] text-slate-500">Chunk {source.chunk_id} · {source.retrieval_method}</span></span><ExternalLink size={14} className="mt-1 shrink-0 text-slate-400" /></li>)}
                  </ul>
                ) : documents.length ? (
                  <ul className="mt-2 divide-y divide-slate-100">{documents.slice(0, 4).map((document) => <li key={document.document_id} className="flex items-start gap-2 py-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700"><FileText size={15} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{document.filename}</span><span className="mt-1 block text-[11px] text-slate-500">{document.chunks} chunks · {document.status}</span></span></li>)}</ul>
                ) : <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-500">Sources used for your answers will appear here.</p>}
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] xl:p-4">
                <h2 className="text-base font-bold text-slate-900">Suggested Actions</h2>
                <div className="mt-2 space-y-1.5">
                  {suggestedActions.map((action, index) => {
                    const ActionIcon = [FileText, Search, BarChart3][index];
                    return <button key={action} type="button" onClick={() => void sendQuestion(undefined, action)} disabled={sending} className="flex w-full items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold leading-5 text-slate-800 transition hover:border-violet-200 hover:bg-violet-50 disabled:opacity-50"><span className="flex size-8 shrink-0 items-center justify-center rounded bg-violet-50 text-violet-700"><ActionIcon size={15} /></span><span>{action}</span></button>;
                  })}
                  <Link href="/evaluation" className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 transition hover:border-violet-200 hover:bg-violet-50"><span className="flex size-8 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-700"><ShieldCheck size={15} /></span>Review answer quality</Link>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(31,41,55,0.03)] xl:p-4">
                <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Knowledge Insights</h2><Link href="/analytics" className="text-[10px] font-semibold text-violet-700 hover:text-violet-900">View all</Link></div>
                <div className="mt-2 divide-y divide-slate-100">
                  <Insight icon={BookOpen} label="Indexed documents" detail={`${documents.length} available in your knowledge base`} />
                  <Insight icon={FileText} label="Searchable passages" detail={`${chunkCount.toLocaleString()} indexed chunks`} />
                  <Insight icon={GitBranch} label="Retrieval pipeline" detail={latestResponse ? latestResponse.retrieval_method : "Hybrid search ready"} />
                  <Insight icon={Lightbulb} label="Latest answer" detail={latestResponse ? `${latestResponse.sources.length} cited sources` : "Ask a question to see citations"} />
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Insight({ icon: Icon, label, detail }: { icon: LucideIcon; label: string; detail: string }) {
  return <div className="flex items-center gap-2.5 py-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700"><Icon size={15} /></span><span className="min-w-0"><span className="block text-xs font-semibold text-slate-800">{label}</span><span className="mt-1 block truncate text-[11px] text-slate-500">{detail}</span></span></div>;
}

function CitationIcon({ method, size }: { method: string; size: number }) {
  if (method === "Jira") return <SiJira size={size} className="mt-0.5 shrink-0 text-blue-600" />;
  if (method === "GitHub") return <SiGithub size={size} className="mt-0.5 shrink-0 text-slate-900" />;
  if (method === "Slack") return <SlackLogo size={size} className="mt-0.5 shrink-0" />;
  return <FileText size={size} className="mt-0.5 shrink-0 text-violet-700" />;
}