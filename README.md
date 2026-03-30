# Smart Leave Management System

A microservice-based leave tracking system built with Node.js, Express, and MongoDB.

## Architecture

```
                        ┌──────────────────────┐
                        │     API Gateway       │
Client ──────────────►  │     Port: 4001        │
                        └──────────┬───────────┘
                                   │
         ┌─────────────────────────┼──────────────────────────┐
         │                         │                          │
         ▼                         ▼                          ▼
┌──────────────────┐    ┌──────────────────────┐   ┌─────────────────────┐
│  Auth & User     │    │  Leave Balance &      │   │  Approval Service   │
│  Service         │    │  Reporting Service    │   │  Port: 5002         │
│  Port: 5010      │    │  Port: 5001           │   └────────┬────────────┘
└──────────────────┘    └──────────────────────┘            │
                                                             ▼
                                                  ┌─────────────────────┐
                                                  │  Leave Request      │
                                                  │  Service            │
                                                  │  Port: 5003         │
                                                  └─────────────────────┘
```

## Services

| Service | Port | Directory | Description |
|---|---|---|---|
| API Gateway | 4001 | `api-gateway/` | Routes all client requests to microservices |
| Auth & User Service | 5010 | `auth-user-service/` | User registration, login (JWT), user management |
| Leave Balance & Reporting Service | 5001 | `leave-balance-reporting-service/` | Leave balance tracking, usage logs, reports |
| Approval Service | 5002 | `approval-service/` | Leave approval workflow (Manager role) |
| Leave Request Service | 5003 | `leave-request-service/` | Employee leave applications |

## API Gateway Routes

| Gateway Endpoint | Forwards To | Service |
|---|---|---|
| `POST /api/auth/register` | `POST /api/auth/register` | Auth & User (5010) |
| `POST /api/auth/login` | `POST /api/auth/login` | Auth & User (5010) |
| `GET/PUT/DELETE /api/users/:id` | `/api/users/:id` | Auth & User (5010) |
| `GET/POST /api/balances` | `/api/balance` | Balance & Reporting (5001) |
| `GET /api/reports/...` | `/api/reports/...` | Balance & Reporting (5001) |
| `GET/POST /api/approvals` | `/api/approvals` | Approval (5002) |
| `POST /api/leaves/apply` | `POST /api/leave/apply` | Leave Request (5003) |
| `GET /api/leaves/:userId` | `GET /api/leave/:userId` | Leave Request (5003) |

## Running the System

Start each service in a separate terminal:

```powershell
# 1 – Auth & User Service
cd auth-user-service
npm run dev

# 2 – Leave Balance & Reporting Service
cd leave-balance-reporting-service
npm run dev

# 3 – Approval Service
cd approval-service
node server.js    # or npm run dev if script exists

# 4 – Leave Request Service
cd leave-request-service
npm run dev

# 5 – API Gateway (start last)
cd api-gateway
node server.js
```

## Health Checks

```powershell
curl http://localhost:4001/health   # API Gateway
curl http://localhost:5010/health   # Auth & User Service
curl http://localhost:5001/health   # Balance & Reporting Service
curl http://localhost:5002/health   # Approval Service
curl http://localhost:5003/health   # Leave Request Service
```

## Swagger Docs

Each service exposes Swagger documentation at `/api-docs`:

- API Gateway docs: http://localhost:4001/api-docs
- Auth & User Service: http://localhost:5010/api-docs
- Balance & Reporting Service: http://localhost:5001/api-docs
- Approval Service: http://localhost:5002/api-docs
- Leave Request Service: http://localhost:5003/api-docs

## Roles

| Role | Permissions |
|---|---|
| `EMPLOYEE` | Register, login, apply for leave, view own leave history and balance |
| `MANAGER` | All employee actions + view/approve/reject all leave requests, manage users and balances |

## Shared Resources

The `shared/` directory contains middleware used by all services:

- `shared/middleware/authMiddleware.js` – JWT verification
- `shared/middleware/roleMiddleware.js` – Role-based access control
