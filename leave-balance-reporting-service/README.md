# Leave Balance & Reporting Service

## Purpose
The **Leave Balance & Reporting Service** is a dedicated microservice within the Smart Leave & Approval Management System. It acts as the single source of truth for all employee leave balances. It is strictly responsible for maintaining how many leave days each user has allocated, taken, and remaining, while providing robust reporting endpoints for managers and employees alike.

## Technologies Used
- **Node.js** & **Express.js**: For building the fast, scalable REST API.
- **MongoDB** & **Mongoose**: For NoSQL database storage, aggregate queries, and schema rules.
- **dotenv**: For managing environment variables securely outside the codebase.
- **cors** & **morgan**: For enabling cross-origin requests and maintaining clean console logs.

## Folder Structure (MVC Pattern)
```text
leave-balance-reporting-service/
├── src/
│   ├── config/          # Database connection setup
│   ├── controllers/     # Extracts HTTP request data and formats JSON responses
│   ├── middleware/      # Global error handlers
│   ├── models/          # Mongoose Database schemas (LeaveBalance, LeaveUsageLog)
│   ├── routes/          # API URL endpoint definitions
│   ├── services/        # Core business logic (math calculations, DB queries)
│   ├── app.js           # Express app setup and middleware registration
│   └── server.js        # Main entry point for the microservice
├── .env.example         # Template for required environment variables
├── package.json         # Project dependencies and script commands
└── seed.js              # Script to automatically populate the database with test data
```

## Setup Instructions & How to Run Locally

1. **Navigate** into the microservice directory:
   ```bash
   cd leave-balance-reporting-service
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a new file named `.env` in the root folder, and securely define your values (matching `.env.example`):
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/leave_balance_db
   ```
4. **Seed the Database (Optional but highly recommended)**:
   ```bash
   node seed.js
   ```
5. **Start the Server**:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:5001`.*

---

## API List

### 1. Balance Operations
- `POST /api/balance` - Create a new user's leave balance.
- `GET /api/balance` - Retrieve all leave balances.
- `GET /api/balance/:userId` - Retrieve a specific user's leave balance.
- `PUT /api/balance/:userId` - Update a specific user's leave balance manually.
- `DELETE /api/balance/:userId` - Delete a user's leave balance.

### 2. Integration with Approval Service
- `POST /api/balance/deduct` - Safely deducts approved leave days, checks if the balance is sufficient to prevent negative drops, and automatically records the action into the historical Usage Log.

### 3. Reporting
- `GET /api/reports/user/:userId` - Provides a user's current exact balance alongside their full chronological history of taken leaves.
- `GET /api/reports/monthly/:userId` - Provides a grouped summary of usage grouped by year and month.
- `GET /api/reports/top-leave-users` - Retrieves a descending leaderboard ranking of employees who have taken the most leaves.

---

## Sample Business Flow (Leave Deduction)
This microservice operates independently but is designed to integrate seamlessly with the larger ecosystem:
1. An employee requests **3 days** of leave in the *Request Service*.
2. A manager approves it in the **Approval Service**.
3. The Approval Service immediately triggers an internal HTTP POST request to this service (`/api/balance/deduct`).
4. Our decoupled `balanceService.js` **validates** the request, explicitly calculating `remaining = total - used`.
5. If the user doesn't have enough days, it rejects the deduction with a `400 Bad Request`. If they do, the balance updates successfully, a `LeaveUsageLog` is created for reporting, and `200 OK` is returned!

---

## Future Improvements
- **Authentication (JWT)**: Integrate JSON Web Token verification middleware to validate tokens passed from the Auth microservice on every request to prevent unauthorized DB changes.
- **Message Broker Integration**: Upgrade from REST-based HTTP POST calls to a Message Broker (like RabbitMQ, Kafka, or AWS SQS) for asynchronous, highly resilient, event-driven leave deductions.
- **Automated Year-End Rollover**: Add a node-cron job scheduler that automatically resets `usedLeave` and adds remaining days to the next year's `totalAllocated` balance at the end of December.
