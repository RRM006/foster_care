import os
import bcrypt
import binascii
from bson import ObjectId
from datetime import datetime, timedelta, timezone

import jwt
from config import Config
import database


def generate_token(user_id, role):
    """Generate JWT token"""
    payload = {
        "user_id": str(user_id),
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=Config.JWT_EXPIRATION),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)


def decode_token(token):
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(
            token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_current_user(token):
    """Get current user from token"""
    payload = decode_token(token)
    if not payload:
        return None

    user_id = payload.get("user_id")
    role = payload.get("role")

    # Get user from appropriate collection based on role
    try:
        if role in ("admin", "staff"):
            collection = database.get_collection("staff")
            user = collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user["collection"] = "staff"
        elif role == "donor":
            collection = database.get_collection("donors")
            user = collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user["collection"] = "donors"
        elif role == "guardian":
            collection = database.get_collection("guardians")
            user = collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user["collection"] = "guardians"
        else:
            return None

        return user
    except Exception:
        return None


def require_role(allowed_roles):
    """Decorator to check user role"""

    def decorator(f):
        def wrapper(*args, **kwargs):
            token = kwargs.get("token")
            if not token:
                return {"error": "No token provided"}, 401

            user = get_current_user(token)
            if not user:
                return {"error": "Invalid token"}, 401

            if (
                user.get("role") not in allowed_roles
                and user.get("role_field") not in allowed_roles
            ):
                return {"error": "Insufficient permissions"}, 403

            return f(*args, **kwargs)

        return wrapper

    return decorator


def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password, hashed_password):
    """Verify password against hash"""
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"), hashed_password.encode("utf-8")
        )
    except Exception:
        return False
