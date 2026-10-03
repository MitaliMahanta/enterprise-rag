from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.middleware import RequestIDMiddleware
from app.api.routes_chat import router as chat_router
from app.api.routes_documents import router as documents_router
from app.api.routes_health import router as health_router
from app.config import settings


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Pulse AI Assistant backend",
    version="0.1.0",
)


# --------------------------------------------------
# Middleware
# --------------------------------------------------

app.add_middleware(
    RequestIDMiddleware,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Routes
# --------------------------------------------------

app.include_router(
    health_router,
)

app.include_router(
    chat_router,
)

app.include_router(
    documents_router,
)


# --------------------------------------------------
# Root endpoint
# --------------------------------------------------

@app.get("/")
def root():

    return {
        "application": settings.PROJECT_NAME,
        "status": "running",
        "version": "0.1.0",
    }