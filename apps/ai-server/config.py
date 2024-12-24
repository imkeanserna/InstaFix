import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "your-secret-key"
    UPLOAD_FOLDER = "uploads"
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
    MODEL_PATH = "path/to/your/model"
