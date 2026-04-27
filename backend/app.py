import os
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from functools import wraps

from config import Config
from database import init_db, get_db, get_collection
from utils.auth import (
    generate_token,
    decode_token,
    get_current_user,
    hash_password,
    verify_password,
)
from utils.file_handler import save_file, allowed_file

app = Flask(__name__)
app.config["SECRET_KEY"] = Config.JWT_SECRET
app.config["MAX_CONTENT_LENGTH"] = Config.MAX_CONTENT_LENGTH

CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})

# Initialize database
try:
    init_db()
    print("✓ Database initialized!")
except Exception as e:
    print(f"✗ Database initialization failed: {e}")


# ==================== HELPERS ====================

# Field whitelists: only these keys are allowed through on create/update
CHILD_FIELDS = {
    "full_name",
    "gender",
    "date_of_birth",
    "agency_id",
    "current_status",
    "admission_date",
    "photo_url",
    "documents",
}
GUARDIAN_FIELDS = {
    "full_name",
    "phone",
    "address",
    "national_id",
    "child_id",
    "verified",
}
STAFF_FIELDS = {
    "full_name",
    "email",
    "phone",
    "role_field",
    "agency_id",
    "status",
}
DONOR_FIELDS = {
    "full_name",
    "email",
    "phone",
    "donor_type",
}
DONATION_FIELDS = {
    "donor_id",
    "agency_id",
    "amount",
    "purpose",
    "donation_date",
    "reference_no",
    "receipt_url",
}
AGENCY_FIELDS = {"name", "address", "phone", "email"}
CHILD_RECORD_FIELDS = {
    "child_id",
    "health_status",
    "education_level",
    "last_visit_date",
    "notes",
}

# Valid enum values
VALID_STATUSES = {"pending", "in_foster", "reunified", "adopted"}
VALID_GENDERS = {"male", "female", "other", ""}
VALID_DONOR_TYPES = {"individual", "NGO", "corporate"}
VALID_ROLES = {"admin", "staff", "donor", "guardian"}
VALID_STAFF_STATUSES = {"active", "inactive"}


def utcnow():
    """Return current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def sanitize_data(data, allowed_fields):
    """Strip any keys not in the allowed set — prevents NoSQL injection
    and arbitrary field overwrite (e.g., _id, role, password, created_at)."""
    return {k: v for k, v in data.items() if k in allowed_fields}


def get_pagination_params():
    """Extract page/limit from query string with safe defaults."""
    try:
        page = max(1, int(request.args.get("page", 1)))
    except (ValueError, TypeError):
        page = 1
    try:
        limit = min(100, max(1, int(request.args.get("limit", 50))))
    except (ValueError, TypeError):
        limit = 50
    skip = (page - 1) * limit
    return page, limit, skip


def error_response(message, status_code):
    """Consistent JSON error format."""
    return jsonify({"error": message, "status": status_code}), status_code


def success_response(data, status_code=200):
    """Consistent JSON success format."""
    if isinstance(data, str):
        return jsonify({"message": data, "status": status_code}), status_code
    return jsonify({**data, "status": status_code}), status_code


import re


def validate_email(email):
    """Validate email format"""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def validate_phone(phone):
    """Validate phone number (Bangladesh format)"""
    if not phone:
        return True  # Phone is optional
    # Bangladesh: +880 followed by 10 digits, or 01 followed by 10 digits
    pattern = r"^(\+8801[3-9]\d{8}|01[3-9]\d{9})$"
    return re.match(pattern, phone) is not None


def validate_name(name):
    """Validate name (letters, spaces, hyphens only)"""
    if not name:
        return False
    pattern = r"^[a-zA-Z\s\-\.]+$"
    return re.match(pattern, name) is not None


def soft_delete_record(collection_name, record_id, user_id):
    """Soft delete a record - mark as deleted instead of removing"""
    try:
        result = get_collection(collection_name).update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"deleted_at": utcnow(), "deleted_by": user_id}},
        )
        return result.modified_count > 0
    except Exception:
        return False


def get_soft_delete_query(additional_query=None):
    """Get query that excludes soft-deleted records"""
    base_query = {"deleted_at": None}
    if additional_query:
        base_query.update(additional_query)
    return base_query


def log_audit_event(
    user_id,
    action,
    collection_name,
    record_id,
    old_value=None,
    new_value=None,
    agency_id=None,
):
    """Log an audit event for tracking changes"""
    try:
        audit_data = {
            "user_id": user_id,
            "action": action,  # create, update, delete, login, logout
            "collection_name": collection_name,
            "record_id": str(record_id) if record_id else None,
            "old_value": old_value,
            "new_value": new_value,
            "agency_id": agency_id,
            "timestamp": utcnow(),
        }
        get_collection("audit_logs").insert_one(audit_data)
        return True
    except Exception as e:
        print(f"Audit logging failed: {e}")
        return False


def get_user_agency_id(user_data):
    """Get the agency_id from the current user's profile"""
    user_id = user_data.get("user_id")
    role = user_data.get("role")

    if role in ("admin", "staff"):
        try:
            staff = get_collection("staff").find_one({"_id": ObjectId(user_id)})
            if staff and staff.get("agency_id"):
                return staff["agency_id"]
        except Exception:
            pass
    elif role == "donor":
        try:
            donor = get_collection("donors").find_one({"_id": ObjectId(user_id)})
            if donor and donor.get("agency_id"):
                return donor["agency_id"]
        except Exception:
            pass
    elif role == "guardian":
        try:
            guardian = get_collection("guardians").find_one({"_id": ObjectId(user_id)})
            if guardian and guardian.get("agency_id"):
                return guardian["agency_id"]
        except Exception:
            pass

    return None


# ==================== DECORATORS ====================


