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
| **Admin** | Government/Agency superuser | Full system access |
| **Staff/Social Worker** | Case managers, field workers | CRUD children, records, families |
| **Donor** | NGOs, individuals, corporations | View/donate limited |
| **Guardian/Foster Family** | Assigned guardians | View assigned child only |

---

## 2. Tech Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | Flask 3.x (Python) |
| Database | MongoDB Atlas (NoSQL) |
| Driver | PyMongo |
| Authentication | JWT (PyJWT) |
| File Storage | Local `/uploads` folder |
| CORS | Flask-CORS |

### Frontend
| Component | Technology |
|-----------|------------|
| Build Tool | Vite |
| Framework | React 18 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Styling | CSS Modules |
| Icons | Lucide React |

### Deployment
| Component | Service |
|-----------|---------|
| Frontend | Vercel / Netlify |
| Backend | Render / Railway |
| Database | MongoDB Atlas |

---

## 3. UI/UX Design Specification

### 3.1 Color Palette

| Role | Color Name | Hex Code | Usage |
|------|-----------|----------|-------|
| **Primary** | Light Green | `#B8FFB8` | Main buttons, highlights |
| **Primary Dark** | Soft Green | `#90EE90` | Button hover, active states |
| **Secondary** | Emerald | `#2ECC71` | Success states, approved |
| **Accent** | Forest Green | `#228B22` | Headers, navigation |
| **Background** | Off-White | `#F5F5F5` | Page background |
| **Surface** | White | `#FFFFFF` | Cards, modals |
| **Text Primary** | Dark Gray | `#333333` | Main text |
| **Text Secondary** | Medium Gray | `#666666` | Secondary text |
| **Error** | Red | `#E74C3C` | Errors, delete |
| **Success** | Green | `#27AE60` | Success messages |
| **Warning** | Orange | `#F39C12` | Warnings, pending |
| **Info** | Blue | `#3498DB` | Information |

### 3.2 Typography

| Element | Font Family | Size | Weight | Line Height |
|---------|-------------|------|--------|-------------|
| **H1** | 'Poppins', Arial | 32px | 700 | 1.2 |
| **H2** | 'Poppins', Arial | 24px | 600 | 1.3 |
| **H3** | 'Poppins', Arial | 20px | 600 | 1.4 |
| **Body** | 'Inter', Arial | 16px | 400 | 1.5 |
| **Body Small** | 'Inter', Arial | 14px | 400 | 1.5 |
| **Label** | 'Inter', Arial | 12px | 500 | 1.4 |
| **Button** | 'Inter', Arial | 14px | 600 | 1 |

### 3.3 Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing |
| `sm` | 8px | Icon gaps |
| `md` | 16px | Standard padding |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Large gaps |
| `2xl` | 48px | Page margins |

### 3.4 Responsive Breakpoints

| Breakpoint | Width | Columns | Layout |
|-----------|-------|--------|--------|
| **Mobile** | < 640px | 1 | Single column |
| **Tablet** | 640px - 1024px | 2 | Two columns |
| **Desktop** | > 1024px | 3-4 | Multi column |

### 3.5 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER                               │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Logo   │  │     Nav Menu     │  │  User Menu  │  │
│  └──────────┘  └──────────────────┘  └──────────────┘  │
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│    SIDEBAR     │              MAIN CONTENT                     │
│                │                                            │
│  - Dashboard   │  ┌────────────────────────────────────┐  │
│  - Children   │  │          STATS CARDS                │  │
│  - Guardians  │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ │  │
│  - Donors     │  │  │Card│ │Card│ │Card│ │Card│ │  │
│  - Donations  │  │  └────┘ └────┘ └────┘ └────┘ │  │
│  - Staff     │  └────────────────────────────────────┘  │
│  - Agencies  │                                            │
│              │  ┌────────────────────────────────────┐  │
│              │  │           DATA TABLE               │  │
│              │  │  Name    Status   Date   Actions    │  │
│              │  └────────────────────────────────────┘  │
│                │                                            │
└────────────────┴────────────────────────────────────────────┘
```

### 3.6 Component Specifications

#### 3.6.1 Button Component
```
Primary Button:
- Background: #90EE90
- Hover: #2ECC71
- Text: #333333
- Padding: 12px 24px
- Border Radius: 8px
- Font Weight: 600

Secondary Button:
- Background: transparent
- Border: 2px solid #90EE90
- Text: #228B22

