# Database Collections Schema

This document describes the MongoDB collections and their schemas for the Foster Care Management System.

---

## Multi-Center Architecture

The system supports **multiple Foster Care Centers (Agencies)**. Each center operates independently with its own:
- Admin user
- Staff members
- Children
- Guardians
- Donors
- Donations
- Child Records

All entities (except agencies themselves) are linked to a specific `agency_id` to ensure data isolation between centers.

---

## Collections Overview

| Collection | Description |
|-----------|-------------|
| agencies | Foster care centers (each admin creates one) |
| donors | Individual/NGO donors (linked to agency) |
| children | Orphaned children records (linked to agency) |
| guardians | Foster families and guardians (linked to agency) |
| staff | Social workers and employees (linked to agency) |
| child_records | Health and education records (linked to agency via child) |
| donations | Donation history and tracking (linked to agency) |

---

## agencies

```json
{
  "_id": "ObjectId",
  "name": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated unique ID |
| name | String | Yes | Agency name |
| address | String | No | Full address |
| phone | String | No | Contact number |
| email | String | No | Email address |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

---

## donors

```json
{
  "_id": "ObjectId",
  "full_name": "string",
  "donor_type": "individual|NGO|corporate",
  "phone": "string",
  "email": "string",
  "password": "hashed_string",
  "role": "donor",
  "agency_id": "ObjectId",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated unique ID |
| full_name | String | Yes | Donor full name |
| donor_type | String | Yes | Type: individual/NGO/corporate |
| phone | String | No | Contact number |
| email | String | Yes | Email (unique) |
| password | String | Yes | Bcrypt hashed password |
| role | String | Yes | Fixed: "donor" |
| agency_id | ObjectId | Yes | Foreign key to agencies (which center donor donates to) |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

---

## children

```json
{
  "_id": "ObjectId",
  "agency_id": "ObjectId",
  "full_name": "string",
  "gender": "male|female|other",
  "date_of_birth": "date",
  "current_status": "pending|in_foster|reunified|adopted",
  "admission_date": "date",
  "photo_url": "string",
  "documents": ["string"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated unique ID |
| agency_id | ObjectId | Yes | Foreign key to agencies |
| full_name | String | Yes | Child's full name |
| gender | String | No | male/female/other |
| date_of_birth | Date | No | Date of birth |
| current_status | String | Yes | pending/in_foster/reunified/adopted |
| admission_date | Date | Yes | Date of admission |
| photo_url | String | No | Path to photo |
| documents | Array | No | Array of document paths |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

---

## guardians

```json
{
  "_id": "ObjectId",
  "child_id": "ObjectId",
  "full_name": "string",
  "phone": "string",
  "address": "string",
  "national_id": "string",
  "verified": "boolean",
  "password": "hashed_string",
  "role": "guardian",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated unique ID |
| child_id | ObjectId | Yes | Foreign key to children |
| full_name | String | Yes | Guardian full name |
| phone | String | No | Contact number |
| address | String | No | Full address |
| national_id | String | No | National ID number |
| verified | Boolean | Yes | Verification status |
| password | String | Yes | Bcrypt hashed password |
| role | String | Yes | Fixed: "guardian" |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

---

## staff

```json
{
  "_id": "ObjectId",
  "agency_id": "ObjectId",
  "full_name": "string",
  "role_field": "admin|staff",
  "phone": "string",
  "email": "string",
  "password": "hashed_string",
  "status": "active|inactive",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated unique ID |
| agency_id | ObjectId | No | Foreign key to agencies |
| full_name | String | Yes | Staff full name |
| role_field | String | Yes | admin or staff |
| phone | String | No | Contact number |
| email | String | Yes | Email (unique) |
| password | String | Yes | Bcrypt hashed password |
| status | String | Yes | active/inactive |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

---

## child_records

```json
{
  "_id": "ObjectId",
  "child_id": "ObjectId",
  "health_status": "string",
  "education_level": "string",
  "last_visit_date": "date",
  "notes": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated unique ID |
| child_id | ObjectId | Yes | Foreign key to children |
| health_status | String | No | Health condition |
| education_level | String | No | Education level |
| last_visit_date | Date | No | Last checkup date |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

---

## donations

```json
{
  "_id": "ObjectId",
  "donor_id": "ObjectId",
  "agency_id": "ObjectId",
  "amount": "number",
  "purpose": "string",
  "donation_date": "date",
  "reference_no": "string",
  "receipt_url": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated unique ID |
| donor_id | ObjectId | Yes | Foreign key to donors |
| agency_id | ObjectId | Yes | Foreign key to agencies |
| amount | Number | Yes | Donation amount |
| purpose | String | No | Donation purpose |
| donation_date | Date | Yes | Date of donation |
| reference_no | String | No | Reference number |
| receipt_url | String | No | Path to receipt |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

---

*Schema Version: 1.0*
*Last Updated: April 2026*