def token_required(f):
    """Decorator to require authentication"""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return error_response("Token is missing", 401)

        payload = decode_token(token)
        if not payload:
            return error_response("Invalid or expired token", 401)

        request.user_data = payload
        return f(*args, **kwargs)

    return decorated


def role_required(roles):
    """Decorator to check user role"""

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if "Authorization" in request.headers:
                auth_header = request.headers["Authorization"]
                if auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]

            if not token:
                return error_response("Token is missing", 401)

            payload = decode_token(token)
            if not payload:
                return error_response("Invalid or expired token", 401)

            user_role = payload.get("role")
            if user_role not in roles:
                return error_response("Insufficient permissions", 403)

            request.user_data = payload
            return f(*args, **kwargs)

        return decorated

    return decorator


# ==================== AUTH ROUTES ====================


@app.route("/api/auth/register", methods=["POST"])
def register():
    """Register a new user"""
    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    required_fields = ["name", "email", "password", "role"]
    for field in required_fields:
        if field not in data or not str(data[field]).strip():
            return error_response(f"{field} is required", 400)

    name = str(data.get("name")).strip()
    email = str(data.get("email")).strip().lower()
    password = str(data.get("password"))
    role = str(data.get("role")).strip().lower()

    # Validate role
    if role not in VALID_ROLES:
        return error_response(
            f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}", 400
        )

    # Validate email format
    if not validate_email(email):
        return error_response("Invalid email format", 400)

    # Validate name format
    if not validate_name(name):
        return error_response(
            "Invalid name format (letters, spaces, hyphens only)", 400
        )

    # Validate phone if provided
    phone = str(data.get("phone", "")).strip()
    if phone and not validate_phone(phone):
        return error_response(
            "Invalid phone number format (use Bangladesh format)", 400
        )

    # Validate password length
    if len(password) < 6:
        return error_response("Password must be at least 6 characters", 400)

    # Check if email already exists in the target collection
    if role == "donor":
        collection = get_collection("donors")
    elif role == "guardian":
        collection = get_collection("guardians")
    else:
        collection = get_collection("staff")

    if collection.find_one({"email": email}):
        return error_response("Email already registered", 400)

    # Create user based on role
    user_data = {
        "full_name": name,
        "email": email,
        "password": hash_password(password),
        "role": role,
        "created_at": utcnow(),
        "updated_at": utcnow(),
    }

    # For admin role, create agency first
    agency_id = None
    if role == "admin":
        agency_name = str(data.get("agencyName", "")).strip()
        if not agency_name:
            return error_response("Agency name is required for admin registration", 400)

        agencies_collection = get_collection("agencies")
        agency_result = agencies_collection.insert_one(
            {
                "name": agency_name,
                "address": str(data.get("address", "")).strip(),
                "phone": str(data.get("phone", "")).strip(),
                "email": email,
                "created_at": utcnow(),
                "updated_at": utcnow(),
            }
        )
        agency_id = agency_result.inserted_id
    elif role in ("staff", "donor", "guardian"):
        # Get agency_id from request for non-admin roles
        provided_agency_id = data.get("agency_id")
        if not provided_agency_id:
            return error_response(
                "Agency selection is required for staff/donor/guardian", 400
            )

        # Validate agency exists
        try:
            agency_obj_id = ObjectId(provided_agency_id)
            agency = get_collection("agencies").find_one({"_id": agency_obj_id})
            if not agency:
                return error_response("Invalid agency selected", 400)
            agency_id = agency_obj_id
        except InvalidId:
            return error_response("Invalid agency ID format", 400)

    if role == "donor":
        donor_type = str(data.get("donor_type", "individual")).strip()
        if donor_type not in VALID_DONOR_TYPES:
            donor_type = "individual"
        user_data["donor_type"] = donor_type
        user_data["phone"] = str(data.get("phone", "")).strip()
        user_data["agency_id"] = agency_id
    elif role == "guardian":
        user_data["phone"] = str(data.get("phone", "")).strip()
        user_data["address"] = str(data.get("address", "")).strip()
        user_data["national_id"] = str(data.get("national_id", "")).strip()
        user_data["verified"] = False
        user_data["child_id"] = data.get("child_id", None)
        user_data["agency_id"] = agency_id
    elif role in ("staff", "admin"):
        user_data["role_field"] = role
        user_data["status"] = "active"
        user_data["agency_id"] = agency_id
        user_data["phone"] = str(data.get("phone", "")).strip()

    result = collection.insert_one(user_data)

    # Audit log - user registration
    collection_name = "staff" if role in ("admin", "staff") else f"{role}s"
    log_audit_event(
        str(result.inserted_id),
        "create",
        collection_name,
        result.inserted_id,
        None,
        {"email": email, "role": role},
        agency_id,
    )

    # Generate token
    token = generate_token(str(result.inserted_id), role)

    # Get agency name if applicable
    agency_name = None
    if agency_id:
        agency = get_collection("agencies").find_one({"_id": agency_id})
        if agency:
            agency_name = agency.get("name")

    return success_response(
        {
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": str(result.inserted_id),
                "name": name,
                "email": email,
                "role": role,
                "agency_name": agency_name,
            },
        },
        201,
    )


