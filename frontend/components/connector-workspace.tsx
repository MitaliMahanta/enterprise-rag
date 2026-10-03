"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, Search, Settings2 } from "lucide-react";
import AppShell from "@/components/app-shell";
import PageHeader from "@/components/page-header";

type ConnectorWorkspaceProps = {
  name: string;
  description: string;
  logo: ReactNode;
  logoClass: string;
  tabs: string[];
  placeholder: string;
  columns: string[];
  rows: string[][];
};

export default function ConnectorWorkspace({
  name,
  description,
  logo,
  logoClass,
  tabs,
  placeholder,
  columns,
  rows,
}: ConnectorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const filteredRows = useMemo(() => {
    const value = submittedQuery.toLowerCase();
    return value ? rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(value))) : rows;
  }, [rows, submittedQuery]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  }

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-52px)] bg-[linear-gradient(118deg,#fafaff_0%,#f4f5ff_60%,#fbf9ff_100%)] px-4 py-5 sm:px-6 xl:px-7">
        <div className="mx-auto max-w-[1320px]">
          <PageHeader title={`${name} Connector`} description={description} />

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${logoClass}`}>{logo}</span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-slate-900">{name}</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">Connector workspace</p>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">Preview · not connected</span>
              <Link href="/settings" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-2 text-[10px] font-semibold text-slate-700 hover:border-violet-200 hover:bg-violet-50">
                <Settings2 size={13} /> Configure
              </Link>
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-2 sm:px-4" role="tablist" aria-label={`${name} connector views`}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 border-b-2 px-3 py-2.5 text-[10px] font-semibold transition-colors xl:text-xs ${activeTab === tab ? "border-violet-600 text-violet-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-5">
              <form onSubmit={handleSearch} className="flex gap-2">
                <label htmlFor={`${name}-search`} className="sr-only">Search {name}</label>
                <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100">
                  <Search size={16} className="shrink-0 text-slate-400" />
                  <input id={`${name}-search`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 sm:text-sm" />
                </div>
                <button type="submit" aria-label={`Search ${name}`} className="flex size-11 shrink-0 items-center justify-center rounded-md bg-violet-600 text-white hover:bg-violet-700"><Search size={17} /></button>
              </form>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5 text-[9px] text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">Preview project</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">Sample results</span>
                  {submittedQuery && <button type="button" onClick={() => { setQuery(""); setSubmittedQuery(""); }} className="rounded-full bg-violet-50 px-2.5 py-1 font-semibold text-violet-700">Clear filter ×</button>}
                </div>
                <span className="text-[9px] text-slate-400">{filteredRows.length} sample {filteredRows.length === 1 ? "result" : "results"}</span>
              </div>

              <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead className="bg-slate-50">
                    <tr>{columns.map((column) => <th key={column} className="whitespace-nowrap border-b border-slate-200 px-3 py-2.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">{column}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredRows.length ? filteredRows.map((row, rowIndex) => (
                      <tr key={`${row[0]}-${rowIndex}`} className="border-b border-slate-100 last:border-0 hover:bg-violet-50/40">
                        {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className={`max-w-[420px] px-3 py-3 text-xs ${cellIndex === 0 ? "whitespace-nowrap font-semibold text-violet-700" : "text-slate-700"}`}><span className="block truncate">{cell}</span></td>)}
                      </tr>
                    )) : (
                      <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500">No sample results match “{submittedQuery}”.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-slate-500"><AlertCircle size={13} className="mt-0.5 shrink-0 text-amber-600" /><p>These are illustrative preview rows. Connect {name} in Settings to search live workspace data or perform actions.</p></div>
            </div>
          </section>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
            <span>Active view: <span className="font-semibold text-slate-700">{activeTab}</span></span>
            <Link href="/settings" className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900">Connector settings <ArrowUpRight size={12} /></Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
