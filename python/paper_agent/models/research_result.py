from pydantic import BaseModel
from typing import List, Dict, Any

class ResearchResult(BaseModel):
    """Results from research phase"""
    papers: List[Dict[str, Any]]
    reports: List[Dict[str, Any]]
    databases: List[str] 