# Foster Care Management System (FCMS)

A centralized digital database system to manage orphaned children, foster families, donations, and child welfare agencies in Bangladesh.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [User Roles](#user-roles)
5. [Project Structure](#project-structure)
6. [Prerequisites](#prerequisites)
7. [Installation Guide](#installation-guide)
8. [Running the Project](#running-the-project)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

### Purpose
The Foster Care Management System (FCMS) aims to improve foster care in Bangladesh by:
- Digital record keeping for children, foster families, guardians, and donations
- Quick child placement into verified foster families
- Health and education tracking for children
- Transparent donation management
- Reducing errors and mismanagement in child welfare

### Target Users
- **Admin**: Government/Agency superuser with full access
- **Staff/Social Worker**: Case managers managing children and families
- **Donor**: NGOs, individuals, corporations making donations
- **Guardian/Foster Family**: guardians caring for assigned children

---

## Features

### Core Features
- ✅ User Authentication (JWT-based)
- ✅ Role-based Access Control (RBAC)
- ✅ CRUD Operations for all collections
- ✅ File Upload (child photos, documents, donation receipts)
- ✅ Dashboard with statistics
- ✅ Search and filter functionality
- ✅ Donation tracking

### Database Collections (7)
1. **agencies** - Child welfare agencies
2. **donors** - Individual/NGO donors
3. **children** - Orphaned children records
4. **guardians** - Foster families and guardians
5. **staff** - Social workers and employees
6. **child_records** - Health and education records
7. **donations** - Donation history and tracking

*See [Database_Schema.md](./Database_Schema.md) for detailed collection schemas.*

---

## Tech Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | Flask 3.x |
| Database | MongoDB Atlas |
| Driver | PyMongo |
| Auth | JWT (PyJWT) |
| File Storage | Local filesystem |

### Frontend
| Component | Technology |
|-----------|------------|
| Build Tool | Vite |
| Framework | React 18 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Styling | CSS |

### Design
- **Primary Color**: `#B8FFB8` (Light Green)
- **Secondary Color**: `#2ECC71` (Emerald)
- **Accent Color**: `#228B22` (Forest Green)

---

## User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full CRUD access to all data within their foster care center/agency, manage staff, view all center data |
| **staff** | CRUD children, guardians, child_records; view donations within their center |
| **donor** | Create donations, view own donations to their center |
| **guardian** | View assigned child info only |

---

## Multi-Center Architecture

Each Foster Care Center (Agency) operates independently:
- **Admin**: Creates their own center during registration by providing a center name
- **Staff/Donor/Guardian**: Selects their center from a dropdown list during registration
- **Children, Guardians, Donors**: All associated with a specific center
- **Data Isolation**: Users can only see and manage data from their own center

### Registration Flow
1. **Admin**: Select "Admin (Foster Care Center)" → Enter center name → Creates new agency
2. **Staff**: Select "Staff" → Select from existing centers dropdown
3. **Donor**: Select "Donor" → Select from existing centers dropdown
4. **Guardian**: Select "Guardian" → Select from existing centers dropdown

---

## Project Structure

```
foster_care/
├── README.md
├── .gitignore
├── requirements.txt
│
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── config.py             # Configuration settings
│   ├── database.py          # MongoDB connection
│   ├── .env              # Environment variables
│   ├── requirements.txt
│   ├── models/
│   │   └── __init__.py
│   ├── utils/
│   │   ├── auth.py
│   │   └── file_handler.py
│   └── uploads/
│       ├── photos/
│       ├── documents/
│       └── receipts/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├��─ src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Children.jsx
│   │   │   ├── Guardians.jsx
│   │   │   ├── Staff.jsx
│   │   │   ├── Donors.jsx
│   │   │   ├── Donations.jsx
│   │   │   ├── Agencies.jsx
│   │   │   └── NotFound.jsx
│   │   └── components/
│   │       └── Sidebar.jsx
│
├── README.md
├── PRD.md
├── Guide.md
├── Database_Schema.md
├── API_Endpoints.md
└── MongoDB_Atlas_Setup_Guide.md
```

---

## Prerequisites

### Install Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Python** (v3.10 or higher)
   - Download: https://www.python.org/
   - Verify: `python --version`

3. **Git** (optional, for version control)
   - Download: https://git-scm.com/

4. **MongoDB Atlas Account** (already provided)
   - See [MongoDB_Atlas_Setup_Guide.md](./MongoDB_Atlas_Setup_Guide.md)

---

## Installation Guide

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd foster_care
```

### Step 2: Set Up Backend

#### Create virtual environment
```bash
cd backend

# Create virtual environment (Windows)
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Create virtual environment (Mac/Linux)
python3 -m venv venv

# Activate virtual environment (Mac/Linux)
source venv/bin/activate
```

#### Install Python dependencies
```bash
pip install -r requirements.txt
```

#### Run backend server
```bash
python app.py
```

The backend will run at: `http://localhost:5000`

---

### Step 3: Set Up Frontend

#### Navigate to project root
```bash
cd foster_care
```

#### Install dependencies
```bash
cd frontend
npm install
```

#### Install additional packages
```bash
npm install axios react-router-dom lucide-react
```

#### Run frontend
```bash
npm run dev
```

The frontend will run at: `http://localhost:5173`

---

## Running the Project

### Development Mode

#### Terminal 1: Backend
```bash
cd /home/rafi/Workspace/Projects/cse411/foster_care/backend
python app.py
```

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

#### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: See [API_Endpoints.md](./API_Endpoints.md)

---

## Running the Project (Quick Start)

The fastest way to run both frontend and backend:

```bash
cd foster_care
./start
```

This will start both services. Press Ctrl+C to stop both.

---

## Deployment Guide

### Backend (Render/Railway)

1. **Deploy to Render**:
   - Push code to GitHub
   - Connect GitHub to Render
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `python app.py`
   - Add environment variables in Render dashboard

2. **Environment Variables**:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

### Frontend (Vercel/Netlify)

1. **Deploy to Vercel**:
   - Push code to GitHub
   - Connect GitHub to Vercel
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Update API URL**:
   - In frontend, update `api.js` baseURL to your deployed backend URL

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connection refused
```
**Solution**: Check your MONGO_URI in .env file. Ensure password is correct.

#### 2. ModuleNotFoundError
```
ModuleNotFoundError: No module named 'flask'
```
**Solution**: Activate virtual environment and run `pip install -r requirements.txt`

#### 3. CORS Error
```
Access to fetch blocked by CORS policy
```
**Solution**: Ensure Flask-CORS is installed and configured in app.py

#### 4. Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**: Kill the process using that port or change port in config

#### 5. React Build Error
```
Error: ENOENT: no such file or directory
```
**Solution**: Delete node_modules and package-lock.json, then run `npm install`

---

## License

This project is created for educational purposes.

---

## Related Documentation

- [PRD.md](./PRD.md) - Product Requirements Document
- [Guide.md](./Guide.md) - Step-by-step Setup Guide
- [Database_Schema.md](./Database_Schema.md) - Database Collections Schema
- [API_Endpoints.md](./API_Endpoints.md) - API Endpoints Reference
- [MongoDB_Atlas_Setup_Guide.md](./MongoDB_Atlas_Setup_Guide.md) - MongoDB Atlas Guide

---

## Support

For any issues or questions:
- Check the troubleshooting section above
- Review [API_Endpoints.md](./API_Endpoints.md)
- Contact the project maintainer