# Leave Request Service

Microservice for submitting and storing leave requests (Member 2 — Node.js + Swagger).

## Responsibilities

- **POST** `/leave/apply` — create a leave request (stored as `PENDING`).
- **GET** `/leave/{userId}` — list all requests for that user (newest first).
- **GET** `/leaves/user/{userId}` — same as above (compatible with `auth-user-service` / `LEAVE_SERVICE_URL`).

## Rules implemented here

- Validates date range (`endDate` ≥ `startDate`).
- **Overlap detection:** rejects new applications that overlap any existing **PENDING** or **APPROVED** request for the same `userId` (HTTP 409).

> Leave balance checks and manager approve/reject are owned by other services; this service stores requests and exposes them for approval workflows.

## Run locally

1. Copy `.env.example` to `.env` if you need to change `PORT` or use a remote database.
2. `npm install`
3. `npm run dev` (or `npm start`)

By default the service uses **in-memory MongoDB** (`mongodb-memory-server`). Nothing else is required. The first run may download the embedded MongoDB binary once.

- **API:** `http://localhost:5001` (default; override with `PORT`)
- **Swagger UI:** `http://localhost:5001/api-docs`

### Using a real MongoDB (Atlas or local)

Set in `.env`:

```env
USE_IN_MEMORY_DB=false
MONGODB_URI=<your connection string>
```

## Environment

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5001`) |
| `USE_IN_MEMORY_DB` | Set to `false` only when using `MONGODB_URI`. If omitted or anything other than `false`, in-memory DB is used. |
| `MONGODB_URI` | Required when `USE_IN_MEMORY_DB=false` |
