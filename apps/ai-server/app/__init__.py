from config import Config
from flask import Flask
from flask_restful import Api


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask-RESTful
    api = Api(app)

    # Import routes here, after app is created
    from app.routes.detections_routes import DetectionResource

    api.add_resource(DetectionResource, "/api/detect", "/api/detect/<int:detection_id>")

    return app
