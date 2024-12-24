from datetime import datetime
from typing import Dict, List, Tuple

from app.models.detection_model import Detection


class DetectionService:
    def __init__(self, model_path: str):
        self.classes = []  # Load your class names here

    def process_image(self, image_path: str) -> Detection:
        """Process image and detect objects."""
        return Detection(
            id=1,  # Replace with proper ID generation
            image_path="kean.png",
            objects=[],
            confidence=2.0,
            timestamp=datetime.now().isoformat(),
        )
