# Agri Connect V2 Backend

This is the production-ready FastAPI backend for Agri Connect V2.

## Technology Stack
- FastAPI
- PostgreSQL with asyncpg & pgvector
- Redis
- LangGraph & LangChain for AI features
- Uvicorn

## Local Development
1. Setup virtual environment using `uv`:
   ```bash
   uv venv
   source .venv/bin/activate
   uv pip install -e ".[dev]"
   ```
2. Start services:
   ```bash
   docker-compose up -d db redis
   ```
3. Run API:
   ```bash
   uvicorn app.main:app --reload
   ```
