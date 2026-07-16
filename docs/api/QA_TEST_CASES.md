# Detailed QA API Test Cases

This document contains comprehensive manual test cases, including field-level validations and specific error expectations. Payloads are provided as raw JSON blocks for easy copy-pasting.

## Module: System

### TC-001: Health Check
**Endpoint:** `GET {{baseUrl}}/health`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-002: Health Check (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/health`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

## Module: Auth (DONE)

### TC-003: Login (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/auth/login`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": "admin@example.com",
  "password": "1234"

// "email": "niraha90611@bevriz.com",
//   "password": "asdfasdf"
   
//   "token":""  required when user forgot and redirect to forget password page for reset password
}
```

---

### TC-004: Forgot Password (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/auth/forgot-password`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": "admin@example.com"
}
```

---

### TC-005: Forgot Password (Missing `email`)
**Endpoint:** `POST {{baseUrl}}/auth/forgot-password`

**Expected Outcome:** Status 400. Error: `email` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-006: Forgot Password (Null `email`)
**Endpoint:** `POST {{baseUrl}}/auth/forgot-password`

**Expected Outcome:** Status 400. Error: `email` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": null
}
```

---

### TC-007: Forgot Password (Invalid Type for `email`)
**Endpoint:** `POST {{baseUrl}}/auth/forgot-password`

