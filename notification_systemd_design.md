# Stage 1: API Design & Real-Time Mechanism

## Core Actions
1. Fetch all notifications for a logged-in student.
2. Mark a notification as read.
3. Receive real-time push notifications.

## REST API Endpoints

### 1. Get Notifications
* **Endpoint:** `GET /api/v1/notifications`
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "12345",
      "type": "Placement",
      "message": "Interview scheduled",
      "isRead": false,
      "createdAt": "2026-05-18T10:00:00Z"
    }
  ]
}
---

# Stage 2: Persistent Storage

## Database Choice: MongoDB (NoSQL)
A document database like MongoDB is highly recommended here. Notifications are write-heavy and schema requirements can evolve based on the notification type. MongoDB handles high-volume inserts efficiently.

## Schema
```json
{
  "_id": "ObjectId",
  "studentId": "String (Index)",
  "notificationType": "String (Enum: Event, Result, Placement)",
  "message": "String",
  "isRead": "Boolean",
  "createdAt": "Date"
}