@app.route("/api/auth/login", methods=["POST"])
def login():
    """Login user"""
    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    if not data.get("email") or not data.get("password"):
        return error_response("Email and password are required", 400)

    email = str(data.get("email")).strip().lower()
    password = str(data.get("password"))

    # Try to find user in all collections
    user = None
    role = None

    # Check staff (admin)
    staff_col = get_collection("staff")
    user = staff_col.find_one({"email": email})
    if user:
        role = user.get("role_field", "staff")

    # Check donors
    if not user:
        donor_col = get_collection("donors")
        user = donor_col.find_one({"email": email})
        if user:
            role = "donor"

    # Check guardians
    if not user:
        guardian_col = get_collection("guardians")
        user = guardian_col.find_one({"email": email})
        if user:
            role = "guardian"

    if not user:
        return error_response("Invalid email or password", 401)

    # Verify password
    if not verify_password(password, user.get("password", "")):
        return error_response("Invalid email or password", 401)

    # Generate token
    token = generate_token(str(user["_id"]), role)

    # Audit log - login action
    log_audit_event(
        str(user["_id"]),
        "login",
        "auth",
        str(user["_id"]),
        None,
        None,
        user.get("agency_id"),
    )

    # Get agency name if applicable
    agency_name = None
    agency_id = user.get("agency_id")
    if agency_id:
        agency = get_collection("agencies").find_one({"_id": agency_id})
        if agency:
            agency_name = agency.get("name")

    return success_response(
        {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user.get("full_name"),
                "email": user.get("email"),
                "role": role,
                "agency_name": agency_name,
            },
        }
    )


@app.route("/api/auth/me", methods=["GET"])
@token_required
def get_current_user_info():
    """Get current user info"""
    payload = request.user_data
    user_id = payload.get("user_id")
    role = payload.get("role")

    try:
        collection = get_collection(
            "staff" if role in ("admin", "staff") else f"{role}s"
        )
        user = collection.find_one({"_id": ObjectId(user_id)})
    except InvalidId:
        return error_response("Invalid user ID", 400)

    if not user:
        return error_response("User not found", 404)

    user["_id"] = str(user["_id"])
    user.pop("password", None)

    return jsonify({"user": user})


@app.route("/api/auth/profile", methods=["PUT"])
@token_required
def update_profile():
    """Update current user's profile (name, phone)"""
    payload = request.user_data
    user_id = payload.get("user_id")
    role = payload.get("role")

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    try:
        collection = get_collection(
            "staff" if role in ("admin", "staff") else f"{role}s"
        )
        update_data = {}

        if data.get("name"):
            update_data["full_name"] = str(data.get("name")).strip()
        if data.get("phone"):
            update_data["phone"] = str(data.get("phone")).strip()

        if not update_data:
            return error_response("No valid fields to update", 400)

        update_data["updated_at"] = utcnow()

        result = collection.update_one(
            {"_id": ObjectId(user_id)}, {"$set": update_data}
        )

        if result.matched_count == 0:
            return error_response("User not found", 404)

        return success_response("Profile updated successfully")
    except InvalidId:
        return error_response("Invalid user ID", 400)


@app.route("/api/auth/change-password", methods=["PUT"])
@token_required
def change_password():
    """Change current user's password"""
    payload = request.user_data
    user_id = payload.get("user_id")
    role = payload.get("role")

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return error_response("Current password and new password are required", 400)

    if len(new_password) < 6:
        return error_response("New password must be at least 6 characters", 400)

    try:
        collection = get_collection(
            "staff" if role in ("admin", "staff") else f"{role}s"
        )
        user = collection.find_one({"_id": ObjectId(user_id)})

        if not user:
            return error_response("User not found", 404)

        if not verify_password(current_password, user.get("password", "")):
            return error_response("Current password is incorrect", 400)

        collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": hash_password(new_password), "updated_at": utcnow()}},
        )

        return success_response("Password changed successfully")
    except InvalidId:
        return error_response("Invalid user ID", 400)


# ==================== CHILDREN ROUTES ====================


@app.route("/api/children", methods=["GET"])
@token_required
def get_children():
    """Get all children (admin/staff only) with pagination and search"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    page, limit, skip = get_pagination_params()
    search = request.args.get("search", "").strip()

    agency_id = get_user_agency_id(request.user_data)
    query = get_soft_delete_query({"agency_id": agency_id} if agency_id else {})

    # Add search filter
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"gender": {"$regex": search, "$options": "i"}},
            {"current_status": {"$regex": search, "$options": "i"}},
        ]

    total = get_collection("children").count_documents(query)
    children_list = list(get_collection("children").find(query).skip(skip).limit(limit))
    for child in children_list:
        child["_id"] = str(child["_id"])
        child.pop("documents", None)

    return jsonify(
        {
            "children": children_list,
            "page": page,
            "limit": limit,
            "total": total,
        }
    )


@app.route("/api/children", methods=["POST"])
@token_required
def create_child():
    """Create a new child"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    if not data.get("full_name"):
        return error_response("full_name is required", 400)

    # Get agency_id from user's profile
    agency_id = get_user_agency_id(request.user_data)
    if not agency_id:
        return error_response("User is not associated with any agency", 400)

    # Validate enum fields
    status = str(data.get("current_status", "pending")).strip()
    if status not in VALID_STATUSES:
        return error_response(
            f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}", 400
        )

    gender = str(data.get("gender", "")).strip()
    if gender and gender not in VALID_GENDERS:
        return error_response(
            f"Invalid gender. Must be one of: {', '.join(VALID_GENDERS - {''})}", 400
        )

    child_data = sanitize_data(data, CHILD_FIELDS)
    child_data["current_status"] = status
    child_data["gender"] = gender
    child_data["agency_id"] = agency_id
    child_data.setdefault("admission_date", utcnow().strftime("%Y-%m-%d"))
    child_data["created_at"] = utcnow()
    child_data["updated_at"] = utcnow()

    result = get_collection("children").insert_one(child_data)

    # Audit log
    user_id = request.user_data.get("user_id")
    agency_id = get_user_agency_id(request.user_data)
    log_audit_event(
        user_id, "create", "children", result.inserted_id, None, child_data, agency_id
    )

    return success_response(
        {"message": "Child created successfully", "child_id": str(result.inserted_id)},
        201,
    )


@app.route("/api/children/<child_id>", methods=["GET"])
@token_required
def get_child(child_id):
    """Get child by ID"""
    try:
        child = get_collection("children").find_one({"_id": ObjectId(child_id)})
    except InvalidId:
        return error_response("Invalid child ID format", 400)

    if not child:
        return error_response("Child not found", 404)

    child["_id"] = str(child["_id"])
    return jsonify({"child": child})


