from pymongo import MongoClient
import certifi
from config import Config

client = None
db = None


def init_db():
    """Initialize database connection and create indexes"""
    global client, db
    try:
        client = MongoClient(Config.MONGO_URI, tlsCAFile=certifi.where())
        db = client[Config.DATABASE_NAME]

        # Test connection
        client.admin.command("ping")
        print("✓ MongoDB connected successfully!")

        # Create indexes for better query performance
        create_indexes()

        return db
    except Exception as e:
        print(f"✗ MongoDB connection error: {e}")
        raise


def create_indexes():
    """Create indexes on collections for query optimization

    Indexes improve query performance significantly.
    Below are the indexes created for this NoSQL database:
    """
    print("Creating database indexes...")

    # CHILDREN COLLECTION INDEXES
    # Compound index for agency filtering with search - most common query pattern
    db.children.create_index(
        [("agency_id", 1), ("deleted_at", 1)], name="idx_children_agency_active"
    )

    # Text search index on full_name for search functionality
    db.children.create_index(
        [("full_name", "text")],
        name="idx_children_name_text",
        default_language="english",
    )

    # Index on current_status for filtering by status
    db.children.create_index([("current_status", 1)], name="idx_children_status")

    # Index on guardian_id for child-guardian relationship queries
    db.children.create_index([("guardian_id", 1)], name="idx_children_guardian")

    # GUARDIANS COLLECTION INDEXES
    db.guardians.create_index(
        [("agency_id", 1), ("deleted_at", 1)], name="idx_guardians_agency_active"
    )

    db.guardians.create_index([("full_name", "text")], name="idx_guardians_name_text")

    # Index on verified status
    db.guardians.create_index([("verified", 1)], name="idx_guardians_verified")

    # DONORS COLLECTION INDEXES
    db.donors.create_index(
        [("agency_id", 1), ("deleted_at", 1)], name="idx_donors_agency_active"
    )

    # Unique index on email for fast lookup and duplicate prevention
    db.donors.create_index([("email", 1)], unique=True, name="idx_donors_email_unique")

    # STAFF COLLECTION INDEXES
    db.staff.create_index(
        [("agency_id", 1), ("deleted_at", 1)], name="idx_staff_agency_active"
    )

    db.staff.create_index([("email", 1)], unique=True, name="idx_staff_email_unique")

    # Index on role_field for admin/staff filtering
    db.staff.create_index([("role_field", 1)], name="idx_staff_role")

    # AGENCIES COLLECTION INDEXES
    db.agencies.create_index([("deleted_at", 1)], name="idx_agencies_active")

    # DONATIONS COLLECTION INDEXES
    db.donations.create_index(
        [("agency_id", 1), ("deleted_at", 1)], name="idx_donations_agency_active"
    )

    # Compound index for donation reports - date range queries
    db.donations.create_index(
        [("agency_id", 1), ("donation_date", -1)], name="idx_donations_date"
    )

    # Index on donor_id for lookup
    db.donations.create_index([("donor_id", 1)], name="idx_donations_donor")

    # CHILD_RECORDS COLLECTION INDEXES
    db.child_records.create_index([("child_id", 1)], name="idx_childrecords_child")

    # Index on record_type for filtering
    db.child_records.create_index([("record_type", 1)], name="idx_childrecords_type")

    # AUDIT_LOGS COLLECTION INDEXES
    # Compound index for admin audit log queries - most common query
    db.audit_logs.create_index(
        [("agency_id", 1), ("timestamp", -1)], name="idx_auditlogs_agency_time"
    )

    # Index on user_id for user activity tracking
    db.audit_logs.create_index([("user_id", 1)], name="idx_auditlogs_user")

    # Index on action type for filtering
    db.audit_logs.create_index([("action", 1)], name="idx_auditlogs_action")

    print(f"✓ Database indexes created for query optimization")


def get_db():
    """Get database instance"""
    global db
    if db is None:
        init_db()
    return db


def get_collection(name):
    """Get a specific collection"""
    return get_db()[name]
