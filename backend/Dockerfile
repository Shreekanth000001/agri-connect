# ==========================================
# STAGE 1: Builder (Install Dependencies)
# ==========================================
FROM python:3.12-slim AS builder

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Install build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency resolution
RUN pip install --no-cache-dir uv

# Copy project metadata & install dependencies into virtualenv
COPY pyproject.toml .
RUN uv venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN uv pip install --no-cache-dir .

# ==========================================
# STAGE 2: Production Runner
# ==========================================
FROM python:3.12-slim AS runner

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH" \
    PORT=8000

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv

# Create a non-root security user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/sh -m appuser && \
    mkdir -p /app/uploads && \
    chown -R appuser:appgroup /app

# Copy application source code
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check against FastAPI health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

# Command to run production FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