@app.route("/api/children/<child_id>", methods=["PUT"])
@token_required
def update_child(child_id):
    """Update child — only whitelisted fields allowed"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    # Sanitize: strip non-whitelisted fields to prevent injection
    safe_data = sanitize_data(data, CHILD_FIELDS)

    # Validate enum fields if present
    if "current_status" in safe_data:
        if safe_data["current_status"] not in VALID_STATUSES:
            return error_response(
                f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}", 400
            )
    if "gender" in safe_data:
        if safe_data["gender"] not in VALID_GENDERS:
            return error_response(
                f"Invalid gender. Must be one of: {', '.join(VALID_GENDERS - {''})}",
                400,
            )

    safe_data["updated_at"] = utcnow()

    try:
        result = get_collection("children").update_one(
            {"_id": ObjectId(child_id)}, {"$set": safe_data}
        )
    except InvalidId:
        return error_response("Invalid child ID format", 400)

    if result.matched_count == 0:
        return error_response("Child not found", 404)

    return success_response("Child updated successfully")


@app.route("/api/children/<child_id>", methods=["DELETE"])
@token_required
def delete_child(child_id):
    """Delete child (soft delete - admin only)"""
    role = request.user_data.get("role")
    if role != "admin":
        return error_response("Admin access required", 403)

    user_id = request.user_data.get("user_id")
    agency_id = get_user_agency_id(request.user_data)

    try:
        deleted = soft_delete_record("children", child_id, user_id)
    except InvalidId:
        return error_response("Invalid child ID format", 400)

    if not deleted:
        return error_response("Child not found", 404)

    # Audit log
    log_audit_event(user_id, "delete", "children", child_id, None, None, agency_id)

    return success_response("Child deleted successfully (soft delete)")


@app.route("/api/children/<child_id>/assign", methods=["PUT"])
@token_required
def assign_child_to_guardian(child_id):
    """Assign a child to a guardian"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    guardian_id = data.get("guardian_id")
    if not guardian_id:
        return error_response("guardian_id is required", 400)

    try:
        child_obj_id = ObjectId(child_id)
        guardian_obj_id = ObjectId(guardian_id)
    except InvalidId:
        return error_response("Invalid ID format", 400)

    agency_id = get_user_agency_id(request.user_data)
    user_id = request.user_data.get("user_id")

    # Verify child belongs to user's agency
    child = get_collection("children").find_one(
        {"_id": child_obj_id, "agency_id": agency_id}
    )
    if not child:
        return error_response("Child not found", 404)

    # Verify guardian belongs to user's agency
    guardian = get_collection("guardians").find_one(
        {"_id": guardian_obj_id, "agency_id": agency_id, "verified": True}
    )
    if not guardian:
        return error_response("Guardian not found or not verified", 404)

    # Update child with guardian assignment
    old_guardian_id = child.get("guardian_id")
    get_collection("children").update_one(
        {"_id": child_obj_id},
        {
            "$set": {
                "guardian_id": guardian_obj_id,
                "current_status": "in_foster",
                "updated_at": utcnow(),
            }
        },
    )

    # Also update guardian's child_id
    get_collection("guardians").update_one(
        {"_id": guardian_obj_id},
        {"$set": {"child_id": child_obj_id, "updated_at": utcnow()}},
    )

    # Audit log
    log_audit_event(
        user_id,
        "assign",
        "children",
        child_id,
        {"guardian_id": str(old_guardian_id) if old_guardian_id else None},
        {"guardian_id": guardian_id},
        agency_id,
    )

    return success_response(f"Child assigned to guardian {guardian.get('full_name')}")


# ==================== GUARDIANS ROUTES ====================


@app.route("/api/guardians", methods=["GET"])
@token_required
def get_guardians():
    """Get all guardians with pagination and search"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    page, limit, skip = get_pagination_params()
    search = request.args.get("search", "").strip()

    agency_id = get_user_agency_id(request.user_data)
    query = get_soft_delete_query({"agency_id": agency_id} if agency_id else {})

    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}},
        ]

    total = get_collection("guardians").count_documents(query)
    guardians_list = list(
        get_collection("guardians").find(query).skip(skip).limit(limit)
    )
    for guardian in guardians_list:
        guardian["_id"] = str(guardian["_id"])

    return jsonify(
        {
            "guardians": guardians_list,
            "page": page,
            "limit": limit,
            "total": total,
        }
    )


@app.route("/api/guardians", methods=["POST"])
@token_required
def create_guardian():
    """Create a new guardian"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    if not data.get("full_name"):
        return error_response("full_name is required", 400)

    # Get agency_id from user's profile
    agency_id = get_user_agency_id(request.user_data)
    if not agency_id:
        return error_response("User is not associated with any agency", 400)

    guardian_data = sanitize_data(data, GUARDIAN_FIELDS)
    guardian_data["agency_id"] = agency_id
    guardian_data.setdefault("verified", False)
    guardian_data["created_at"] = utcnow()
    guardian_data["updated_at"] = utcnow()

    result = get_collection("guardians").insert_one(guardian_data)

    return success_response(
        {
            "message": "Guardian created successfully",
            "guardian_id": str(result.inserted_id),
        },
        201,
    )


@app.route("/api/guardians/<guardian_id>", methods=["GET"])
@token_required
def get_guardian(guardian_id):
    """Get guardian by ID"""
    try:
        guardian = get_collection("guardians").find_one({"_id": ObjectId(guardian_id)})
    except InvalidId:
        return error_response("Invalid guardian ID format", 400)

    if not guardian:
        return error_response("Guardian not found", 404)

    guardian["_id"] = str(guardian["_id"])
    return jsonify({"guardian": guardian})


