# 📅 5-Day Implementation Roadmap

## Project Timeline (Gantt-Style)

| Component / Feature       | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 |
| ------------------------- | :---: | :---: | :---: | :---: | :---: |
| **Foundation**            |   █   |       |       |       |       |
| **Authentication**        |       |   █   |       |       |       |
| **Core Business Logic**   |       |       |   █   |       |       |
| **Supporting Features**   |       |       |       |   █   |       |
| **Next.js Integration**   |       |       |       |       |   █   |

This is a concrete, day-by-day execution plan for introducing FastAPI and cleaning up the codebase. Each day has clear deliverables and acceptance criteria.

### Day 1: Foundation
**Goal:** FastAPI project scaffold + database models

- [ ] Initialize `backend/` directory with FastAPI project structure
- [ ] Set up virtual environment, install dependencies (fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, alembic, pydantic, python-jose, passlib[bcrypt], cloudinary, python-multipart)
- [ ] Create `app/config.py` with pydantic-settings for env var management
- [ ] Create `app/database.py` with async SQLAlchemy engine + sessionmaker pointing to existing PostgreSQL
- [ ] Create SQLAlchemy models mirroring all 4 Prisma models exactly (same table names, column names, types, enums)
- [ ] Initialize Alembic, run `alembic stamp head` against existing DB (DO NOT run any migration SQL)
- [ ] Verify: run a Python script that reads all Users from existing DB via SQLAlchemy
- [ ] Create `app/main.py` with FastAPI app, CORS middleware, health check endpoint
- [ ] Verify: `GET /health` returns `{"status": "ok"}`

**Acceptance Criteria:** FastAPI app starts, connects to PostgreSQL, reads existing data correctly.

---

### Day 2: Authentication
**Goal:** Complete auth system in FastAPI

- [ ] Create `app/utils/security.py` — JWT create/verify (python-jose, HS256), password hash/verify (passlib bcrypt)
- [ ] Create `app/schemas/user.py` — Pydantic schemas: UserCreate, UserLogin, UserResponse, TokenResponse
- [ ] Create `app/routers/auth.py`:
  - POST /api/v1/auth/register — validate input, check duplicate email, hash password, create user, return JWT
  - POST /api/v1/auth/login — find user by email, verify password, return JWT
  - GET /api/v1/auth/me — decode JWT from Authorization header, return user profile
- [ ] Create `app/dependencies.py` — `get_current_user` dependency (extracts and verifies JWT)
- [ ] Write pytest tests for all 3 auth endpoints (happy path + error cases)
- [ ] Verify: can register, login, and access /auth/me with token from Postman/curl

**Acceptance Criteria:** All auth endpoints work, JWT tokens are interoperable, tests pass.

---

### Day 3: Core Business Logic
**Goal:** Auction + Bid CRUD in FastAPI

- [ ] Create `app/schemas/auction.py` — AuctionCreate, AuctionResponse, AuctionList (paginated)
- [ ] Create `app/schemas/bid.py` — BidCreate, BidResponse, BidAction
- [ ] Create `app/routers/auctions.py`:
  - GET /api/v1/auctions — list with pagination, category filter, status filter, sort
  - GET /api/v1/auctions/{id} — detail with farmer info + bids
  - POST /api/v1/auctions — create (Farmer-only)
  - PATCH /api/v1/auctions/{id}/cancel — cancel (owner only)
  - GET /api/v1/auctions/search?q= — full-text search
- [ ] Create `app/routers/bids.py`:
  - POST /api/v1/auctions/{id}/bids — place bid (Buyer-only, duplicate check, amount validation)
  - PATCH /api/v1/bids/{id}/accept — accept bid (Farmer-only, auto-reject others, close auction)
  - PATCH /api/v1/bids/{id}/reject — reject bid (Farmer-only)
- [ ] Create `app/services/bid_service.py` — encapsulate bid acceptance transaction logic
- [ ] Write tests for all endpoints
- [ ] Verify: complete auction lifecycle works via curl/Postman

**Acceptance Criteria:** Can create auction, place bid, accept/reject, search — all via FastAPI.

---

### Day 4: Supporting Features + Cloudinary
**Goal:** Profile, Contact, Dashboard, Image Upload

- [ ] Create `app/routers/users.py`:
  - GET /api/v1/users/me — profile
  - PUT /api/v1/users/me — update phone/address
- [ ] Create `app/routers/contact.py`:
  - POST /api/v1/contact — save message
- [ ] Create `app/routers/dashboard.py`:
  - GET /api/v1/dashboard/farmer — listings with bids + stats
  - GET /api/v1/dashboard/buyer — bid history + stats
- [ ] Create `app/utils/cloudinary.py` + `app/routers/upload.py`:
  - POST /api/v1/upload/image — accept multipart file, upload to Cloudinary, return URL
- [ ] Write tests for all new endpoints
- [ ] Verify: all FastAPI endpoints working, OpenAPI docs at /docs look complete

**Acceptance Criteria:** Full API feature parity with current Next.js backend. /docs shows all endpoints.

---

### Day 5: Next.js Integration + Cleanup
**Goal:** Wire Next.js frontend to FastAPI backend

- [ ] Create Next.js catch-all proxy route: `app/api/proxy/[...path]/route.ts` that forwards to FastAPI with JWT from cookie
- [ ] Update home page fetch: `/productsroute` → `/api/proxy/auctions`
- [ ] Update login flow: POST to `/api/proxy/auth/login`, store returned JWT in HTTP-only cookie
- [ ] Update signup flow: POST to `/api/proxy/auth/register`, store JWT cookie
- [ ] Update dashboard: fetch from `/api/proxy/dashboard/farmer` or `/api/proxy/dashboard/buyer`
- [ ] Update product detail: fetch from `/api/proxy/auctions/{id}`
- [ ] Update bid submission: POST to `/api/proxy/auctions/{id}/bids`
- [ ] Update profile: fetch/update via `/api/proxy/users/me`
- [ ] Update contact: POST to `/api/proxy/contact`
- [ ] Clean up: remove unused Next.js API routes that are now proxied
- [ ] Clean up: remove duplicate route handlers
- [ ] Fix: `fontally` → `finally` typo
- [ ] Fix: move Firebase keys to env vars or remove Firebase entirely
- [ ] Smoke test entire app end-to-end

**Acceptance Criteria:** App works end-to-end with FastAPI backend. No direct Prisma calls from Next.js for proxied features.