**Expected Outcome:** Status 400. Error: `email` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": 12345
}
```

---

### TC-008: Get Profile
**Endpoint:** `GET {{baseUrl}}/auth/profile`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-009: Get Profile (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/auth/profile`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-010: logout
**Endpoint:** `POST {{baseUrl}}/auth/logout`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-011: logout (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/auth/logout`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-012: Update Profile (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/auth/user`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Updated Name",
  "password":"1234" // only if need to chng password
}
```

---

### TC-013: Update Profile (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/auth/user`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-014: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Invalid captcha`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-015: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `User not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-016: Edge Case - Unauthorized / Forbidden
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Invalid or expired token`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-017: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Invalid credentials`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-018: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `User not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-019: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Name or password is required`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-020: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `User not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-021: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `User not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-022: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `User not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: Users (DONE)

### TC-014: Get Users
**Endpoint:** `GET {{baseUrl}}/users?search=nira`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-015: Get Users (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/users?search=nira`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-016: Create User (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-017: Create User (Missing `name`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `name` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-018: Create User (Null `name`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `name` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": null,
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-019: Create User (Invalid Type for `name`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `name` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": 12345,
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-020: Create User (Missing `email`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `email` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "phone": "1234567891",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-021: Create User (Null `email`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `email` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": null,
  "phone": "1234567891",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-022: Create User (Invalid Type for `email`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `email` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": 12345,
  "phone": "1234567891",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-023: Create User (Missing `phone`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `phone` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-024: Create User (Null `phone`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `phone` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": null,
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-025: Create User (Invalid Type for `phone`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `phone` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": 12345,
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-026: Create User (Missing `password`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `password` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-027: Create User (Null `password`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `password` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": null,
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-028: Create User (Invalid Type for `password`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `password` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": 12345,
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-029: Create User (Missing `role`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `role` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": "123",
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-030: Create User (Null `role`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `role` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": "123",
  "role": null,
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-031: Create User (Invalid Type for `role`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `role` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": "123",
  "role": 12345,
  "district": "6a4cd6f9ac4068b43cf42d6f"
}
```

---

### TC-032: Create User (Missing `district`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `district` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e"
}
```

---

### TC-033: Create User (Null `district`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `district` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": null
}
```

---

### TC-034: Create User (Invalid Type for `district`)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 400. Error: `district` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "John Doe",
  "email": "fipanor105+55@duvips.com",
  "phone": "1234567891",
  "password": "123",
  "role": "6a4cd6f9ac4068b43cf42d6e",
  "district": 12345
}
```

---

### TC-035: Create User (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/users`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-036: Update User (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/users/:id`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Jane Doe",
  "status": "SUSPENDED"
}
```

---

### TC-037: Update User (Missing `name`)
**Endpoint:** `PUT {{baseUrl}}/users/:id`

**Expected Outcome:** Status 400. Error: `name` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "status": "SUSPENDED"
}
```

---

### TC-038: Update User (Null `name`)
**Endpoint:** `PUT {{baseUrl}}/users/:id`

**Expected Outcome:** Status 400. Error: `name` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": null,
  "status": "SUSPENDED"
}
```

---

### TC-039: Update User (Invalid Type for `name`)
**Endpoint:** `PUT {{baseUrl}}/users/:id`

**Expected Outcome:** Status 400. Error: `name` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": 12345,
  "status": "SUSPENDED"
}
```

---

### TC-040: Update User (Missing `status`)
**Endpoint:** `PUT {{baseUrl}}/users/:id`

**Expected Outcome:** Status 400. Error: `status` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Jane Doe"
}
```

---

### TC-041: Update User (Null `status`)
**Endpoint:** `PUT {{baseUrl}}/users/:id`

**Expected Outcome:** Status 400. Error: `status` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Jane Doe",
  "status": null
}
```

---

### TC-042: Update User (Invalid Type for `status`)
**Endpoint:** `PUT {{baseUrl}}/users/:id`

**Expected Outcome:** Status 400. Error: `status` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Jane Doe",
  "status": 12345
}
```

---

### TC-043: Update User (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/users/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-044: Delete User
**Endpoint:** `DELETE {{baseUrl}}/users/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-045: Delete User (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/users/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-046: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `User with this email or phone already exists`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-047: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Role not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-048: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `User not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-049: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `User not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: Roles (DONE)

### TC-046: Get Roles
**Endpoint:** `GET {{baseUrl}}/roles`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-047: Get Roles (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/roles`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-048: Create Role (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "designationEnglish": "New Role",
  "designationHindi": "\u0928\u092f\u093e \u092a\u0926",
  "level": "L3"
}
```

---

### TC-049: Create Role (Missing `designationEnglish`)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 400. Error: `designationEnglish` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "designationHindi": "\u0928\u092f\u093e \u092a\u0926",
  "level": "L3"
}
```

---

### TC-050: Create Role (Null `designationEnglish`)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 400. Error: `designationEnglish` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "designationEnglish": null,
  "designationHindi": "\u0928\u092f\u093e \u092a\u0926",
  "level": "L3"
}
```

---

### TC-051: Create Role (Invalid Type for `designationEnglish`)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 400. Error: `designationEnglish` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "designationEnglish": 12345,
  "designationHindi": "\u0928\u092f\u093e \u092a\u0926",
  "level": "L3"
}
```

---

### TC-052: Create Role (Missing `designationHindi`)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 400. Error: `designationHindi` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "designationEnglish": "New Role",
  "level": "L3"
}
```

---

### TC-053: Create Role (Null `designationHindi`)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 400. Error: `designationHindi` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "designationEnglish": "New Role",
  "designationHindi": null,
  "level": "L3"
}
```

---

### TC-054: Create Role (Invalid Type for `designationHindi`)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 400. Error: `designationHindi` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "designationEnglish": "New Role",
  "designationHindi": 12345,
  "level": "L3"
}
```

---

### TC-055: Create Role (Missing `level`)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 400. Error: `level` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "designationEnglish": "New Role",
  "designationHindi": "\u0928\u092f\u093e \u092a\u0926"
}
```

---

### TC-056: Create Role (Null `level`)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 400. Error: `level` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "designationEnglish": "New Role",
  "designationHindi": "\u0928\u092f\u093e \u092a\u0926",
  "level": null
}
```

---

### TC-057: Create Role (Invalid Type for `level`)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 400. Error: `level` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "designationEnglish": "New Role",
  "designationHindi": "\u0928\u092f\u093e \u092a\u0926",
  "level": 12345
}
```

---

### TC-058: Create Role (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/roles`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-059: Update Role (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/roles/:id`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "level": "L4"
}
```

---

### TC-060: Update Role (Missing `level`)
**Endpoint:** `PUT {{baseUrl}}/roles/:id`

**Expected Outcome:** Status 400. Error: `level` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-061: Update Role (Null `level`)
**Endpoint:** `PUT {{baseUrl}}/roles/:id`

**Expected Outcome:** Status 400. Error: `level` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "level": null
}
```

---

### TC-062: Update Role (Invalid Type for `level`)
**Endpoint:** `PUT {{baseUrl}}/roles/:id`

**Expected Outcome:** Status 400. Error: `level` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "level": 12345
}
```

---

### TC-063: Update Role (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/roles/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-064: Delete Role
**Endpoint:** `DELETE {{baseUrl}}/roles/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-065: Delete Role (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/roles/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-066: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Role with this designation already exists`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-067: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Role not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-068: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Role not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: Complaint Sources (DONE)

### TC-066: Create Complaint Source (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/complaint-sources`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "IVR"
}
```

---

### TC-067: Create Complaint Source (Missing `title`)
**Endpoint:** `POST {{baseUrl}}/complaint-sources`

**Expected Outcome:** Status 400. Error: `title` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-068: Create Complaint Source (Null `title`)
**Endpoint:** `POST {{baseUrl}}/complaint-sources`

**Expected Outcome:** Status 400. Error: `title` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": null
}
```

---

### TC-069: Create Complaint Source (Invalid Type for `title`)
**Endpoint:** `POST {{baseUrl}}/complaint-sources`

**Expected Outcome:** Status 400. Error: `title` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": 12345
}
```

---

### TC-070: Create Complaint Source (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/complaint-sources`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-071: Get Complaint Sources
**Endpoint:** `GET {{baseUrl}}/complaint-sources`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-072: Get Complaint Sources (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/complaint-sources`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-073: Update Complaint Source (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/complaint-sources/:id`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "WhatsApp"
}
```

---

### TC-074: Update Complaint Source (Missing `title`)
**Endpoint:** `PUT {{baseUrl}}/complaint-sources/:id`

**Expected Outcome:** Status 400. Error: `title` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-075: Update Complaint Source (Null `title`)
**Endpoint:** `PUT {{baseUrl}}/complaint-sources/:id`

**Expected Outcome:** Status 400. Error: `title` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": null
}
```

---

### TC-076: Update Complaint Source (Invalid Type for `title`)
**Endpoint:** `PUT {{baseUrl}}/complaint-sources/:id`

**Expected Outcome:** Status 400. Error: `title` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": 12345
}
```

---

### TC-077: Update Complaint Source (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/complaint-sources/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-078: Delete Complaint Source
**Endpoint:** `DELETE {{baseUrl}}/complaint-sources/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-079: Delete Complaint Source (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/complaint-sources/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-080: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Complaint source with this title already exists`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-081: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Complaint source not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-082: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Complaint source not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: Sub-Services (DONE)

### TC-080: Create Sub-Service (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-081: Create Sub-Service (Missing `title`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `title` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-082: Create Sub-Service (Null `title`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `title` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": null,
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-083: Create Sub-Service (Invalid Type for `title`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `title` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": 12345,
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-084: Create Sub-Service (Missing `titleHindi`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `titleHindi` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-085: Create Sub-Service (Null `titleHindi`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `titleHindi` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": null,
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-086: Create Sub-Service (Invalid Type for `titleHindi`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `titleHindi` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": 12345,
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-087: Create Sub-Service (Missing `sla`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `sla` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "geoTagged": true,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-088: Create Sub-Service (Null `sla`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `sla` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": null,
  "geoTagged": true,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-089: Create Sub-Service (Invalid Type for `sla`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `sla` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": "invalid_string",
  "geoTagged": true,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-090: Create Sub-Service (Missing `geoTagged`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `geoTagged` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-091: Create Sub-Service (Null `geoTagged`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `geoTagged` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": null,
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-092: Create Sub-Service (Invalid Type for `geoTagged`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `geoTagged` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": "invalid_string",
  "fieldVisit": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-093: Create Sub-Service (Missing `fieldVisit`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `fieldVisit` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": true,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-094: Create Sub-Service (Null `fieldVisit`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `fieldVisit` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": null,
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-095: Create Sub-Service (Invalid Type for `fieldVisit`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `fieldVisit` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": "invalid_string",
  "service": "6a4dd4bcc4997b14929505d8"
}
```

---

### TC-096: Create Sub-Service (Missing `service`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `service` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": true
}
```

---

### TC-097: Create Sub-Service (Null `service`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `service` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": true,
  "service": null
}
```

---

### TC-098: Create Sub-Service (Invalid Type for `service`)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 400. Error: `service` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Pothole Repair",
  "titleHindi": "\u0917\u0921\u094d\u0922\u093e \u092e\u0930\u092e\u094d\u092e\u0924",
  "sla": 48,
  "geoTagged": true,
  "fieldVisit": true,
  "service": 12345
}
```

---

### TC-099: Create Sub-Service (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/services/sub`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-100: Get Sub-Services
**Endpoint:** `GET {{baseUrl}}/services/sub`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-101: Get Sub-Services (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/services/sub`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-102: Update Sub-Service (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/services/sub/:id`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "sla": 24
}
```

---

### TC-103: Update Sub-Service (Missing `sla`)
**Endpoint:** `PUT {{baseUrl}}/services/sub/:id`

**Expected Outcome:** Status 400. Error: `sla` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-104: Update Sub-Service (Null `sla`)
**Endpoint:** `PUT {{baseUrl}}/services/sub/:id`

**Expected Outcome:** Status 400. Error: `sla` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "sla": null
}
```

---

### TC-105: Update Sub-Service (Invalid Type for `sla`)
**Endpoint:** `PUT {{baseUrl}}/services/sub/:id`

**Expected Outcome:** Status 400. Error: `sla` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "sla": "invalid_string"
}
```

---

### TC-106: Update Sub-Service (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/services/sub/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-107: Delete Sub-Service
**Endpoint:** `DELETE {{baseUrl}}/services/sub/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-108: Delete Sub-Service (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/services/sub/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-109: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Service with this title already exists`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-110: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Service not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-111: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Service not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-112: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Main service not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-113: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Sub-Service not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-114: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Sub-Service not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: Services (DONE)

### TC-109: Create Service (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Public Works",
  "titleHindi": "\u0938\u093e\u0930\u094d\u0935\u091c\u0928\u093f\u0915 \u0915\u093e\u0930\u094d\u092f",
  "department": "PWD"
}
```

---

### TC-110: Create Service (Missing `title`)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 400. Error: `title` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "titleHindi": "\u0938\u093e\u0930\u094d\u0935\u091c\u0928\u093f\u0915 \u0915\u093e\u0930\u094d\u092f",
  "department": "PWD"
}
```

---

### TC-111: Create Service (Null `title`)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 400. Error: `title` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": null,
  "titleHindi": "\u0938\u093e\u0930\u094d\u0935\u091c\u0928\u093f\u0915 \u0915\u093e\u0930\u094d\u092f",
  "department": "PWD"
}
```

---

### TC-112: Create Service (Invalid Type for `title`)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 400. Error: `title` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": 12345,
  "titleHindi": "\u0938\u093e\u0930\u094d\u0935\u091c\u0928\u093f\u0915 \u0915\u093e\u0930\u094d\u092f",
  "department": "PWD"
}
```

---

### TC-113: Create Service (Missing `titleHindi`)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 400. Error: `titleHindi` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Public Works",
  "department": "PWD"
}
```

---

### TC-114: Create Service (Null `titleHindi`)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 400. Error: `titleHindi` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Public Works",
  "titleHindi": null,
  "department": "PWD"
}
```

---

### TC-115: Create Service (Invalid Type for `titleHindi`)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 400. Error: `titleHindi` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Public Works",
  "titleHindi": 12345,
  "department": "PWD"
}
```

