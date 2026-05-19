# Database Design Analysis - NoSQL (MongoDB)

This document analyzes the Foster Care Management System's database design from a NoSQL perspective, suitable for CSE 411 Advanced Database Systems course.

---

## 1. Document Model Design

### 1.1 Collections Schema

The system uses **document-oriented storage** with the following collections:

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `agencies` | Foster care centers | name, address, phone, email |
| `staff` | Admin and staff users | full_name, email, role_field, agency_id |
| `children` | Orphaned children records | full_name, gender, date_of_birth, agency_id, guardian_id |
| `guardians` | Foster families | full_name, phone, address, verified, agency_id |
| `donors` | Donation contributors | full_name, email, donor_type, agency_id |
| `donations` | Donation records | amount, donor_id, agency_id, donation_date |
| `child_records` | Health/education records | child_id, record_type, health_status |
| `audit_logs` | Activity tracking | user_id, action, collection_name, timestamp |

### 1.2 Document Structure Example

```json
// Children Collection - Document Example
{
  "_id": ObjectId("..."),
  "full_name": "Rahim Islam",
  "gender": "male",
  "date_of_birth": "2015-03-15",
  "current_status": "in_foster",
  "agency_id": ObjectId("..."),
  "guardian_id": ObjectId("..."),  // Reference to guardian
  "admission_date": "2024-01-10",
  "photo_url": "/uploads/photos/...",
  "created_at": ISODate("2024-01-10T10:30:00Z"),
  "updated_at": ISODate("2024-01-10T10:30:00Z"),
  "deleted_at": null  // Soft delete field
}
```

---

## 2. NoSQL Concepts Implemented

### 2.1 Denormalized Data Model

**Why denormalization?**
- Reduces the need for JOIN operations
- Improves read performance for common queries
- Each document contains all related information

**Example**: The `children` document contains `guardian_id` directly instead of using a separate join table.

### 2.2 Embedding vs Referencing

| Pattern Used | Example | Reason |
|-------------|---------|--------|
| **Referencing** | children → guardians | When data is updated frequently |
| **Embedding** | N/A (not heavily used) | Would use for rarely changing static data |

### 2.3 Soft Deletes

Instead of physically deleting documents, we use a `deleted_at` field:

```python
# Query filter automatically excludes deleted records
def get_soft_delete_query(additional_query=None):
    base_query = {"deleted_at": None}
    if additional_query:
        base_query.update(additional_query)
    return base_query
```

**Benefits**:
- Data integrity - can recover accidentally deleted records
- Audit trail - maintains history
- Compliance - often required for legal purposes

---

## 3. Indexing Strategy

Indexes are created in `database.py` during initialization. Here's the strategy:

### 3.1 Index Types Used

| Index Type | Collection | Purpose |
|------------|------------|---------|
| Compound | children | `(agency_id, deleted_at)` - filtering + soft delete |
| Text | children, guardians | Full-text search on names |
| Single | donations | `(donation_date)` - date range queries |
| Unique | staff, donors | `(email)` - prevent duplicates, fast lookup |
| Compound | audit_logs | `(agency_id, timestamp)` - common admin query |

### 3.2 Why These Indexes?

1. **agency_id filter**: Every query filters by agency for multi-tenant isolation
2. **deleted_at filter**: Always exclude soft-deleted records
3. **Text indexes**: Enable search functionality without complex regex
4. **Unique indexes**: MongoDB enforces email uniqueness at database level

### 3.3 Query Optimization Example

**Before optimization** (full collection scan):
```javascript
db.children.find({ agency_id: ObjectId("..."), current_status: "pending" })
// Scans entire collection
```

**After optimization** (uses compound index):
```javascript
// Uses idx_children_agency_active index
db.children.find({ agency_id: ObjectId("..."), deleted_at: null })
// Index scan - much faster
```

---

## 4. Aggregation Pipelines

The system uses MongoDB's **aggregation framework** for reporting:

