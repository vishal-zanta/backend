# Bihar CRM - Third-Party API Documentation

All Third-Party APIs require an API Key to be sent in the headers.

**Authentication Header:**
`x-api-key: <YOUR_API_KEY>`

---

## 1. Register a Grievance
**Endpoint:** `POST /api/v1/third-party/grievances`
**Content-Type:** `multipart/form-data`

**Description:**
Submit a new grievance into the CRM.

**Fields (Form-Data):**
- `classification` (Stringified JSON, Required): E.g., `{"department": "ObjectId", "service": "ObjectId", "subService": "ObjectId", "description": "Text"}`
- `address` (Stringified JSON, Required): E.g., `{"district": "ObjectId", "pincode": "123456", "block": "Text", "panchayat": "Text", "addressLine1": "Text"}`
- `citizenInfo` (Stringified JSON, Required): E.g., `{"fullName": "John Doe", "mobile": "9999999999", "email": "test@test.com"}`
- `evidence` (Stringified JSON, Optional): E.g., `{"photos": [], "videos": [], "documents": []}`
- `impact` (Stringified JSON, Optional): E.g., `{"scale": "INDIVIDUAL", "severity": "HIGH", "isRecurring": false}`
- `communication` (Stringified JSON, Optional): E.g., `{"preferredMethod": "SMS", "language": "Hindi"}`
- `channel` (ObjectId, Optional): If omitted, it will automatically link to the channel matching your API key name.
- `files` (File Upload, Optional): You can attach up to 5 files (images, videos, or audio).

**Response (201 Created):**
```json
{
  "status": 201,
  "message": "Grievance submitted successfully via Third Party API",
  "data": {
    "grievanceId": "BR-2026-0001",
    "_id": "64a2b3c4..."
  }
}
```

---

## 2. Track Grievances
**Endpoint:** `GET /api/v1/third-party/grievances/track`
**Content-Type:** `application/json`

**Description:**
Fetch a paginated list of grievances created by your API Key. The results are securely isolated.

**Query Parameters (Filters):**
- `grievanceId` (String): Search for a specific grievance ID (e.g., BR-2026-0001).
- `department` (String): Comma-separated list of Department ObjectIds to filter by.
- `service` (String): Comma-separated list of Service ObjectIds to filter by.
- `subService` (String): Comma-separated list of SubService ObjectIds to filter by.
- `division` (String): Comma-separated list of District (Division) ObjectIds.
- `startDate` (ISO Date): Filter grievances created on or after this date.
- `endDate` (ISO Date): Filter grievances created on or before this date.
- `page` (Number): Pagination page number (Default: 1).
- `limit` (Number): Number of items per page (Default: 10).

*Note: If no dates or specific `grievanceId` are provided, the API automatically defaults to returning grievances from the last 1 month.*
*Note 2: If you pass `department`, `service`, and `subService` simultaneously, the API will smartly intersect them to find matching sub-services.*

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Grievances fetched successfully",
  "data": {
    "docs": [ { ...grievance object... } ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

## 3. Get Grievance Details
**Endpoint:** `GET /api/v1/third-party/grievances/:id`
**Content-Type:** `application/json`

**Description:**
Fetch the full details of a specific grievance, including populated relationships, SLA data, and the live timeline log.

**Path Parameters:**
- `id`: Can be either the MongoDB `_id` OR the human-readable `grievanceId` (e.g., BR-2026-0001).

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Grievance details retrieved successfully",
  "data": {
    "_id": "...",
    "grievanceId": "BR-2026-0001",
    "status": "PENDING",
    "classification": { ...fully populated... },
    "address": { ...fully populated... },
    "assignedOfficer": { ...fully populated... },
    "timeline": [ { ...timeline event logs... } ],
    "slaHours": 48
  }
}
```

---

## 4. Update Grievance Status
**Endpoint:** `PATCH /api/v1/third-party/grievances/:id`
**Content-Type:** `application/json`

**Description:**
Update the status of a grievance. This action securely records to the internal system timeline, attributing the update to your API Key.

**Path Parameters:**
- `id`: MongoDB `_id` OR `grievanceId`.

**Body:**
- `status` (String, Required): The new status (e.g., "RESOLVED", "CLOSED", "REOPENED").
- `remarks` (String, Optional): Context/remarks for the status change.

*Rules:*
- Changing to `RESOLVED` requires the grievance to already have geotagged photos and a completed field visit.
- Changing to `REOPENED` requires the grievance to currently be in a `RESOLVED` or `CLOSED` state.

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Grievance status changed to RESOLVED.",
  "data": { ...updated grievance... }
}
```

---

## 5. Update Grievance Priority
**Endpoint:** `PATCH /api/v1/third-party/grievances/:id/priority`
**Content-Type:** `application/json`

**Description:**
Update the priority level of a grievance. This action securely logs the priority change to the internal system timeline.

**Path Parameters:**
- `id`: MongoDB `_id` OR `grievanceId`.

**Body:**
- `assignedPriority` (String, Required): The new priority (e.g., "NORMAL", "URGENT", "CRITICAL").

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Grievance priority changed to URGENT.",
  "data": { ...updated grievance... }
}
```