Danger Button:
- Background: #E74C3C
- Text: white
```

#### 3.6.2 Card Component
```
- Background: #FFFFFF
- Border Radius: 12px
- Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Padding: 24px
- Hover: translateY(-2px), shadow increase
```

#### 3.6.3 Input Field
```
- Background: #FFFFFF
- Border: 1px solid #E0E0E0
- Border Radius: 8px
- Padding: 12px 16px
- Focus: border-color #2ECC71, shadow
- Placeholder: #999999
```

#### 3.6.4 Table Component
```
- Header Background: #F5F5F5
- Row Hover: #F0F8F0
- Border: 1px solid #E0E0E0
- Cell Padding: 16px
```

#### 3.6.5 Status Badges
```
- Pending: Orange (#F39C12) background
- In Foster: Green (#2ECC71) background
- Reunified: Blue (#3498DB) background
- Adopted: Purple (#9B59B6) background
```

### 3.7 Animations

| Animation | Duration | Easing |
|-----------|----------|--------|
| Button hover | 200ms | ease-in-out |
| Card hover | 300ms | ease-out |
| Modal open | 250ms | ease-out |
| Page transition | 300ms | ease-in-out |
| Sidebar toggle | 200ms | ease-in-out |

---

## 4. Database Collections

### 4.1 agencies
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated |
| name | String | Yes | Agency name |
| address | String | No | Full address |
| phone | String | No | Contact number |
| email | String | No | Email address |
| created_at | DateTime | Yes | Auto-generated |
| updated_at | DateTime | Yes | Auto-generated |

### 4.2 donors
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated |
| full_name | String | Yes | Donor name |
| donor_type | String | Yes | individual/NGO/corporate |
| phone | String | No | Contact number |
| email | String | Yes | Email (unique) |
| password | String | Yes | Bcrypt hashed |
| role | String | Yes | "donor" |
| created_at | DateTime | Yes | Auto-generated |
| updated_at | DateTime | Yes | Auto-generated |

### 4.3 children
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated |
| agency_id | ObjectId | Yes | Foreign key to agencies |
| full_name | String | Yes | Child's full name |
| gender | String | No | male/female/other |
| date_of_birth | Date | No | DOB |
| current_status | String | Yes | pending/in_foster/reunified/adopted |
| admission_date | Date | Yes | Date of admission |
| photo_url | String | No | Path to photo |
| documents | Array | No | Array of document paths |
| created_at | DateTime | Yes | Auto-generated |
| updated_at | DateTime | Yes | Auto-generated |

### 4.4 guardians
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated |
| child_id | ObjectId | Yes | Foreign key to children |
| full_name | String | Yes | Guardian name |
| phone | String | No | Contact number |
| address | String | No | Full address |
| national_id | String | No | NID number |
| verified | Boolean | Yes | Verification status |
| password | String | Yes | Bcrypt hashed |
| role | String | Yes | "guardian" |
| created_at | DateTime | Yes | Auto-generated |
| updated_at | DateTime | Yes | Auto-generated |

### 4.5 staff
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated |
| agency_id | ObjectId | No | Foreign key to agencies |
| full_name | String | Yes | Staff name |
| role_field | String | Yes | admin/staff |
| phone | String | No | Contact number |
| email | String | Yes | Email (unique) |
| password | String | Yes | Bcrypt hashed |
| status | String | Yes | active/inactive |
| created_at | DateTime | Yes | Auto-generated |
| updated_at | DateTime | Yes | Auto-generated |

### 4.6 child_records
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated |
| child_id | ObjectId | Yes | Foreign key to children |
| health_status | String | No | Health condition |
| education_level | String | No | Education level |
| last_visit_date | Date | No | Last checkup |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Auto-generated |
| updated_at | DateTime | Yes | Auto-generated |

### 4.7 donations
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Auto-generated |
| donor_id | ObjectId | Yes | Foreign key to donors |
| agency_id | ObjectId | Yes | Foreign key to agencies |
| amount | Number | Yes | Donation amount |
| purpose | String | No | Donation purpose |
| donation_date | Date | Yes | Date of donation |
| reference_no | String | No | Reference number |
| receipt_url | String | No | Path to receipt |
| created_at | DateTime | Yes | Auto-generated |
| updated_at | DateTime | Yes | Auto-generated |

---

## 5. User Roles & Permissions

### 5.1 Role Matrix

| Feature | Admin | Staff | Donor | Guardian |
|---------|-------|-------|-------|----------|
| **View Dashboard** | ✓ | ✓ | ✗ | ✗ |
| **Manage Children** | ✓ | ✓ | ✗ | ✗ |
| **Manage Guardians** | ✓ | ✓ | ✗ | ✗ |
| **Manage Staff** | ✓ | ✗ | ✗ | ✗ |
| **Manage Donors** | ✓ | ✓ | ✗ | ✗ |
| **Manage Donations** | ✓ | ✓ | ✓ | ✗ |
| **Manage Agencies** | ✓ | ✓ | ✗ | ✗ |
| **Manage Records** | ✓ | ✓ | ✗ | ✗ |
| **Upload Files** | ✓ | ✓ | ✓ | ✗ |
| **View Reports** | ✓ | ✓ | ✗ | ✗ |

---

## 6. Functional Requirements

### 6.1 Authentication
- [ ] User registration with role selection
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