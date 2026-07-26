# 🐍 FastAPI Integration Plan

## 1. Overview
We are introducing a FastAPI (Python) backend to handle all business logic, authentication, and database access, while Next.js becomes a pure rendering/UI layer.

## 2. FastAPI Project Structure
Proposed directory structure for the Python backend:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, CORS, lifespan
│   ├── config.py               # Settings via pydantic-settings
│   ├── database.py             # SQLAlchemy async engine + session
│   ├── dependencies.py         # get_db, get_current_user
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── auction.py
│   │   ├── bid.py
│   │   └── contact.py
│   ├── schemas/                # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── auction.py
│   │   ├── bid.py
│   │   └── contact.py
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── auctions.py
│   │   ├── bids.py
│   │   └── contact.py
│   ├── services/               # Business logic layer
│   │   ├── auth_service.py
│   │   ├── auction_service.py
│   │   ├── bid_service.py
│   │   └── cloudinary_service.py
│   └── utils/
│       ├── security.py         # JWT + bcrypt helpers
│       └── cloudinary.py       # Cloudinary upload helpers
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example
```

## 3. Key Dependencies
| Package | Description |
|---|---|
| `fastapi` | Web framework for building APIs |
| `uvicorn` | ASGI web server |
| `sqlalchemy[asyncio]` | ORM for database interaction (with async support) |
| `asyncpg` | PostgreSQL async database driver |
| `alembic` | Database migrations tool |
| `pydantic` | Data validation and schemas |
| `pydantic-settings` | Settings management |
| `python-jose[cryptography]` | JWT token creation and verification |
| `passlib[bcrypt]` | Password hashing |
| `cloudinary` | Image upload and management |
| `python-multipart` | Form data parsing |
| `httpx` | Async HTTP client (mainly for tests) |
| `pytest` | Testing framework |
| `redis` | (Optional) Caching and rate limiting |

## 4. Migration Steps
- **Phase 1 (Day 1)**: Set up FastAPI project skeleton, SQLAlchemy models mirroring Prisma schema exactly, Alembic with initial migration (stamp existing DB, don't recreate), config/env management
- **Phase 2 (Day 2)**: Auth endpoints (`POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`), JWT token issuance + verification, password hashing with passlib, dependency injection for `current_user`
- **Phase 3 (Day 3)**: Auction CRUD (`GET /auctions` list with pagination+filters, `GET /auctions/{id}` detail, `POST /auctions` create with Cloudinary, `PATCH /auctions/{id}/status`), Bid endpoints (`POST /auctions/{id}/bids`, `PATCH /bids/{id}/accept`, `PATCH /bids/{id}/reject`)
- **Phase 4 (Day 4)**: User profile (`GET /users/me`, `PUT /users/me`), Contact (`POST /contact`), Search (`GET /auctions/search?q=`), Dashboard aggregation (`GET /dashboard/farmer`, `GET /dashboard/buyer`)
- **Phase 5 (Day 5)**: Next.js integration — create proxy API routes in Next.js that forward to FastAPI, update all `fetch()` calls, update session handling (read JWT from cookie → forward to FastAPI)

## 5. Next.js Proxy Pattern
```typescript
// app/api/proxy/[...path]/route.ts
export async function GET(req, { params }) {
  const token = cookies().get('session')?.value;
  const res = await fetch(`${FASTAPI_URL}/${params.path.join('/')}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return Response.json(await res.json());
}
```

## 6. Environment Variables
| Variable | Description |
|---|---|
| `DATABASE_URL` | Database connection string |
| `JWT_SECRET` | Secret key for JWT |
| `JWT_ALGORITHM` | HS256 |
| `JWT_EXPIRE_MINUTES` | 10080 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary config |
| `CLOUDINARY_API_KEY` | Cloudinary config |
| `CLOUDINARY_API_SECRET` | Cloudinary config |
| `CORS_ORIGINS` | Allowed origins |
| `REDIS_URL` | (Optional) Redis url |

## 7. Testing Strategy
Use `pytest` + `httpx` `AsyncClient` for API tests, test each endpoint with valid/invalid/unauthorized requests.
