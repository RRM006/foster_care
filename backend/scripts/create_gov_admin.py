#!/usr/bin/env python3
"""
Script to create the first Government Admin user.
Run this script once to bootstrap the government admin account.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import init_db, get_db
from utils.auth import hash_password
from datetime import datetime


def create_gov_admin(email, password, full_name="System Government Admin"):
    """Create a government admin user"""
    try:
        init_db()
        db = get_db()

        # Check if gov admin already exists
        existing = db.government_admins.find_one({"email": email})
        if existing:
            print(f"Government admin with email {email} already exists!")
            return False

        # Create gov admin
        gov_admin = {
            "full_name": full_name,
            "email": email,
            "password": hash_password(password),
            "is_active": True,
            "created_at": datetime.utcnow(),
        }

        result = db.government_admins.insert_one(gov_admin)
        print(f"Government admin created successfully!")
        print(f"ID: {result.inserted_id}")
        print(f"Email: {email}")
        print(f"Name: {full_name}")
        return True

    except Exception as e:
        print(f"Error creating government admin: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python create_gov_admin.py <email> <password>")
        print(
            "Example: python create_gov_admin.py gov@fostercare.gov  securepassword123"
        )
        sys.exit(1)

    email = sys.argv[1]
    password = sys.argv[2]

    if len(password) < 6:
        print("Error: Password must be at least 6 characters")
        sys.exit(1)

    create_gov_admin(email, password)
