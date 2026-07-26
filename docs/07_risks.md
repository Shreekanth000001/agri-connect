# ⚠️ Risk Register

This document catalogs all technical, operational, and business risks for the Agri-Connect v2 project, especially related to the FastAPI migration.

| Risk ID | Category | Risk Description | Likelihood | Impact | Current Status | Mitigation Strategy |
|---|---|---|---|---|---|---|
| R-001 | Security | Firebase API keys exposed in source code | High | High | Open | Move keys to environment variables (.env) and remove hardcoded values. Rotate keys if previously pushed to public repo. |
| R-002 | Security | No CSRF protection on cookie-based auth | Medium | High | Open | Implement Anti-CSRF tokens in FastAPI or configure SameSite=Strict/Lax for cookies appropriately. |
| R-003 | Security | No rate limiting on auth endpoints | High | High | Open | Implement rate limiting middleware (e.g., slowapi) on FastAPI auth routes. |
| R-004 | Security | No input validation/sanitization on API routes | High | Medium | Mitigated (Planned) | Use Pydantic schemas in FastAPI to enforce strict input validation. |
| R-005 | Security | JWT secret key management — if compromised, all sessions invalid | Low | Critical | Open | Store secret securely in env variables/secrets manager. Implement key rotation strategy. |
| R-006 | Security | bcrypt import via require() may fail in edge runtime | Medium | Medium | Mitigated (Planned) | Move auth logic completely to FastAPI Python backend which uses robust `passlib`. |
| R-007 | Technical | Dual-write period during migration could cause data inconsistency | Medium | High | Open | Migrate all DB operations to FastAPI simultaneously (Day 5 integration) to avoid dual writes. |
| R-008 | Technical | SQLAlchemy enum values must exactly match PostgreSQL enum values or queries fail | Medium | High | Open | Ensure SQLAlchemy models perfectly mirror existing DB schema. Validate with a dry-run read script on Day 1. |
| R-009 | Technical | Connection pool exhaustion during dual-write (FastAPI + Next.js both connecting) | Medium | Medium | Open | Configure reasonable connection pool limits (PgBouncer/SQLAlchemy config) and monitor during transition. |
| R-010 | Technical | No automated tests means regressions go unnoticed | High | High | Mitigated (Planned) | Write `pytest` test suites for FastAPI routes during development (Days 2-4). |
| R-011 | Technical | `any` types in TypeScript mask bugs | High | Medium | Open | Gradually replace `any` with strict interfaces when integrating frontend with new FastAPI endpoints. |
| R-012 | Technical | No pagination means full table scans on large datasets | High | High | Mitigated (Planned) | Implement pagination on FastAPI endpoints (Day 3). |
| R-013 | Operational | FastAPI deployment requires separate hosting (Railway/Render) adding infra complexity | Low | Medium | Accepted | Document deployment process clearly. Automate CI/CD later. |
| R-014 | Operational | Two deployments (Vercel + FastAPI host) increases latency for API calls | Medium | Medium | Open | Host FastAPI backend in same or geographically close region as Vercel edge functions. |
| R-015 | Operational | No monitoring/alerting — production errors go unnoticed | High | High | Open | Integrate basic logging and error tracking (e.g., Sentry) in FastAPI app. |
| R-016 | Operational | No CI/CD pipeline — manual deployments are error-prone | Medium | Medium | Open | Setup GitHub Actions for automated testing and deployment. |
| R-017 | Data | Prisma → SQLAlchemy migration could break FK constraints if not mapped exactly | Low | Critical | Open | Careful model definition. Avoid running Alembic migrations that modify existing schemas; only `stamp head`. |
| R-018 | Data | Alembic `stamp head` on wrong database could corrupt migration history | Low | Critical | Open | Strictly separate Dev/Prod DB connection strings and use strict env checks before running Alembic. |
| R-019 | Data | Seed data creates accounts with shared password — must not exist in production | Medium | High | Open | Ensure seed scripts are not bundled or executable in production environment. Disable default accounts. |
| R-020 | Performance | Next.js proxy adds extra network hop to every API call | Medium | Low-Medium | Accepted | Monitor latency. If significant, consider direct API calls from client components where feasible, bypassing proxy. |
| R-021 | Performance | Leaflet marker icons loaded from unpkg CDN — single point of failure | Low | Low | Open | Host marker icons locally within Next.js `public` directory. |
| R-022 | Performance | No image optimization — raw Cloudinary URLs served without Next.js Image component | Medium | Medium | Open | Update frontend to use `next/image` with Cloudinary loader. |

## Risk Matrix

| Impact \ Likelihood | Low | Medium | High |
| :--- | :--- | :--- | :--- |
| **Critical** | R-005, R-017, R-018 | | |
| **High** | | R-002, R-007, R-008, R-019 | R-001, R-003, R-010, R-012, R-015 |
| **Medium** | R-013 | R-006, R-009, R-014, R-016, R-022 | R-004, R-011 |
| **Low** | R-021 | R-020 | |

## Top 5 Priority Risks

1. **R-001: Firebase API keys exposed in source code**
   - **Action:** Move hardcoded keys to `.env` immediately, update code to read from `process.env`. If keys were pushed publicly, rotate them in the Firebase console.
   - **Deadline:** Day 5 (Cleanup phase), but ideally sooner.

2. **R-003: No rate limiting on auth endpoints**
   - **Action:** Implement rate limiting middleware (like `slowapi`) for `/api/v1/auth/login` and `/register` to prevent brute-force attacks.
   - **Deadline:** Day 2 (Authentication implementation).

3. **R-010: No automated tests means regressions go unnoticed**
   - **Action:** Ensure pytest is configured and write tests for all new FastAPI endpoints as they are developed. Block PRs without tests.
   - **Deadline:** Ongoing (Days 2-4).

4. **R-012: No pagination means full table scans on large datasets**
   - **Action:** Implement offset/limit or cursor-based pagination for `GET /api/v1/auctions` and search queries to prevent performance degradation.
   - **Deadline:** Day 3 (Core Business Logic implementation).

5. **R-015: No monitoring/alerting — production errors go unnoticed**
   - **Action:** Integrate a basic error tracking tool (e.g., Sentry) into the FastAPI application to capture and alert on unhandled exceptions.
   - **Deadline:** Day 1 (Foundation setup).
