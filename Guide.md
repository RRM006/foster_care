# Foster Care Management System - Complete Setup Guide

This guide will walk you through setting up the entire Foster Care Management System from scratch.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)
3. [Backend Setup](#3-backend-setup)
4. [Frontend Setup](#4-frontend-setup)
5. [Running the Project](#5-running-the-project)
6. [Testing the Application](#6-testing-the-application)
7. [Deployment](#7-deployment)
8. [Common Issues](#8-common-issues)

---

## 1. Prerequisites

### 1.1 Required Software

You need to install the following software on your computer:

| Software | Version | Download Link | Verification Command |
|----------|---------|--------------|-------------------|
| **Node.js** | v18+ | https://nodejs.org/ | `node --version` |
| **Python** | v3.10+ | https://www.python.org/ | `python --version` |
| **Git** | Latest | https://git-scm.com/ | `git --version` |
| **VS Code** | Latest | https://code.visualstudio.com/ | (Manual) |

### 1.2 Verify Installation

Open your terminal/command prompt and run:

```bash
# Check Node.js
node --version
# Expected: v18.x.x or higher

# Check Python
python --version
# Expected: 3.10.x or higher

# Check Git
git --version
# Expected: git version x.x.x
```

If any of these show errors, you need to install them first.

---

## 2. MongoDB Atlas Setup

### 2.1 Your MongoDB Credentials

**Database Name:** fosterdb  
**Username:** fosterdb  
**Password:** <YOUR_MONGODB_PASSWORD>  
**Connection String:**
```
mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URL>/?appName=<APP_NAME>
```

### 2.2 Accessing MongoDB Atlas

#### Method 1: Through Browser

1. **Open MongoDB Atlas**
   ```
   https://cloud.mongodb.com/
   ```

2. **Login**
   - Click "Log In"
   - Use your credentials (contact your instructor if you don't have login)

3. **Navigate to Database**
   - Click your project name
   - Click "Browse Collections"

4. **View Data**
   - You should see these collections:
     - agencies
     - donors
     - children
     - guardians
     - staff
     - child_records
     - donations

#### Method 2: MongoDB Compass (Optional)

1. **Download MongoDB Compass**
   ```
   https://www.mongodb.com/compass
   ```

2. **Open Compass**
   - Click "New Connection"

3. **Enter Connection String**
   ```
   mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URL>/?appName=<APP_NAME>
   ```

4. **Click Connect**

#### Method 3: VS Code MongoDB Extension

1. **Install Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search "MongoDB for VS Code"
   - Click Install

2. **Connect**
   - Press Ctrl+Shift+P
   - Type "MongoDB: Connect"
   - Paste connection string
   - Press Enter

### 2.3 Reset Database Password (If Needed)

If you can't connect, reset the password:

1. Go to https://cloud.mongodb.com/
2. Click "Database Access"
3. Find "fosterdb" user
4. Click "Edit"
5. Set password to: `<YOUR_MONGODB_PASSWORD>`
6. Click "Save"

---

## 3. Backend Setup

### Step 3.1: Create Project Folder Structure

```bash
# Navigate to your project directory
cd /your/project/path

# Create project folder
mkdir foster_care
cd foster_care
```

### Step 3.2: Set Up Python Virtual Environment

```bash
# Go to backend folder
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

You should see `(venv)` at the beginning of your terminal line.

### Step 3.3: Install Python Dependencies

```bash
pip install flask flask-cors pymongo python-dotenv pyjwt bcrypt
```

Wait for installation to complete. You should see "Successfully installed..." messages.

### Step 3.4: Create Upload Folders

```bash
# Create uploads directory
mkdir uploads

# Create subdirectories
mkdir uploads\photos
mkdir uploads\documents
mkdir uploads\receipts
```

### Step 3.5: Configure Environment Variables

The `.env` file should already exist. Verify it has this content:

```
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URL>/?appName=<APP_NAME>

# JWT Secret Key
JWT_SECRET=<YOUR_JWT_SECRET>

# Server Port
PORT=5000

# Debug Mode
DEBUG=True
```

### Step 3.6: Run the Backend

```bash
python app.py
```

You should see:
```
✓ MongoDB connected successfully!
✓ Database initialized!
 * Running on http://0.0.0.0:5000
```

**Keep this terminal open!**

---

## 4. Frontend Setup

### Step 4.1: Create React App with Vite

Open a **new terminal** (keep backend running):

```bash
# Navigate to project folder
cd foster_care

# Create Vite React app (say YES when prompted)
npm create vite@latest frontend -- --template react
```

### Step 4.2: Install Dependencies

```bash
# Go to frontend folder
cd frontend

# Install base dependencies
npm install

# Install additional packages
npm install axios react-router-dom lucide-react
```

### Step 4.3: Start the Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

**Keep this terminal open too!**

### Step 4.4: Open in Browser

1. Open your browser
2. Go to: `http://localhost:5173`
3. You should see the FCMS login page

---

## 5. Running the Project

You need **two terminals** running simultaneously:

### Terminal 1: Backend
```bash
cd foster_care/backend
# Activate venv first if needed
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
python app.py
```

### Terminal 2: Frontend
```bash
cd foster_care/frontend
npm run dev
```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## 6. Testing the Application

### 6.1 Test Backend API

Open a new terminal or use Postman:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","message":"FCMS API is running"}
```

### 6.2 Test Registration

Use Postman or curl to register a user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@fcmsobd.org",
    "password": "admin123",
    "role": "admin",
    "phone": "+8801234567890"
  }'
```

### 6.3 Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fcmsobd.org",
    "password": "admin123"
  }'
```

You should get a response with `token`. Copy this token for testing protected routes.

### 6.4 Test Protected Routes

Replace `YOUR_TOKEN_HERE` with the token from login:

```bash
# Get all children
curl http://localhost:5000/api/children \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get stats
curl http://localhost:5000/api/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 7. Deployment

### 7.1 Deploy Backend to Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render Account**
   - Go to https://render.com/
   - Click "New Blueprint"

3. **Connect GitHub**
   - Select your repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `python app.py`

4. **Add Environment Variables**
   - MONGO_URI: `mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URL>/?appName=<APP_NAME>`
   - JWT_SECRET: `your_new_secret_key`
   - PORT: `5000`

5. **Deploy**

### 7.2 Deploy Frontend to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Frontend ready"
   git push origin main
   ```

2. **Create Vercel Account**
   - Go to https://vercel.com/
   - Click "Add New Project"

3. **Import GitHub**
   - Select your repository
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Add Environment Variables**
   - VITE_API_URL: `your_backend_url`

5. **Deploy**

---

## 8. Common Issues

### Issue 1: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
```bash
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue 2: MongoDB Connection Error

**Solution:**
1. Check your MONGO_URI in `.env` file
2. Make sure password is correct: `<YOUR_MONGODB_PASSWORD>`
3. Check internet connection
4. Try.mongodb Atlas Network Access settings

### Issue 3: Port Already in Use (5000)

**Solution:**
```bash
# Windows - kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux - kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Issue 4: CORS Error

**Solution:**
- Make sure Flask-CORS is installed
- Check if `CORS(app)` is in app.py

### Issue 5: React Build Errors

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue 6: "npm is not recognized"

**Solution:**
- Install Node.js properly from https://nodejs.org/
- Restart your terminal
- Add Node.js to system PATH

---

## Quick Reference Commands

### Backend Commands
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Commands
```bash
cd frontend
npm install
npm run dev
npm run build
```

### MongoDB Commands
```bash
# Connect test
mongosh "mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URL>/?appName=<APP_NAME>" --username <USERNAME>
```

---

## Support

If you face any issues not covered here:

1. Check the error message carefully
2. Search the error message on Google
3. Check backend terminal for error logs
4. Contact your instructor

---

*Guide Version: 1.0*
*Last Updated: April 2026*
*Project: Foster Care Management System*