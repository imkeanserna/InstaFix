from dataclasses import dataclass
from typing import Dict, List


@dataclass
class Detection:
    id: int
    image_path: str
    objects: List[Dict]
    confidence: float
    timestamp: str
