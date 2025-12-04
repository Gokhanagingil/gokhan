# Architecture Diagnostics Report

**Project:** Arctic Echo - GRC + ITSM Platform (Facilitator Dashboard MVP)  
**Generated:** December 04, 2025  
**Scope:** Full architectural analysis of the monorepo

---

## 1. Repository Overview & Modules

### 1.1 Project Structure

The Arctic Echo project is organized as a monorepo with npm workspaces containing two main applications:

```
/
├── frontend/                 # Next.js 15 frontend (React 19, TypeScript, Tailwind v4)
├── backend/                  # NestJS 11 backend (TypeORM, PostgreSQL, Socket.io)
├── package.json              # Root workspace configuration
└── README.md                 # Project documentation
```

### 1.2 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | Next.js | 15.4.1 |
| Frontend UI | React | 19.1.0 |
| Frontend Styling | Tailwind CSS | 4.x |
| Backend Framework | NestJS | 11.x |
| ORM | TypeORM | 0.3.25 |
| Database | PostgreSQL | 8.16.3 (pg driver) |
| Real-time | Socket.io | 4.8.1 |
| Authentication | Passport JWT | 4.0.1 |
| API Documentation | Swagger | 11.2.0 |

### 1.3 Missing Infrastructure

The following directories/files referenced in the task description do not exist in the repository:

| Expected | Status | Notes |
|----------|--------|-------|
| `docs/` | Missing | No documentation directory (created for this report) |
| `scripts/` | Missing | No scripts directory |
| `.github/workflows/` | Missing | No CI/CD configuration |
| `.env` files | Missing | No environment files committed |

---

## 2. Backend Module Inventory

### 2.1 Module Summary Table

| Module | Path | Controllers | Services | Entities | Guards | Imports |
|--------|------|-------------|----------|----------|--------|---------|
| AppModule | `src/app.module.ts` | AppController | AppService, FacilitatorGateway | - | - | ConfigModule, PassportModule, JwtModule, TypeOrmModule, AuthModule, SessionModule, SeedModule, ParticipantModule, EventModule, FeedbackModule, ScoreModule |
| AuthModule | `src/modules/auth/` | AuthController | AuthService, JwtStrategy | User | JwtAuthGuard | TypeOrmModule, PassportModule, JwtModule |
| SessionModule | `src/modules/session/` | SessionController | SessionService | Session | JwtAuthGuard | TypeOrmModule |
| ParticipantModule | `src/modules/facilitator/participant/` | ParticipantController | ParticipantService, FacilitatorGateway | Participant | JwtAuthGuard | TypeOrmModule |
| EventModule | `src/modules/facilitator/event/` | EventController | EventService, FacilitatorGateway | Event | JwtAuthGuard | TypeOrmModule |
| FeedbackModule | `src/modules/facilitator/feedback/` | FeedbackController | FeedbackService | Feedback | JwtAuthGuard | TypeOrmModule |
| ScoreModule | `src/modules/facilitator/score/` | ScoreController | ScoreService, FacilitatorGateway | Score | JwtAuthGuard | TypeOrmModule |
| SeedModule | `src/modules/facilitator/seed/` | SeedController | - | - | JwtAuthGuard | - |

### 2.2 Controller Routes

| Controller | Base Path | Routes | Auth Required |
|------------|-----------|--------|---------------|
| AppController | `/api` | `GET /` | No |
| AuthController | `/api/auth` | `POST /register`, `POST /login`, `GET /me` | `/me` only |
| SessionController | `/api/session` | `POST /start`, `POST /stop`, `GET /status` | Yes |
| ParticipantController | `/api/participants` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` | Yes |
| EventController | `/api/events` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` | Yes |
| FeedbackController | `/api/feedback` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` | Yes |
| ScoreController | `/api/scores` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` | Yes |
| SeedController | `/api/seed` | `POST /` | Yes |

### 2.3 Entity Definitions

| Entity | Table | Primary Key | Key Fields | Relationships |
|--------|-------|-------------|------------|---------------|
| User | `users` | UUID | email, password, role (enum: facilitator/observer) | None |
| Session | `sessions` | UUID | startedAt, endedAt, status (enum: active/stopped) | None |
| Participant | `participants` | UUID | name, role, lastActive, status (enum: active/inactive/ai-controlled) | None |
| Event | `events` | UUID | type (enum), title, description, triggeredAt, status | None |
| Feedback | `feedback` | UUID | participantId, message, sentAt | ManyToOne -> Participant |
| Score | `scores` | UUID | participantId, value (decimal), reason, timestamp | ManyToOne -> Participant |