---

### TC-116: Create Service (Missing `department`)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 400. Error: `department` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Public Works",
  "titleHindi": "\u0938\u093e\u0930\u094d\u0935\u091c\u0928\u093f\u0915 \u0915\u093e\u0930\u094d\u092f"
}
```

---

### TC-117: Create Service (Null `department`)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 400. Error: `department` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Public Works",
  "titleHindi": "\u0938\u093e\u0930\u094d\u0935\u091c\u0928\u093f\u0915 \u0915\u093e\u0930\u094d\u092f",
  "department": null
}
```

---

### TC-118: Create Service (Invalid Type for `department`)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 400. Error: `department` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Public Works",
  "titleHindi": "\u0938\u093e\u0930\u094d\u0935\u091c\u0928\u093f\u0915 \u0915\u093e\u0930\u094d\u092f",
  "department": 12345
}
```

---

### TC-119: Create Service (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/services`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-120: Get Services
**Endpoint:** `GET {{baseUrl}}/services`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-121: Get Services (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/services`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-122: Update Service (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/services/:id`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Public Works Updated"
}
```

---

### TC-123: Update Service (Missing `title`)
**Endpoint:** `PUT {{baseUrl}}/services/:id`

**Expected Outcome:** Status 400. Error: `title` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-124: Update Service (Null `title`)
**Endpoint:** `PUT {{baseUrl}}/services/:id`

**Expected Outcome:** Status 400. Error: `title` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": null
}
```

---

### TC-125: Update Service (Invalid Type for `title`)
**Endpoint:** `PUT {{baseUrl}}/services/:id`

**Expected Outcome:** Status 400. Error: `title` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": 12345
}
```

---

### TC-126: Update Service (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/services/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-127: Delete Service
**Endpoint:** `DELETE {{baseUrl}}/services/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-128: Delete Service (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/services/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

## Module: SLA Configs (DONE)

### TC-129: Create SLA Config (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "subService": "6a4dd4ddc4997b14929505d9",
  "escalations": [
    {
      "role": "6a4cd6f9ac4068b43cf42d6e",
      "slaHours": 12
    },
    {
      "role": "6a4cd6f9ac4068b43cf42d6f",
      "slaHours": 12
    }
  ],
  "officer": true
}
```

---

### TC-130: Create SLA Config (Missing `subService`)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 400. Error: `subService` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "escalations": [
    {
      "role": "6a4cd6f9ac4068b43cf42d6e",
      "slaHours": 12
    },
    {
      "role": "6a4cd6f9ac4068b43cf42d6f",
      "slaHours": 12
    }
  ],
  "officer": true
}
```

---

### TC-131: Create SLA Config (Null `subService`)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 400. Error: `subService` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "subService": null,
  "escalations": [
    {
      "role": "6a4cd6f9ac4068b43cf42d6e",
      "slaHours": 12
    },
    {
      "role": "6a4cd6f9ac4068b43cf42d6f",
      "slaHours": 12
    }
  ],
  "officer": true
}
```

---

### TC-132: Create SLA Config (Invalid Type for `subService`)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 400. Error: `subService` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "subService": 12345,
  "escalations": [
    {
      "role": "6a4cd6f9ac4068b43cf42d6e",
      "slaHours": 12
    },
    {
      "role": "6a4cd6f9ac4068b43cf42d6f",
      "slaHours": 12
    }
  ],
  "officer": true
}
```

---

### TC-133: Create SLA Config (Missing `escalations`)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 400. Error: `escalations` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "subService": "6a4dd4ddc4997b14929505d9",
  "officer": true
}
```

---

### TC-134: Create SLA Config (Null `escalations`)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 400. Error: `escalations` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "subService": "6a4dd4ddc4997b14929505d9",
  "escalations": null,
  "officer": true
}
```

---

### TC-135: Create SLA Config (Invalid Type for `escalations`)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 400. Error: `escalations` must be an array.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "subService": "6a4dd4ddc4997b14929505d9",
  "escalations": "not_an_array",
  "officer": true
}
```

---

### TC-136: Create SLA Config (Missing `officer`)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 400. Error: `officer` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "subService": "6a4dd4ddc4997b14929505d9",
  "escalations": [
    {
      "role": "6a4cd6f9ac4068b43cf42d6e",
      "slaHours": 12
    },
    {
      "role": "6a4cd6f9ac4068b43cf42d6f",
      "slaHours": 12
    }
  ]
}
```

---

### TC-137: Create SLA Config (Null `officer`)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 400. Error: `officer` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "subService": "6a4dd4ddc4997b14929505d9",
  "escalations": [
    {
      "role": "6a4cd6f9ac4068b43cf42d6e",
      "slaHours": 12
    },
    {
      "role": "6a4cd6f9ac4068b43cf42d6f",
      "slaHours": 12
    }
  ],
  "officer": null
}
```

---

### TC-138: Create SLA Config (Invalid Type for `officer`)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 400. Error: `officer` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "subService": "6a4dd4ddc4997b14929505d9",
  "escalations": [
    {
      "role": "6a4cd6f9ac4068b43cf42d6e",
      "slaHours": 12
    },
    {
      "role": "6a4cd6f9ac4068b43cf42d6f",
      "slaHours": 12
    }
  ],
  "officer": "invalid_string"
}
```

---

### TC-139: Create SLA Config (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-140: Get SLA Configs
**Endpoint:** `GET {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-141: Get SLA Configs (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/sla-configs`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-142: Update SLA Config (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/sla-configs/:id`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "active": false
}
```

---

### TC-143: Update SLA Config (Missing `active`)
**Endpoint:** `PUT {{baseUrl}}/sla-configs/:id`

**Expected Outcome:** Status 400. Error: `active` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-144: Update SLA Config (Null `active`)
**Endpoint:** `PUT {{baseUrl}}/sla-configs/:id`

**Expected Outcome:** Status 400. Error: `active` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "active": null
}
```

---

### TC-145: Update SLA Config (Invalid Type for `active`)
**Endpoint:** `PUT {{baseUrl}}/sla-configs/:id`

**Expected Outcome:** Status 400. Error: `active` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "active": "invalid_string"
}
```

---

