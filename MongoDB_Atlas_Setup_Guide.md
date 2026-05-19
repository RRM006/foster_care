# MongoDB Atlas Setup Guide

This guide explains how to set up and connect to MongoDB Atlas for the Foster Care Management System.

---

## Your MongoDB Credentials

| Field | Value |
|-------|-------|
| **Database Name** | fosterdb |
| **Username** | fosterdb |
| **Password** | <YOUR_MONGODB_PASSWORD> |
| **Connection String** | `mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URL>/?appName=<APP_NAME>` |

---

## Accessing MongoDB Atlas

### Method 1: Through Browser

1. **Open MongoDB Atlas**
   ```
   https://cloud.mongodb.com/
   ```

2. **Login**
   - Click "Log In"
   - Enter your credentials

3. **Navigate to Database**
   - Click your project name
   - Click "Browse Collections"

4. **View Data**
   - You should see these collections:
     - `agencies`
     - `donors`
     - `children`
     - `guardians`
     - `staff`
     - `child_records`
     - `donations`

### Method 2: MongoDB Compass (Optional)

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

### Method 3: VS Code MongoDB Extension

1. **Install Extension**
   - Open VS Code
   - Go to Extensions (`Ctrl+Shift+X`)
   - Search "MongoDB for VS Code"
   - Click Install

2. **Connect**
   - Press `Ctrl+Shift+P`
   - Type "MongoDB: Connect"
   - Paste connection string
   - Press Enter

---

## Reset Database Password (If Needed)

If you can't connect, reset the password:

1. Go to https://cloud.mongodb.com/
2. Click **Organization** → **Database Access**
3. Find "fosterdb" user
4. Click **Edit**
5. Set password to: `<YOUR_MONGODB_PASSWORD>`
6. Click **Save**

---

## Network Access Settings

If connection fails, check Network Access:

1. Go to https://cloud.mongodb.com/
2. Click **Project** → **Network Access**
3. Ensure **Access List Entry** allows your IP address
4. Or set to "Allow Access from Anywhere" (0.0.0.0/0) for development

---

## Troubleshooting Connection Issues

| Error | Solution |
|-------|----------|
| Connection timed out | Check internet connection |
| Authentication failed | Verify password is correct |
| Network not reachable | Check Network Access settings |
| Invalid connection string | Use the exact connection string above |

---

*Guide Version: 1.0*
*Last Updated: April 2026*