@app.route("/api/guardians/<guardian_id>", methods=["PUT"])
@token_required
def update_guardian(guardian_id):
    """Update guardian — only whitelisted fields"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    safe_data = sanitize_data(data, GUARDIAN_FIELDS)
    safe_data["updated_at"] = utcnow()

    try:
        result = get_collection("guardians").update_one(
            {"_id": ObjectId(guardian_id)}, {"$set": safe_data}
        )
    except InvalidId:
        return error_response("Invalid guardian ID format", 400)

    if result.matched_count == 0:
        return error_response("Guardian not found", 404)

    return success_response("Guardian updated successfully")


@app.route("/api/guardians/<guardian_id>", methods=["DELETE"])
@token_required
def delete_guardian(guardian_id):
    """Delete guardian (soft delete - admin only)"""
    role = request.user_data.get("role")
    if role != "admin":
        return error_response("Admin access required", 403)

    user_id = request.user_data.get("user_id")

    try:
        deleted = soft_delete_record("guardians", guardian_id, user_id)
    except InvalidId:
        return error_response("Invalid guardian ID format", 400)

    if not deleted:
        return error_response("Guardian not found", 404)

    return success_response("Guardian deleted successfully (soft delete)")


# ==================== STAFF ROUTES ====================


@app.route("/api/staff", methods=["GET"])
@token_required
def get_staff():
    """Get all staff (admin only) with pagination and search"""
    role = request.user_data.get("role")
    if role != "admin":
        return error_response("Admin access required", 403)

    page, limit, skip = get_pagination_params()
    search = request.args.get("search", "").strip()

    agency_id = get_user_agency_id(request.user_data)
    query = get_soft_delete_query({"agency_id": agency_id} if agency_id else {})

    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"role_field": {"$regex": search, "$options": "i"}},
        ]

    total = get_collection("staff").count_documents(query)
    staff_list = list(get_collection("staff").find(query).skip(skip).limit(limit))
    for s in staff_list:
        s["_id"] = str(s["_id"])
        s.pop("password", None)

    return jsonify(
        {
            "staff": staff_list,
            "page": page,
            "limit": limit,
            "total": total,
        }
    )


@app.route("/api/staff", methods=["POST"])
@token_required
def create_staff():
    """Create a new staff"""
    role = request.user_data.get("role")
    if role != "admin":
        return error_response("Admin access required", 403)

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    required_fields = ["full_name", "email", "password", "role"]
    for field in required_fields:
        if field not in data or not str(data[field]).strip():
            return error_response(f"{field} is required", 400)

    agency_id = get_user_agency_id(request.user_data)
    if not agency_id:
        return error_response("User is not associated with any agency", 400)

    staff_data = {
        "agency_id": agency_id,
        "full_name": str(data.get("full_name")).strip(),
        "role_field": data.get("role", "staff"),
        "phone": str(data.get("phone", "")).strip(),
        "email": str(data.get("email")).strip().lower(),
        "password": hash_password(str(data.get("password"))),
        "status": data.get("status", "active"),
        "created_at": utcnow(),
        "updated_at": utcnow(),
    }

    # Validate status
    if staff_data["status"] not in VALID_STAFF_STATUSES:
        return error_response(
            f"Invalid status. Must be one of: {', '.join(VALID_STAFF_STATUSES)}", 400
        )

    result = get_collection("staff").insert_one(staff_data)

    return success_response(
        {"message": "Staff created successfully", "staff_id": str(result.inserted_id)},
        201,
    )


@app.route("/api/staff/<staff_id>", methods=["GET"])
@token_required
def get_staff_member(staff_id):
    """Get staff by ID"""
    try:
        staff = get_collection("staff").find_one({"_id": ObjectId(staff_id)})
    except InvalidId:
        return error_response("Invalid staff ID format", 400)

    if not staff:
        return error_response("Staff not found", 404)

    staff["_id"] = str(staff["_id"])
    staff.pop("password", None)
    return jsonify({"staff": staff})


@app.route("/api/staff/<staff_id>", methods=["PUT"])
@token_required
def update_staff(staff_id):
    """Update staff — only whitelisted fields"""
    role = request.user_data.get("role")
    if role != "admin":
        return error_response("Admin access required", 403)

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    safe_data = sanitize_data(data, STAFF_FIELDS)

    # Validate status if present
    if "status" in safe_data and safe_data["status"] not in VALID_STAFF_STATUSES:
        return error_response(
            f"Invalid status. Must be one of: {', '.join(VALID_STAFF_STATUSES)}", 400
        )

    # Password update handled separately (not in whitelist, needs hashing)
    if "password" in data and data["password"]:
        safe_data["password"] = hash_password(str(data["password"]))

    safe_data["updated_at"] = utcnow()

    try:
        result = get_collection("staff").update_one(
            {"_id": ObjectId(staff_id)}, {"$set": safe_data}
        )
    except InvalidId:
        return error_response("Invalid staff ID format", 400)

    if result.matched_count == 0:
        return error_response("Staff not found", 404)

    return success_response("Staff updated successfully")


@app.route("/api/staff/<staff_id>", methods=["DELETE"])
@token_required
def delete_staff(staff_id):
    """Delete staff (soft delete - admin only)"""
    role = request.user_data.get("role")
    if role != "admin":
        return error_response("Admin access required", 403)

    user_id = request.user_data.get("user_id")

    try:
        deleted = soft_delete_record("staff", staff_id, user_id)
    except InvalidId:
        return error_response("Invalid staff ID format", 400)

    if not deleted:
        return error_response("Staff not found", 404)

    return success_response("Staff deleted successfully (soft delete)")


# ==================== DONORS ROUTES ====================


@app.route("/api/donors", methods=["GET"])
@token_required
def get_donors():
    """Get all donors (admin/staff) with pagination and search"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    page, limit, skip = get_pagination_params()
    search = request.args.get("search", "").strip()

    agency_id = get_user_agency_id(request.user_data)
    query = get_soft_delete_query({"agency_id": agency_id} if agency_id else {})

    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"donor_type": {"$regex": search, "$options": "i"}},
        ]

    total = get_collection("donors").count_documents(query)
    donors_list = list(get_collection("donors").find(query).skip(skip).limit(limit))
    for donor in donors_list:
        donor["_id"] = str(donor["_id"])
        donor.pop("password", None)

    return jsonify(
        {
            "donors": donors_list,
            "page": page,
            "limit": limit,
            "total": total,
        }
    )


