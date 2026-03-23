# Leave Request Service
This microservice is the core engine for submitting and tracking leave requests.

## Responsibilities
- Allow employees to submit new leave requests (dates, reason, type).
- Validate requests against the Leave Balance service.
- Maintain the state and history of individual leave requests.
- Expose endpoints to check if a user is currently on an APPROVED leave (e.g. for Auth Service login locks).
