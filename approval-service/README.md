# Approval Service

This is the **Approval Service** for the Smart Leave Management System.

## Port
- Runs on **5000**
- Swagger URL: **http://localhost:5000/api-docs**

## Folder Structure

```bash
approval-service/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── approvalController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   └── Approval.js
│   ├── routes/
│   │   └── approvalRoutes.js
│   ├── services/
│   │   ├── approvalService.js
│   │   └── externalServices.js
│   └── app.js
├── .env.example
├── package.json
├── postman_collection.json
├── server.js
├── swagger.yaml
└── README.md
```

## Main APIs
- `POST /api/approvals`
- `GET /api/approvals`
- `GET /api/approvals/:id`
- `GET /api/approvals/pending`
- `PUT /api/approvals/:id`
- `DELETE /api/approvals/:id`

## Run
```bash
npm install
cp .env.example .env
npm run dev
```

## Notes
- This service communicates with:
  - Auth & User Service
  - Leave Request Service
  - Leave Balance & Reporting Service
- On approval:
  - leave status is updated
  - user leave balance is deducted
  - balance/reporting service can be notified