### TC-146: Update SLA Config (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/sla-configs/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-147: Delete SLA Config
**Endpoint:** `DELETE {{baseUrl}}/sla-configs/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-148: Delete SLA Config (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/sla-configs/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-149: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `SLA config for this Sub-Service already exists`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-150: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Sub-Service not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-151: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Role not found for escalation id: ${esc.role}`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-152: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Total escalation time (${totalSlaHours}h) cannot be greater than Sub-Service SLA (${subServiceData.sla}h)`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-153: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `SLA Config not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-154: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Role not found for escalation id: ${esc.role}`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-155: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Total escalation time (${totalSlaHours}h) cannot be greater than Sub-Service SLA (${subServiceData.sla}h)`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-156: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `SLA Config not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: ULBs (DONE)

### TC-149: Create ULB (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna Municipal Corporation",
  "nameHindi": "\u092a\u091f\u0928\u093e \u0928\u0917\u0930 \u0928\u093f\u0917\u092e",
  "wards": 75,
  "district": "6a4de44dba63bfc9458dea34"
}
```

---

### TC-150: Create ULB (Missing `name`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `name` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "nameHindi": "\u092a\u091f\u0928\u093e \u0928\u0917\u0930 \u0928\u093f\u0917\u092e",
  "wards": 75,
  "district": "6a4de44dba63bfc9458dea34"
}
```

---

### TC-151: Create ULB (Null `name`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `name` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": null,
  "nameHindi": "\u092a\u091f\u0928\u093e \u0928\u0917\u0930 \u0928\u093f\u0917\u092e",
  "wards": 75,
  "district": "6a4de44dba63bfc9458dea34"
}
```

---

### TC-152: Create ULB (Invalid Type for `name`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `name` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": 12345,
  "nameHindi": "\u092a\u091f\u0928\u093e \u0928\u0917\u0930 \u0928\u093f\u0917\u092e",
  "wards": 75,
  "district": "6a4de44dba63bfc9458dea34"
}
```

---

### TC-153: Create ULB (Missing `nameHindi`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `nameHindi` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna Municipal Corporation",
  "wards": 75,
  "district": "6a4de44dba63bfc9458dea34"
}
```

---

### TC-154: Create ULB (Null `nameHindi`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `nameHindi` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna Municipal Corporation",
  "nameHindi": null,
  "wards": 75,
  "district": "6a4de44dba63bfc9458dea34"
}
```

---

### TC-155: Create ULB (Invalid Type for `nameHindi`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `nameHindi` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna Municipal Corporation",
  "nameHindi": 12345,
  "wards": 75,
  "district": "6a4de44dba63bfc9458dea34"
}
```

---

### TC-156: Create ULB (Missing `wards`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `wards` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna Municipal Corporation",
  "nameHindi": "\u092a\u091f\u0928\u093e \u0928\u0917\u0930 \u0928\u093f\u0917\u092e",
  "district": "6a4de44dba63bfc9458dea34"
}
```

---

### TC-157: Create ULB (Null `wards`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `wards` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna Municipal Corporation",
  "nameHindi": "\u092a\u091f\u0928\u093e \u0928\u0917\u0930 \u0928\u093f\u0917\u092e",
  "wards": null,
  "district": "6a4de44dba63bfc9458dea34"
}
```

---

### TC-158: Create ULB (Invalid Type for `wards`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `wards` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna Municipal Corporation",
  "nameHindi": "\u092a\u091f\u0928\u093e \u0928\u0917\u0930 \u0928\u093f\u0917\u092e",
  "wards": "invalid_string",
  "district": "6a4de44dba63bfc9458dea34"
}
```

---

### TC-159: Create ULB (Missing `district`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `district` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna Municipal Corporation",
  "nameHindi": "\u092a\u091f\u0928\u093e \u0928\u0917\u0930 \u0928\u093f\u0917\u092e",
  "wards": 75
}
```

---

### TC-160: Create ULB (Null `district`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `district` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna Municipal Corporation",
  "nameHindi": "\u092a\u091f\u0928\u093e \u0928\u0917\u0930 \u0928\u093f\u0917\u092e",
  "wards": 75,
  "district": null
}
```

---

### TC-161: Create ULB (Invalid Type for `district`)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 400. Error: `district` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna Municipal Corporation",
  "nameHindi": "\u092a\u091f\u0928\u093e \u0928\u0917\u0930 \u0928\u093f\u0917\u092e",
  "wards": 75,
  "district": 12345
}
```

---

### TC-162: Create ULB (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-163: Get ULBs
**Endpoint:** `GET {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-164: Get ULBs (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/demography/ulb`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-165: Update ULB (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/demography/ulb/:id`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "wards": 80
}
```

---

### TC-166: Update ULB (Missing `wards`)
**Endpoint:** `PUT {{baseUrl}}/demography/ulb/:id`

**Expected Outcome:** Status 400. Error: `wards` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-167: Update ULB (Null `wards`)
**Endpoint:** `PUT {{baseUrl}}/demography/ulb/:id`

**Expected Outcome:** Status 400. Error: `wards` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "wards": null
}
```

---

### TC-168: Update ULB (Invalid Type for `wards`)
**Endpoint:** `PUT {{baseUrl}}/demography/ulb/:id`

**Expected Outcome:** Status 400. Error: `wards` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "wards": "invalid_string"
}
```

---

### TC-169: Update ULB (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/demography/ulb/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-170: Delete ULB
**Endpoint:** `DELETE {{baseUrl}}/demography/ulb/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-171: Delete ULB (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/demography/ulb/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-172: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `District with this name already exists`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-173: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Demography not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-174: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Demography not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-175: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `District not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-176: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `ULB not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-177: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `ULB not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: Demography (Districts) (DONE)

### TC-172: Create Demography (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": "South Bihar",
  "population": 2442383,
  "urban": true
}
```

---

### TC-173: Create Demography (Missing `name`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `name` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": "South Bihar",
  "population": 2442383,
  "urban": true
}
```

---

### TC-174: Create Demography (Null `name`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `name` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": null,
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": "South Bihar",
  "population": 2442383,
  "urban": true
}
```

---

### TC-175: Create Demography (Invalid Type for `name`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `name` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": 12345,
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": "South Bihar",
  "population": 2442383,
  "urban": true
}
```

---

### TC-176: Create Demography (Missing `nameHindi`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `nameHindi` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "division": "Patna",
  "zone": "South Bihar",
  "population": 2442383,
  "urban": true
}
```

---

### TC-177: Create Demography (Null `nameHindi`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `nameHindi` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": null,
  "division": "Patna",
  "zone": "South Bihar",
  "population": 2442383,
  "urban": true
}
```

---

### TC-178: Create Demography (Invalid Type for `nameHindi`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `nameHindi` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": 12345,
  "division": "Patna",
  "zone": "South Bihar",
  "population": 2442383,
  "urban": true
}
```

---

### TC-179: Create Demography (Missing `division`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `division` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "zone": "South Bihar",
  "population": 2442383,
  "urban": true
}
```

---

### TC-180: Create Demography (Null `division`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `division` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": null,
  "zone": "South Bihar",
  "population": 2442383,
  "urban": true
}
```

---

### TC-181: Create Demography (Invalid Type for `division`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `division` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": 12345,
  "zone": "South Bihar",
  "population": 2442383,
  "urban": true
}
```

---

### TC-182: Create Demography (Missing `zone`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `zone` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "population": 2442383,
  "urban": true
}
```

---

### TC-183: Create Demography (Null `zone`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `zone` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": null,
  "population": 2442383,
  "urban": true
}
```

---

