# API Endpoints

This document lists all API endpoints for the Foster Care Management System.

**Base URL:** `http://localhost:5000/api`

**Authentication:** All protected routes require header: `Authorization: Bearer <token>`

---

## Authentication

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login user |
| GET | `/auth/me` | Yes | Get current user |

### POST /auth/register
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "admin|staff|donor|guardian",
  "phone": "string"
}
```

### POST /auth/login
```json
{
  "email": "string",
  "password": "string"
}
```

---

## Agencies

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| GET | `/agencies` | Yes | Get all agencies |
| POST | `/agencies` | Yes | Create agency |
| GET | `/agencies/:id` | Yes | Get agency by ID |

---

## Children

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| GET | `/children` | Yes | Get all children |
| POST | `/children` | Yes | Create child |
| GET | `/children/:id` | Yes | Get child by ID |
| PUT | `/children/:id` | Yes | Update child |
| DELETE | `/children/:id` | Yes (Admin) | Delete child |

### POST /children
```json
{
  "full_name": "string",
  "agency_id": "string",
  "gender": "male|female|other",
  "date_of_birth": "date",
  "current_status": "pending|in_foster|reunified|adopted",
  "admission_date": "date",
  "photo_url": "string"
}
```

---

## Guardians

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| GET | `/guardians` | Yes | Get all guardians |
| POST | `/guardians` | Yes | Create guardian |
| GET | `/guardians/:id` | Yes | Get guardian by ID |
| PUT | `/guardians/:id` | Yes | Update guardian |
| DELETE | `/guardians/:id` | Yes (Admin) | Delete guardian |

### POST /guardians
```json
{
  "full_name": "string",
  "child_id": "string",
  "phone": "string",
  "address": "string",
  "national_id": "string",
  "verified": "boolean"
}
```

---

## Staff

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| GET | `/staff` | Yes (Admin) | Get all staff |
| POST | `/staff` | Yes (Admin) | Create staff |
| GET | `/staff/:id` | Yes | Get staff by ID |
| PUT | `/staff/:id` | Yes (Admin) | Update staff |
| DELETE | `/staff/:id` | Yes (Admin) | Delete staff |

### POST /staff
```json
{
  "full_name": "string",
  "email": "string",
  "password": "string",
  "role": "admin|staff",
  "phone": "string",
  "agency_id": "string",
  "status": "active|inactive"
}
```

---

## Donors

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| GET | `/donors` | Yes | Get all donors |
| POST | `/donors` | Yes | Create donor |
| GET | `/donors/:id` | Yes | Get donor by ID |
| PUT | `/donors/:id` | Yes | Update donor |

### POST /donors
```json
{
  "full_name": "string",
  "email": "string",
  "password": "string",
  "donor_type": "individual|NGO|corporate",
  "phone": "string"
}
```

---

## Donations

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| GET | `/donations` | Yes | Get all donations |
| POST | `/donations` | Yes | Create donation |
| GET | `/donations/:id` | Yes | Get donation by ID |

### POST /donations
```json
{
  "donor_id": "string",
  "agency_id": "string",
  "amount": "number",
  "purpose": "string",
  "donation_date": "date",
  "reference_no": "string",
  "receipt_url": "string"
}
```

---

## Child Records

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| GET | `/child_records` | Yes | Get all records |
| POST | `/child_records` | Yes | Create record |
| GET | `/child_records/:id` | Yes | Get record by ID |
| PUT | `/child_records/:id` | Yes | Update record |

### POST /child_records
```json
{
  "child_id": "string",
  "health_status": "string",
  "education_level": "string",
  "last_visit_date": "date",
  "notes": "string"
}
```

---

## File Uploads

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| POST | `/upload/photo` | Yes | Upload child photo |
| POST | `/upload/document` | Yes | Upload document |
| POST | `/upload/receipt` | Yes | Upload donation receipt |

**Content-Type:** `multipart/form-data`

**Body:** `file` (file field)

**Response:**
```json
{
  "message": "Photo uploaded successfully",
  "path": "/uploads/photos/abc123.jpg"
}
```

---

## Statistics

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| GET | `/stats` | Yes | Dashboard statistics |

### GET /stats Response
```json
{
  "total_children": 0,
  "total_guardians": 0,
  "total_donors": 0,
  "total_donations": 0,
  "total_staff": 0,
  "total_agencies": 0,
  "pending_children": 0,
  "in_foster": 0
}
```

---

## Health Check

| Method | Endpoint | Protected | Description |
|--------|----------|----------|-------------|
| GET | `/health` | No | API health check |

### GET /health Response
```json
{
  "status": "ok",
  "message": "FCMS API is running"
}
```

---

## Role Permissions

| Endpoint | Admin | Staff | Donor | Guardian |
|----------|-------|-------|-------|----------|
| /auth/* | ✓ | ✓ | ✓ | ✓ |
| /children | ✓ | ✓ | ✗ | ✗ |
| /guardians | ✓ | ✓ | ✗ | ✗ |
| /donors | ✓ | ✓ | ✗ | ✗ |
| /donations | ✓ | ✓ | ✓ | ✗ |
| /staff | ✓ | ✗ | ✗ | ✗ |
| /agencies | ✓ | ✓ | ✗ | ✗ |
| /child_records | ✓ | ✓ | ✗ | ✗ |
| /stats | ✓ | ✓ | ✗ | ✗ |
| /upload/* | ✓ | ✓ | ✓ | ✗ |

---

*API Version: 1.0*
*Last Updated: April 2026*