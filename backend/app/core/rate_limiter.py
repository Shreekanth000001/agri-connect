import time
import logging
from collections import defaultdict
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    In-Memory Sliding Window Rate Limiter Middleware for sensitive API routes.
    Prevents brute-force authentication attacks and AI endpoint spamming.
    """
    def __init__(
        self,
        app,
        rate_limits: dict[str, tuple[int, int]] | None = None
    ):
        super().__init__(app)
        # Endpoint prefix -> (max_requests, window_seconds)
        self.rate_limits = rate_limits or {
            "/api/v1/auth/login": (10, 60),      # 10 requests per minute
            "/api/v1/ai/chat": (30, 60),         # 30 requests per minute
            "/api/v1/upload/image": (15, 60),    # 15 uploads per minute
        }
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        
        # Match rate-limited endpoints
        matched_rule = None
        for endpoint, limit_tuple in self.rate_limits.items():
            if path.startswith(endpoint):
                matched_rule = limit_tuple
                break

        if matched_rule:
            max_reqs, window = matched_rule
            client_ip = request.client.host if request.client else "127.0.0.1"
            key = f"{path}:{client_ip}"
            now = time.time()

            # Clean expired timestamps outside the sliding window
            self.requests[key] = [t for t in self.requests[key] if now - t < window]

            if len(self.requests[key]) >= max_reqs:
                logger.warning(f"Rate limit exceeded for IP {client_ip} on {path} ({len(self.requests[key])}/{max_reqs})")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": f"Rate limit exceeded. Maximum {max_reqs} requests per {window} seconds allowed."
                    },
                    headers={"Retry-After": str(window)}
                )

            self.requests[key].append(now)

        return await call_next(request)
