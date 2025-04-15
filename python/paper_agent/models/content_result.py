from pydantic import BaseModel
from typing import List, Dict

class ContentResult(BaseModel):
    """Results from content generation"""
    outline: List[str]
    sections: Dict[str, str]
    citations: List[str] 