### 2.4 Duplicate/Legacy Code Issue

There is a **duplicate participant module** at `src/participant/` that appears to be legacy code:

| Location | Type | Issue |
|----------|------|-------|
| `src/participant/` | Legacy | Uses in-memory array, numeric IDs, different entity structure |
| `src/modules/facilitator/participant/` | Active | Uses TypeORM, UUID, proper entity with status enum |

**Risk Level:** Medium - The legacy module is not imported in AppModule but creates confusion and potential import errors.

---

## 3. Frontend Module Inventory

### 3.1 Application Structure

| Component | Path | Description |
|-----------|------|-------------|
| Entry Point | `src/app/layout.tsx` | Root layout with Geist fonts, global CSS |
| Home Page | `src/app/page.tsx` | Default Next.js boilerplate (not customized) |
| Facilitator Page | `src/app/facilitator/page.tsx` | Main dashboard component |
| Global Styles | `src/app/globals.css` | Tailwind v4 import, CSS variables |

### 3.2 Router & Routes

The frontend uses Next.js App Router with the following routes:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `page.tsx` | Default Next.js landing page (boilerplate) |
| `/facilitator` | `facilitator/page.tsx` | Facilitator dashboard |

### 3.3 API Client Analysis

The API client is implemented inline in `facilitator/page.tsx` with the following functions:

| Function | Endpoint | Method | Auth |
|----------|----------|--------|------|
| `autoLogin` | `/api/auth/login` | POST | No |
| `fetchParticipants` | `/api/participants` | GET | Bearer token |
| `fetchEvents` | `/api/events` | GET | Bearer token |
| `fetchScores` | `/api/scores` | GET | Bearer token |
| `sendFeedback` | `/api/feedback` | POST | Bearer token |

**Issues Identified:**

1. **Hardcoded credentials:** `autoLogin` uses hardcoded `admin@example.com` / `admin` which don't match seed data (`admin@arctic-echo.com` / `admin123`)
2. **No API client abstraction:** All fetch logic is inline in the component
3. **Incorrect token storage:** Stores `data.access_token` but backend returns `data.token`
4. **No error handling for auth failures:** Silent failures on 401 responses

### 3.4 Real-time Integration

Socket.io client is initialized at module level:

```typescript
const socket: Socket = io('http://localhost:3001');
```

**Issues:**
- Socket is created at module load, not component mount
- Only listens for `eventUpdate` but backend emits `new-event`, `new-participant`, `score-updated`, `session-update`
- No reconnection handling

---

## 4. Dependency Graph & Architectural Shape

### 4.1 Backend Module Dependencies

```
AppModule (Root)
├── ConfigModule (Global)
├── PassportModule
├── JwtModule
├── TypeOrmModule
├── AuthModule
│   ├── TypeOrmModule.forFeature([User])
│   ├── PassportModule
│   └── JwtModule
├── SessionModule
│   └── TypeOrmModule.forFeature([Session])
├── SeedModule
│   └── (No imports, uses DataSource injection)
├── ParticipantModule
│   ├── TypeOrmModule.forFeature([Participant])
│   └── FacilitatorGateway (Provider)
├── EventModule
│   ├── TypeOrmModule.forFeature([Event])
│   └── FacilitatorGateway (Provider)
├── FeedbackModule
│   └── TypeOrmModule.forFeature([Feedback])
└── ScoreModule
    ├── TypeOrmModule.forFeature([Score])
    └── FacilitatorGateway (Provider)
```

### 4.2 Architectural Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| **FacilitatorGateway Duplication** | High | FacilitatorGateway is provided in AppModule AND in ParticipantModule, EventModule, ScoreModule. This creates multiple instances. |
| **No Shared Module** | Medium | Common dependencies (FacilitatorGateway) should be in a shared module with `exports` |
| **Missing Entity Relations** | Medium | Session has no relation to Participants, Events, Scores - data isolation per session not enforced |
| **No Tenant Isolation** | High | No tenantId field on any entity - multi-tenancy not implemented |
| **Circular Risk** | Low | No circular dependencies detected currently |

### 4.3 Cross-Domain Violations

| Violation | Description |
|-----------|-------------|
| Feedback -> Participant | FeedbackModule references Participant entity directly without importing ParticipantModule |
| Score -> Participant | ScoreModule references Participant entity directly without importing ParticipantModule |

---

## 5. Backend Boot & Lifecycle Analysis

