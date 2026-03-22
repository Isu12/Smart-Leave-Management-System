# Approval Service
This microservice manages the workflow for approving or rejecting leave requests.

## Responsibilities
- Receive pending leave requests from the Leave Request Service.
- Route requests to the appropriate direct manager.
- Update the status of the request (APPROVED/REJECTED).
