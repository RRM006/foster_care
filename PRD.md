# Foster Care Management System (FCMS) - Product Requirements Document

---

## 1. Project Overview

### Project Name
**Foster Care Management System (FCMS)**

### Project Type
Full-stack Web Application (REST API + React Frontend)

### Core Functionality
A centralized digital database system to manage orphaned children, foster families, donations, and child welfare agencies in Bangladesh. The system enables efficient tracking of children's well-being, transparent donation management, and quick foster family placement.

### Target Users
| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Foster Care Center owner/manager | Full access to their center's data |
| **Staff/Social Worker** | Case managers, field workers | CRUD children, records, families within their center |
| **Donor** | NGOs, individuals, corporations | View/donate to their center |
| **Guardian/Foster Family** | Assigned guardians | View assigned child only |

---

## 5. User Roles & Permissions

### 5.1 Role Matrix

| Feature | Admin | Staff | Donor | Guardian |
|---------|-------|-------|-------|----------|
| **View Dashboard** | ✓ | ✓ | ✗ | ✗ |
| **Manage Children** | ✓ (own center) | ✓ (own center) | ✗ | ✗ |
| **Manage Guardians** | ✓ (own center) | ✓ (own center) | ✗ | ✗ |
| **Manage Staff** | ✓ (own center) | ✗ | ✗ | ✗ |
| **Manage Donors** | ✓ (own center) | ✓ (own center) | ✗ | ✗ |
| **Manage Donations** | ✓ (own center) | ✓ (own center) | ✓ (own center) | ✗ |
| **Manage Agencies** | ✓ (own center only) | ✗ | ✗ | ✗ |
| **Manage Records** | ✓ (own center) | ✓ (own center) | ✗ | ✗ |
| **Upload Files** | ✓ | ✓ | ✓ | ✗ |
| **View Reports** | ✓ (own center) | ✓ (own center) | ✗ | ✗ |

### 5.2 Multi-Center Architecture

- **Admin**: Registers their Foster Care Center (Agency) during signup. Manages all data within their center only.
- **Data Isolation**: Each center's admin, staff, children, guardians, and donors are isolated from other centers.
- **Staff Assignment**: Staff members belong to a specific center and can only access that center's data.

---

## 6. Functional Requirements

### 6.1 Authentication
- [ ] User registration with role selection
- [ ] Admin registers and creates their Foster Care Center automatically
- [ ] Staff/Donor/Guardian registers and selects their center from dropdown
- [ ] Login with email/password
- [ ] JWT token generation
- [ ] Token validation on protected routes
- [ ] Password hashing with bcrypt

### 6.2 Children Management
- [ ] View all children list
- [ ] Add new child
- [ ] View child details
- [ ] Update child information
- [ ] Delete child (admin only)
- [ ] Upload child photo
- [ ] Upload documents
- [ ] Search/filter children

### 6.3 Guardians Management
- [ ] View all guardians
- [ ] Add new guardian
- [ ] Link guardian to child
- [ ] Verify guardian
- [ ] Update guardian info

### 6.4 Donations
- [ ] View all donations
- [ ] Make donation
- [ ] Upload receipt
- [ ] Track donation usage

### 6.5 Dashboard
- [ ] Total children count
- [ ] Total donations amount
- [ ] Children by status
- [ ] Recent activities

---

## 7. API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Children
- `GET /api/children` - Get all children
- `POST /api/children` - Create child
- `GET /api/children/:id` - Get child
- `PUT /api/children/:id` - Update child
- `DELETE /api/children/:id` - Delete child

### Guardians
- `GET /api/guardians` - Get all guardians
- `POST /api/guardians` - Create guardian
- `GET /api/guardians/:id` - Get guardian
- `PUT /api/guardians/:id` - Update guardian
- `DELETE /api/guardians/:id` - Delete guardian

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff
- `GET /api/staff/:id` - Get staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Donors
- `GET /api/donors` - Get all donors
- `POST /api/donors` - Create donor
- `GET /api/donors/:id` - Get donor
- `PUT /api/donors/:id` - Update donor

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create donation
- `GET /api/donations/:id` - Get donation

### Agencies
- `GET /api/agencies` - Get all agencies
- `POST /api/agencies` - Create agency
- `GET /api/agencies/:id` - Get agency

### Child Records
- `GET /api/child_records` - Get all records
- `POST /api/child_records` - Create record
- `GET /api/child_records/:id` - Get record
- `PUT /api/child_records/:id` - Update record

### File Uploads
- `POST /api/upload/photo` - Upload photo
- `POST /api/upload/document` - Upload document
- `POST /api/upload/receipt` - Upload receipt

### Stats
- `GET /api/stats` - Dashboard statistics

---

## 8. Acceptance Criteria

### 8.1 Authentication
- [ ] Users can register with unique email
- [ ] Users can login with valid credentials
- [ ] Invalid credentials show error
- [ ] JWT token is stored in localStorage
- [ ] Protected routes redirect to login

### 8.2 Dashboard
- [ ] Shows correct statistics
- [ ] Charts display properly
- [ ] Responsive on mobile

### 8.3 CRUD Operations
- [ ] All collections support full CRUD
- [ ] Forms validate required fields
- [ ] Success/error messages display
- [ ] Data persists to MongoDB

### 8.4 File Uploads
- [ ] Photos upload successfully
- [ ] Documents upload successfully
- [ ] Files are served correctly

### 8.5 Role-based Access
- [ ] Admin can access all features
- [ ] Staff has limited access
- [ ] Donor has donation access
- [ ] Guardian sees only assigned child

---

## 9. Project Deliverables

1. **Backend API** - Flask REST API with MongoDB
2. **Frontend App** - Vite React application
3. **Documentation** - PRD, README, Guide
4. **Database** - MongoDB Atlas cluster

---

## 10. Timeline

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Project Setup | 1 day |
| 2 | Backend Development | 2 days |
| 3 | Frontend Setup | 1 day |
| 4 | Frontend Components | 3 days |
| 5 | Integration & Testing | 2 days |
| 6 | Documentation | 1 day |
| **Total** | | **10 days** |

---

*Document Version: 1.0*
*Last Updated: April 2026*
*Project: Foster Care Management System*