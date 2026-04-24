import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # MongoDB Configuration — MUST be set via environment variable
    MONGO_URI = os.getenv("MONGO_URI")
    if not MONGO_URI:
        raise RuntimeError(
            "MONGO_URI environment variable is not set. "
            "Create a .env file in the backend/ directory with: "
            "MONGO_URI=mongodb+srv://..."
        )

    # JWT Configuration — MUST be set via environment variable
    JWT_SECRET = os.getenv("JWT_SECRET")
    if not JWT_SECRET:
        raise RuntimeError(
            "JWT_SECRET environment variable is not set. "
            "Create a .env file in the backend/ directory with: "
            "JWT_SECRET=your_secret_key_here"
        )

    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION = 24 * 60  # 24 hours in minutes

    # Server Configuration
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"

    # Upload Configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf", "doc", "docx"}

    # Allowed image extensions
    ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

    # Database name
    DATABASE_NAME = os.getenv("DATABASE_NAME", "fosterdb")