### TC-184: Create Demography (Invalid Type for `zone`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `zone` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": 12345,
  "population": 2442383,
  "urban": true
}
```

---

### TC-185: Create Demography (Missing `population`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `population` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": "South Bihar",
  "urban": true
}
```

---

### TC-186: Create Demography (Null `population`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `population` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": "South Bihar",
  "population": null,
  "urban": true
}
```

---

### TC-187: Create Demography (Invalid Type for `population`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `population` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": "South Bihar",
  "population": "invalid_string",
  "urban": true
}
```

---

### TC-188: Create Demography (Missing `urban`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `urban` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": "South Bihar",
  "population": 2442383
}
```

---

### TC-189: Create Demography (Null `urban`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `urban` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": "South Bihar",
  "population": 2442383,
  "urban": null
}
```

---

### TC-190: Create Demography (Invalid Type for `urban`)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 400. Error: `urban` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "name": "Patna",
  "nameHindi": "\u092a\u091f\u0928\u093e",
  "division": "Patna",
  "zone": "South Bihar",
  "population": 2442383,
  "urban": "invalid_string"
}
```

---

### TC-191: Create Demography (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/demography`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-192: Get Demographies
**Endpoint:** `GET {{baseUrl}}/demography`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-193: Get Demographies (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/demography`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-194: Update Demography (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/demography/:id`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "population": 2500000
}
```

---

### TC-195: Update Demography (Missing `population`)
**Endpoint:** `PUT {{baseUrl}}/demography/:id`

**Expected Outcome:** Status 400. Error: `population` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-196: Update Demography (Null `population`)
**Endpoint:** `PUT {{baseUrl}}/demography/:id`

**Expected Outcome:** Status 400. Error: `population` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "population": null
}
```

---

### TC-197: Update Demography (Invalid Type for `population`)
**Endpoint:** `PUT {{baseUrl}}/demography/:id`

**Expected Outcome:** Status 400. Error: `population` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "population": "invalid_string"
}
```

---

### TC-198: Update Demography (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/demography/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-199: Delete Demography
**Endpoint:** `DELETE {{baseUrl}}/demography/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-200: Delete Demography (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/demography/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

## Module: Officer Tagging (DONE)

### TC-201: Create Officer Tagging (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "officer": "6a4cd8a079068ed6b9ce9990",
  "services": [
    "6a4dd4ddc4997b14929505d9"
  ],
  "wards": [
    "Ward 1"
  ]
}
```

---

### TC-202: Create Officer Tagging (Missing `officer`)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `officer` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "services": [
    "6a4dd4ddc4997b14929505d9"
  ],
  "wards": [
    "Ward 1"
  ]
}
```

---

### TC-203: Create Officer Tagging (Null `officer`)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `officer` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "officer": null,
  "services": [
    "6a4dd4ddc4997b14929505d9"
  ],
  "wards": [
    "Ward 1"
  ]
}
```

---

### TC-204: Create Officer Tagging (Invalid Type for `officer`)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `officer` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "officer": 12345,
  "services": [
    "6a4dd4ddc4997b14929505d9"
  ],
  "wards": [
    "Ward 1"
  ]
}
```

---

### TC-205: Create Officer Tagging (Missing `services`)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `services` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "officer": "6a4cd8a079068ed6b9ce9990",
  "wards": [
    "Ward 1"
  ]
}
```

---

### TC-206: Create Officer Tagging (Null `services`)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `services` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "officer": "6a4cd8a079068ed6b9ce9990",
  "services": null,
  "wards": [
    "Ward 1"
  ]
}
```

---

### TC-207: Create Officer Tagging (Invalid Type for `services`)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `services` must be an array.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "officer": "6a4cd8a079068ed6b9ce9990",
  "services": "not_an_array",
  "wards": [
    "Ward 1"
  ]
}
```

---

### TC-208: Create Officer Tagging (Missing `wards`)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `wards` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "officer": "6a4cd8a079068ed6b9ce9990",
  "services": [
    "6a4dd4ddc4997b14929505d9"
  ]
}
```

---

### TC-209: Create Officer Tagging (Null `wards`)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `wards` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "officer": "6a4cd8a079068ed6b9ce9990",
  "services": [
    "6a4dd4ddc4997b14929505d9"
  ],
  "wards": null
}
```

---

### TC-210: Create Officer Tagging (Invalid Type for `wards`)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `wards` must be an array.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "officer": "6a4cd8a079068ed6b9ce9990",
  "services": [
    "6a4dd4ddc4997b14929505d9"
  ],
  "wards": "not_an_array"
}
```

---

### TC-211: Create Officer Tagging (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-212: Get Officer Taggings
**Endpoint:** `GET {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-213: Get Officer Taggings (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-214: Update Officer Tagging (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "wards": [
    "Ward 1",
    "Ward 2"
  ]
}
```

---

