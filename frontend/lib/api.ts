const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type ChatSource = {
  chunk_id: number;
  source: string;
  score: number;
  retrieval_method: string;
};

export type ChatResponse = {
  question: string;
  retrieval_method: string;
  hybrid_candidates: number;
  reranked_count: number;
  sources: ChatSource[];
  answer: string;
  metadata: {
    total_latency_ms: number;
    retrieval_pipeline_latency_ms: number;
    llm_latency_ms: number;
  };
};

export type KnowledgeDocument = {
  document_id: string;
  filename: string;
  status: string;
  chunks: number;
  created_at?: string;
};

export type HealthResponse = {
  status: string;
  service: string;
  version: string;
};

export type ChatHistoryEntry = {
  created_at: string;
  question: string;
  answer_latency_ms: number;
  sources: ChatSource[];
};

const CHAT_HISTORY_KEY = "enterprise-ai-chat-history";

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { detail?: string };
    if (body.detail) return body.detail;
  } catch {
    // Use the HTTP status when the response body is not JSON.
  }

  return `Request failed (${response.status}).`;
}

export async function askAssistant(question: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));
  const result = (await response.json()) as ChatResponse;

  if (typeof window !== "undefined") {
    try {
      const history = getChatHistory();
      const entry: ChatHistoryEntry = {
        created_at: new Date().toISOString(),
        question: result.question,
        answer_latency_ms: result.metadata.total_latency_ms,
        sources: result.sources,
      };
      window.localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify([...history, entry].slice(-200)));
    } catch {
      // Chat responses remain usable when browser storage is unavailable.
    }
  }

  return result;
}

export function getChatHistory(): ChatHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return [];
    const history = JSON.parse(stored) as ChatHistoryEntry[];
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

export async function getDocuments(): Promise<KnowledgeDocument[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));
  const body = (await response.json()) as {
    documents?: KnowledgeDocument[];
  };
  return body.documents ?? [];
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));
  return (await response.json()) as HealthResponse;
}

export async function uploadDocument(file: File): Promise<KnowledgeDocument> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));
  return (await response.json()) as KnowledgeDocument;
}