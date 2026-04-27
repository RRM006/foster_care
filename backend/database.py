from pymongo import MongoClient
import certifi
from config import Config

client = None
db = None


def init_db():
    """Initialize database connection"""
    global client, db
    try:
        client = MongoClient(Config.MONGO_URI, tlsCAFile=certifi.where())
        db = client[Config.DATABASE_NAME]

        # Test connection
        client.admin.command("ping")
        print("✓ MongoDB connected successfully!")

        return db
    except Exception as e:
        print(f"✗ MongoDB connection error: {e}")
        raise


def get_db():
    """Get database instance"""
    global db
    if db is None:
        init_db()
    return db


def get_collection(name):
    """Get a specific collection"""
    return get_db()[name]
