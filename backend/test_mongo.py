#!/usr/bin/env python3
"""Test MongoDB Atlas connection"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv

load_dotenv()

from pymongo import MongoClient

# Direct connection using resolved hostnames (bypassing SRV DNS issue)
# The SRV record resolves to ac-iwclzo7 but connection string uses dbprojectcluster
DIRECT_URI = "mongodb://fosterdb:QjUmTm2zLmmjHVso@ac-iwclzo7-shard-00-00.jbou71h.mongodb.net:27017,ac-iwclzo7-shard-00-02.jbou71h.mongodb.net:27017/?ssl=true&replicaSet=atlas-xxxxxx&authSource=admin&retryWrites=true&w=majority"

print("Testing MongoDB connection (Direct)...")
print("Connecting to: ac-iwclzo7-shard-00-xx.jbou71h.mongodb.net")

try:
    # Try direct connection without SRV
    client = MongoClient(
        "mongodb://fosterdb:QjUmTm2zLmmjHVso@ac-iwclzo7-shard-00-00.jbou71h.mongodb.net:27017/?ssl=true&authSource=admin",
        serverSelectionTimeoutMS=5000,
        directConnection=True,
    )
    client.admin.command("ping")
    print("✓ MongoDB connected successfully (Direct)!")

    # List databases
    databases = client.list_database_names()
    print(f"Available databases: {databases}")

    # Check fosterdb
    if "fosterdb" in databases:
        db = client["fosterdb"]
        collections = db.list_collection_names()
        print(f"Collections in fosterdb: {collections}")
    else:
        print("Database 'fosterdb' not found. Will be created when needed.")

    client.close()
    print("\n✓ Connection successful!")
    print("Now updating backend/.env with direct connection string...")
    sys.exit(0)

except Exception as e:
    print(f"✗ Direct connection failed: {e}")
    print("\nPlease go to MongoDB Atlas and:")
    print("1. Check if cluster is PAUSED → Click RESUME")
    print(
        "2. Go to Network Access → Add IP Address → Add '0.0.0.0/0' (allow from anywhere)"
    )
    print("3. Go to Database → Connect → Drivers → Copy FRESH connection string")
    sys.exit(1)
