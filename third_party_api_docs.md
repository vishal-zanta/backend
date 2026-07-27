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
- `classification` (Stringified JSON, **Required**): 
  - `subService` (ObjectId, **Required**): The sub-service reference ID.
  - `nature` (ObjectId, **Required**): The nature of grievance (Option ID, filtered by type `"Grievance Nature"`).
  - `scheme` (String, Optional): The associated government scheme.
  - `subject` (String, Optional): A short subject or title for the grievance.
- `evidence` (Stringified JSON, **Required**):
  - `frequency` (ObjectId, **Required**): How often the issue occurs (Option ID, filtered by type `"Evidence Frequency"`).
  - `details` (String, Optional): Full text description of the grievance.
  - `occurrenceDate` (ISO Date, Optional): The date the issue occurred.
- `citizenInfo` (Stringified JSON, **Required**):
  - `mobile` (String, **Required**): The citizen's 10-digit mobile number.
  - `fullName` (String, Optional): Citizen's full name.
  - `alternateMobile` (String, Optional)
  - `email` (String, Optional): Valid email format.
  - `preferredLanguage` (String, Optional)
- `address` (Stringified JSON, Optional):
  - `district` (ObjectId, **Required if address is passed**): The district reference (Demography ID).
  - `subdivision` (String, **Required if address is passed**): The subdivision name.
  - `state` (String, Optional), `villageOrWard` (String, Optional), `pinCode` (String, Optional), `landmark` (String, Optional)
- `impact` (Stringified JSON, Optional):
  - `affectedBeneficiary` (ObjectId, **Required if impact is passed**): Beneficiary type (Option ID, filtered by type `"Affected Beneficiaries"`).
  - `vulnerability` (Object, Optional): Object with boolean flags (`seniorCitizen`, `woman`, `personWithDisability`, `economicallyWeakerSection`).
  - `publicImpact` (ObjectId, Optional): The public impact scale (Option ID).
- `communication` (Stringified JSON, Optional):
  - `preferredMode` (ObjectId, Optional): Preferred communication method (Complaint Source ID).
  - `feedbackConsent` (Boolean, Optional), `satisfactionSurveyConsent` (Boolean, Optional)
- `channel` (ObjectId, **Required**): The communication channel (Complaint Source ID) this grievance originated from.
- `files` (File Upload, Optional): You can attach up to 5 files. **Allowed Formats:** Images (JPEG, PNG, WEBP), Video (MP4), and Audio (MPEG/MP3). Max 10MB per file.

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

---

## 6. Metadata APIs (Reference Data)
**Content-Type:** `application/json`

**Description:**
Fetch dropdown options and reference data required to correctly map IDs when creating a grievance. All these endpoints support standard filtering, search, and pagination query parameters (e.g., `?page=1&limit=50&search=xyz`).

**Endpoints:**

1. **Get Dropdown Options**
   `GET /api/v1/third-party/grievances/metadata/options`
   - Fetches options like vulnerability types, impact scales, etc.
   
2. **Get Complaint Sources**
   `GET /api/v1/third-party/grievances/metadata/complaint-sources`
   - Fetches available communication channels/sources.

3. **Get Demographics**
   `GET /api/v1/third-party/grievances/metadata/demographics`
   - Fetches states, districts, blocks, etc.
   - Example Filters: `?state=Bihar`, `?district=Patna`

4. **Get Departments**
   `GET /api/v1/third-party/grievances/metadata/departments`
   - Fetches all available departments.

5. **Get Services**
   `GET /api/v1/third-party/grievances/metadata/services`
   - Fetches services.
   - Example Filter: `?department=ObjectId`

6. **Get Sub-Services**
   `GET /api/v1/third-party/grievances/metadata/sub-services`
   - Fetches sub-services.
   - Example Filter: `?service=ObjectId`

**Response Example (200 OK):**
```json
{
  "status": 200,
  "message": "Fetched successfully",
  "data": {
    "docs": [
      {
        "_id": "64a2b3c...",
        "title": "Health Department",
        "titleHindi": "स्वास्थ्य विभाग"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```