### TC-215: Update Officer Tagging (Missing `wards`)
**Endpoint:** `PUT {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `wards` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-216: Update Officer Tagging (Null `wards`)
**Endpoint:** `PUT {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `wards` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "wards": null
}
```

---

### TC-217: Update Officer Tagging (Invalid Type for `wards`)
**Endpoint:** `PUT {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 400. Error: `wards` must be an array.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "wards": "not_an_array"
}
```

---

### TC-218: Update Officer Tagging (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-219: Delete Officer Tagging
**Endpoint:** `DELETE {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-220: Delete Officer Tagging (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/officer-taggings`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-221: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Officer (User) not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-222: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `One or more provided Sub-Services are invalid`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-223: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Tagging for this officer already exists`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-224: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Officer Tagging not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-225: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `One or more provided Sub-Services are invalid`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-226: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Officer Tagging not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: Workflow Levels (DONE)

### TC-221: Create Workflow Level (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "role": "ROLE_ID",
  "description": "First Level"
}
```

---

### TC-222: Create Workflow Level (Missing `role`)
**Endpoint:** `POST {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 400. Error: `role` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "description": "First Level"
}
```

---

### TC-223: Create Workflow Level (Null `role`)
**Endpoint:** `POST {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 400. Error: `role` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "role": null,
  "description": "First Level"
}
```

---

### TC-224: Create Workflow Level (Invalid Type for `role`)
**Endpoint:** `POST {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 400. Error: `role` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "role": 12345,
  "description": "First Level"
}
```

---

### TC-225: Create Workflow Level (Missing `description`)
**Endpoint:** `POST {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 400. Error: `description` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "role": "ROLE_ID"
}
```

---

### TC-226: Create Workflow Level (Null `description`)
**Endpoint:** `POST {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 400. Error: `description` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "role": "ROLE_ID",
  "description": null
}
```

---

### TC-227: Create Workflow Level (Invalid Type for `description`)
**Endpoint:** `POST {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 400. Error: `description` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "role": "ROLE_ID",
  "description": 12345
}
```

---

### TC-228: Create Workflow Level (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-229: Get Workflow Levels
**Endpoint:** `GET {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-230: Get Workflow Levels (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-231: Update Workflow Level (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "description": "Updated First Level"
}
```

---

### TC-232: Update Workflow Level (Missing `description`)
**Endpoint:** `PUT {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 400. Error: `description` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-233: Update Workflow Level (Null `description`)
**Endpoint:** `PUT {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 400. Error: `description` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "description": null
}
```

---

### TC-234: Update Workflow Level (Invalid Type for `description`)
**Endpoint:** `PUT {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 400. Error: `description` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "description": 12345
}
```

---

### TC-235: Update Workflow Level (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-236: Delete Workflow Level
**Endpoint:** `DELETE {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-237: Delete Workflow Level (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/workflow-levels`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-238: Bulk Update Orders (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/workflow-levels/bulk-order`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "updates": [
    {
      "id": "LEVEL_ID_1",
      "order": 1
    },
    {
      "id": "LEVEL_ID_2",
      "order": 2
    }
  ]
}
```

---

### TC-239: Bulk Update Orders (Missing `updates`)
**Endpoint:** `POST {{baseUrl}}/workflow-levels/bulk-order`

**Expected Outcome:** Status 400. Error: `updates` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-240: Bulk Update Orders (Null `updates`)
**Endpoint:** `POST {{baseUrl}}/workflow-levels/bulk-order`

**Expected Outcome:** Status 400. Error: `updates` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "updates": null
}
```

---

### TC-241: Bulk Update Orders (Invalid Type for `updates`)
**Endpoint:** `POST {{baseUrl}}/workflow-levels/bulk-order`

**Expected Outcome:** Status 400. Error: `updates` must be an array.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "updates": "not_an_array"
}
```

---

### TC-242: Bulk Update Orders (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/workflow-levels/bulk-order`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-243: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Role not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-244: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Workflow level for this role already exists`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-245: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Workflow level not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-246: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Role not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-247: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Workflow level not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-248: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Updates must be an array of objects with id and order`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: captcha (DONE)

### TC-243: get captcha
**Endpoint:** `GET {{baseUrl}}/captcha`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-244: get captcha (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/captcha`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

## Module: citizen

### TC-245: sent otp (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758",
  "captchaId": "4727845a",
  "captchaValue": "rxiDQn"
}
```

---

### TC-246: sent otp (Missing `mobile`)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 400. Error: `mobile` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "captchaId": "4727845a",
  "captchaValue": "rxiDQn"
}
```

---

### TC-247: sent otp (Null `mobile`)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 400. Error: `mobile` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": null,
  "captchaId": "4727845a",
  "captchaValue": "rxiDQn"
}
```

---

### TC-248: sent otp (Invalid Type for `mobile`)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 400. Error: `mobile` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": 12345,
  "captchaId": "4727845a",
  "captchaValue": "rxiDQn"
}
```

---

### TC-249: sent otp (Missing `captchaId`)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 400. Error: `captchaId` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758",
  "captchaValue": "rxiDQn"
}
```

---

### TC-250: sent otp (Null `captchaId`)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 400. Error: `captchaId` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758",
  "captchaId": null,
  "captchaValue": "rxiDQn"
}
```

---

### TC-251: sent otp (Invalid Type for `captchaId`)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 400. Error: `captchaId` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758",
  "captchaId": 12345,
  "captchaValue": "rxiDQn"
}
```

---

### TC-252: sent otp (Missing `captchaValue`)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 400. Error: `captchaValue` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758",
  "captchaId": "4727845a"
}
```

---

### TC-253: sent otp (Null `captchaValue`)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 400. Error: `captchaValue` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758",
  "captchaId": "4727845a",
  "captchaValue": null
}
```

---

### TC-254: sent otp (Invalid Type for `captchaValue`)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 400. Error: `captchaValue` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758",
  "captchaId": "4727845a",
  "captchaValue": 12345
}
```

---

### TC-255: sent otp (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/citizen/send-otp`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-256: feedback of complain (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/grievances/citizen/:id/feedback`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "rating": 5,
  "feedbackText": "test feed back"
}
```

---

### TC-257: feedback of complain (Missing `rating`)
**Endpoint:** `POST {{baseUrl}}/grievances/citizen/:id/feedback`

**Expected Outcome:** Status 400. Error: `rating` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "feedbackText": "test feed back"
}
```

---

### TC-258: feedback of complain (Null `rating`)
**Endpoint:** `POST {{baseUrl}}/grievances/citizen/:id/feedback`

**Expected Outcome:** Status 400. Error: `rating` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "rating": null,
  "feedbackText": "test feed back"
}
```

---

### TC-259: feedback of complain (Invalid Type for `rating`)
**Endpoint:** `POST {{baseUrl}}/grievances/citizen/:id/feedback`

**Expected Outcome:** Status 400. Error: `rating` must be a number.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "rating": "invalid_string",
  "feedbackText": "test feed back"
}
```

---

### TC-260: feedback of complain (Missing `feedbackText`)
**Endpoint:** `POST {{baseUrl}}/grievances/citizen/:id/feedback`

**Expected Outcome:** Status 400. Error: `feedbackText` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "rating": 5
}
```

---

### TC-261: feedback of complain (Null `feedbackText`)
**Endpoint:** `POST {{baseUrl}}/grievances/citizen/:id/feedback`

**Expected Outcome:** Status 400. Error: `feedbackText` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "rating": 5,
  "feedbackText": null
}
```

---

### TC-262: feedback of complain (Invalid Type for `feedbackText`)
**Endpoint:** `POST {{baseUrl}}/grievances/citizen/:id/feedback`

**Expected Outcome:** Status 400. Error: `feedbackText` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "rating": 5,
  "feedbackText": 12345
}
```

---

### TC-263: feedback of complain (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/grievances/citizen/:id/feedback`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-264: add complain
**Endpoint:** `POST {{baseUrl}}/grievances/citizen`

**Expected Outcome:** Status 200/201. Success.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** FormData / Other (See Postman)

---

### TC-265: add complain (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/grievances/citizen`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-266: login (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/citizen/login`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758",
  "otp": "123456"
}
```

---

### TC-267: login (Missing `mobile`)
**Endpoint:** `POST {{baseUrl}}/citizen/login`

**Expected Outcome:** Status 400. Error: `mobile` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "otp": "123456"
}
```

---

### TC-268: login (Null `mobile`)
**Endpoint:** `POST {{baseUrl}}/citizen/login`

**Expected Outcome:** Status 400. Error: `mobile` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": null,
  "otp": "123456"
}
```

---

### TC-269: login (Invalid Type for `mobile`)
**Endpoint:** `POST {{baseUrl}}/citizen/login`

**Expected Outcome:** Status 400. Error: `mobile` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": 12345,
  "otp": "123456"
}
```

---

### TC-270: login (Missing `otp`)
**Endpoint:** `POST {{baseUrl}}/citizen/login`

**Expected Outcome:** Status 400. Error: `otp` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758"
}
```

---

### TC-271: login (Null `otp`)
**Endpoint:** `POST {{baseUrl}}/citizen/login`

**Expected Outcome:** Status 400. Error: `otp` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758",
  "otp": null
}
```

---

### TC-272: login (Invalid Type for `otp`)
**Endpoint:** `POST {{baseUrl}}/citizen/login`

