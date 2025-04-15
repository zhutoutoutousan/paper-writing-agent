from dataclasses import dataclass
from typing import List, Optional

@dataclass
class PaperMetadata:
    """Metadata for a research paper"""
    title: str
    authors: List[str]
    abstract: str = ""
    keywords: Optional[List[str]] = None
    references: Optional[List[str]] = None

    def __post_init__(self):
        if self.keywords is None:
            self.keywords = []
        if self.references is None:
            self.references = [] 