@app.route("/api/donors", methods=["POST"])
@token_required
def create_donor():
    """Create a new donor"""
    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    required_fields = ["full_name", "email", "password"]
    for field in required_fields:
        if field not in data or not str(data[field]).strip():
            return error_response(f"{field} is required", 400)

    donor_type = str(data.get("donor_type", "individual")).strip()
    if donor_type not in VALID_DONOR_TYPES:
        return error_response(
            f"Invalid donor_type. Must be one of: {', '.join(VALID_DONOR_TYPES)}", 400
        )

    donor_data = {
        "full_name": str(data.get("full_name")).strip(),
        "donor_type": donor_type,
        "phone": str(data.get("phone", "")).strip(),
        "email": str(data.get("email")).strip().lower(),
        "password": hash_password(str(data.get("password"))),
        "role": "donor",
        "agency_id": get_user_agency_id(request.user_data),
        "created_at": utcnow(),
        "updated_at": utcnow(),
    }

    result = get_collection("donors").insert_one(donor_data)

    return success_response(
        {"message": "Donor created successfully", "donor_id": str(result.inserted_id)},
        201,
    )


@app.route("/api/donors/<donor_id>", methods=["GET"])
@token_required
def get_donor(donor_id):
    """Get donor by ID"""
    try:
        donor = get_collection("donors").find_one({"_id": ObjectId(donor_id)})
    except InvalidId:
        return error_response("Invalid donor ID format", 400)

    if not donor:
        return error_response("Donor not found", 404)

    donor["_id"] = str(donor["_id"])
    donor.pop("password", None)
    return jsonify({"donor": donor})


@app.route("/api/donors/<donor_id>", methods=["PUT"])
@token_required
def update_donor(donor_id):
    """Update donor — only whitelisted fields"""
    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    safe_data = sanitize_data(data, DONOR_FIELDS)

    if "donor_type" in safe_data and safe_data["donor_type"] not in VALID_DONOR_TYPES:
        return error_response(
            f"Invalid donor_type. Must be one of: {', '.join(VALID_DONOR_TYPES)}", 400
        )

    # Password update handled separately
    if "password" in data and data["password"]:
        safe_data["password"] = hash_password(str(data["password"]))

    safe_data["updated_at"] = utcnow()

    try:
        result = get_collection("donors").update_one(
            {"_id": ObjectId(donor_id)}, {"$set": safe_data}
        )
    except InvalidId:
        return error_response("Invalid donor ID format", 400)

    if result.matched_count == 0:
        return error_response("Donor not found", 404)

    return success_response("Donor updated successfully")


@app.route("/api/donors/<donor_id>", methods=["DELETE"])
@token_required
def delete_donor(donor_id):
    """Delete donor (soft delete - admin only)"""
    role = request.user_data.get("role")
    if role != "admin":
        return error_response("Admin access required", 403)

    user_id = request.user_data.get("user_id")

    try:
        deleted = soft_delete_record("donors", donor_id, user_id)
    except InvalidId:
        return error_response("Invalid donor ID format", 400)

    if not deleted:
        return error_response("Donor not found", 404)

    return success_response("Donor deleted successfully (soft delete)")


# ==================== DONATIONS ROUTES ====================


@app.route("/api/donations", methods=["GET"])
@token_required
def get_donations():
    """Get all donations with pagination"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff", "donor"):
        return error_response("Insufficient permissions", 403)

    page, limit, skip = get_pagination_params()

    agency_id = get_user_agency_id(request.user_data)
    query = get_soft_delete_query({"agency_id": agency_id} if agency_id else {})

    total = get_collection("donations").count_documents(query)
    donations_list = list(
        get_collection("donations").find(query).skip(skip).limit(limit)
    )
    for donation in donations_list:
        donation["_id"] = str(donation["_id"])

    return jsonify(
        {
            "donations": donations_list,
            "page": page,
            "limit": limit,
            "total": total,
        }
    )


@app.route("/api/donations", methods=["POST"])
@token_required
def create_donation():
    """Create a new donation"""
    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    required_fields = ["donor_id", "amount"]
    for field in required_fields:
        if field not in data:
            return error_response(f"{field} is required", 400)

    agency_id = get_user_agency_id(request.user_data)
    if not agency_id:
        return error_response("User is not associated with any agency", 400)

    # Validate amount
    try:
        amount = float(data.get("amount"))
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return error_response("Amount must be a positive number", 400)

    donation_data = sanitize_data(data, DONATION_FIELDS)
    donation_data["amount"] = amount
    donation_data["agency_id"] = agency_id
    donation_data.setdefault("donation_date", utcnow().strftime("%Y-%m-%d"))
    donation_data["created_at"] = utcnow()
    donation_data["updated_at"] = utcnow()

    result = get_collection("donations").insert_one(donation_data)

    return success_response(
        {
            "message": "Donation recorded successfully",
            "donation_id": str(result.inserted_id),
        },
        201,
    )


@app.route("/api/donations/<donation_id>", methods=["GET"])
@token_required
def get_donation(donation_id):
    """Get donation by ID"""
    try:
        donation = get_collection("donations").find_one({"_id": ObjectId(donation_id)})
    except InvalidId:
        return error_response("Invalid donation ID format", 400)

    if not donation:
        return error_response("Donation not found", 404)

    donation["_id"] = str(donation["_id"])
    return jsonify({"donation": donation})


# ==================== AGENCIES ROUTES ====================


@app.route("/api/agencies", methods=["GET"])
@token_required
def get_agencies():
    """Get all agencies with pagination (admin sees own agency only)"""
    role = request.user_data.get("role")
    page, limit, skip = get_pagination_params()

    agency_id = get_user_agency_id(request.user_data)
    if role == "admin" and agency_id:
        query = get_soft_delete_query({"_id": agency_id})
    else:
        query = get_soft_delete_query({})

    total = get_collection("agencies").count_documents(query)
    agencies_list = list(get_collection("agencies").find(query).skip(skip).limit(limit))
    for agency in agencies_list:
        agency["_id"] = str(agency["_id"])

    return jsonify(
        {
            "agencies": agencies_list,
            "page": page,
            "limit": limit,
            "total": total,
        }
    )


@app.route("/api/agencies/list", methods=["GET"])
def get_agencies_public():
    """Get all agencies for registration dropdown (public, no auth required)"""
    try:
        agencies = list(get_collection("agencies").find({}, {"_id": 1, "name": 1}))
        for agency in agencies:
            agency["_id"] = str(agency["_id"])
        return jsonify({"agencies": agencies})
    except Exception as e:
        return error_response(f"Failed to fetch agencies: {str(e)}", 500)


@app.route("/api/agencies", methods=["POST"])
@token_required
def create_agency():
    """Create a new agency"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    if not data.get("name"):
        return error_response("name is required", 400)

    agency_data = sanitize_data(data, AGENCY_FIELDS)
    agency_data["created_at"] = utcnow()
    agency_data["updated_at"] = utcnow()

    result = get_collection("agencies").insert_one(agency_data)

    return success_response(
        {
            "message": "Agency created successfully",
            "agency_id": str(result.inserted_id),
        },
        201,
    )