### 4.1 Donations Report Pipeline

```python
pipeline = [
    {"$match": query},                           // Filter by agency
    {"$group": {
        "_id": None,
        "total": {"$sum": "$amount"},           // Calculate total
        "count": {"$sum": 1}                    // Count records
    }}
]
```

**Pipeline breakdown**:
1. `$match`: Filter documents (like WHERE in SQL)
2. `$group`: Group and aggregate (like GROUP BY in SQL)
3. `$sum`: Calculate aggregate values

### 4.2 Children Status Report

```python
# Group by current_status to get counts
{"$group": {"_id": "$current_status", "count": {"$sum": 1}}}
```

This produces:
```json
[
  {"_id": "pending", "count": 15},
  {"_id": "in_foster", "count": 23},
  {"_id": "adopted", "count": 8}
]
```

---

## 5. Transactions (ACID)

### 5.1 Why Transactions?

The child-guardian assignment uses MongoDB transactions to ensure **atomicity**:

```python
with mongo_client.start_session() as session:
    with session.start_transaction():
        # Update child
        db.children.update_one(..., session=session)
        
        # Update guardian  
        db.guardians.update_one(..., session=session)
```

### 5.2 ACID Properties Demonstrated

| Property | Implementation |
|----------|---------------|
| **Atomicity** | Both updates succeed or both fail |
| **Consistency** | Database moves from one valid state to another |
| **Isolation** | Other operations see complete transaction |
| **Durability** | Once committed, persists even if system fails |

---

## 6. Multi-Tenant Data Isolation

### 6.1 Agency-Based Filtering

Every query includes agency_id filter:

```python
agency_id = get_user_agency_id(request.user_data)
query = get_soft_delete_query({"agency_id": agency_id} if agency_id else {})
```

### 6.1 Why This Design?

- **Security**: Each agency only sees their own data
- **Performance**: Agency_id indexes make filtering efficient
- **Simplicity**: No separate database/collection per agency

---

## 7. Query Patterns

### 7.1 Common Query Patterns

| Operation | Query Pattern | Index Used |
|-----------|---------------|------------|
| Get children by agency | `{agency_id: x, deleted_at: null}` | Compound index |
| Search children | `{agency_id: x, $or: [...]}` | Text + compound |
| Get donations by date | `{agency_id: x, donation_date: {...}}` | Compound |
| Audit logs by time | `{agency_id: x, timestamp: -1}` | Compound |

### 7.2 Example: Server-Side Search

```python
# Backend search query
search = request.args.get("search", "").strip()
if search:
    query["$or"] = [
        {"full_name": {"$regex": search, "$options": "i"}},
        {"current_status": {"$regex": search, "$options": "i"}},
    ]
```

This pushes search to the database level (server-side) instead of filtering in application (client-side).

---

## 8. Comparison: NoSQL vs SQL Concepts

| SQL Concept | MongoDB Equivalent |
|-------------|-------------------|
| Table | Collection |
| Row | Document |
| Column | Field |
| JOIN | $lookup / Embedding |
| WHERE | $match |
| GROUP BY | $group |
| ORDER BY | $sort |
| INDEX | create_index() |
| TRANSACTION | start_transaction() |

---

## 9. Design Decisions Summary

| Decision | Rationale |
|----------|-----------|
| Document model | Flexible schema for evolving data |
| Soft deletes | Data safety and compliance |
| Agency-based isolation | Multi-tenant security |
| Indexes on common queries | Performance optimization |
| Aggregation for reports | Built-in analytics capability |
| Transactions for critical ops | Data integrity |

---

## 10. Potential Improvements

For academic depth, consider:

1. **Shard keys**: Distribute data across servers for scale
2. **Atlas Search**: More advanced full-text search
3. **Change Streams**: Real-time notifications
4. **Time-series collections**: For donation tracking over time
5. **Schema validation**: Enforce document structure at DB level

---

*This documentation was prepared for CSE 411 Advanced Database Systems course project.*