### 5.1 Bootstrap Process (`main.ts`)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()...
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
```

### 5.2 Potential Failure Points

| Component | Risk | Issue | Recommendation |
|-----------|------|-------|----------------|
| **CORS Origin** | High | Hardcoded `http://localhost:3000` - will fail in production | Use ConfigService with environment variable |
| **JWT Secret** | Critical | `process.env.JWT_SECRET!` with non-null assertion - crashes if undefined | Add validation, provide default for dev |
| **Database Connection** | High | TypeORM `synchronize: true` in production will cause data loss | Disable in production, use migrations |
| **No Helmet** | Medium | No security headers middleware | Add `@nestjs/helmet` |
| **No Rate Limiting** | Medium | No rate limiting configured | Add `@nestjs/throttler` |
| **No Health Check** | Medium | No health check endpoint | Add `@nestjs/terminus` |
| **Swagger in Production** | Low | Swagger exposed on same `/api` prefix | Disable in production or use different path |

### 5.3 Missing Global Configuration

| Feature | Status | Impact |
|---------|--------|--------|
| Global Exception Filter | Missing | Unhandled exceptions expose stack traces |
| Global Logging Interceptor | Missing | No request/response logging |
| Request Timeout | Missing | Long-running requests can hang |
| Graceful Shutdown | Missing | Connections not properly closed |

---

## 6. Environment & Configuration Dependencies

### 6.1 Environment Variables

| Variable | Used In | Required | Default | Risk |
|----------|---------|----------|---------|------|
| `JWT_SECRET` | `app.module.ts`, `auth.module.ts`, `jwt.strategy.ts` | Yes | None | **Critical** - App crashes without it |
| `DATABASE_HOST` | `app.module.ts`, `seed.ts` | No | `localhost` | Low |
| `DATABASE_PORT` | `app.module.ts`, `seed.ts` | No | `5432` | Low |
| `DATABASE_USERNAME` | `app.module.ts`, `seed.ts` | No | `postgres` | Low |
| `DATABASE_PASSWORD` | `app.module.ts`, `seed.ts` | No | `password` | Medium - Insecure default |
| `DATABASE_NAME` | `app.module.ts`, `seed.ts` | No | `arctic_echo` | Low |
| `PORT` | `main.ts` | No | `3001` | Low |

### 6.2 Configuration Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| **No .env.example** | Medium | No template for required environment variables |
| **JWT Secret Duplication** | High | JWT secret configured in both AppModule and AuthModule - potential mismatch |
| **No ConfigService Usage** | Medium | Direct `process.env` access instead of NestJS ConfigService |
| **Hardcoded CORS** | High | CORS origin hardcoded, not configurable |
| **Hardcoded WebSocket CORS** | High | WebSocket gateway has separate hardcoded CORS |

### 6.3 Recommended .env Template

```env
# Required
JWT_SECRET=your-secure-jwt-secret-min-32-chars

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=secure-password
DATABASE_NAME=arctic_echo

# Application
PORT=3001
NODE_ENV=development

# CORS (recommended addition)
CORS_ORIGIN=http://localhost:3000
```

---

## 7. Security, Auth & Multi-Tenancy Overview

### 7.1 Authentication Mechanism

| Feature | Implementation | Status |
|---------|----------------|--------|
| Auth Strategy | JWT (Bearer Token) | Implemented |
| Token Expiry | 24 hours | Configured |
| Password Hashing | bcrypt (10 rounds) | Implemented |
| Refresh Tokens | Not implemented | Missing |
| Token Rotation | Not implemented | Missing |
| Token Blacklist | Not implemented | Missing |

### 7.2 Guards Usage

| Controller | Guard Applied | Level |
|------------|---------------|-------|
| AppController | None | Endpoint |
| AuthController | JwtAuthGuard on `/me` only | Endpoint |
| SessionController | JwtAuthGuard | Controller |
| ParticipantController | JwtAuthGuard | Controller |
| EventController | JwtAuthGuard | Controller |
| FeedbackController | JwtAuthGuard | Controller |
| ScoreController | JwtAuthGuard | Controller |
| SeedController | JwtAuthGuard | Controller |

### 7.3 Unprotected Endpoints

| Endpoint | Risk | Recommendation |
|----------|------|----------------|
| `GET /api` | Low | Health check, acceptable |
| `POST /api/auth/register` | High | No rate limiting, anyone can create accounts |
| `POST /api/auth/login` | Medium | No rate limiting, brute force possible |

### 7.4 Multi-Tenancy Status

**Current State:** Not implemented

