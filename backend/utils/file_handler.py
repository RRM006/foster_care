import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from config import Config


def allowed_file(filename, allowed_extensions=None):
    """Check if file extension is allowed"""
    if allowed_extensions is None:
        allowed_extensions = Config.ALLOWED_EXTENSIONS
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions


def allowed_image(filename):
    """Check if image extension is allowed"""
    return allowed_file(filename, Config.ALLOWED_IMAGE_EXTENSIONS)


def save_file(file, subfolder=""):
    """Save uploaded file and return the file path"""
    if file and allowed_file(file.filename):
        # Generate unique filename
        filename = secure_filename(file.filename)
        ext = filename.rsplit(".", 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"

        # Create folder if not exists
        if subfolder:
            upload_path = os.path.join(Config.UPLOAD_FOLDER, subfolder)
        else:
            upload_path = Config.UPLOAD_FOLDER

        os.makedirs(upload_path, exist_ok=True)

        # Save file
        file_path = os.path.join(upload_path, unique_filename)
        file.save(file_path)

        # Return relative path for storage
        if subfolder:
            return f"/uploads/{subfolder}/{unique_filename}"
        return f"/uploads/{unique_filename}"

    return None


def delete_file(file_path):
    """Delete uploaded file"""
    if file_path:
        full_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "..", file_path
        )
        full_path = os.path.normpath(full_path)

        if os.path.exists(full_path):
            os.remove(full_path)
            return True
    return False


def get_timestamp():
    """Get current timestamp"""
    return datetime.utcnow()