@app.route("/api/agencies/<agency_id>", methods=["GET"])
@token_required
def get_agency(agency_id):
    """Get agency by ID"""
    try:
        agency = get_collection("agencies").find_one({"_id": ObjectId(agency_id)})
    except InvalidId:
        return error_response("Invalid agency ID format", 400)

    if not agency:
        return error_response("Agency not found", 404)

    agency["_id"] = str(agency["_id"])
    return jsonify({"agency": agency})


# ==================== CHILD RECORDS ROUTES ====================


@app.route("/api/child_records", methods=["GET"])
@token_required
def get_child_records():
    """Get all child records with pagination"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    page, limit, skip = get_pagination_params()

    agency_id = get_user_agency_id(request.user_data)

    if agency_id:
        children = list(
            get_collection("children").find(
                get_soft_delete_query({"agency_id": agency_id}), {"_id": 1}
            )
        )
        child_ids = [c["_id"] for c in children]
        query = {"child_id": {"$in": child_ids}} if child_ids else {}
    else:
        query = get_soft_delete_query({})

    total = get_collection("child_records").count_documents(query)
    records = list(get_collection("child_records").find(query).skip(skip).limit(limit))
    for record in records:
        record["_id"] = str(record["_id"])

    return jsonify(
        {
            "records": records,
            "page": page,
            "limit": limit,
            "total": total,
        }
    )


@app.route("/api/child_records", methods=["POST"])
@token_required
def create_child_record():
    """Create child health/education record"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    if not data.get("child_id"):
        return error_response("child_id is required", 400)

    record_data = sanitize_data(data, CHILD_RECORD_FIELDS)
    record_data.setdefault("last_visit_date", utcnow().strftime("%Y-%m-%d"))
    record_data["created_at"] = utcnow()
    record_data["updated_at"] = utcnow()

    result = get_collection("child_records").insert_one(record_data)

    return success_response(
        {
            "message": "Child record created successfully",
            "record_id": str(result.inserted_id),
        },
        201,
    )


@app.route("/api/child_records/<record_id>", methods=["GET"])
@token_required
def get_child_record(record_id):
    """Get child record by ID"""
    try:
        record = get_collection("child_records").find_one({"_id": ObjectId(record_id)})
    except InvalidId:
        return error_response("Invalid record ID format", 400)

    if not record:
        return error_response("Record not found", 404)

    record["_id"] = str(record["_id"])
    return jsonify({"record": record})


@app.route("/api/child_records/<record_id>", methods=["PUT"])
@token_required
def update_child_record(record_id):
    """Update child record — only whitelisted fields"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    data = request.get_json()
    if not data:
        return error_response("Request body is required", 400)

    safe_data = sanitize_data(data, CHILD_RECORD_FIELDS)
    safe_data["updated_at"] = utcnow()

    try:
        result = get_collection("child_records").update_one(
            {"_id": ObjectId(record_id)}, {"$set": safe_data}
        )
    except InvalidId:
        return error_response("Invalid record ID format", 400)

    if result.matched_count == 0:
        return error_response("Record not found", 404)

    return success_response("Record updated successfully")


# ==================== FILE UPLOAD ROUTES ====================


@app.route("/api/upload/photo", methods=["POST"])
@token_required
def upload_photo():
    """Upload child photo"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    if "file" not in request.files:
        return error_response("No file provided", 400)

    file = request.files["file"]
    file_path = save_file(file, "photos")

    if not file_path:
        return error_response("Invalid file type", 400)

    return success_response(
        {"message": "Photo uploaded successfully", "path": file_path}
    )


