# 🗄️ Database Ownership & Migration Strategy

## 1. Current State
Prisma owns the database. `schema.prisma` defines all models. `prisma migrate dev` applies migrations. `prisma db seed` seeds data. Prisma Client generated to `src/generated/prisma/`. Singleton pattern in `lib/prisma.ts`.

## 2. Target State
SQLAlchemy + Alembic own the database. FastAPI is the single source of truth for schema. Next.js no longer has direct database access.

## 3. Migration Strategy
- **Step 1**: Create SQLAlchemy models that exactly mirror the current Prisma schema (same table names, column names, types, defaults, constraints)
- **Step 2**: Initialize Alembic and run `alembic stamp head` on the existing database to mark current state WITHOUT running any migration SQL
- **Step 3**: Verify SQLAlchemy models work against the existing data by running read queries
- **Step 4**: Dual-write period — both Next.js (Prisma) and FastAPI (SQLAlchemy) can read, but only one writes at a time (start with Next.js writes, gradually move to FastAPI)
- **Step 5**: Cut over — all writes go through FastAPI. Remove Prisma from Next.js.
- **Step 6**: Delete `prisma/` directory, remove `@prisma/client` and `prisma` from package.json

## 4. Schema Mapping Table
- Prisma `Int @id @default(autoincrement())` → SQLAlchemy `Column(Integer, primary_key=True, autoincrement=True)`
- Prisma `String @unique` → SQLAlchemy `Column(String, unique=True, nullable=False)`
- Prisma `Float` → SQLAlchemy `Column(Float, nullable=False)`
- Prisma `DateTime @default(now())` → SQLAlchemy `Column(DateTime, server_default=func.now())`
- Prisma `String[]` → SQLAlchemy `Column(ARRAY(String), server_default='{}')`
- Prisma enums → SQLAlchemy `Enum` (using PostgreSQL native enums)

### Model Mappings
**User**
- `uid`: Integer, primary key, autoincrement
- `uname`: String
- `uemail`: String, unique
- `password`: String (bcrypt)
- `uphone`: String, default ''
- `ugeo`: String
- `uloc`: String, default '' (GPS coords)
- `role`: Enum FARMER|BUYER, default FARMER
- `ujoinedAt`: DateTime, default now()

**ProductAuction**
- `ProdAucId`: Integer, primary key, autoincrement
- `fid`: Integer, FK → User.uid
- `title`: String
- `description`: String
- `startingBid`: Float
- `startTime`: DateTime, default now()
- `endTime`: DateTime
- `auctionStatus`: Enum OPEN|CLOSED|CANCELLED, default OPEN
- `category`: Enum VEGETABLES|FRUITS|GRAINS|DAIRY|MEAT|FISH|OTHER, default OTHER
- `imageUrl`: ARRAY(String), default []
- `CreatedAt`: DateTime, default now()

**BidId**
- `bidId`: Integer, primary key, autoincrement
- `aucId`: Integer, FK → ProductAuction.ProdAucId
- `cid`: Integer, FK → User.uid (buyer)
- `fid`: Integer, FK → User.uid (farmer)
- `bidAmount`: Float
- `bidTime`: DateTime, default now()
- `deliveryDate`: DateTime, nullable
- `status`: Enum PENDING|ACCEPTED|REJECTED|COMPLETED|FAILED, default PENDING
- `ujoinedAt`: DateTime, default now()

**ContactMessage**
- `msgId`: Integer, primary key, autoincrement
- `name`: String
- `email`: String
- `message`: String
- `status`: Enum UNREAD|READ|RESOLVED, default UNREAD
- `createdAt`: DateTime, default now()

## 5. Alembic Configuration
Key alembic.ini and env.py settings for async PostgreSQL using SQLAlchemy's async capabilities.

## 6. Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Data Loss | Stamp head without running actual SQL, perform backups. |
| Enum Mismatch | Match Enums strictly using PostgreSQL native enums in both. |
| FK constraint differences | Maintain strict ON DELETE RESTRICT, ON UPDATE CASCADE behavior across frameworks. |
| Connection pool conflicts during dual-write | Configure appropriate limits in both Prisma and SQLAlchemy pool settings. |

## 7. Rollback Plan
If FastAPI migration fails, Prisma can be restored since `schema.prisma` was not deleted until Step 6.
