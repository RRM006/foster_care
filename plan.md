# Foster Care Management System - Implementation Plan

This document outlines the phased implementation roadmap to transform the system into a production-ready foster care management solution.

---

## Phase 1: Critical Features (Data Safety & User Management)

### 1.1 Soft Deletes
- **Description**: Instead of permanently deleting records, mark them as deleted with timestamp
- **Collections affected**: children, guardians, donors, staff, agencies, donations, child_records
- **Implementation**:
  - Add `deleted_at` field to all collections
  - Add `deleted_by` field to track who deleted
  - Update all DELETE endpoints to use soft delete
  - Update GET endpoints to filter out deleted records by default
  - Add option to view/restore deleted records (admin only)

### 1.2 Profile Management
- **Description**: Allow users to view and update their own profile
- **Implementation**:
  - Add `GET /api/auth/profile` endpoint - returns current user's profile
  - Add `PUT /api/auth/profile` endpoint - update own profile (name, phone)
  - Return agency info in profile response

### 1.3 Password Change
- **Description**: Allow users to change their password securely
- **Implementation**:
  - Add `PUT /api/auth/change-password` endpoint
  - Require current password verification
  - Validate new password strength
  - Update password hash in database

---

## Phase 2: Data Integrity & Performance

### 2.1 Audit Logging
- **Description**: Track all create/update/delete actions for accountability
- **Implementation**:
  - Create `audit_logs` collection
  - Log schema: user_id, action, collection_name, record_id, timestamp, old_value, new_value
  - Create middleware to automatically log all mutations
  - Add `GET /api/audit-logs` endpoint (admin only)
  - Filter by user, action type, date range

### 2.2 Server-Side Pagination
- **Description**: Move pagination from client-side to server-side for better performance
- **Implementation**:
  - Currently frontend filters after fetching all records
  - Update backend to accept search/filter parameters
  - Implement proper skip/limit with search on database level
  - Update frontend to use server pagination
  - Add sort options (by name, date, status)

### 2.3 Child-Guardian Assignment Workflow
- **Description**: Proper workflow to assign children to guardians
- **Implementation**:
  - Add `assigned_guardian_id` to children collection
  - Create assignment request workflow:
    - Staff creates assignment request
    - Guardian can accept/reject
    - Status tracking: pending → accepted/rejected
  - Add assignment history tracking
  - Guardian sees only assigned children

---

## Phase 3: Enhanced Features

### 3.1 Input Validation & Sanitization
- **Description**: Proper validation for all inputs
- **Implementation**:
  - Email format validation (regex)
  - Phone number format (Bangladesh format)
  - Date validation (valid dates, age limits for children)
  - Required field validation
  - String length limits
  - XSS prevention in text fields

### 3.2 PDF Receipt Generation
- **Description**: Generate downloadable donation receipts
- **Implementation**:
  - Add `GET /api/donations/{id}/receipt` endpoint
  - Generate PDF with donation details:
    - Donor name, amount, date, purpose
    - Agency info
    - Reference number
  - Use Python PDF library (reportlab or fpdf)

### 3.3 Reports & Analytics
- **Description**: Generate summary reports
- **Implementation**:
  - Add `GET /api/reports/donations` endpoint - donation summary by date range
  - Add `GET /api/reports/children` endpoint - children statistics by status
  - Add `GET /api/reports/agency` endpoint - agency overview
  - Frontend: Add Reports page with export options

### 3.4 Activity Feed
- **Description**: Show recent activities on dashboard
- **Implementation**:
  - Use audit logs to show last 10-20 activities
  - Group by action type
  - Show relative timestamps (2 hours ago, yesterday)

---

## Phase 4: Security Enhancements (Optional)

### 4.1 Rate Limiting
- Prevent brute force attacks on login/register

### 4.2 JWT Refresh Tokens
- Implement token refresh mechanism

### 4.3 API Versioning
- Version API as /api/v1/

---

## Implementation Order

| Phase | Features | Estimated Complexity |
|-------|----------|---------------------|
| Phase 1 | Soft deletes, Profile, Password change | Medium |
| Phase 2 | Audit logging, Pagination, Child-Guardian workflow | High |
| Phase 3 | Validation, PDF receipts, Reports | Medium |
| Phase 4 | Security enhancements | Low |

---

## Notes

- All backend changes must maintain backward compatibility where possible
- Frontend changes should be minimal and intuitive
- Test each feature thoroughly before moving to next phase
- Update documentation after each phase

---

## Start Implementation

To begin, execute Phase 1 first.