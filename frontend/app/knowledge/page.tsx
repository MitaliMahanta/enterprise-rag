"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { FileText, Search, Upload } from "lucide-react";
import AppShell from "@/components/app-shell";
import PageHeader from "@/components/page-header";
import { getDocuments, uploadDocument, type KnowledgeDocument } from "@/lib/api";

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    getDocuments()
      .then((loadedDocuments) => {
        if (mounted) setDocuments(loadedDocuments);
      })
      .catch((requestError: unknown) => {
        if (mounted) {
          setError(requestError instanceof Error ? requestError.message : "Could not load documents.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadDocument(file);
      setDocuments((current) => [uploaded, ...current.filter((document) => document.document_id !== uploaded.document_id)]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const filteredDocuments = useMemo(
    () => documents.filter((document) => document.filename.toLowerCase().includes(query.toLowerCase())),
    [documents, query],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-[1120px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <PageHeader
          title="Knowledge"
          description="Manage the PDF documents indexed for retrieval-augmented answers."
          action={
            <>
              <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={(event) => void handleUpload(event)} className="sr-only" />
              <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center justify-center gap-2 rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
                <Upload size={16} /> {uploading ? "Indexing..." : "Upload PDF"}
              </button>
            </>
          }
        />

        {error && <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}

        <section className="border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <label className="flex h-10 min-w-0 items-center gap-2 border border-slate-200 px-3 sm:w-80">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter documents" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
            </label>
            <span className="text-xs text-slate-500">{documents.length} indexed {documents.length === 1 ? "document" : "documents"}</span>
          </div>

          {loading ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500">Loading document registry...</p>
          ) : filteredDocuments.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <FileText size={24} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">{query ? "No matching documents" : "No documents indexed"}</p>
              <p className="mt-1 text-sm text-slate-500">{query ? "Try a different filename." : "Upload a PDF to add it to the searchable knowledge base."}</p>
            </div>
          ) : (
            <ul>
              {filteredDocuments.map((document) => (
                <li key={document.document_id} className="flex items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-0 sm:px-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-800"><FileText size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{document.filename}</span>
                    <span className="mt-1 block text-xs text-slate-500">{document.chunks} chunks · {document.status}</span>
                  </span>
                  <span className={`shrink-0 text-xs font-medium ${document.status === "indexed" ? "text-emerald-700" : "text-amber-700"}`}>{document.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="mt-3 text-xs text-slate-500">PDF files only · Maximum upload size 20 MB</p>
      </div>
    </AppShell>
  );
}