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

  ---

# Stage 4: Performance & User Experience

Fetching directly from the DB on every page load overwhelms the database. 

## Solutions
1. **Caching Layer (Redis):** Cache the unread notifications for active users in a Redis cluster. On page load, the frontend hits Redis instead of the primary DB.
2. **Pagination:** Only fetch the top 10 notifications initially. Use infinite scroll to load more.
* **Tradeoffs:** Redis introduces state management complexity to ensure cache consistency, and requires additional infrastructure costs.

---

# Stage 5: Reliability and Bulk Processing

## Shortcomings of the Current Implementation
The current loop is synchronous. If `send_email` fails midway, the loop crashes, and the remaining students never get their notifications. Saving to the DB and sending emails should **not** happen synchronously together. 

## Redesign: Message Queues
Save the notification to the DB instantly, and push the actual email delivery tasks to an asynchronous message queue (like RabbitMQ) with automatic retries.

## Revised Pseudocode
```python
function notify_all(student_ids: array, message: string):
    # Bulk insert to DB for high speed
    save_bulk_to_db(student_ids, message)
    
    # Push tasks to asynchronous Message Queue
    for student_id in student_ids:
        message_queue.push(task_type="email", id=student_id, msg=message)
        message_queue.push(task_type="app_push", id=student_id, msg=message)

# Background Worker (Runs independently)
function process_queue(task):
    try:
        if task.type == "email": send_email(task.id, task.msg)
    except Exception:
        message_queue.retry_later(task)

---

# Stage 6: Priority Inbox Implementation

The implementation for the Priority Inbox involves fetching notifications dynamically from the evaluation server and sorting them in memory based on a composite priority score. 

## Weighting Criteria
* **Placement**: Weight 3 (Highest Priority)
* **Result**: Weight 2
* **Event**: Weight 1

## Tie-breaking Logic
When two notifications have identical type weights, they are sorted by recency (Timestamp) in descending order to ensure the newest critical updates are displayed first. 

The complete, functional implementation code has been successfully executed and added to the `notification_app_be/priority_inbox.js` directory, with console logs verifying the correct execution and filtering of the top 10 items.