| Requirement | Status | Notes |
|-------------|--------|-------|
| Tenant ID on entities | Missing | No tenantId field |
| Tenant extraction | Missing | No TenantGuard |
| Data isolation | Missing | All users see all data |
| Tenant-scoped queries | Missing | No automatic filtering |

### 7.5 Security Vulnerabilities

| Vulnerability | Severity | Description |
|---------------|----------|-------------|
| **No Role-Based Access** | High | UserRole enum exists but no RolesGuard implemented |
| **Password in Response** | Critical | User entity returns password hash in API responses |
| **No Input Sanitization** | Medium | Only class-validator, no XSS protection |
| **Seed Endpoint Exposed** | High | `/api/seed` can reset database, only requires auth |

---

## 8. Testing & Tooling Status

### 8.1 Root Package Scripts

| Script | Command | Status |
|--------|---------|--------|
| `dev` | Run both frontend and backend | Working |
| `dev:frontend` | Run frontend only | Working |
| `dev:backend` | Run backend only | Working |
| `build` | Build both | Working |
| `lint` | Lint both | Working |
| `test` | Test both | Partial |
| `install:all` | Install all dependencies | Working |

### 8.2 Backend Scripts

| Script | Command | Status | Notes |
|--------|---------|--------|-------|
| `build` | `nest build` | Working | |
| `start` | `nest start` | Working | |
| `start:dev` | `nest start --watch` | Working | |
| `start:debug` | `nest start --debug --watch` | Working | |
| `start:prod` | `node dist/main` | Working | |
| `lint` | `eslint ... --fix` | Working | |
| `test` | `jest` | Partial | Only 1 test file |
| `test:watch` | `jest --watch` | Working | |
| `test:cov` | `jest --coverage` | Working | |
| `test:e2e` | `jest --config ./test/jest-e2e.json` | Broken | Requires database |

### 8.3 Frontend Scripts

| Script | Command | Status | Notes |
|--------|---------|--------|-------|
| `dev` | `next dev` | Working | |
| `build` | `next build` | Working | |
| `start` | `next start` | Working | |
| `lint` | `next lint` | Working | |
| `test` | Not defined | Missing | No test script |

### 8.4 Test Coverage Analysis

| Area | Files | Coverage | Notes |
|------|-------|----------|-------|
| Backend Unit | 1 | ~5% | Only `app.controller.spec.ts` |
| Backend E2E | 1 | ~5% | Only `app.e2e-spec.ts`, requires DB |
| Frontend | 0 | 0% | No tests |

### 8.5 Missing Scripts

| Script | Purpose | Priority |
|--------|---------|----------|
| `db:migrate` | Run TypeORM migrations | High |
| `db:seed` | Seed database | Medium |
| `db:reset` | Reset database | Medium |
| `test:frontend` | Frontend tests | High |
| `smoke` | Smoke tests | Medium |
| `typecheck` | TypeScript check | Medium |

---

## 9. Performance & Scalability Risks

### 9.1 Risk Assessment

| Risk | Severity | Area | Description |
|------|----------|------|-------------|
| **No Pagination** | High | API | `findAll()` methods return all records without pagination |
| **No Query Optimization** | Medium | Database | No indexes defined, no query optimization |
| **Synchronous Operations** | Low | Controllers | All operations are async, no blocking code |
| **WebSocket Scaling** | High | Real-time | Single server WebSocket, no Redis adapter for scaling |
| **No Caching** | Medium | API | No caching layer for frequently accessed data |
| **TypeORM Synchronize** | Critical | Database | `synchronize: true` will cause issues at scale |
| **No Connection Pooling Config** | Medium | Database | Using default TypeORM pool settings |
| **No Background Jobs** | Medium | Processing | No queue system for async processing |

### 9.2 Detailed Analysis

**No Pagination (High Risk)**

All `findAll()` methods in services return complete datasets:

```typescript
// participant.service.ts
async findAll(): Promise<Participant[]> {
  return this.participantRepository.find();
}
```

For a GRC/ITSM platform expecting high-volume data, this will cause:
- Memory exhaustion on large datasets
- Slow response times
- Client-side rendering issues

**WebSocket Scaling (High Risk)**

The FacilitatorGateway uses in-memory Socket.io without Redis adapter:

```typescript
@WebSocketGateway({
  cors: { origin: 'http://localhost:3000', credentials: true },
})
export class FacilitatorGateway { ... }
```

This means:
- Cannot scale horizontally (multiple server instances)
- WebSocket connections lost on server restart
- No message persistence

**TypeORM Synchronize (Critical Risk)**

