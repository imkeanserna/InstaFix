import os

from flask import current_app, request
from flask_restful import Resource, abort, fields, marshal_with, reqparse
from gradio_client import Client
from werkzeug.utils import secure_filename

from app.services.detection_service import DetectionService

detection_fields = {
    "id": fields.Integer,
    "image_path": fields.String,
    "objects": fields.List(
        fields.Nested(
            {
                "class": fields.String,
                "confidence": fields.Float,
                "bbox": fields.List(fields.Integer),
            }
        )
    ),
    "confidence": fields.Float,
    "timestamp": fields.String,
}


class DetectionResource(Resource):
    def __init__(self):
        self.detection_service = DetectionService(current_app.config["MODEL_PATH"])

    @marshal_with(detection_fields)
    def post(self):
        """Handle image upload and perform detection."""
        if "image" not in request.files:
            abort(
                404, description={"success": False, "message": "No image file provided"}
            )

        file = request.files["image"]
        if file.filename == "":
            abort(
                404,
                description={"success": False, "message": "No selected file provided"},
            )

        if not self._allowed_file(file.filename):
            abort(
                404, description={"success": False, "message": "File type not allowed"}
            )

        filepath = "/tmp/test.png"

        # Perform detection
        result = self.detection_service.process_image(filepath)
        return result

    @marshal_with(detection_fields)
    def get(self, detection_id):
        """Retrieve a specific detection result."""
        # Implement retrieval logic
        client = Client("kenkurosaki/instafix-chat")
        result = client.predict(
            message="Who's Kyrie Irving?",
            system_message="You are a friendly Chatbot.",
            max_tokens=512,
            temperature=0.7,
            top_p=0.95,
            api_name="/chat",
        )
        print(result)
        return {
            "id": 1,
            "image_path": "image.png",
            "objects": [],
            "confidence": 2.0,
            "timestamp": "2022-01-01T00:00:00.000000",
        }

    def _allowed_file(self, filename):
        return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower()
            in current_app.config["ALLOWED_EXTENSIONS"]
        )