**Expected Outcome:** Status 400. Error: `otp` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "mobile": "8307753758",
  "otp": 12345
}
```

---

### TC-273: get profile
**Endpoint:** `GET {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-274: get profile (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-275: get dashboard-analytics
**Endpoint:** `GET {{baseUrl}}/citizen/dashboard-analytics`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-276: get dashboard-analytics (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/citizen/dashboard-analytics`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-277: get complain by id
**Endpoint:** `GET {{baseUrl}}/grievances/citizen/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-278: get complain by id (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/grievances/citizen/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-279: get complains
**Endpoint:** `GET {{baseUrl}}/grievances/citizen`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-280: get complains (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/grievances/citizen`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-281: update profile (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": "tkb8059@gmail.com",
  "preferredLanguage": "English",
  "name": "tarun kumar"
}
```

---

### TC-282: update profile (Missing `email`)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 400. Error: `email` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "preferredLanguage": "English",
  "name": "tarun kumar"
}
```

---

### TC-283: update profile (Null `email`)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 400. Error: `email` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": null,
  "preferredLanguage": "English",
  "name": "tarun kumar"
}
```

---

### TC-284: update profile (Invalid Type for `email`)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 400. Error: `email` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": 12345,
  "preferredLanguage": "English",
  "name": "tarun kumar"
}
```

---

### TC-285: update profile (Missing `preferredLanguage`)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 400. Error: `preferredLanguage` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": "tkb8059@gmail.com",
  "name": "tarun kumar"
}
```

---

### TC-286: update profile (Null `preferredLanguage`)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 400. Error: `preferredLanguage` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": "tkb8059@gmail.com",
  "preferredLanguage": null,
  "name": "tarun kumar"
}
```

---

### TC-287: update profile (Invalid Type for `preferredLanguage`)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 400. Error: `preferredLanguage` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": "tkb8059@gmail.com",
  "preferredLanguage": 12345,
  "name": "tarun kumar"
}
```

---

### TC-288: update profile (Missing `name`)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 400. Error: `name` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": "tkb8059@gmail.com",
  "preferredLanguage": "English"
}
```

---

### TC-289: update profile (Null `name`)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 400. Error: `name` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": "tkb8059@gmail.com",
  "preferredLanguage": "English",
  "name": null
}
```

---

### TC-290: update profile (Invalid Type for `name`)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 400. Error: `name` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "email": "tkb8059@gmail.com",
  "preferredLanguage": "English",
  "name": 12345
}
```

---

### TC-291: update profile (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/citizen/profile`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-292: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `mobile, captchaId, and captchaValue are required`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-293: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `error.message || "Invalid Captcha`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-294: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `mobile and otp are required`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-295: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `error.message || "Invalid OTP`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-296: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Invalid email format`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-297: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 409. Error: `Email already in use`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-298: Edge Case - Unauthorized / Forbidden
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 401. Error: `Unauthorized`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: options

### TC-292: get options types
**Endpoint:** `GET {{baseUrl}}/options/types`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-293: get options types (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/options/types`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-294: get options
**Endpoint:** `GET {{baseUrl}}/options`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-295: get options (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/options`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-296: add options (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/options`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
    "title":"Community",
    "type":"publicImpact"
}
// (Self / Family / Community
```

---

### TC-297: add options (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/options`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-298: edit (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/options/6a4f8beef1d6b486f5b8e31a`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Complaint",
  "type": "grievanceNature"
}
```

---

### TC-299: edit (Missing `title`)
**Endpoint:** `PUT {{baseUrl}}/options/6a4f8beef1d6b486f5b8e31a`

**Expected Outcome:** Status 400. Error: `title` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "type": "grievanceNature"
}
```

---

### TC-300: edit (Null `title`)
**Endpoint:** `PUT {{baseUrl}}/options/6a4f8beef1d6b486f5b8e31a`

**Expected Outcome:** Status 400. Error: `title` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": null,
  "type": "grievanceNature"
}
```

---

### TC-301: edit (Invalid Type for `title`)
**Endpoint:** `PUT {{baseUrl}}/options/6a4f8beef1d6b486f5b8e31a`

**Expected Outcome:** Status 400. Error: `title` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": 12345,
  "type": "grievanceNature"
}
```

---

### TC-302: edit (Missing `type`)
**Endpoint:** `PUT {{baseUrl}}/options/6a4f8beef1d6b486f5b8e31a`

**Expected Outcome:** Status 400. Error: `type` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Complaint"
}
```

---

### TC-303: edit (Null `type`)
**Endpoint:** `PUT {{baseUrl}}/options/6a4f8beef1d6b486f5b8e31a`

**Expected Outcome:** Status 400. Error: `type` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Complaint",
  "type": null
}
```

---

### TC-304: edit (Invalid Type for `type`)
**Endpoint:** `PUT {{baseUrl}}/options/6a4f8beef1d6b486f5b8e31a`

**Expected Outcome:** Status 400. Error: `type` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "title": "Complaint",
  "type": 12345
}
```

---

### TC-305: edit (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/options/6a4f8beef1d6b486f5b8e31a`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-306: delete option
**Endpoint:** `DELETE {{baseUrl}}/options/6a4f8beef1d6b486f5b8e31a`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-307: delete option (Unauthorized)
**Endpoint:** `DELETE {{baseUrl}}/options/6a4f8beef1d6b486f5b8e31a`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-308: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `title and type are required`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-309: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Option with title '${title}' already exists in type '${type}'`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-310: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Option not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-311: Edge Case - Duplicate Entry
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Option with title '${option.title}' already exists in type '${option.type}'`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-312: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Option not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: Grievance