```typescript
TypeOrmModule.forRoot({
  ...
  synchronize: true,  // DANGEROUS IN PRODUCTION
})
```

This setting:
- Auto-modifies database schema on entity changes
- Can cause data loss in production
- Should be replaced with migrations

### 9.3 Future Load Concerns

| Feature | Expected Load | Current Capacity | Gap |
|---------|---------------|------------------|-----|
| Event Ingestion | High (alerts, integrations) | Low (REST only) | Need message queue |
| Real-time Updates | Medium-High | Low (single server) | Need Redis adapter |
| Audit Logging | High | None | Need logging infrastructure |
| Report Generation | Medium | None | Need background jobs |

---

## 10. Prioritized Recommendations & Next Steps

### 10.1 Critical (Immediate Action Required)

| # | Issue | Action | Effort |
|---|-------|--------|--------|
| 1 | JWT Secret crash risk | Add validation and default for development | 1 hour |
| 2 | Password exposed in API | Add `@Exclude()` decorator or DTO transformation | 2 hours |
| 3 | TypeORM synchronize | Disable, implement migrations | 4 hours |
| 4 | Seed endpoint security | Add role guard or remove from production | 1 hour |

### 10.2 High Priority (This Sprint)

| # | Issue | Action | Effort |
|---|-------|--------|--------|
| 5 | No pagination | Implement pagination on all list endpoints | 8 hours |
| 6 | FacilitatorGateway duplication | Create shared module, export gateway | 2 hours |
| 7 | Frontend auth mismatch | Fix credentials and token field name | 1 hour |
| 8 | CORS hardcoding | Use ConfigService for CORS configuration | 2 hours |
| 9 | No role-based access | Implement RolesGuard | 4 hours |
| 10 | Remove legacy participant module | Delete `src/participant/` directory | 30 min |

### 10.3 Medium Priority (Next Sprint)

| # | Issue | Action | Effort |
|---|-------|--------|--------|
| 11 | No health checks | Add @nestjs/terminus health module | 2 hours |
| 12 | No rate limiting | Add @nestjs/throttler | 2 hours |
| 13 | No Helmet | Add security headers | 1 hour |
| 14 | WebSocket event mismatch | Align frontend listeners with backend events | 2 hours |
| 15 | No API client abstraction | Create dedicated API service in frontend | 4 hours |
| 16 | No .env.example | Create environment template | 30 min |
| 17 | Missing tests | Add unit tests for services | 16 hours |

### 10.4 Low Priority (Backlog)

| # | Issue | Action | Effort |
|---|-------|--------|--------|
| 18 | No CI/CD | Set up GitHub Actions | 4 hours |
| 19 | No caching | Add Redis caching layer | 8 hours |
| 20 | No background jobs | Add Bull queue for async processing | 8 hours |
| 21 | Multi-tenancy | Design and implement tenant isolation | 40 hours |
| 22 | Refresh tokens | Implement token refresh flow | 8 hours |

---

## Summary of Key Findings

1. **Architecture is sound but incomplete** - The NestJS modular structure is well-organized, but lacks production-ready features like pagination, caching, and proper error handling.

2. **Security gaps exist** - Password hashes are exposed in API responses, no role-based access control despite having roles defined, and the seed endpoint is a security risk.

3. **Configuration is fragile** - JWT secret will crash the app if missing, CORS is hardcoded, and TypeORM synchronize is enabled which is dangerous for production.

4. **Frontend-backend mismatch** - The frontend uses incorrect credentials for auto-login, wrong token field name, and listens for different WebSocket events than the backend emits.

5. **Duplicate code exists** - Legacy participant module at `src/participant/` should be removed to avoid confusion.

6. **FacilitatorGateway is over-provided** - The WebSocket gateway is provided in multiple modules, creating multiple instances instead of a shared singleton.

7. **No pagination on list endpoints** - All `findAll()` methods return complete datasets, which will cause performance issues at scale.

8. **Testing is minimal** - Only one unit test and one e2e test exist, with zero frontend tests.

9. **No CI/CD pipeline** - No GitHub Actions or other CI/CD configuration exists.

10. **Multi-tenancy not implemented** - No tenant isolation despite being a requirement for the GRC/ITSM platform.

11. **Real-time scaling limited** - WebSocket implementation cannot scale horizontally without Redis adapter.

12. **Missing infrastructure** - No docs, scripts, or workflows directories exist despite being referenced in requirements.

---

**Report Generated By:** Architectural Diagnostics Scan  
**File Location:** `docs/ARCHITECTURE-DIAGNOSTICS-REPORT.md`
