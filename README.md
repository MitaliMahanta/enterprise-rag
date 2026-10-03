# Pulse AI — Enterprise AI Engineering Intelligence

Pulse AI is an AI Engineering Operations Intelligence platform designed to help engineering teams understand what is happening across their projects.

It brings together engineering signals from systems such as Jira, GitHub, Slack, and internal knowledge sources, using RAG, hybrid retrieval, reranking, and agent-based orchestration to produce evidence-backed engineering insights.

---

## Overview

Engineering context is distributed across multiple systems:

- **Jira** — work items, blockers, dependencies, and sprint status
- **GitHub** — pull requests, commits, code changes, and CI activity
- **Slack** — discussions, decisions, incidents, and engineering context
- **Internal Knowledge** — requirements, architecture, documentation, and runbooks

Pulse AI is designed to provide an intelligence layer across these sources.

It aims to identify:

- Blocked work
- Unresolved dependencies
- Requirement-to-implementation gaps
- Decision drift
- Release risks
- Stale or conflicting documentation
- Cross-system engineering issues

The goal is to provide **evidence-backed analysis rather than simply generating an answer**.

---

## Architecture

```text
                         PULSE AI
                 Engineering Intelligence

                       User Question
                            │
                            ▼
                     ┌──────────────┐
                     │ Orchestrator │
                     └──────┬───────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    ┌───────────┐     ┌───────────┐     ┌───────────┐
    │ Jira Agent│     │GitHub Agent│    │Slack Agent│
    └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                    ┌───────────────┐
                    │ Knowledge/RAG │
                    └───────┬───────┘
                            ▼
                     ┌────────────┐
                     │Correlation │
                     └─────┬──────┘
                           ▼
                  ┌──────────────────┐
                  │ Reality Analysis │
                  └────────┬─────────┘
                           ▼
                 ┌────────────────────┐
                 │ Evidence-backed    │
                 │ Report             │
                 └─────────┬──────────┘
                           ▼
                   Human Approval

RAG & Retrieval Pipeline
Pulse AI uses a hybrid retrieval pipeline combining semantic and lexical search.
User Question
      │
      ├───────────────┐
      ▼               ▼
Dense Retrieval    BM25 Search
      │               │
      └───────┬───────┘
              ▼
      Reciprocal Rank
         Fusion (RRF)
              │
              ▼
       Hybrid Candidates
              │
              ▼
      Cross-Encoder
         Reranking
              │
              ▼
         Top Results
              │
              ▼
             LLM
              │
              ▼
    Evidence-backed Answer

Retrieval Capabilities
- Dense semantic retrieval
- BM25 lexical retrieval
- Hybrid retrieval
- Reciprocal Rank Fusion (RRF)
- Cross-encoder reranking
- Vector search
- Sentence embeddings
- Structured citations
- Retrieval evaluation

Enterprise UI
Pulse AI includes an enterprise-oriented interface for engineering intelligence.
Command Center
Centralized view of engineering activity, investigations, risks, and system status.
AI Investigation
Ask engineering questions and receive structured responses backed by retrieved evidence and citations.
Example:
Why is the Phoenix release at risk?

Multi-Agent Operations
Visualizes orchestration across specialized engineering agents and the investigation workflow.
Enterprise Connectors
UI experiences for:
- Jira
- GitHub
- Slack
- Internal knowledge sources

FastAPI
   │
   ├── API
   │    ├── Health
   │    ├── Chat
   │    └── Documents
   │
   ├── RAG Pipeline
   │    ├── Retrieval
   │    ├── Reranking
   │    └── LLM Generation
   │
   ├── Ingestion
   │    ├── PDF Loading
   │    ├── Chunking
   │    ├── Embeddings
   │    └── Vector Indexing
   │
   └── Observability
        ├── Request IDs
        ├── Structured Logging
        └── Latency Instrumentation

API
Health
GET /api/v1/health

Chat
POST /api/v1/chat

Example:
{
  "question": "What is the difference between supervised and unsupervised learning?"
}

Document Upload
POST /api/v1/documents/upload

Evaluation & Observability
The system tracks AI pipeline performance across:
- Dense retrieval latency
- BM25 latency
- RRF latency
- Retrieval latency
- Reranker latency
- LLM latency
- End-to-end latency
- Candidate count
- Reranked count
- Recall@K
The goal is to make RAG systems measurable, observable, and traceable.
Technology Stack
AI / RAG
RAG · Dense Retrieval · BM25 · Hybrid Retrieval · RRF · Cross-Encoder Reranking · Embeddings · RAG Evaluation · Agentic AI
AI / ML
Sentence Transformers · Hugging Face Transformers · Ollama · Llama 3.2
Backend
Python · FastAPI · Pydantic · Qdrant · REST APIs
Frontend
Next.js · React · TypeScript · Tailwind CSS · shadcn/UI
Engineering
Docker · Git · GitHub · Pytest · API Testing
Enterprise
Jira · GitHub · Slack · Enterprise Knowledge Sources
Project Structure
enterprise-rag/
│
├── app/
│   ├── api/
│   ├── ingestion/
│   ├── retrieval/
│   ├── services/
│   ├── models/
│   ├── rag.py
│   └── main.py
│
├── data/
│   ├── pdfs/
│   └── uploads/
│
├── tests/
├── frontend/
│
├── .env.example
├── docker-compose.yml
├── requirements.txt
└── README.md

Getting Started
1. Clone
git clone https://github.com/MitaliMahanta/enterprise-rag.git
cd enterprise-rag

2. Create Environment
python3 -m venv .venv
source .venv/bin/activate

3. Install Dependencies
pip install -r requirements.txt

4. Start Qdrant
docker compose up -d

5. Start Ollama
ollama pull llama3.2:3b

6. Configure Environment
Create .env:
QDRANT_HOST=localhost
QDRANT_PORT=6333
OLLAMA_MODEL=llama3.2:3b

7. Start API
uvicorn app.main:app --reload

API:
http://localhost:8000

Swagger:
http://localhost:8000/docs

Current Status
Pulse AI is an ongoing engineering project.
Current Foundation
- Enterprise AI UI
- FastAPI backend
- RAG pipeline
- Dense retrieval
- BM25 retrieval
- Hybrid retrieval
- Reciprocal Rank Fusion
- Cross-encoder reranking
- Qdrant vector database
- Ollama local LLM inference
- Document ingestion
- Document upload API
- Structured citations
- Retrieval evaluation
- Latency instrumentation
- API testing
- Multi-agent orchestration concepts
- Enterprise connector experiences
Roadmap
- [ ] Persistent document registry
- [ ] Multi-document ingestion improvements
- [ ] Persistent conversation memory
- [ ] Jira integration
- [ ] GitHub integration
- [ ] Slack integration
- [ ] Agent execution engine
- [ ] Cross-system correlation engine
- [ ] Engineering risk detection
- [ ] Evaluation dashboard
- [ ] Audit trails
- [ ] Human-approved actions
- [ ] Enterprise authentication and authorization
- [ ] Production deployment
Engineering Philosophy
Retrieve
   ↓
Rank
   ↓
Reason
   ↓
Correlate
   ↓
Explain
   ↓
Measure
   ↓
Act — with approval

Pulse AI explores how AI can become a measurable, observable, and evidence-backed intelligence layer for engineering workflows.
License
This project is currently intended as a personal engineering project and portfolio demonstration.

### What I removed

Your current README has several sections that repeat the same information—for example, the **Enterprise Architecture + Multi-Agent flow + Example Investigation** are essentially describing the same workflow three times. :chatgpt-content-reference{index="1"} :chatgpt-content-reference{index="2"}

I also removed the repeated **“Running Locally”** heading/clone instructions and consolidated the API, observability, evaluation, and capabilities sections. Your current file literally has the local setup beginning twice. :chatgpt-content-reference{index="3"}

This version should feel much more like a **real GitHub product repository README** rather than development notes.