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
---

# Stage 3: Query Optimization

## Query Analysis
The original query is slow because it forces the database to perform a full table scan across 5,000,000 rows. Adding an index on *every* column is highly ineffective; it drastically slows down write operations and consumes massive storage space.

## The Solution
Create a **Composite Index** specifically targeting the fields used in the query: `(studentID, isRead, createdAt DESC)`. 

## Query for Placement Notifications (Last 7 Days)
```sql
SELECT studentID 
FROM notifications 
WHERE notificationType = 'Placement' 
  AND createdAt >= NOW() - INTERVAL 7 DAY;