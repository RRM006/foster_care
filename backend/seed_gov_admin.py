"""
Seed script: Create the first Government Admin user and migrate existing agencies.

Usage:
    cd backend
    python seed_gov_admin.py

This script:
  1. Creates a Government Admin user in the 'government_admins' collection.
  2. Sets 'setup_complete: true' on all existing agencies (backward compatibility).
"""

import sys
from config import Config
from database import init_db, get_collection
from utils.auth import hash_password
from datetime import datetime, timezone


def utcnow():
    return datetime.now(timezone.utc)


def seed():
    print("=" * 50)
    print("  FCMS — Government Admin Seed Script")
    print("=" * 50)

    # Initialize DB
    init_db()

    # --- 1. Create Government Admin ---
    email = "gov@fcms.gov.bd"
    password = "govadmin123"

    gov_col = get_collection("government_admins")

    existing = gov_col.find_one({"email": email})
    if existing:
        print(f"\n⚠  Government Admin '{email}' already exists. Skipping creation.")
    else:
        gov_data = {
            "full_name": "Government Admin",
            "email": email,
            "password": hash_password(password),
            "role": "government_admin",
            "created_at": utcnow(),
            "updated_at": utcnow(),
        }
        result = gov_col.insert_one(gov_data)
        print(f"\n✓ Government Admin created:")
        print(f"  Email:    {email}")
        print(f"  Password: {password}")
        print(f"  ID:       {result.inserted_id}")

    # --- 2. Migrate existing agencies: set setup_complete = true ---
    agencies_col = get_collection("agencies")
    result = agencies_col.update_many(
        {"setup_complete": {"$exists": False}},
        {"$set": {"setup_complete": True}},
    )
    if result.modified_count > 0:
        print(f"\n✓ Migrated {result.modified_count} existing agencies (set setup_complete=true)")
    else:
        print("\n✓ No agencies need migration (all already have setup_complete field)")

    print("\n" + "=" * 50)
    print("  Seed complete!")
    print("=" * 50)


if __name__ == "__main__":
    try:
        seed()
    except Exception as e:
        print(f"\n✗ Seed failed: {e}")
        sys.exit(1)