### TC-308: get all complaints for cce and admin
**Endpoint:** `GET {{baseUrl}}/grievances/all`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-309: get all complaints for cce and admin (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/grievances/all`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-310: get all complaints for cce and admin details
**Endpoint:** `GET {{baseUrl}}/grievances/all/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-311: get all complaints for cce and admin details (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/grievances/all/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-312: get all complaints for officer
**Endpoint:** `GET {{baseUrl}}/grievances/officer`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-313: get all complaints for officer (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/grievances/officer`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-314: get officer dashboard analitics
**Endpoint:** `GET {{baseUrl}}/grievances/officer/dashboard-analytics?filter`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-315: get officer dashboard analitics (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/grievances/officer/dashboard-analytics?filter`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-316: get admin dashboard analitics
**Endpoint:** `GET {{baseUrl}}/grievances/admin/dashboard-analytics?filter`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-317: get admin dashboard analitics (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/grievances/admin/dashboard-analytics?filter`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-318: get complaints details for officer
**Endpoint:** `GET {{baseUrl}}/grievances/officer/detail/:id`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-319: get complaints details for officer (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/grievances/officer/detail/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-320: transfer to officer (Valid Payload)
**Endpoint:** `PATCH {{baseUrl}}/grievances/officer/:id/transfer`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
    "assignedOfficer":"6a4cd72ecca0894bf179398e" //officer id 
 }
```

---

### TC-321: transfer to officer (Unauthorized)
**Endpoint:** `PATCH {{baseUrl}}/grievances/officer/:id/transfer`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-322: add geo tagged images
**Endpoint:** `POST {{baseUrl}}/grievances/officer/:id/geotagged-images`

**Expected Outcome:** Status 200/201. Success.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** FormData / Other (See Postman)

---

### TC-323: add geo tagged images (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/grievances/officer/:id/geotagged-images`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-324: update status (Valid Payload)
**Endpoint:** `PATCH {{baseUrl}}/grievances/officer/:id/status`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
    "status":"RESOLVED", //officer id
    // "remarks":""  only when its completed or resolved
 }

//  "OPEN",
//           "IN_PROGRESS",
//           "RESOLVED",
//           "CLOSED",
//           "REOPENED",
//           "ESCALATED"
```

---

### TC-325: update status (Unauthorized)
**Endpoint:** `PATCH {{baseUrl}}/grievances/officer/:id/status`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-326: update priority (Valid Payload)
**Endpoint:** `PATCH {{baseUrl}}/grievances/officer/:id/priority`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
    "assignedPriority":"NORMAL"
 }

// ["NORMAL", "URGENT", "CRITICAL", "PENDING"]
```

---

### TC-327: update priority (Unauthorized)
**Endpoint:** `PATCH {{baseUrl}}/grievances/officer/:id/priority`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-328: add complain
**Endpoint:** `POST {{baseUrl}}/grievances/officer/create`

**Expected Outcome:** Status 200/201. Success.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** FormData / Other (See Postman)

---

### TC-329: add complain (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/grievances/officer/create`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-330: update complain
**Endpoint:** `PUT {{baseUrl}}/grievances/officer/:id`

**Expected Outcome:** Status 200/201. Success.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** FormData / Other (See Postman)

---

### TC-331: update complain (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/grievances/officer/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-332: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 401. Error: `Unauthorized. Citizen not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-333: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Invalid JSON format in form-data fields.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-334: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `classification and evidence are required.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-335: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Invalid JSON format in form-data fields.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-336: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `classification and evidence are required.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-337: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `citizenInfo.mobile is required when creating a grievance on behalf of a citizen.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-338: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 401. Error: `Unauthorized. Citizen not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-339: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 401. Error: `Unauthorized. Citizen not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-340: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-341: Edge Case - Unauthorized / Forbidden
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 403. Error: `Access denied. You do not own this grievance.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-342: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 401. Error: `Unauthorized. Officer not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-343: Edge Case - Unauthorized / Forbidden
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 401. Error: `Unauthorized.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-344: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `A valid star rating between 1 and 5 is required.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-345: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-346: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 403. Error: `You are not authorized to review this grievance.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-347: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Feedback can only be submitted for RESOLVED or CLOSED grievances.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-348: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Feedback has already been submitted for this grievance and cannot be changed.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-349: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-350: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-351: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `New assignedOfficer ID is required.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-352: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-353: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-354: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Status is required.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-355: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-356: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-357: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `assignedPriority is required.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-358: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-359: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `No images provided.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-360: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-361: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `File ${file.originalname} is not a valid image.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-362: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Failed to parse EXIF data for ${file.originalname}. Geotagging is mandatory for this service.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-363: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Image ${file.originalname} is not geotagged. This service strictly requires geotagged images. Please ensure location services are enabled on your camera app.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-364: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-365: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 401. Error: `Unauthorized. Officer not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-366: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Grievance not found.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-367: Edge Case - Unauthorized / Forbidden
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 403. Error: `Access denied. This grievance is not assigned to you.`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: visits

### TC-332: get visists
**Endpoint:** `GET {{baseUrl}}/visits`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-333: get visists (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/visits`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-334: update status/shedule (Valid Payload)
**Endpoint:** `PUT {{baseUrl}}/visits/:id`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{

"status":"SCHEDULED", //enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS'],
"schedule": "2026-06-30" 
 // "remarks":""  only when its completed

}
```

---

### TC-335: update status/shedule (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/visits/:id`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-336: Edge Case - Unauthorized / Forbidden
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 401. Error: `Unauthorized`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-337: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `Field visit not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: activities

### TC-336: add activity
**Endpoint:** `POST {{baseUrl}}/activity/pulse`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-337: add activity (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/activity/pulse`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-338: get count of acitve officers
**Endpoint:** `GET {{baseUrl}}/activity/active-users`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-339: get count of acitve officers (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/activity/active-users`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-340: admin- logout users
**Endpoint:** `POST {{baseUrl}}/activity/admin-logout/:userId`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-341: admin- logout users (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/activity/admin-logout/:userId`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-342: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `User not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: break

### TC-342: add / end break
**Endpoint:** `POST {{baseUrl}}/breaks/toggle`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-343: add / end break (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/breaks/toggle`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-344: get break status
**Endpoint:** `GET {{baseUrl}}/breaks/status`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-345: get break status (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/breaks/status`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-346: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `User not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-347: Edge Case - Invalid ID / Entity Not Found
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 404. Error: `User not found`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

## Module: chats

### TC-346: get conversation
**Endpoint:** `GET {{baseUrl}}/chat/conversations`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-347: get conversation (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/chat/conversations`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-348: get online status
**Endpoint:** `GET {{baseUrl}}/chat/status/:userid`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-349: get online status (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/chat/status/:userid`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-350: get conversation messages
**Endpoint:** `GET {{baseUrl}}/chat/messages/6a55cf96f2d9fd522fe8f610?page=1&limit=10`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-351: get conversation messages (Unauthorized)
**Endpoint:** `GET {{baseUrl}}/chat/messages/6a55cf96f2d9fd522fe8f610?page=1&limit=10`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-352: mark read msseages
**Endpoint:** `PUT {{baseUrl}}/chat/messages/:id/read`

**Expected Outcome:** Status 200 OK. Data returned successfully.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `None`

---

### TC-353: mark read msseages (Unauthorized)
**Endpoint:** `PUT {{baseUrl}}/chat/messages/:id/read`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-354: add convestation with user (Valid Payload)
**Endpoint:** `POST {{baseUrl}}/chat/conversation`

**Expected Outcome:** Status 200/201. Success response.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "targetUserId": "6a523f56478b1301a8b5e00b"
}
```

---

### TC-355: add convestation with user (Missing `targetUserId`)
**Endpoint:** `POST {{baseUrl}}/chat/conversation`

**Expected Outcome:** Status 400. Error: `targetUserId` is required.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{}
```

---

### TC-356: add convestation with user (Null `targetUserId`)
**Endpoint:** `POST {{baseUrl}}/chat/conversation`

**Expected Outcome:** Status 400. Error: `targetUserId` cannot be null.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "targetUserId": null
}
```

---

### TC-357: add convestation with user (Invalid Type for `targetUserId`)
**Endpoint:** `POST {{baseUrl}}/chat/conversation`

**Expected Outcome:** Status 400. Error: `targetUserId` must be a string.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload (What I Pass):**
```json
{
  "targetUserId": 12345
}
```

---

### TC-358: add convestation with user (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/chat/conversation`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---

### TC-359: send messages
**Endpoint:** `POST {{baseUrl}}/chat/message`

**Expected Outcome:** Status 200/201. Success.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** FormData / Other (See Postman)

---

### TC-360: send messages (Unauthorized)
**Endpoint:** `POST {{baseUrl}}/chat/message`

**Expected Outcome:** Status 401. Error: Unauthorized access.

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** No Auth Header

---


#### Custom Edge Cases (Extracted from Code)

### TC-361: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Target user ID is required`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-362: Edge Case - Validation Failure
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Cannot chat with yourself`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-363: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Conversation ID is required`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-364: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `Content or file is required`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-365: Edge Case - Unauthorized / Forbidden
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 403. Error: `Invalid conversation or access denied`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-366: Edge Case - Unauthorized / Forbidden
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 403. Error: `Invalid conversation or access denied`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-367: Edge Case - Unauthorized / Forbidden
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 403. Error: `Invalid conversation or access denied`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

### TC-368: Edge Case - Missing Requirement
**Endpoint:** (Dependent on specific trigger)

**Expected Outcome:** Status 400. Error: `User ID is required`

**Actual Outcome:** __________________

**Status:** [ ] Pass &nbsp; [ ] Fail

**Payload:** `Trigger specific condition to cause this error`

---