@app.route("/api/upload/document", methods=["POST"])
@token_required
def upload_document():
    """Upload document"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    if "file" not in request.files:
        return error_response("No file provided", 400)

    file = request.files["file"]
    file_path = save_file(file, "documents")

    if not file_path:
        return error_response("Invalid file type", 400)

    return success_response(
        {"message": "Document uploaded successfully", "path": file_path}
    )


@app.route("/api/upload/receipt", methods=["POST"])
@token_required
def upload_receipt():
    """Upload donation receipt"""
    if "file" not in request.files:
        return error_response("No file provided", 400)

    file = request.files["file"]
    file_path = save_file(file, "receipts")

    if not file_path:
        return error_response("Invalid file type", 400)

    return success_response(
        {"message": "Receipt uploaded successfully", "path": file_path}
    )


# ==================== STATS ROUTE ====================


@app.route("/api/stats", methods=["GET"])
@token_required
def get_stats():
    """Get dashboard statistics"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    agency_id = get_user_agency_id(request.user_data)
    base_query = get_soft_delete_query({"agency_id": agency_id} if agency_id else {})

    stats = {
        "total_children": get_collection("children").count_documents(base_query),
        "total_guardians": get_collection("guardians").count_documents(base_query),
        "total_donors": get_collection("donors").count_documents(base_query),
        "total_donations": get_collection("donations").count_documents(
            {"agency_id": agency_id} if agency_id else {}
        ),
        "total_staff": get_collection("staff").count_documents(base_query),
        "total_agencies": get_collection("agencies").count_documents(
            get_soft_delete_query({})
        ),
        "pending_children": get_collection("children").count_documents(
            get_soft_delete_query(
                {"current_status": "pending", **({"agency_id": agency_id} if agency_id else {})}
            )
        ),
        "in_foster": get_collection("children").count_documents(
            get_soft_delete_query(
                {"current_status": "in_foster", **({"agency_id": agency_id} if agency_id else {})}
            )
        ),
    }

    return jsonify(stats)


# ==================== REPORTS ROUTES ====================


@app.route("/api/reports/donations", methods=["GET"])
@token_required
def get_donations_report():
    """Get donations summary report"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    agency_id = get_user_agency_id(request.user_data)
    query = {"agency_id": agency_id} if agency_id else {}

    # Get total donations amount
    pipeline = [
        {"$match": query},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]
    result = list(get_collection("donations").aggregate(pipeline))

    total_amount = result[0]["total"] if result else 0
    total_count = result[0]["count"] if result else 0

    # Get by donor type
    by_donor_type = list(
        get_collection("donations").aggregate(
            [
                {"$match": query},
                {
                    "$lookup": {
                        "from": "donors",
                        "localField": "donor_id",
                        "foreignField": "_id",
                        "as": "donor",
                    }
                },
                {"$unwind": {"path": "$donor", "preserveNullAndEmptyArrays": True}},
                {
                    "$group": {
                        "_id": "$donor.donor_type",
                        "total": {"$sum": "$amount"},
                        "count": {"$sum": 1},
                    }
                },
            ]
        )
    )

    return jsonify(
        {
            "total_amount": total_amount,
            "total_donations": total_count,
            "by_donor_type": [
                {
                    "type": r["_id"] or "unknown",
                    "amount": r["total"],
                    "count": r["count"],
                }
                for r in by_donor_type
            ],
        }
    )


@app.route("/api/reports/children", methods=["GET"])
@token_required
def get_children_report():
    """Get children statistics report"""
    role = request.user_data.get("role")
    if role not in ("admin", "staff"):
        return error_response("Insufficient permissions", 403)

    agency_id = get_user_agency_id(request.user_data)
    query = get_soft_delete_query({"agency_id": agency_id} if agency_id else {})

    # Get by status
    by_status = list(
        get_collection("children").aggregate(
            [
                {"$match": query},
                {"$group": {"_id": "$current_status", "count": {"$sum": 1}}},
            ]
        )
    )

    # Get by gender
    by_gender = list(
        get_collection("children").aggregate(
            [{"$match": query}, {"$group": {"_id": "$gender", "count": {"$sum": 1}}}]
        )
    )

    return jsonify(
        {
            "by_status": [
                {"status": r["_id"] or "unknown", "count": r["count"]}
                for r in by_status
            ],
            "by_gender": [
                {"gender": r["_id"] or "unknown", "count": r["count"]}
                for r in by_gender
            ],
            "total": get_collection("children").count_documents(query),
        }
    )


# ==================== FILE SERVING ====================


@app.route("/uploads/<path:filename>", methods=["GET"])
def serve_file(filename):
    """Serve uploaded files"""
    return send_from_directory(Config.UPLOAD_FOLDER, filename)


# ==================== AUDIT LOGS ROUTES ====================


@app.route("/api/audit-logs", methods=["GET"])
@token_required
def get_audit_logs():
    """Get audit logs (admin only)"""
    role = request.user_data.get("role")
    if role != "admin":
        return error_response("Admin access required", 403)

    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    skip = (page - 1) * limit

    agency_id = get_user_agency_id(request.user_data)
    query = {"agency_id": agency_id} if agency_id else {}

    total = get_collection("audit_logs").count_documents(query)
    logs = list(
        get_collection("audit_logs")
        .find(query)
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )

    for log in logs:
        log["_id"] = str(log["_id"])
        log["timestamp"] = (
            log["timestamp"].isoformat() if log.get("timestamp") else None
        )
        # Don't send old/new values in list view to reduce payload
        log.pop("old_value", None)
        log.pop("new_value", None)

    return jsonify(
        {
            "logs": logs,
            "page": page,
            "limit": limit,
            "total": total,
        }
    )


# ==================== HEALTH CHECK ====================


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "FCMS API is running"})


# ==================== ERROR HANDLERS ====================


@app.errorhandler(404)
def not_found(error):
    return error_response("Not found", 404)


@app.errorhandler(500)
def internal_error(error):
    return error_response("Internal server error", 500)


@app.errorhandler(413)
def request_entity_too_large(error):
    return error_response("File too large. Maximum size is 16MB.", 413)


# ==================== MAIN ====================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
